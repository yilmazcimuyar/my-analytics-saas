// src/app/(marketing)/pricing/page.tsx
'use client';

import { PricingTable } from '@/components/pricing/PricingTable';
import Link from 'next/link';
import { useState } from 'react';

export const metadata = {
  title: 'Pricing - MyAnalytics',
  description: 'Simple, transparent pricing for privacy-first analytics.',
};

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | undefined>();

  const handleSelectPlan = (plan: string) => {
    // Redirect to checkout or registration based on plan
    if (plan === 'HOBBY') {
      window.location.href = '/register';
    } else {
      // Store selected plan and redirect to registration
      localStorage.setItem('selectedPlan', plan);
      window.location.href = '/register';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            MyAnalytics
          </Link>
          <div className="flex gap-4">
            <Link href="/login" className="px-4 py-2 text-blue-600 hover:text-blue-700">
              Sign In
            </Link>
            <Link href="/register" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Pricing Header */}
      <div className="bg-gradient-to-b from-blue-50 to-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that's right for your needs. All plans include our full feature set.
            No hidden fees. Cancel anytime.
          </p>
        </div>
      </div>

      {/* Pricing Table */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <PricingTable 
          onSelectPlan={handleSelectPlan}
          currentPlan={selectedPlan as any}
        />
      </div>

      {/* Comparison */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Plan Comparison
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold">Feature</th>
                  <th className="text-center py-3 px-4 font-semibold">Hobby</th>
                  <th className="text-center py-3 px-4 font-semibold">Pro</th>
                  <th className="text-center py-3 px-4 font-semibold">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-4 px-4 font-medium">Monthly Events</td>
                  <td className="text-center py-4 px-4">100K</td>
                  <td className="text-center py-4 px-4">Unlimited</td>
                  <td className="text-center py-4 px-4">Unlimited</td>
                </tr>
                <tr className="border-b border-gray-200 bg-gray-100">
                  <td className="py-4 px-4 font-medium">Team Members</td>
                  <td className="text-center py-4 px-4">1</td>
                  <td className="text-center py-4 px-4">10</td>
                  <td className="text-center py-4 px-4">Unlimited</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-4 px-4 font-medium">Custom Events</td>
                  <td className="text-center py-4 px-4">✓</td>
                  <td className="text-center py-4 px-4">✓</td>
                  <td className="text-center py-4 px-4">✓</td>
                </tr>
                <tr className="border-b border-gray-200 bg-gray-100">
                  <td className="py-4 px-4 font-medium">White Label</td>
                  <td className="text-center py-4 px-4">-</td>
                  <td className="text-center py-4 px-4">✓</td>
                  <td className="text-center py-4 px-4">✓</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-4 px-4 font-medium">Custom Domain</td>
                  <td className="text-center py-4 px-4">-</td>
                  <td className="text-center py-4 px-4">✓</td>
                  <td className="text-center py-4 px-4">✓</td>
                </tr>
                <tr className="border-b border-gray-200 bg-gray-100">
                  <td className="py-4 px-4 font-medium">Advanced Reports</td>
                  <td className="text-center py-4 px-4">-</td>
                  <td className="text-center py-4 px-4">✓</td>
                  <td className="text-center py-4 px-4">✓</td>
                </tr>
                <tr className="bg-gray-100">
                  <td className="py-4 px-4 font-medium">Priority Support</td>
                  <td className="text-center py-4 px-4">-</td>
                  <td className="text-center py-4 px-4">-</td>
                  <td className="text-center py-4 px-4">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Pricing FAQs
          </h2>

          <div className="space-y-8">
            <details className="border border-gray-200 rounded-lg p-6 cursor-pointer">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                <span>What happens when I reach my monthly limit?</span>
                <span className="text-2xl">+</span>
              </summary>
              <p className="text-gray-600 mt-4">
                When you reach your monthly limit, new events won't be tracked. You'll see an upgrade banner in your dashboard. 
                Upgrade anytime to continue tracking, and usage resets on the 1st of each month.
              </p>
            </details>

            <details className="border border-gray-200 rounded-lg p-6 cursor-pointer">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                <span>Can I cancel my subscription anytime?</span>
                <span className="text-2xl">+</span>
              </summary>
              <p className="text-gray-600 mt-4">
                Yes! You can cancel your subscription anytime from your account settings. Your data remains accessible
                for 30 days after cancellation.
              </p>
            </details>

            <details className="border border-gray-200 rounded-lg p-6 cursor-pointer">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                <span>Do you offer custom enterprise plans?</span>
                <span className="text-2xl">+</span>
              </summary>
              <p className="text-gray-600 mt-4">
                Yes! For enterprise needs, contact our sales team. We offer custom plans with dedicated support,
                SLA guarantees, and unlimited everything.
              </p>
            </details>

            <details className="border border-gray-200 rounded-lg p-6 cursor-pointer">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                <span>What payment methods do you accept?</span>
                <span className="text-2xl">+</span>
              </summary>
              <p className="text-gray-600 mt-4">
                We accept all major credit cards (Visa, Mastercard, American Express) via Stripe. 
                Enterprise customers can arrange alternative payment methods.
              </p>
            </details>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-blue-600 text-white py-12">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <Link href="/register" className="inline-block px-8 py-3 bg-white text-blue-600 rounded hover:bg-gray-100 font-semibold">
            Start Your Free Trial Now
          </Link>
        </div>
      </div>
    </div>
  );
}
