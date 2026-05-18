import { PaymentProvider, type Transaction } from '@prisma/client';
import { format } from 'date-fns';

export function formatTransactionDate(date: string | Date): string {
  return format(new Date(date), 'dd.MM.yyyy');
}

export function getProviderName(provider: PaymentProvider): string {
  switch (provider) {
    case PaymentProvider.STRIPE:
      return 'Stripe';
    default:
      return provider;
  }
}

export function getFormattedAmount(transaction: Transaction): string {
  return `$${(transaction.amount / 100).toFixed(2)}`;
}
