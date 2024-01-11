import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { UploadModule } from './upload/upload.module';
import { AdminModule } from './admin/admin.module';
import { ProductModule } from './product/product.module';
import { OrderModule } from './order/order.module';
import { AddressModule } from './address/address.module';
import { ReviewModule } from './review/review.module';
import { CategoryModule } from './category/category.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env.local' }),
    SequelizeModule.forRoot({
      dialect: 'mariadb',
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT as any,
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: 'db_pet_shop',
      autoLoadModels: true,
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    PassportModule.register({ session: true }),
    UploadModule,
    AdminModule,
    ProductModule,
    OrderModule,
    AddressModule,
    ReviewModule,
    CategoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
