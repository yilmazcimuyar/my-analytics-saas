// src/app/(marketing)/page.tsx
import { LandingHero, FeaturesSection, FaqSection } from '@/components/marketing/LandingHero';
import Link from 'next/link';

export const metadata = {
  title: 'MyAnalytics - Privacy-First Analytics Platform',
  description: 'A modern, privacy-focused analytics platform based on Umami. GDPR compliant, no cookies, real-time insights.',
};

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">MyAnalytics</h1>
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

      {/* Main Content */}
      <LandingHero />
      <FeaturesSection />
      <FaqSection />

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-6">Ready to get started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of businesses using MyAnalytics for privacy-first analytics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="px-8 py-3 bg-white text-blue-600 rounded hover:bg-gray-100 font-medium">
              Create Free Account
            </Link>
            <Link href="/pricing" className="px-8 py-3 border-2 border-white text-white rounded hover:bg-white hover:bg-opacity-10 font-medium">
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-semibold mb-4">MyAnalytics</h3>
              <p className="text-sm">
                Privacy-first analytics platform for modern websites.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="https://umami.is/docs" className="hover:text-white">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="https://umami.is" className="hover:text-white">Umami</a></li>
                <li><a href="https://github.com/umami-software/umami" className="hover:text-white">GitHub</a></li>
                <li><a href="#" className="hover:text-white">Community</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2024 MyAnalytics. Based on <a href="https://umami.is" className="hover:text-white">Umami</a>. MIT License.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
