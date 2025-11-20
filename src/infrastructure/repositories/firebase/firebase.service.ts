import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { CreateNotificationDto } from '../../../presentations/firebase/dto/createNotification.dto';
import { FirebaseRepository } from '../../../domains/repositories/firebase/firebase.repository';

@Injectable()
export class FirebaseService implements FirebaseRepository {
  constructor(
    @Inject('FIREBASE_MESSAGING')
    private readonly messaging: admin.messaging.Messaging,
  ) {}

  async sendNotification(payload: CreateNotificationDto): Promise<void> {
    const message: admin.messaging.Message = {
      notification: {
        title: payload.title,
        body: payload.body,
      },
      token: payload.fcmToken,
    };

    try {
      await this.messaging.send(message);
      console.log('Notification sent successfully');
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Failed to send notification');
    }
  }
}
