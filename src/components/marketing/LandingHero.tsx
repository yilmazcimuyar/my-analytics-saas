// src/components/marketing/LandingHero.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function LandingHero() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
            Privacy-First Analytics for{' '}
            <span className="text-blue-600">Your Website</span>
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            MyAnalytics is a modern, privacy-focused alternative to Google
            Analytics. Understand your users without invasive tracking.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/register">
              <Button className="bg-blue-600 text-white hover:bg-blue-700 px-8 py-3 text-lg">
                Get Started Free
              </Button>
            </Link>
            <Link href="/pricing">
              <Button className="bg-gray-200 text-gray-900 hover:bg-gray-300 px-8 py-3 text-lg">
                View Pricing
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                100%
              </div>
              <p className="text-gray-600">GDPR Compliant</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                No Cookies
              </div>
              <p className="text-gray-600">Privacy by Default</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                Real-Time
              </div>
              <p className="text-gray-600">Live Analytics</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FeaturesSection() {
  const features = [
    {
      title: 'Real-Time Analytics',
      description: 'See your visitors and events as they happen',
      icon: '⚡',
    },
    {
      title: 'UTM Tracking',
      description: 'Track campaigns with query parameters',
      icon: '🎯',
    },
    {
      title: 'Funnels & Retention',
      description: 'Understand user journeys and retention',
      icon: '📊',
    },
    {
      title: 'Custom Events',
      description: 'Track any event important to your business',
      icon: '🔧',
    },
    {
      title: 'Team Collaboration',
      description: 'Invite team members and control permissions',
      icon: '👥',
    },
    {
      title: 'White Label Setup',
      description: 'Customize colors, logo, and custom domain',
      icon: '🎨',
    },
  ];

  return (
    <div className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
          Powerful Features
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function FaqSection() {
  const faqs = [
    {
      question: 'Why MyAnalytics instead of Google Analytics?',
      answer:
        'MyAnalytics is privacy-first, no cookies, GDPR compliant, and much simpler to use without giving away your data.',
    },
    {
      question: 'Can I customize the dashboard?',
      answer:
        'Yes! With our white-label features, you can customize colors, logos, and even use your own domain.',
    },
    {
      question: 'How much data can I track?',
      answer:
        'Our Hobby plan includes 100K events/month, Pro plan is unlimited. Enterprise plans can be customized.',
    },
    {
      question: 'Is my data secure?',
      answer:
        'Absolutely. We use encrypted connections, secure infrastructure, and never share your data with third parties.',
    },
  ];

  return (
    <div className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
          Frequently Asked Questions
        </h2>

        <div className="space-y-8">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg border border-gray-200"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {faq.question}
              </h3>
              <p className="text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
