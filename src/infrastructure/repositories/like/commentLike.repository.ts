import { Injectable, Inject } from "@nestjs/common";
import { CommentLikeM } from "../../../domains/model/commentLike";
import { CommentLikeRepository } from "../../../domains/repositories/like/commentLike.repository";
import { Firestore, FieldValue } from "firebase-admin/firestore";


@Injectable()
export class CommentLikeRepositoryFirebase implements CommentLikeRepository  {
  constructor(
    @Inject('FIRESTORE') private readonly firestore: Firestore,
  ){}

  private get collection() {
    return this.firestore.collection('commentLikes');
  }
  async createCommentLike(commentLike: CommentLikeM): Promise<void> {
    const docId = `${commentLike.user.id}_${commentLike.comment.id}`;
    await this.collection.doc(docId).set({
      userId: commentLike.user.id,
      commentId: commentLike.comment.id,
      createdAt: FieldValue.serverTimestamp(),
    });

    await this.firestore.collection('comments').doc(commentLike.comment.id).update({
      likeCounts : FieldValue.increment(1),
    });
  }

  async verifyIsCommentLiked(userId: string, commentId: string): Promise<boolean> {
    const docId = `${userId}_${commentId}`;
    const doc = await this.collection.doc(docId).get();
    return doc.exists;
  }

  async getCommentLikeCount(commentId: string): Promise<number> {
    const doc = await this.firestore.collection('comments').doc(commentId).get();
    return doc.data()?.likeCounts ?? 0;
  }
  
  async deleteCommentLike(userId: string, commentId: string): Promise<void> {
    const docId = `${userId}_${commentId}`;
    await this.collection.doc(docId).delete();
  }
}