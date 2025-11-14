import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { Firestore, FieldValue, Timestamp, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { PostM } from '../../../domains/model/post';
import { PostRepository } from '../../../domains/repositories/post/post.repository';
import { firebaseNormalize } from '../../../commons/helper/firebaseNormalize'; 


@Injectable()
export class PostRepositoryFirestore implements PostRepository {
  constructor(@Inject('FIRESTORE') private readonly firestore: Firestore) {}

  private get postsCol() { return this.firestore.collection('posts'); }
  private get hashtagsCol() { return this.firestore.collection('hashtags'); }
  private get commentsCol() { return this.firestore.collection('comments'); }
  private get repliesCol() { return this.firestore.collection('replies'); }
  private get postLikesCol() { return this.firestore.collection('postLikes'); }

  // Create post: assume `post` includes `user` denormalized summary and hashTagIds or hashTagNames
  async createPost(post: PostM): Promise<void> {
    const now = FieldValue.serverTimestamp();
    const docRef = this.postsCol.doc(); // auto id
    const postPayload: any = {
      ...post,
      createdAt: now,
      updatedAt: now,
      likeCount: 0,
    };

    // ensure we don't store entities inside Firestore (strip nested classes)
    delete postPayload.id;
    // Save post
    await docRef.set(postPayload);

    // increment postCount for each hashtag if hashtag IDs provided
    const hashTagIds: string[] = (post.hashTags || []).map((h: any) => h.id).filter(Boolean);
    const batch = this.firestore.batch();
    for (const tagId of hashTagIds) {
      const tagRef = this.hashtagsCol.doc(tagId);
      batch.update(tagRef, { postCount: FieldValue.increment(1) });
    }
    if (hashTagIds.length) await batch.commit();
  }

  // Verify existence
  async verifyPostAvailability(id: string): Promise<boolean> {
    const snap = await this.postsCol.doc(id).get();
    if (!snap.exists) throw new NotFoundException('Post not found');
    return true;
  }

  // Verify ownership - assumes post.userId stored
  async verifyPostOwnership(userId: string, postId: string): Promise<boolean> {
    const snap = await this.postsCol.doc(postId).get();
    if (!snap.exists) throw new UnauthorizedException('You are not authorized to perform this action');
    const data = snap.data() as any;
    if (data.userId !== userId) throw new UnauthorizedException('You are not authorized to perform this action');
    return true;
  }

  // Helper: convert Firestore doc -> PostM-like object
  private docToPost(doc: QueryDocumentSnapshot): PostM {
    const data = doc.data() as any;
    return firebaseNormalize({
      id: doc.id,
      title: data.title,
      content: data.content,
      media_url: data.media_url,
      post_type: data.post_type,
      created_at: data.createdAt,
      updated_at: data.updatedAt,
      user: data.user || { id: data.userId },
      hashTags: data.hashTagNames ? data.hashTagNames.map((n: string) => ({ name: n })) : (data.hashTagIds || []).map((id: string) => ({ id })),
      likeCount: typeof data.likeCount === 'number' ? data.likeCount : 0,
    }) as any as PostM;
  }

  // Pagination: cursor-based (preferred). `cursor` is last doc's createdAt ISO or firestore Timestamp, or null to start.
  // For compatibility with your previous signature (page:number, limit:number) we support naive offset only if page > 0 and no cursor provided.
  async getPaginatedPosts(
    searchQuery: string,
    page: number,
    limit: number,
    cursor?: { createdAt: FirebaseFirestore.Timestamp; id?: string } | null,
  ): Promise<{ posts: Partial<PostM[]>; total: number }> {
    // Build base query
    let q: FirebaseFirestore.Query = this.postsCol.orderBy('createdAt', 'desc');

    // Search NOTE: Firestore does not support LIKE; you'd need a dedicated search index (Algolia) or store searchable tokens.
    // Here we do a simple case: if searchQuery exists, filter by exact equality on title lowercase token (if you maintain it).
    if (searchQuery && searchQuery.trim()) {
      // This requires maintaining a `title_lower` or tokens array on the document. If not available, this will be a full collection scan (not recommended).
      q = q.where('title_lower', '>=', searchQuery.toLowerCase()).where('title_lower', '<=', searchQuery.toLowerCase() + '\uf8ff');
    }

    // Cursor support
    if (cursor && cursor.createdAt) {
      q = q.startAfter(cursor.createdAt);
    } else if (page && page > 1) {
      // naive offset if the caller uses page/limit: NOT efficient at scale
      const offset = (page - 1) * limit;
      q = q.offset(offset);
    }

    // total count: Firestore has count() aggregation (server SDK). Use it if available; otherwise avoid.
    let total = 0;
    try {
      // @ts-ignore - aggregate count on admin SDK
      const countSnap = await this.postsCol.count().get();
      total = countSnap.data().count || 0;
    } catch {
      // best-effort fallback (expensive) - warning: will scan collection
      total = (await this.postsCol.get()).size;
    }

    // fetch page
    const snapshot = await q.limit(limit).get();
    const posts = snapshot.docs.map(d => this.docToPost(d));

    return firebaseNormalize({ posts, total });
  }

  async getPostsByUserId(
    page: number,
    limit: number,
    userId: string,
    searchQuery: string,
    cursor?: { createdAt: FirebaseFirestore.Timestamp; id?: string } | null,
  ): Promise<{ posts: Partial<PostM>[]; total: number }> {
    let q: FirebaseFirestore.Query = this.postsCol.where('userId', '==', userId).orderBy('createdAt', 'desc');

    if (searchQuery && searchQuery.trim()) {
      q = q.where('title_lower', '>=', searchQuery.toLowerCase()).where('title_lower', '<=', searchQuery.toLowerCase() + '\uf8ff');
    }

    if (cursor && cursor.createdAt) q = q.startAfter(cursor.createdAt);
    else if (page && page > 1) q = q.offset((page - 1) * limit);

    let total = 0;
    try {
      const countSnap = await this.postsCol.where('userId', '==', userId).count().get();
      total = countSnap.data().count || 0;
    } catch {
      total = (await this.postsCol.where('userId', '==', userId).get()).size;
    }

    const snap = await q.limit(limit).get();
    const posts = snap.docs.map(d => this.docToPost(d));
    return firebaseNormalize({ posts, total });
  }

  async getPostsByHashTagName(
    page: number,
    limit: number,
    hashTagName: string,
    searchQuery: string,
    cursor?: { createdAt: FirebaseFirestore.Timestamp; id?: string } | null,
  ): Promise<{ posts: Partial<PostM>[]; total: number }> {
    // Strategy: find tag(s) by name, take ids, then query posts where hashTagIds array contains any of these ids.
    const tagSnap = await this.hashtagsCol.where('name_lower', '==', hashTagName.toLowerCase()).get();
    if (tagSnap.empty) return { posts: [], total: 0 };
    const tagIds = tagSnap.docs.map(d => d.id);

    let q: FirebaseFirestore.Query = this.postsCol.where('hashTagIds', 'array-contains-any', tagIds).orderBy('createdAt', 'desc');

    if (searchQuery && searchQuery.trim()) {
      q = q.where('title_lower', '>=', searchQuery.toLowerCase()).where('title_lower', '<=', searchQuery.toLowerCase() + '\uf8ff');
    }

    if (cursor && cursor.createdAt) q = q.startAfter(cursor.createdAt);
    else if (page && page > 1) q = q.offset((page - 1) * limit);

    let total = 0;
    try {
      const countSnap = await this.postsCol.where('hashTagIds', 'array-contains-any', tagIds).count().get();
      total = countSnap.data().count || 0;
    } catch {
      total = (await this.postsCol.where('hashTagIds', 'array-contains-any', tagIds).get()).size;
    }

    const snap = await q.limit(limit).get();
    const posts = snap.docs.map(d => this.docToPost(d));
    return firebaseNormalize({ posts, total });
  }

  async getPostById(id: string): Promise<PostM> {
    const snap = await this.postsCol.doc(id).get();
    if (!snap.exists) throw new NotFoundException('Post not found');
    return firebaseNormalize(this.docToPost(snap as QueryDocumentSnapshot));
  }

  // Detailed post: loads post + comments + replies + counters
  async getDetailedPostById(id: string): Promise<any> {
    const postSnap = await this.postsCol.doc(id).get();
    if (!postSnap.exists) throw new NotFoundException('Post not found');

    const postData = postSnap.data() as any;
    const post: any = this.docToPost(postSnap as QueryDocumentSnapshot);

    // load comments for post
    const commentsSnap = await this.commentsCol.where('postId', '==', id).orderBy('createdAt', 'asc').get();
    const comments = [];
    for (const cdoc of commentsSnap.docs) {
      const c = cdoc.data() as any;
      // fetch replies for comment
      const repliesSnap = await this.repliesCol.where('commentId', '==', cdoc.id).orderBy('createdAt', 'asc').get();
      const replies = repliesSnap.docs.map(r => {
        const rd = r.data() as any;
        return {
          id: r.id,
          content: rd.content,
          user: rd.user,
          likeCount: typeof rd.likeCount === 'number' ? rd.likeCount : 0,
          createdAt: rd.createdAt,
        };
      });

      comments.push({
        id: cdoc.id,
        content: c.content,
        user: c.user,
        likeCount: typeof c.likeCount === 'number' ? c.likeCount : 0,
        createdAt: c.createdAt,
        replies,
      });
    }

    return firebaseNormalize({
      id: post.id,
      user: post.user,
      post_type: post.post_type,
      media_url: post.media_url,
      title: post.title,
      content: post.content,
      hashTags: post.hashTags,
      created_at: post.created_at,
      updated_at: post.updated_at,
      likeCount: post.likeCount,
      comments,
    });
  }

  async getPostsByUserIds(
    page: number,
    limit: number,
    userIds: string[],
    searchQuery: string,
    cursor?: { createdAt: FirebaseFirestore.Timestamp; id?: string } | null,
  ): Promise<{ posts: PostM[]; total: number }> {
    // Firestore supports IN for up to 10 items. If userIds > 10, chunk them.
    const chunks: string[][] = [];
    const n = 10;
    for (let i = 0; i < userIds.length; i += n) chunks.push(userIds.slice(i, i + n));

    let allPosts: PostM[] = [];
    let total = 0;

    for (const chunk of chunks) {
      let q: FirebaseFirestore.Query = this.postsCol.where('userId', 'in', chunk).orderBy('createdAt', 'desc');

      if (searchQuery && searchQuery.trim()) {
        q = q.where('title_lower', '>=', searchQuery.toLowerCase()).where('title_lower', '<=', searchQuery.toLowerCase() + '\uf8ff');
      }

      if (cursor && cursor.createdAt) q = q.startAfter(cursor.createdAt);
      else if (page && page > 1) q = q.offset((page - 1) * limit);

      try {
        const countSnap = await this.postsCol.where('userId', 'in', chunk).count().get();
        total += countSnap.data().count || 0;
      } catch {
        total += (await this.postsCol.where('userId', 'in', chunk).get()).size;
      }

      const snap = await q.limit(limit).get();
      allPosts = allPosts.concat(snap.docs.map(d => this.docToPost(d)));
    }

    // naive: trimming to limit for combined result
    return firebaseNormalize({ posts: allPosts.slice(0, limit), total });
  }

  // Edit post: update fields, manage hashtag counts if tags changed
  async editPost(id: string, post: Partial<PostM>): Promise<void> {
    const postRef = this.postsCol.doc(id);
    const snap = await postRef.get();
    if (!snap.exists) throw new NotFoundException('Post not found');

    const existing = snap.data() as any;

    // If hashtags changed: update postCount counters
    const oldTagIds: string[] = existing.hashTagIds || [];
    const newTagIds: string[] = (post.hashTags || []).map((h: any) => h.id).filter(Boolean);

    const toAdd = newTagIds.filter(id2 => !oldTagIds.includes(id2));
    const toRemove = oldTagIds.filter(id2 => !newTagIds.includes(id2));

    const batch = this.firestore.batch();
    for (const addId of toAdd) batch.update(this.hashtagsCol.doc(addId), { postCount: FieldValue.increment(1) });
    for (const remId of toRemove) batch.update(this.hashtagsCol.doc(remId), { postCount: FieldValue.increment(-1) });

    // Prepare payload
    const payload: any = { ...post, updatedAt: FieldValue.serverTimestamp() };
    if (post.hashTags) {
      payload.hashTagIds = newTagIds;
      payload.hashTagNames = (post.hashTags || []).map((h: any) => h.name || '');
    }

    batch.update(postRef, payload);
    await batch.commit();
  }

  async deletePost(id: string): Promise<void> {
    const postRef = this.postsCol.doc(id);
    const snap = await postRef.get();
    if (!snap.exists) return;
    const data = snap.data() as any;

    // decrement hashtag postCounts
    const tagIds: string[] = data.hashTagIds || [];
    const batch = this.firestore.batch();
    for (const tId of tagIds) batch.update(this.hashtagsCol.doc(tId), { postCount: FieldValue.increment(-1) });

    batch.delete(postRef);
    await batch.commit();

    // Optionally delete comments/replies/likes belonging to this post - implement as needed (batch deletes)
  }
}
