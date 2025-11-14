import { Inject, Injectable } from "@nestjs/common";
import { FollowM } from "../../../domains/model/follow";
import { UserM } from "../../../domains/model/user";
import { FollowRepository } from "../../../domains/repositories/follow/follow.repository";
import { Firestore } from "firebase-admin/firestore";
import { firebaseNormalize } from '../../../commons/helper/firebaseNormalize'; 

@Injectable()
export class FollowRepositoryFirebase implements FollowRepository{
  constructor(
    @Inject('FIRESTORE') private readonly firestore: Firestore,
  ){}

  private get collection() {
    return this.firestore.collection('follows');
  }

  async createFollow(follow: FollowM): Promise<void> {
    const id = `${follow.follower.id}_${follow.following.id}`;

    // fetch both users to get their basic info
    const [followerSnap, followingSnap] = await Promise.all([
      this.firestore.collection('users').doc(follow.follower.id).get(),
      this.firestore.collection('users').doc(follow.following.id).get(),
    ]);

    if (!followerSnap.exists || !followingSnap.exists) {
      throw new Error('Either follower or following user not found');
    }

    const follower = followerSnap.data()!;
    const following = followingSnap.data()!;

    await this.collection.doc(id).set({
      followerId: follow.follower.id,
      followingId: follow.following.id,
      followerUsername: follower.username,
      followerAvatarUrl: follower.avatarUrl,
      followingUsername: following.username,
      followingAvatarUrl: following.avatarUrl,
      created_at: new Date(),
    });
  }

  // ✅ Delete a follow
  async deleteFollow(userId: string, followingId: string): Promise<void> {
    await this.collection.doc(`${userId}_${followingId}`).delete();
  }

  // ✅ Check if following
  async isUserFollowing(userId: string, followingId: string): Promise<boolean> {
    const doc = await this.collection.doc(`${userId}_${followingId}`).get();
    return doc.exists;
  }

  // ✅ Get followers (no join)
  async getFollowersByUserId(
    userId: string,
    page: number,
    limit: number
  ): Promise<{ followers: UserM[]; count: number }> {
    const snapshot = await this.collection
      .where('followingId', '==', userId)
      .orderBy('createdAt', 'desc')
      .offset((page - 1) * limit)
      .limit(limit)
      .get();

    const followers = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: data.followerId,
        username: data.followerUsername,
        avatarUrl: data.followerAvatarUrl,
      } as UserM;
    });

    // Count total (can cache this later)
    const totalSnapshot = await this.collection.where('followingId', '==', userId).get();

    return firebaseNormalize({
      followers,
      count: totalSnapshot.size,
    });
  }

  // ✅ Get following (no join)
  async getFollowingByUserId(
    userId: string,
    page: number,
    limit: number
  ): Promise<{ following: UserM[]; count: number }> {
    const snapshot = await this.collection
      .where('followerId', '==', userId)
      .orderBy('created_at', 'desc')
      .offset((page - 1) * limit)
      .limit(limit)
      .get();

    const following = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: data.followingId,
        username: data.followingUsername,
        avatarUrl: data.followingAvatarUrl,
      } as UserM;
    });

    const totalSnapshot = await this.collection.where('followerId', '==', userId).get();

    return firebaseNormalize({
      following,
      count: totalSnapshot.size,
    });
  }
}