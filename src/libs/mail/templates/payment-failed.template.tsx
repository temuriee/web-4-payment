import * as React from 'react';
import {
  Html,
  Body,
  Container,
  Head,
  Preview,
  Tailwind,
  Heading,
  Text,
  Font,
} from '@react-email/components';
import type { Transaction } from '@prisma/client';
import {
  formatTransactionDate,
  getFormattedAmount,
  getProviderName,
} from 'src/common/utils/payment';

export interface PaymentFailedTemplateProps {
  transaction: Transaction;
}

export function PaymentFailedTemplate({
  transaction,
}: PaymentFailedTemplateProps) {
  return (
    <Html>
      <Head>
        <Font
          fontFamily="Geist"
          fallbackFontFamily="Arial"
          webFont={{
            url: 'https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap',
            format: 'woff2',
          }}
        />
      </Head>
      <Tailwind>
        <Preview>Payment Processing Issue</Preview>

        <Body className="bg-gray-50 font-sans text-gray-700">
          <Container className="max-w-2xl mx-auto bg-white rounded-md shadow-md">
            <div className="relative px-8 py-16 overflow-hidden">
              <div className="relative text-center">
                <Heading className="mb-2 text-2xl font-bold text-slate-900">
                  Payment Failed!
                </Heading>
                <Text className="text-base text-slate-500">
                  An error occurred while processing your payment. You can retry
                  the payment in your account dashboard.
                </Text>
              </div>

              <div className="p-8 mt-8 bg-gray-100 rounded-xl">
                <Heading className="mb-6 text-xl font-semibold text-slate-900">
                  Payment Details
                </Heading>

                <div className="mb-3 flex justify-between text-sm text-slate-500">
                  <span>Transaction ID:</span>{' '}
                  <span className="font-mono text-slate-900">
                    {transaction.id}
                  </span>
                </div>

                <div className="mb-3 flex justify-between text-sm text-slate-500">
                  <span>Date:</span>{' '}
                  <span className="text-slate-900">
                    {formatTransactionDate(transaction.createdAt)}
                  </span>
                </div>

                <div className="mb-6 flex justify-between text-sm text-slate-500">
                  <span>Payment Method:</span>{' '}
                  <span className="text-slate-900">
                    {getProviderName(transaction.provider)}
                  </span>
                </div>

                <div className="flex justify-between pt-3 border-t border-gray-300">
                  <span className="text-lg font-semibold text-slate-900">
                    Amount:
                  </span>{' '}
                  <span className="text-lg font-bold text-slate-900">
                    {getFormattedAmount(transaction)}
                  </span>
                </div>
              </div>

              <div className="mt-10 text-center">
                <Text className="text-sm text-slate-500">
                  If the problem persists, please contact support or retry the
                  payment in your account dashboard.
                </Text>
              </div>
            </div>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
