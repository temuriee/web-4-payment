import { Body, Controller, Get, Post } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Authorized, Protected } from 'src/common/decorators';
import { type User } from '@prisma/client';
import {
  InitPaymentRequest,
  InitPaymentResponse,
  PaymentHistoryResponse,
} from './dto';

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @ApiOperation({
    summary: 'Get payment history',
    description: 'Returns the list of all user transactions',
  })
  @ApiOkResponse({
    type: [PaymentHistoryResponse],
  })
  @Protected()
  @Get()
  public async getHistory(@Authorized() user: User) {
    return await this.paymentService.getHistory(user);
  }

  @ApiOperation({
    summary: 'Initiate a new payment',
    description:
      'Initializes a payment using the selected provider and billing period',
  })
  @ApiOkResponse({
    type: InitPaymentResponse,
  })
  @Protected()
  @Post('init')
  public async init(@Body() dto: InitPaymentRequest, @Authorized() user: User) {
    return await this.paymentService.init(dto, user);
  }
}
