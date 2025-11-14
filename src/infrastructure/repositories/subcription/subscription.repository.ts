import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Firestore } from 'firebase-admin/firestore';
import { SubscriptionM, SubscriptionStatus } from '../../../domains/model/subscription';
import { SubscriptionRepository } from '../../../domains/repositories/subscription/subscription.repository';
import { firebaseNormalize } from 'src/commons/helper/firebaseNormalize';

@Injectable()
export class SubscriptionRepositoryFirebase implements SubscriptionRepository {
  constructor(
    @Inject('FIRESTORE') private readonly firestore: Firestore,
  ) {}

  private get collection() {
    return this.firestore.collection('subscriptions');
  }

  // ✅ Create new subscription
  async createSubscription(subscription: SubscriptionM): Promise<SubscriptionM> {
    const docRef = this.collection.doc(subscription.id ?? undefined);
    const data = { ...subscription, created_at: new Date() };
    await docRef.set(data);
    return firebaseNormalize({ id: docRef.id, ...data }) as SubscriptionM;
  }

  // ✅ Check if user has an active subscription
  async hasActiveSubscription(userId: string): Promise<boolean> {
    const q = this.collection
      .where('userId', '==', userId)
      .where('status', '==', SubscriptionStatus.active)
      .where('endDate', '>', new Date())
      .limit(1);

    const snapshot = await q.get();
    return !snapshot.empty;
  }

  // ✅ Verify subscription existence by ID
  async verifySubcriptionAvailability(subscriptionId: string): Promise<boolean> {
    const doc = await this.collection.doc(subscriptionId).get();
    if (!doc.exists) throw new NotFoundException('Subscription not found');
    return true;
  }

  // ✅ Verify subscription existence by order ID
  async verifySubsptionAvailabilityByOrderId(orderId: string): Promise<boolean> {
    const q = this.collection.where('orderId', '==', orderId).limit(1);
    const snapshot = await q.get();
    if (snapshot.empty) throw new NotFoundException('Subscription not found');
    return true;
  }

  // ✅ Get subscription by ID
  async getSubscriptionById(subscriptionId: string): Promise<SubscriptionM | null> {
    const doc = await this.collection.doc(subscriptionId).get();
    if (!doc.exists) return null;
    return firebaseNormalize({ id: doc.id, ...doc.data() }) as SubscriptionM;
  }

  // ✅ Get subscription by order ID
  async getSubscrtiptionByOrderId(orderId: string): Promise<SubscriptionM | null> {
    const q = this.collection.where('orderId', '==', orderId).limit(1);
    const snapshot = await q.get();

    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return firebaseNormalize({ id: doc.id, ...doc.data() }) as SubscriptionM;
  }

  // ✅ Get subscription by user ID
  async getSubscriptionByUserId(userId: string): Promise<SubscriptionM | null> {
    const q = this.collection.where('userId', '==', userId).limit(1);
    const snapshot = await q.get();

    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return firebaseNormalize({ id: doc.id, ...doc.data() }) as SubscriptionM;
  }

  // ✅ Update subscription
  async updateSubscription(subscription: SubscriptionM): Promise<SubscriptionM> {
    const docRef = this.collection.doc(subscription.id);
    const doc = await docRef.get();

    if (!doc.exists) throw new NotFoundException('Subscription not found');
    await docRef.update({ ...subscription, updated_at: new Date() });
    return firebaseNormalize({ id: subscription.id, ...subscription });
  }

  // ✅ Get expired subscriptions
  async getExpiredSubscriptions(): Promise<SubscriptionM[] | null> {
    const snapshot = await this.collection
      .where('endDate', '<=', new Date())
      .get();

    if (snapshot.empty) return null;
    return firebaseNormalize(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as SubscriptionM)));
  }
}
