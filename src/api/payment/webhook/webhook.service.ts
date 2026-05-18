import { Injectable, RawBody } from '@nestjs/common';
import { PaymentHandler } from '../payment.handler';
import { StripeService } from '../providers/stripe/stripe.service';

@Injectable()
export class WebhookService {
  public constructor(
    private readonly paymentHandler: PaymentHandler,
    private readonly stripeService: StripeService,
  ) {}

  public async handleStripe(rawbody: Buffer, sig: string) {
    const event = await this.stripeService.parseEvent(rawbody, sig);
    const result = await this.stripeService.handleWebhook(event);
    if (!result) return { ok: true };
    return await this.paymentHandler.processResult(result);
  }
}
