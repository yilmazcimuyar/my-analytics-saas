// src/components/subscription/SubscriptionManager.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { PLANS } from '@/lib/stripe';

interface SubscriptionData {
  subscription: {
    id: string;
    plan: string;
    status: string;
    currentPeriodEnd: string;
    stripeCustomerId?: string;
  };
  usage: {
    eventCount: number;
  };
  usagePercentage: number;
}

interface SubscriptionManagerProps {
  teamId: string;
}

export function SubscriptionManager({ teamId }: SubscriptionManagerProps) {
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSubscription() {
      try {
        const response = await fetch('/api/subscriptions', {
          headers: {
            'x-team-id': teamId,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch subscription');
        }

        const subscriptionData = await response.json();
        setData(subscriptionData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchSubscription();
  }, [teamId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;
  if (!data) return <div>No subscription found</div>;

  const plan = PLANS[data.subscription.plan as keyof typeof PLANS];
  const periodEnd = new Date(data.subscription.currentPeriodEnd);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Subscription Plan
      </h2>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Current Plan</label>
          <p className="text-lg font-semibold text-gray-900">{plan.name}</p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Status</label>
          <p className="text-lg font-semibold capitalize text-green-600">
            {data.subscription.status}
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">
            Billing Period Ends
          </label>
          <p className="text-lg font-semibold text-gray-900">
            {periodEnd.toLocaleDateString()}
          </p>
        </div>

        {/* Usage Display */}
        {plan.monthlyLimit !== null && (
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Monthly Events Usage
            </label>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  data.usagePercentage >= 100
                    ? 'bg-red-600'
                    : data.usagePercentage >= 80
                    ? 'bg-yellow-600'
                    : 'bg-green-600'
                }`}
                style={{ width: `${Math.min(data.usagePercentage, 100)}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {data.usage.eventCount.toLocaleString()} / {(plan.monthlyLimit / 1000).toFixed(0)}K events
            </p>
            {data.usagePercentage >= 100 && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                ⚠️ You've reached your monthly limit. Upgrade to continue tracking.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
