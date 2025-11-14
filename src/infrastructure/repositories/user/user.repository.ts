import { Inject, Injectable, ConflictException, NotFoundException } from "@nestjs/common";
import { UserRepository } from "src/domains/repositories/user/user.repository";
import { RegisterDto } from "src/presentations/auth/dto/auth.dto";
import { UserM } from "src/domains/model/user";
import { Firestore, FieldValue, FieldPath } from "firebase-admin/firestore";
import { firebaseNormalize } from "src/commons/helper/firebaseNormalize";

@Injectable()
export class UserRepositoryFirebase implements UserRepository {
  constructor(
    @Inject('FIRESTORE') private readonly firestore: Firestore,
  ) {}

  private get collection() {
    return this.firestore.collection('users');
  }

  // ✅ Create a new user
  async createUser(registerDto: RegisterDto): Promise<void> {
    await this.collection.doc().set({
      ...registerDto,
      created_at: FieldValue.serverTimestamp(),
    });
  }

  // ✅ Verify if user exists by condition (like email, username, etc.)
  async verifyUserAvailability(condition: any): Promise<boolean> {
    const conditions = Object.entries(condition).map(([key, value]) =>
      this.collection.where(key, "==", value)
    );

    // Firestore doesn't chain array dynamically, so we reduce it
    let queryRef = this.collection as FirebaseFirestore.Query;
    for (const [key, value] of Object.entries(condition)) {
      queryRef = queryRef.where(key, "==", value);
    }

    const snapshot = await queryRef.limit(1).get();
    return !snapshot.empty;
  }

  // ✅ Check profile ownership
  async verifyProfileOwnership(userId: string, profileId: string): Promise<boolean> {
    const userDoc = await this.collection.doc(userId).get();
    if (!userDoc.exists) throw new NotFoundException('User not found');

    if (userId !== profileId) {
      throw new ConflictException('You are not the owner of this profile');
    }
    return true;
  }

  // ✅ Find a single user by condition
  async findUser(condition: any): Promise<UserM> {
    let queryRef = this.collection as FirebaseFirestore.Query;
    for (const [key, value] of Object.entries(condition)) {
      if (key === 'id') {
        queryRef = queryRef.where(FieldPath.documentId(), '==', value);
      } else {
        queryRef = queryRef.where(key, '==', value);
      }
    }

    const snapshot = await queryRef.limit(1).get();
    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return firebaseNormalize({ id: doc.id, ...doc.data() }) as UserM;
  }

  // ✅ Update user by ID
  async editUser(profileId: string, user: Partial<UserM>): Promise<void> {
    const userDoc = this.collection.doc(profileId);
    const exists = await userDoc.get();

    if (!exists.exists) throw new NotFoundException('User not found');

    await userDoc.update({ ...user, updated_at: FieldValue.serverTimestamp()});
  }

  // ✅ Increment/Decrement counters (atomic)
  async incrementFollowerCount(userId: string): Promise<void> {
    await this.collection.doc(userId).update({
      followersCount: FieldValue.increment(1),
    });
  }

  async decrementFollowerCount(userId: string): Promise<void> {
    await this.collection.doc(userId).update({
      followersCount: FieldValue.increment(-1),
    });
  }

  async incrementFollowingCount(userId: string): Promise<void> {
    await this.collection.doc(userId).update({
      followingCount: FieldValue.increment(1),
    });
  }

  async decrementFollowingCount(userId: string): Promise<void> {
    await this.collection.doc(userId).update({
      followingCount: FieldValue.increment(-1),
    });
  }

  // ✅ Delete FCM Token
  async deleteFCMToken(userId: string): Promise<void> {
    await this.collection.doc(userId).update({
      fcmToken: null,
    });
  }
}
