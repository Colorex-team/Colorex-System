import { Injectable, Inject } from "@nestjs/common";
import { ReplyLikeM } from "../../../domains/model/replyLike";
import { ReplyLikeRepository } from "../../../domains/repositories/like/replyLike.repository";
import { Firestore, FieldValue } from "firebase-admin/firestore";

@Injectable()
export class ReplyLikeRepositoryFirebase implements ReplyLikeRepository {
  constructor(
    @Inject('FIRESTORE') private readonly firestore: Firestore,
  ) {}

  private get collection() {
    return this.firestore.collection('replyLikes');
  }

  // ✅ Create a reply like and increment counter atomically
  async createReplyLike(replyLike: ReplyLikeM): Promise<void> {
    const docId = `${replyLike.user.id}_${replyLike.reply.id}`;
    await this.collection.doc(docId).set({
      userId: replyLike.user.id,
      replyId: replyLike.reply.id,
      createdAt: FieldValue.serverTimestamp(),
    });

    // increment reply like counter
    await this.firestore.collection('replies').doc(replyLike.reply.id).update({
      likeCounts: FieldValue.increment(1),
    });
  }

  // ✅ Get the total like count from reply document
  async getReplyLikeCount(replyId: string): Promise<number> {
    const doc = await this.firestore.collection('replies').doc(replyId).get();
    return doc.data()?.likeCounts ?? 0;
  }

  // ✅ Check if user already liked the reply
  async verifyIsReplyLiked(userId: string, replyId: string): Promise<boolean> {
    const docId = `${userId}_${replyId}`;
    const doc = await this.collection.doc(docId).get();
    return doc.exists;
  }

  // ✅ Delete a like and decrement the counter
  async deleteReplyLike(userId: string, replyId: string): Promise<void> {
    const docId = `${userId}_${replyId}`;
    await this.collection.doc(docId).delete();

    // decrement reply like counter
    await this.firestore.collection('replies').doc(replyId).update({
      likeCounts: FieldValue.increment(-1),
    });
  }
}
