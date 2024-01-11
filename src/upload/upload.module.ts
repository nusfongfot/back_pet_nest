import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { UploadImageController } from './upload.controller';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    MulterModule.register({
      dest: './temp',
    }),
  ],
  controllers: [UploadImageController],
  providers: [CloudinaryService],
})
export class UploadModule {}
