import { Module } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { EnvironmentConfigModule } from '../environment-config/environment-config.module';
import { EnvironmentConfigService } from '../environment-config/environment-config.service';

export const getFirebaseOptions = (config: EnvironmentConfigService) => {
  const serviceAccount = JSON.parse(config.getFirebaseCredentialJson());
  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: config.getFirebaseStorageBucket(),
  });
};

@Module({
  imports: [EnvironmentConfigModule],
  providers: [
    {
      provide: 'FIREBASE_APP',
      inject: [EnvironmentConfigService],
      useFactory: getFirebaseOptions,
    },
    {
      provide: 'FIRESTORE',
      useFactory: (app: admin.app.App) => app.firestore(),
      inject: ['FIREBASE_APP'],
    },
    {
      provide: 'FIREBASE_STORAGE',
      inject: ['FIREBASE_APP'],
      useFactory: (app: admin.app.App) => app.storage().bucket(),
    },
    {
      provide: 'FIREBASE_MESSAGING',
      inject: ['FIREBASE_APP'],
      useFactory: (app: admin.app.App) => app.messaging(),
    },
  ],
  exports: ['FIREBASE_APP', 'FIRESTORE', 'FIREBASE_STORAGE', 'FIREBASE_MESSAGING'],
})
export class FirebaseModule {}
