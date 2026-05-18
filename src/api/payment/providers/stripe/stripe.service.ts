import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BillingPeriod,
  TransactionStatus,
  User,
  type Plan,
  type Transaction,
} from '@prisma/client';
import type { PaymentWebhookResult } from '../../interfaces';
import { PrismaService } from 'src/infra/prisma/prisma.service';
import Stripe from 'stripe';

type StripeWebhookEvent = Awaited<
  ReturnType<InstanceType<typeof Stripe>['webhooks']['constructEventAsync']>
>;

@Injectable()
export class StripeService {
  private readonly stripe: Stripe.Stripe;

  private readonly APP_URL: string; // could be moved to a common config service
  private readonly WEBHOOK_SECRETS: string[];

  public constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.stripe = new Stripe(
      this.configService.getOrThrow<string>('STRIPE_SECRET_KEY'),
      {
        apiVersion: '2026-04-22.dahlia',
      },
    );

    this.APP_URL = this.configService.getOrThrow<string>('APP_URL');
    const primaryWebhookSecret = this.configService.getOrThrow<string>(
      'STRIPE_WEBHOOK_SECRET',
    );

    const ngrokWebhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET_NGROK',
    );
    const cliWebhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET_CLI',
    );
    const extraWebhookSecretsRaw = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRETS',
    );

    const extraWebhookSecrets = extraWebhookSecretsRaw
      ? extraWebhookSecretsRaw
          .split(',')
          .map((secret) => secret.trim())
          .filter(Boolean)
      : [];

    this.WEBHOOK_SECRETS = [
      primaryWebhookSecret,
      ...(ngrokWebhookSecret ? [ngrokWebhookSecret] : []),
      ...(cliWebhookSecret ? [cliWebhookSecret] : []),
      ...extraWebhookSecrets,
    ];
  }

  public async create(
    plan: Plan,
    transaction: Transaction,
    user: User,
    billingPeriod: BillingPeriod,
  ) {
    const priceId =
      billingPeriod === BillingPeriod.MONTHLY
        ? plan.stripeMonthlyPriceId
        : plan.stripeYearlyPriceId;

    if (!priceId)
      throw new BadRequestException('Stripe priceId is missing for this plan');

    const successUrl = `${this.APP_URL}/payment/${transaction.id}/success`;
    const cancelUrl = `${this.APP_URL}`;

    // let customerId = user.stripeCustomerId

    // if (!customerId) {
    // 	const customer = await this.stripe.customers.create({
    // 		email: user.email,
    // 		name: user.name
    // 	})

    // 	customerId = customer.id

    // 	await this.prismaService.user.update({
    // 		where: {
    // 			id: user.id
    // 		},
    // 		data: {
    // 			stripeCustomerId: customerId
    // 		}
    // 	})
    // }

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      // customer: customerId,
      customer_email: user.email,
      line_items: [
        {
          // here we can also create stripe products dynamically if needed, now we use stripeId from site plans data
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription', // alt: 'payment', 'setup' - one-time, save card, respectively
      success_url: successUrl,
      // success_url: 'https://example.com/success',
      cancel_url: cancelUrl,
      // cancel_url: 'https://example.com/cancel',
      metadata: {
        transactionId: transaction.id,
        planId: plan.id,
        userId: user.id,
      },
    });

    return session;
  }

  // ეს არის საჭირო რადგან stripe-ი გვიგზავნის webhook-ებს სხვადასხვა ტიპის და ჩვენ გვინდა ყველა მათგანის დამუშავება, ამიტომ ვქმნით საერთო მეთოდს handleWebhook რომელიც მიიღებს stripe-ის event-ს და დააბრუნებს PaymentWebhookResult-ს თუ ეს event არის ის რაც ჩვენ გვაინტერესებს (მაგალითად, ჩექაუთ სესიის დასრულება ან ინვოისის გადახდის შედეგი) ან null-ს თუ ეს event არ არის ჩვენთვის საინტერესო. შემდეგ WebhookService-ში ამ handleWebhook მეთოდს გამოვიყენებთ Stripe-ის webhook-ის დამუშავებისას.
  public async handleWebhook(
    event: StripeWebhookEvent,
  ): Promise<PaymentWebhookResult | null> {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = (
          event as Extract<
            StripeWebhookEvent,
            { type: 'checkout.session.completed' }
          >
        ).data.object;
        const transactionId = session.metadata?.transactionId;
        const planId = session.metadata?.planId;
        const paymentId = session.id;

        if (!transactionId || !planId) return null;

        return {
          transactionId,
          planId,
          paymentId,
          status: TransactionStatus.SUCCEEDED,
          raw: event,
        };
      }

      // case 'invoice.payment_succeeded':
      // 	const invoice = event.data.object as Stripe.Invoice

      // 	if (invoice.billing_reason !== 'subscription_cycle') return null

      // 	return await this.handleAutoBilling(
      // 		invoice.customer as string,
      // 		TransactionStatus.SUCCEEDED,
      // 		invoice.id ?? '',
      // 		event
      // 	)

      case 'invoice.payment_failed': {
        const invoice = (
          event as Extract<
            StripeWebhookEvent,
            { type: 'invoice.payment_failed' }
          >
        ).data.object;

        // if (invoice.billing_reason === 'subscription_cycle') {
        // 	return await this.handleAutoBilling(
        // 		invoice.customer as string,
        // 		TransactionStatus.FAILED,
        // 		invoice.id ?? '',
        // 		event
        // 	)
        // } else {
        // 	const transactionId = invoice.metadata?.transactionId
        // 	const planId = invoice.metadata?.planId
        // 	const paymentId = invoice.id
        // }

        const transactionId = invoice.metadata?.transactionId;
        const planId = invoice.metadata?.planId;
        const paymentId = invoice.id;

        if (!transactionId || !planId || !paymentId) return null;

        return {
          transactionId,
          planId,
          paymentId,
          status: TransactionStatus.FAILED,
          raw: event,
        };
      }

      default:
        return null;
    }
  }

  public async parseEvent(
    rawBody: Buffer,
    signature: string,
  ): Promise<StripeWebhookEvent> {
    let lastError: Error | null = null;

    // Stripe recommends verifying the webhook signature using all known secrets to support secret rotation without downtime (https://stripe.com/docs/webhooks/signatures#secret-rotation)

    // we try each secret until one works, if none work we throw an error with details from the last attempt
    for (const secret of this.WEBHOOK_SECRETS) {
      try {
        // console.log(`Trying to verify Stripe webhook with secret: ${secret}`)
        return await this.stripe.webhooks.constructEventAsync(
          rawBody,
          signature,
          // secret is the signing secret for the webhook endpoint, not the API secret key, so it's safe to log it for debugging purposes if needed. Just make sure to remove such logs in production or secure them properly.
          secret,
        );
      } catch (error) {
        if (error instanceof Error) {
          lastError = error;
        }
      }
    }

    const details = lastError?.message ?? 'unknown error';
    throw new BadRequestException(
      `Webhook signature verification failed for configured Stripe webhook secret(s): ${details}`,
    );
  }
}
