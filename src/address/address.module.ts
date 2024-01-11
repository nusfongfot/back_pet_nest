import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { Address } from 'models/address.model';
import { User } from 'models/user.model';
import { AddressController } from './address.controller';

@Module({
  imports: [SequelizeModule.forFeature([Address, User]), AuthModule],
  controllers: [AddressController],
  providers: [],
})
export class AddressModule {}
