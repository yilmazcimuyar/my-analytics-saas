// src/lib/stripe.ts
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10',
});

export type SubscriptionPlan = 'HOBBY' | 'PRO' | 'ENTERPRISE';

export interface PlanConfig {
  id: SubscriptionPlan;
  name: string;
  price: number;
  monthlyLimit: number | null; // null means unlimited
  features: string[];
  stripeProductId?: string;
}

export const PLANS: Record<SubscriptionPlan, PlanConfig> = {
  HOBBY: {
    id: 'HOBBY',
    name: 'Hobby',
    price: 0,
    monthlyLimit: 100000, // 100K events/month
    features: [
      'Up to 100K events/month',
      '1 team member',
      'Basic analytics',
      'Basic reports',
    ],
  },
  PRO: {
    id: 'PRO',
    name: 'Pro',
    price: 1999, // $19.99/month in cents
    monthlyLimit: null, // Unlimited
    features: [
      'Unlimited events',
      'Up to 10 team members',
      'Advanced analytics',
      'Custom events API',
      'Funnels & retention',
      'Email reports',
      'Team collaboration',
    ],
    stripeProductId: process.env.STRIPE_PRODUCT_PRO,
  },
  ENTERPRISE: {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    price: 0, // Custom pricing
    monthlyLimit: null, // Unlimited
    features: [
      'Unlimited everything',
      'Unlimited team members',
      'White-label support',
      'Custom domain',
      'Priority support',
      'SLA guarantee',
      'Custom integrations',
    ],
  },
};

export async function createStripeCustomer(
  teamId: string,
  email: string,
  teamName: string,
) {
  return stripe.customers.create({
    email,
    name: teamName,
    metadata: {
      teamId,
    },
  });
}

export async function createSubscription(
  customerId: string,
  priceId: string,
) {
  return stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    expand: ['latest_invoice.payment_intent'],
  });
}

export async function updateSubscriptionPlan(
  subscriptionId: string,
  newPriceId: string,
) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const itemId = subscription.items.data[0].id;

  return stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: itemId,
        price: newPriceId,
      },
    ],
    proration_behavior: 'create_prorations',
  });
}

export async function cancelSubscription(subscriptionId: string) {
  return stripe.subscriptions.del(subscriptionId);
}

export async function getCustomer(customerId: string) {
  return stripe.customers.retrieve(customerId);
}

export async function getSubscription(subscriptionId: string) {
  return stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['latest_invoice'],
  });
}
