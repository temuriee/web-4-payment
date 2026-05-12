import { ApiProperty } from '@nestjs/swagger';
import { PaymentProvider, TransactionStatus } from '@prisma/client';

export class PaymentHistoryResponse {
  @ApiProperty({
    description: 'Unique transaction identifier',
    example: 'esGHgSmxpnO5hRQqSeJ-O',
  })
  public id: string;

  @ApiProperty({
    description: 'Transaction created at',
    example: '2025-07-26T15:39:47.024Z',
  })
  public createdAt: Date;

  @ApiProperty({
    description: 'Subscription plan name',
    example: 'Premium',
  })
  public plan: string;

  @ApiProperty({
    description: 'Amount of the transaction',
    example: 2499,
  })
  public amount: number;

  @ApiProperty({
    description: 'Payment provideer used for the transaction',
    example: PaymentProvider.YOOKASSA,
    enum: PaymentProvider,
  })
  public provider: PaymentProvider;

  @ApiProperty({
    description: 'Transaction status',
    example: TransactionStatus.SUCCEEDED,
    enum: TransactionStatus,
  })
  public status: TransactionStatus;
}
