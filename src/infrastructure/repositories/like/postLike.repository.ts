import { Injectable, Inject } from "@nestjs/common";
import { PostLikeM } from "../../../domains/model/postLike";
import { PostLikeRepository } from "../../../domains/repositories/like/postLike.repository";
import { Firestore, FieldValue } from "firebase-admin/firestore";

@Injectable()
export class PostLikeRepositoryFirebase implements PostLikeRepository {
  constructor(
    @Inject('FIRESTORE') private readonly firestore: Firestore,
  ) {}

  private get collection() {
    return this.firestore.collection('postLikes');
  }

  // ✅ Create a post like and increment like count atomically
  async createPostLike(postLike: PostLikeM): Promise<void> {
    const docId = `${postLike.user.id}_${postLike.post.id}`;
    await this.collection.doc(docId).set({
      userId: postLike.user.id,
      postId: postLike.post.id,
      createdAt: FieldValue.serverTimestamp(),
    });

    // Increment like count on post document
    await this.firestore.collection('posts').doc(postLike.post.id).update({
      likeCounts: FieldValue.increment(1),
    });
  }

  // ✅ Get total like count efficiently
  async getPostLikeCount(postId: string): Promise<number> {
    const doc = await this.firestore.collection('posts').doc(postId).get();
    return doc.data()?.likeCounts ?? 0;
  }

  // ✅ Check if user already liked a post
  async verifyIsPostLiked(userId: string, postId: string): Promise<boolean> {
    const docId = `${userId}_${postId}`;
    const doc = await this.collection.doc(docId).get();
    return doc.exists;
  }

  // ✅ Delete like and decrement counter atomically
  async deletePostLike(userId: string, postId: string): Promise<void> {
    const docId = `${userId}_${postId}`;
    await this.collection.doc(docId).delete();

    // Decrement like count on post document
    await this.firestore.collection('posts').doc(postId).update({
      likeCounts: FieldValue.increment(-1),
    });
  }
}
