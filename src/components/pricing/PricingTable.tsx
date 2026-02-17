// src/components/pricing/PricingTable.tsx
'use client';

import React from 'react';
import { PLANS, SubscriptionPlan } from '@/lib/stripe';
import { Button } from '@/components/ui/button';

interface PricingTableProps {
  onSelectPlan?: (plan: SubscriptionPlan) => void;
  currentPlan?: SubscriptionPlan;
}

export function PricingTable({ onSelectPlan, currentPlan }: PricingTableProps) {
  const plans: SubscriptionPlan[] = ['HOBBY', 'PRO', 'ENTERPRISE'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12">
      {plans.map((plan) => {
        const config = PLANS[plan];
        const isSelected = plan === currentPlan;

        return (
          <div
            key={plan}
            className={`rounded-lg border transition-all ${
              isSelected
                ? 'border-blue-500 shadow-lg bg-blue-50'
                : 'border-gray-200 hover:shadow-md'
            }`}
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {config.name}
              </h3>
              
              <div className="mt-4 mb-6">
                {config.price === 0 ? (
                  <div className="text-3xl font-bold text-gray-900">Free</div>
                ) : (
                  <>
                    <div className="text-3xl font-bold text-gray-900">
                      ${(config.price / 100).toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">/month</div>
                  </>
                )}
              </div>

              {config.monthlyLimit !== null && (
                <div className="text-sm text-gray-600 mb-6">
                  {(config.monthlyLimit / 1000).toFixed(0)}K events/month
                </div>
              )}

              <Button
                onClick={() => onSelectPlan?.(plan)}
                disabled={isSelected}
                className={
                  isSelected
                    ? 'w-full bg-blue-600 text-white'
                    : 'w-full bg-gray-200 text-gray-900 hover:bg-gray-300'
                }
              >
                {isSelected ? 'Current Plan' : 'Select Plan'}
              </Button>

              <div className="mt-6 space-y-3">
                {config.features.map((feature) => (
                  <div key={feature} className="flex items-start text-sm">
                    <svg
                      className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
