import { Module } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { PurchaseController } from './purchase.controller';
import { PrismaService } from 'prisma/prisma.service';
import { ProductModule } from 'src/product/product.module';
import { UserModule } from 'src/user/user.module';

@Module({
  controllers: [PurchaseController],
  providers: [PurchaseService, PrismaService],
  imports: [ProductModule, UserModule],
  exports: [PurchaseService],
})
export class PurchaseModule {}
