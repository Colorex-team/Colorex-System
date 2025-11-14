// src/infrastructure/storage/storage.module.ts
import { Module } from '@nestjs/common';
import { GcsStorageService } from './gcsStorage.service';
import { FirebaseModule } from 'src/infrastructure/config/firebase/firebase.module';

// Change the symbol name to avoid confusion with the interface
export const STORAGE_TOKEN = Symbol('IGcsStorage');

@Module({
  imports: [
    FirebaseModule
  ],
  providers: [
    {
      provide: STORAGE_TOKEN,
      useClass: GcsStorageService,
    },
  ],
  exports: [STORAGE_TOKEN],
})
export class StorageModule {}