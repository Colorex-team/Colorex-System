import { Inject, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { Firestore } from "firebase-admin/firestore";
import { ReplyM } from "../../../domains/model/reply";
import { ReplyRepository } from "../../../domains/repositories/reply/reply.repository";
import { firebaseNormalize } from '../../../commons/helper/firebaseNormalize'; 


@Injectable()
export class ReplyRepositoryFirebase implements ReplyRepository {
  constructor(
    @Inject('FIRESTORE') private readonly firestore: Firestore,
  ) {}

  private get collection() {
    return this.firestore.collection('replies');
  }

  // ✅ Create a new reply
  async createReply(reply: ReplyM): Promise<void> {
    const docRef = this.collection.doc(reply.id ?? undefined);
    await docRef.set({
      ...reply,
      created_at: new Date(),
      likeCounts : 0,
    });
  }

  // ✅ Check if reply exists
  async verifyReplyAvailability(replyId: string): Promise<boolean> {
    const doc = await this.collection.doc(replyId).get();
    if (!doc.exists) {
      throw new NotFoundException('Reply not found');
    }
    return true;
  }

  // ✅ Verify ownership of reply
  async verifyReplyOwnership(userId: string, replyId: string): Promise<boolean> {
    const doc = await this.collection.doc(replyId).get();

    if (!doc.exists) {
      throw new NotFoundException('Reply not found');
    }

    const replyData = doc.data();
    if (replyData.userId !== userId) {
      throw new UnauthorizedException('You are not the owner of this reply');
    }

    return true;
  }

  // ✅ Get all replies under a comment
  async getRepliesByCommentId(commentId: string): Promise<ReplyM[]> {
    const snapshot = await this.collection.where('commentId', '==', commentId).get();

    if (snapshot.empty) return [];
    return firebaseNormalize(snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))) as ReplyM[];
  }

  // ✅ Get a single reply by ID
  async getReplyById(replyId: string): Promise<ReplyM | null> {
    const doc = await this.collection.doc(replyId).get();
    if (!doc.exists) return null;
    return firebaseNormalize({ id: doc.id, ...doc.data() }) as ReplyM;
  }

  // ✅ Edit a reply
  async editReplyById(replyId: string, reply: Partial<ReplyM>): Promise<void> {
    const docRef = this.collection.doc(replyId);
    const doc = await docRef.get();

    if (!doc.exists) throw new NotFoundException('Reply not found');
    await docRef.update({
      ...reply,
      updated_at: new Date(),
    });
  }

  // ✅ Delete a reply
  async deleteReply(replyId: string): Promise<void> {
    const docRef = this.collection.doc(replyId);
    const doc = await docRef.get();

    if (!doc.exists) throw new NotFoundException('Reply not found');
    await docRef.delete();
  }
}
