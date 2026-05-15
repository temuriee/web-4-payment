import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infra/prisma/prisma.service';
import { PaymentWebhookResult } from './interfaces';
import {
  BillingPeriod,
  SubscriptionStatus,
  TransactionStatus,
} from '@prisma/client';

@Injectable()
export class PaymentHandler {
  private readonly logger = new Logger(PaymentHandler.name);

  public constructor(private readonly prismaService: PrismaService) {}

  // ეს არის საჭირო რადგან stripe-ი გვიგზავნის webhook-ებს სხვადასხვა ტიპის და ჩვენ გვინდა ყველა მათგანის დამუშავება, ამიტომ ვქმნით საერთო მეთოდს handleWebhook რომელიც მიიღებს stripe-ის event-ს და დააბრუნებს PaymentWebhookResult-ს თუ ეს event არის ის რაც ჩვენ გვაინტერესებს (მაგალითად, ჩექაუთ სესიის დასრულება ან ინვოისის გადახდის შედეგი) ან null-ს თუ ეს event არ არის ჩვენთვის საინტერესო. შემდეგ WebhookService-ში ამ handleWebhook მეთოდს გამოვიყენებთ Stripe-ის webhook-ის დამუშავებისას.
  public async processResult(result: PaymentWebhookResult) {
    const { transactionId, planId, paymentId, status, raw } = result;

    const transaction = await this.prismaService.transaction.findUnique({
      where: {
        id: transactionId,
      },
      include: {
        subscription: {
          include: {
            user: true,
            plan: true,
          },
        },
      },
    });

    if (!transaction) throw new NotFoundException('Transaction not found');

    await this.prismaService.transaction.update({
      where: {
        id: transaction.id,
      },
      data: {
        status,
        externalId: paymentId,
        providerMeta: raw,
      },
    });

    const subscription = transaction.subscription;

    if (status === TransactionStatus.SUCCEEDED && transaction.subscription) {
      const now = new Date();

      const isPlanChange = subscription.plan.id !== planId;

      let baseDate: Date;

      // Determine the base date for the new subscription period
      // თუ უკვე გასულია გამოწერილი ან გეგმას იცვლის ან ახლა ხდება გამოწერა მაშინ ახალი გამოწერის დაწყების თარიღი იქნება დღევანდელი დღე

      if (!subscription.endDate || subscription.endDate < now || isPlanChange) {
        baseDate = new Date(now);
      } else {
        // თუ გეგმა არ შეცვლილა და გამოწერა აქტიურია, მაშინ გაგრძელების თარიღი იქნება არსებული გამოწერის დასრულების თარიღი
        baseDate = new Date(subscription.endDate);
      }

      // Calculate new end date based on billing period
      let newEndDate = new Date(baseDate);

      // if plan y
      if (transaction.billingPeriod === BillingPeriod.YEARLY)
        newEndDate.setFullYear(newEndDate.getFullYear() + 1);
      else {
        const currentDay = newEndDate.getDate();
        newEndDate.setMonth(newEndDate.getMonth() + 1);

        // თუ თარიღი შეიცვალა (მაგალითად, იანვარი 31 + 1 თვე = მარტი 3), მაშინ ვაყენებთ თარიღს თვის ბოლო დღეზე
        // 1 month = 31 day, if next month has less days, set to last day of month, an in total sub will be 1 month not 1 month + x days and not skip to next month

        // 31 მაისი != 30 ივნისი
        if (newEndDate.getDate() !== currentDay) newEndDate.setDate(0);
      }

      await this.prismaService.userSubscription.update({
        where: {
          id: subscription.id,
        },
        data: {
          status: SubscriptionStatus.ACTIVE,
          startDate: now,
          endDate: newEndDate,
          plan: {
            connect: {
              // if plan was changed, connect to new plan
              id: planId,
            },
          },
        },
      });

      this.logger.log(`✅ Payment succeeded ${subscription.user.email}`);
    } else if (status === TransactionStatus.FAILED) {
      await this.prismaService.userSubscription.update({
        where: {
          id: subscription.id,
        },
        data: {
          status: SubscriptionStatus.EXPIRED,
        },
      });

      this.logger.error(`❌ Payment failed for ${subscription.user.email}`);
    }

    return { ok: true };
  }
}
