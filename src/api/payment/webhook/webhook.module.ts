import { Module } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { WebhookController } from './webhook.controller';
import { PaymentHandler } from '../payment.handler';
import { StripeModule } from '../providers/stripe/stripe.module';
import { PrismaModule } from 'src/infra/prisma/prisma.module';

@Module({
  imports: [StripeModule, PrismaModule],
  controllers: [WebhookController],
  providers: [WebhookService, PaymentHandler],
})
export class WebhookModule {}
