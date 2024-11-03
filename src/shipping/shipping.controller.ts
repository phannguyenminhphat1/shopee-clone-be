import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ShippingService } from './shipping.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from 'src/constants/enum';
import { Roles } from 'src/utils/decorators/roles-guard.decorator';
import { ShippingDto } from './dto/shipping.dto';
import { CanceledAndDeliveredDto } from './dto/canceled-delivered.dto';

@UsePipes(ValidationPipe)
@UseGuards(JwtAuthGuard)
@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Post('picking-purchase')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SHIPPER)
  async pickingPurchase(@Body() shippingDto: ShippingDto) {
    return await this.shippingService.pickingPurchase(shippingDto);
  }

  @Post('canceled-delivered')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SHIPPER)
  async canceledAndDeliveredPurchase(
    @Body() canceledAndDeliveredDto: CanceledAndDeliveredDto,
  ) {
    return await this.shippingService.canceledAndDeliveredPurchase(
      canceledAndDeliveredDto,
    );
  }
}
