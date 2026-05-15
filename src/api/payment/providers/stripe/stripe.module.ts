import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { PrismaModule } from 'src/infra/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}
