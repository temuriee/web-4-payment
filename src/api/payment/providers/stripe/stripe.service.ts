import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BillingPeriod,
  User,
  type Plan,
  type Transaction,
} from '@prisma/client';
import { PrismaService } from 'src/infra/prisma/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly stripe: Stripe.Stripe;

  private readonly APP_URL: string; // could be moved to a common config service

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
      // metadata: {
      // 	transactionId: transaction.id,
      // 	planId: plan.id,
      // 	userId: user.id
      // }
    });

    return session;
  }
}
