import { MailerModule } from '@nestjs-modules/mailer';

import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getMailerConfig } from 'src/config';

import { MailProcessor } from './mail.proccesor';
import { MailService } from './mail.service';
import { BullModule } from '@nestjs/bullmq';

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getMailerConfig,
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'mail',
    }),
  ],

  providers: [MailProcessor, MailService],
  exports: [MailService],
})
export class MailModule {}
