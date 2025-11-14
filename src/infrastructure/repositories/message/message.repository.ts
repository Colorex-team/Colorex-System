import { Inject, Injectable } from "@nestjs/common";
import { Firestore } from "firebase-admin/firestore";
import { MessageM } from "../../../domains/model/message";
import { MessageRepository } from "../../../domains/repositories/message/message.repository";
import { firebaseNormalize } from '../../../commons/helper/firebaseNormalize'; 


@Injectable()
export class MessageRepositoryFirebase implements MessageRepository {
  constructor(
    @Inject('FIRESTORE') private readonly firestore: Firestore,
  ) {}

  private get collection() {
    return this.firestore.collection('messages');
  }

  // ✅ Create a message
  async createMessage(message: Partial<MessageM>): Promise<void> {
    const docRef = this.collection.doc(message.id ?? undefined);
    await docRef.set({
      ...message,
      createdAt: new Date(),
    });
  }

  // ✅ Get all messages between sender and receiver
  async getMessages(senderId: string, receiverId: string): Promise<MessageM[]> {
    // We query for both directions (sender → receiver and receiver → sender)
    const sentMessagesQuery = this.collection
      .where('senderId', '==', senderId)
      .where('receiverId', '==', receiverId);

    const receivedMessagesQuery = this.collection
      .where('senderId', '==', receiverId)
      .where('receiverId', '==', senderId);

    const [sentSnap, receivedSnap] = await Promise.all([
      sentMessagesQuery.get(),
      receivedMessagesQuery.get(),
    ]);

    const sentMessages = sentSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as MessageM[];

    const receivedMessages = receivedSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as MessageM[];

    const allMessages = [...sentMessages, ...receivedMessages];

    // Sort descending by createdAt
    return firebaseNormalize(allMessages.sort(
      (a, b) => (b.createdAt as any)?.toMillis?.() - (a.createdAt as any)?.toMillis?.()
    ));
  }
}
