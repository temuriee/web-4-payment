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
    monthlyPrice: 850,
    yearlyPrice: 8160,
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
    monthlyPrice: 2499,
    yearlyPrice: 23990,
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
    monthlyPrice: 4999,
    yearlyPrice: 47990,
  },
];
