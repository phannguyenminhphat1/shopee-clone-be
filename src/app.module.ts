import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ProductModule } from './product/product.module';
import { CategoryModule } from './category/category.module';
import { PurchaseModule } from './purchase/purchase.module';
import { UserModule } from './user/user.module';
import { ShippingModule } from './shipping/shipping.module';

@Module({
  imports: [AuthModule, ProductModule, CategoryModule, PurchaseModule, UserModule, ShippingModule],
})
export class AppModule {}
