import { Injectable, Inject } from '@nestjs/common';
import { HashTagM } from '../../../domains/model/hashtag';
import { HashTagRepository } from '../../../domains/repositories/hashtag/hashtag.repository';
import { Firestore, FieldValue } from 'firebase-admin/firestore';
import { firebaseNormalize } from '../../../commons/helper/firebaseNormalize'; 

@Injectable()
export class HashTagRepositoryFirestore implements HashTagRepository {
  constructor(
    @Inject('FIRESTORE') private readonly firestore: Firestore,
  ) {}

  private get collection() {
    return this.firestore.collection('hashtags');
  }

  // ✅ Create a new hashtag
  async createHashtag(name: string): Promise<void> {
    const docRef = this.collection.doc(); // auto-ID
    await docRef.set({
      name,
      createdAt: FieldValue.serverTimestamp(),
      postCount: 0,
      posts : [] as String[]
    });
  }

  // ✅ Check if a hashtag with this name already exists
  async verifyHashtagAvailability(name: string): Promise<boolean> {
    const snapshot = await this.collection.where('name', '==', name).limit(1).get();
    return !snapshot.empty; // true if hashtag exists
  }

  // ✅ Find hashtag by name
  async findHashtagByName(name: string): Promise<HashTagM | null> {
    const snapshot = await this.collection.where('name', '==', name).limit(1).get();
    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return firebaseNormalize({ id: doc.id, ...doc.data() }) as HashTagM;
  }

  // ✅ Get most popular hashtags (based on postCount)
  async getPopularHashtags(): Promise<Partial<HashTagM[]>> {
    const snapshot = await this.collection
      .orderBy('postCount', 'desc')
      .limit(10)
      .get();

    return firebaseNormalize(snapshot.docs.map(doc => {
      const data = doc.data() as Omit<HashTagM, 'id'>;
      return {
        id: doc.id,
        ...data,
      };
    }));
  }
}
