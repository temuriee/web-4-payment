import type { Plan } from '@prisma/client';

export const plans: Omit<Plan, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: 'Basic',
    description: 'Perfect for small projects and sole proprietors.',
    features: [
      '5 projects',
      '10GB storage',
      'Basic support',
      'Access to core features',
    ],
    isFeatured: false,
    monthlyPrice: 2,
    yearlyPrice: 20,
    stripeMonthlyPriceId: 'price_1SglbmADTNBivpyEj1Grspgz',
    stripeYearlyPriceId: 'price_1SglbmADTNBivpyEEUKBhKJD',
  },
  {
    title: 'Professional',
    description: 'Great for growing companies and teams.',
    features: [
      'Unlimited projects',
      '100GB storage',
      'Priority support',
      'Advanced analytics',
      'Team features',
    ],
    isFeatured: true,
    monthlyPrice: 4,
    yearlyPrice: 40,
    stripeMonthlyPriceId: 'price_1Sgld3ADTNBivpyEuV1uFJSx',
    stripeYearlyPriceId: 'price_1Sgld3ADTNBivpyEarKPPhrk',
  },
  {
    title: 'Business',
    description: 'For large enterprises with high demands.',
    features: [
      'Unlimited projects',
      '1TB storage',
      '24/7 premium support',
      'Advanced security',
      'Custom integrations',
      'Dedicated account manager',
    ],
    isFeatured: false,
    monthlyPrice: 6,
    yearlyPrice: 60,
    stripeMonthlyPriceId: 'price_1SgleJADTNBivpyEAWk7AE2Q',
    stripeYearlyPriceId: 'price_1SgleJADTNBivpyEhRMlNN0C',
  },
];
