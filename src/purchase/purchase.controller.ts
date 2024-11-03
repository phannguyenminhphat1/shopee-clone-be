import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/utils/decorators/user.decorator';
import { users } from '@prisma/client';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { GetCartQueryDto } from './dto/get-cart-query.dto';
import {
  ConfirmPurchaseDto,
  UpdatePurchaseDto,
} from './dto/update-purchase.dto';
import { DeletePurchaseDto } from './dto/delete-purchase.dto';
import { BuyProductDto } from './dto/buy-product.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/utils/decorators/roles-guard.decorator';
import { UserRole } from 'src/constants/enum';

@UsePipes(ValidationPipe)
@UseGuards(JwtAuthGuard)
@Controller('purchase')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Post('add-to-cart')
  async addToCart(@User() user: users, @Body() addToCartDto: AddToCartDto) {
    return this.purchaseService.addToCart(user, addToCartDto);
  }

  @Get('get-purchases')
  async getPurchases(
    @User() user: users,
    @Query() getCartQueryDto: GetCartQueryDto,
  ) {
    return this.purchaseService.getPurchases(user, getCartQueryDto);
  }

  @Put('update-purchase')
  async updatePurchase(
    @User() user: users,
    @Body() updatePurchaseDto: UpdatePurchaseDto,
  ) {
    return this.purchaseService.updatePurchase(user, updatePurchaseDto);
  }

  @Delete('delete-purchases')
  async deletePurchase(
    @User() user: users,
    @Body() deletePurchaseDto: DeletePurchaseDto,
  ) {
    return this.purchaseService.deletePurchases(user, deletePurchaseDto);
  }

  @Post('buy-products')
  async buyProducts(@User() user: users, @Body() buyProductDto: BuyProductDto) {
    return this.purchaseService.buyProducts(user, buyProductDto);
  }

  // ROLE ADMIN
  @Post('confirm-purchase')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async confirmPurchase(@Body() confirmPurchaseDto: ConfirmPurchaseDto) {
    return await this.purchaseService.confirmPurchase(confirmPurchaseDto);
  }
}
