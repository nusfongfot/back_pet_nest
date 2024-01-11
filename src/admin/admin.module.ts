import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AuthModule } from 'src/auth/auth.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { Admin } from 'models/admin.model';

@Module({
  imports: [SequelizeModule.forFeature([Admin]), AuthModule],
  controllers: [AdminController],
  providers: [],
})
export class AdminModule {}
