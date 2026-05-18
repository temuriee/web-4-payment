import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  PaymentSuccessTemplate,
  SubscriptionExpiredTemplate,
} from './templates';
import { Transaction, User } from '@prisma/client';
import { render } from 'react-email';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  private readonly APP_URL: string;

  public constructor(
    private readonly mailerService: MailerService,
    @InjectQueue('mail') private readonly queue: Queue,
    private readonly configService: ConfigService,
  ) {
    this.APP_URL = this.configService.getOrThrow<string>('APP_URL');
  }

  public async sendPaymentSuccessEmail(user: User, transaction: Transaction) {
    const html = await render(PaymentSuccessTemplate({ transaction }));

    await this.queue.add(
      'send-email',
      {
        email: user.email,
        subject: 'Payment Succesfull',
        html,
      },
      {
        removeOnComplete: true,
      },
    );
  }

  public async sendPaymentFailedEmail(user: User, transaction: Transaction) {
    const html = await render(PaymentSuccessTemplate({ transaction }));

    await this.queue.add(
      'send-email',
      {
        email: user.email,
        subject: 'Payment Failed',
        html,
      },
      {
        removeOnComplete: true,
      },
    );
  }

  public async sendSubscriptionExpiredEmail(user: User) {
    const accountUrl = `${this.APP_URL}/dashboard`;
    const html = await render(SubscriptionExpiredTemplate({ accountUrl }));

    await this.queue.add(
      'send-email',
      {
        email: user.email,
        subject: 'your subscription expired',
        html,
      },
      {
        removeOnComplete: true,
      },
    );
  }

  public async sendMail(options: ISendMailOptions) {
    try {
      await this.mailerService.sendMail(options);
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}: error`);
      throw error;
    }
  }
}
