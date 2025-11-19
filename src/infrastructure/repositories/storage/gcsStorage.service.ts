import { BadRequestException, Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Bucket } from '@google-cloud/storage';
import { IGcsStorage } from '../../../domains/repositories/storage/IgcsStorage';

@Injectable()
export class GcsStorageService implements IGcsStorage {
  constructor(
    @Inject('FIREBASE_STORAGE')
    private readonly bucket: Bucket,
  ) {}

  async uploadFile(
    fileBuffer: Buffer,
    destination: string,
    mimeType: string,
  ): Promise<string> {
    const file = this.bucket.file(destination);

    await file.save(fileBuffer, {
      resumable: false,
      metadata: { contentType: mimeType },
    });

    return `https://firebasestorage.googleapis.com/${this.bucket.name}/${destination}`;
  }

  async deleteFile(filePath: string): Promise<void> {
    const decodedPath = decodeURIComponent(filePath.replace(`https://firebasestorage.googleapis.com/${this.bucket.name}/`, ''));

    const file = this.bucket.file(decodedPath);

    try {
      const [exists] = await file.exists();

      if (!exists) {
        throw new NotFoundException(`File ${decodedPath} not found`);
      }

      await file.delete();
    } catch (error) {
      console.log(error);
      throw new BadRequestException(`Failed to delete file: ${decodedPath}`);
    }
  }
}
