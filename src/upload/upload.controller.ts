import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import * as fsExtra from 'fs-extra';

@Controller('api/upload')
export class UploadImageController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('multiple')
  @UseInterceptors(FilesInterceptor('images'))
  async uploadsFileImages(@UploadedFiles() files: Array<Express.Multer.File>) {
    try {
      const urls = [];
      const uploader = async (path: string) =>
        await this.cloudinaryService.uploadsImage(path, 'Pets');

      for (const file of files) {
        const { path, size, originalname } = file;
        if (size > 1024 * 1024) {
          return {
            message: `${originalname} size exceeds 1 MB. Please choose a smaller file.`,
            statusCode: 400,
          };
        }
        const newPath = await uploader(path);
        await fsExtra.unlink(path);
        urls.push(newPath);
      }

      const link = urls?.map((item) => item.secure_url);
      return { link };
    } catch (error) {
      return { message: error.message };
    }
  }
}
