// src/lib/usage.ts
import { db } from '@/lib/db';
import { Subscription, Usage, Team } from '@/generated/prisma';
import { PLANS, SubscriptionPlan } from './stripe';

export async function getTeamUsage(teamId: string, month?: number, year?: number) {
  const now = new Date();
  const currentMonth = month || now.getMonth() + 1;
  const currentYear = year || now.getFullYear();

  const subscription = await db.subscription.findUnique({
    where: { teamId },
  });

  if (!subscription) {
    return null;
  }

  const usage = await db.usage.findUnique({
    where: {
      subscriptionId_year_month: {
        subscriptionId: subscription.id,
        year: currentYear,
        month: currentMonth,
      },
    },
  });

  return usage;
}

export async function incrementEventCount(
  teamId: string,
  increment: number = 1,
) {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const subscription = await db.subscription.findUnique({
    where: { teamId },
  });

  if (!subscription) {
    return null;
  }

  let usage = await db.usage.findUnique({
    where: {
      subscriptionId_year_month: {
        subscriptionId: subscription.id,
        year: currentYear,
        month: currentMonth,
      },
    },
  });

  if (!usage) {
    usage = await db.usage.create({
      data: {
        id: crypto.randomUUID(),
        subscriptionId: subscription.id,
        teamId,
        year: currentYear,
        month: currentMonth,
        eventCount: BigInt(increment),
        limitReached: false,
      },
    });
  } else {
    const newCount = BigInt(usage.eventCount) + BigInt(increment);
    const plan = PLANS[subscription.plan as SubscriptionPlan];
    const limitReached =
      plan.monthlyLimit !== null && newCount > BigInt(plan.monthlyLimit);

    usage = await db.usage.update({
      where: { id: usage.id },
      data: {
        eventCount: newCount,
        limitReached,
      },
    });
  }

  return usage;
}

export async function checkUsageLimit(teamId: string): Promise<boolean> {
  const usage = await getTeamUsage(teamId);
  if (!usage) return false;

  const subscription = await db.subscription.findUnique({
    where: { teamId },
  });

  if (!subscription) return false;

  const plan = PLANS[subscription.plan as SubscriptionPlan];
  if (plan.monthlyLimit === null) return false;

  return usage.limitReached;
}

export async function getUsagePercentage(teamId: string): Promise<number> {
  const usage = await getTeamUsage(teamId);
  if (!usage) return 0;

  const subscription = await db.subscription.findUnique({
    where: { teamId },
  });

  if (!subscription) return 0;

  const plan = PLANS[subscription.plan as SubscriptionPlan];
  if (plan.monthlyLimit === null) return 0;

  return (Number(usage.eventCount) / plan.monthlyLimit) * 100;
}

export async function resetMonthlyUsage() {
  // This function should be called via a cron job on the 1st of every month
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  // Reset all usage records from previous month
  const previousMonth = month === 1 ? 12 : month - 1;
  const previousYear = month === 1 ? year - 1 : year;

  await db.usage.deleteMany({
    where: {
      month: previousMonth,
      year: previousYear,
    },
  });
}
