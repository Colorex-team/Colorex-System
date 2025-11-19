import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { Bucket } from '@google-cloud/storage';
import { IGcsStorage } from '../../../domains/repositories/storage/IgcsStorage';

@Injectable()
export class GcsStorageService implements IGcsStorage {
  constructor(
    @Inject('FIREBASE_STORAGE')
    private readonly bucket: Bucket,
  ) { }

  async uploadFile(
    fileBuffer: Buffer,
    destination: string,
    mimeType: string,
  ): Promise<string> {
    try {
      const file = this.bucket.file(destination);

      await file.save(fileBuffer, {
        resumable: false,
        metadata: { contentType: mimeType },
      });

      // Generate a long-lived signed URL for public access
      const [signedUrl] = await file.getSignedUrl({
        action: 'read',
        expires: '03-17-2055', // Adjust expiration as needed
      });

      return signedUrl;
    } catch (error) {
      throw new BadRequestException('Failed to upload file');
    }
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      // Extract file path from the signed URL
      const pathStart = fileUrl.indexOf(this.bucket.name) + this.bucket.name.length + 1;
      const filePath = decodeURIComponent(fileUrl.substring(pathStart).split('?')[0]);

      const file = this.bucket.file(filePath);

      const [exists] = await file.exists();
      if (!exists) {
        throw new NotFoundException(`File ${filePath} not found`);
      }

      await file.delete();
    } catch (error) {
      throw new BadRequestException('Failed to delete file');
    }
  }
}
