import { Module } from '@nestjs/common';
import { ShippingService } from './shipping.service';
import { ShippingController } from './shipping.controller';
import { PrismaService } from 'prisma/prisma.service';
import { ProductModule } from 'src/product/product.module';

@Module({
  controllers: [ShippingController],
  providers: [ShippingService, PrismaService],
})
export class ShippingModule {}
