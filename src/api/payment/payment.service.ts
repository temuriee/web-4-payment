import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/infra/prisma/prisma.service';

@Injectable()
export class PaymentService {
  public constructor(private readonly prismaService: PrismaService) {}

  public async getHistory(user: User) {
    const payments = await this.prismaService.transaction.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        subscription: {
          include: {
            plan: true,
          },
        },
      },
    });

    const formatted = payments.map((payment) => ({
      id: payment.id,
      createdAt: payment.createdAt,
      plan: payment.subscription.plan.title,
      amount: payment.amount,
      provider: payment.provider,
      status: payment.status,
    }));

    return formatted;
  }
}
