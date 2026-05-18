import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PrismaModule } from 'src/infra/prisma/prisma.module';
import { StripeModule } from './providers/stripe/stripe.module';
import { WebhookModule } from './webhook/webhook.module';
import { PaymentHandler } from './payment.handler';

@Module({
  imports: [PrismaModule, StripeModule, WebhookModule],
  controllers: [PaymentController],
  providers: [PaymentService, PaymentHandler],
  exports: [PaymentHandler],
})
export class PaymentModule {}
