// src/lib/subscription.ts
import { db } from '@/lib/db';
import { PLANS, SubscriptionPlan, stripe, createStripeCustomer } from './stripe';

export async function createTeamSubscription(
  teamId: string,
  email: string,
  teamName: string,
  plan: SubscriptionPlan = 'HOBBY',
) {
  // Check if subscription already exists
  const existing = await db.subscription.findUnique({
    where: { teamId },
  });

  if (existing) {
    throw new Error('Team already has a subscription');
  }

  let stripeCustomerId = '';
  let stripeSubscriptionId = '';

  if (plan !== 'HOBBY') {
    // Create Stripe customer
    const customer = await createStripeCustomer(teamId, email, teamName);
    stripeCustomerId = customer.id;

    // For PRO plan, create a subscription (HOBBY is free, no Stripe needed)
    if (plan === 'PRO' && PLANS.PRO.stripeProductId) {
      const subscription = await stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [{ price: PLANS.PRO.stripeProductId }],
        payment_behavior: 'default_incomplete',
      });
      stripeSubscriptionId = subscription.id;
    }
  }

  return db.subscription.create({
    data: {
      id: crypto.randomUUID(),
      teamId,
      plan,
      status: 'ACTIVE',
      stripeCustomerId: stripeCustomerId || null,
      stripeSubscriptionId: stripeSubscriptionId || null,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });
}

export async function upgradeSubscription(
  teamId: string,
  newPlan: SubscriptionPlan,
) {
  const subscription = await db.subscription.findUnique({
    where: { teamId },
  });

  if (!subscription) {
    throw new Error('Team has no subscription');
  }

  if (!PLANS[newPlan].stripeProductId) {
    throw new Error('Plan does not support Stripe billing');
  }

  if (!subscription.stripeSubscriptionId) {
    throw new Error('Subscription has no Stripe ID');
  }

  // Update Stripe subscription
  const stripeSubscription = await stripe.subscriptions.retrieve(
    subscription.stripeSubscriptionId,
  );
  const itemId = stripeSubscription.items.data[0].id;

  await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
    items: [
      {
        id: itemId,
        price: PLANS[newPlan].stripeProductId!,
      },
    ],
    proration_behavior: 'create_prorations',
  });

  // Update database
  return db.subscription.update({
    where: { id: subscription.id },
    data: {
      plan: newPlan,
    },
  });
}

export async function cancelTeamSubscription(teamId: string) {
  const subscription = await db.subscription.findUnique({
    where: { teamId },
  });

  if (!subscription) {
    throw new Error('Team has no subscription');
  }

  if (subscription.stripeSubscriptionId) {
    await stripe.subscriptions.del(subscription.stripeSubscriptionId);
  }

  return db.subscription.update({
    where: { id: subscription.id },
    data: {
      status: 'CANCELLED',
      cancelledAt: new Date(),
    },
  });
}

export async function getTeamSubscription(teamId: string) {
  return db.subscription.findUnique({
    where: { teamId },
    include: {
      usage: true,
    },
  });
}

export async function handleSubscriptionStatusUpdate(
  subscriptionId: string,
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED',
) {
  const subscription = await db.subscription.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (!subscription) {
    throw new Error('Subscription not found');
  }

  return db.subscription.update({
    where: { id: subscription.id },
    data: {
      status,
      ...(status === 'CANCELLED' && { cancelledAt: new Date() }),
    },
  });
}
