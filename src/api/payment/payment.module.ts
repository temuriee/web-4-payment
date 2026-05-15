import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PrismaModule } from 'src/infra/prisma/prisma.module';
import { StripeModule } from './providers/stripe/stripe.module';

@Module({
  imports: [PrismaModule, StripeModule],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
