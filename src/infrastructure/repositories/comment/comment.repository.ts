import { Inject, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { CommentM } from "../../../domains/model/comment";
import { CommentRepository } from "../../../domains/repositories/comment/comment.repository";
import { EditCommentDto } from "../../../presentations/comment/dto/editComment.dto";
import { Firestore } from 'firebase-admin/firestore';
import { firebaseNormalize } from '../../../commons/helper/firebaseNormalize'; 


@Injectable()
export class CommentRepositoryFirebase implements CommentRepository{
  constructor(
    @Inject('FIRESTORE') private readonly firestore: Firestore,
  ){}

  private get collection() {
    return this.firestore.collection('comments');
  }

  async createComment(comment: CommentM): Promise<void> {
    await this.collection.doc().set({...comment, created_at: new Date(), likeCounts : 0});
  }

  async verifyCommentAvailability(commentId: string): Promise<boolean> {
    const doc = await this.collection.doc(commentId).get();
    if(!doc.exists) {
      throw new NotFoundException('Comment not found');
    };
    return true;
  }

  async verifyCommentOwnership(userId: string, commentId: string): Promise<boolean> {
    const doc = await this.collection.doc(commentId).get();
    if (!doc.exists) throw new NotFoundException('Comment not found')

      const data = doc.data();
    if(!data || data.user !== userId) {
      throw new UnauthorizedException('You are not the owner of this comment');
    }
    return true;
  }

  async getCommentsByPostId(postId: string): Promise<CommentM[]> {
    const snapshot = await this.collection.where('postId', '==', postId).get();
    if (snapshot.empty) return [];
    return snapshot.docs.map((doc) => firebaseNormalize({id : doc.id, ...doc.data()}) ) as CommentM[];
  }
  
  async getCommentById(commentId: string): Promise<CommentM> {
    const doc = await this.collection.doc(commentId).get();
    if (!doc.exists) {
      throw new NotFoundException('Comment not found');
    }
    return firebaseNormalize({ id: doc.id, ...doc.data()}) as CommentM;
  }

  async editComment(commentId: string,comment: Partial<EditCommentDto>): Promise<void> {
    const docRef = this.collection.doc(commentId);
    const doc = await docRef.get();
    if (!doc.exists) throw new NotFoundException('Comment not found');

    await docRef.update({
      ...comment,
      updated_at: new Date(),
    });
  }
  
  async deleteComment(commentId: string): Promise<void> {
    await this.collection.doc(commentId).delete();
  }
}