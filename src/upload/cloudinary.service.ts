import { Injectable } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor() {
    v2.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.CLOUD_KEY,
      api_secret: process.env.CLOUD_SECRET,
    });
  }

  async uploadsImage(
    filePath: string,
    folderOnCloud: string,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await v2.uploader.upload(filePath, {
          resource_type: 'auto',
          folder: folderOnCloud,
        });

        if (result && !result.error) {
          resolve(result);
        } else {
          reject(new Error('An error occurred during upload.'));
        }
      } catch (error) {
        reject(error);
      }
    });
  }
}
