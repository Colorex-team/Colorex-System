import { Inject, Injectable } from "@nestjs/common";
import { AuthRepository } from "../../../domains/repositories/auth/auth.repository";
import { Firestore } from "firebase-admin/firestore";
import { firebaseNormalize } from '../../../commons/helper/firebaseNormalize'; 

@Injectable()
export class AuthRepositoryFirebase implements AuthRepository {
  constructor(
    @Inject('FIRESTORE') private firestore: Firestore,
  ){}

  private get collection() {
    return this.firestore.collection('auth');
  }

  async addToken(token: string): Promise<void> {
    await this.collection.doc(token).set({token});
  }

  async checkTokenAvailability(token: string): Promise<boolean> {
    const doc = await this.collection.doc(token).get();
    return firebaseNormalize(doc.exists);
  }
  async deleteToken(token: string): Promise<void> {
    await this.collection.doc(token).delete();
  }
} 