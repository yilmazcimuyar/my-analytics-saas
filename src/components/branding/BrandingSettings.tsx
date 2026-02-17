// src/components/branding/BrandingSettings.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface BrandingData {
  id: string;
  teamId: string;
  logoUrl?: string | null;
  primaryColor: string;
  secondaryColor: string;
  customDomain?: string | null;
  faviconUrl?: string | null;
}

interface BrandingSettingsProps {
  teamId: string;
}

export function BrandingSettings({ teamId }: BrandingSettingsProps) {
  const [branding, setBranding] = useState<BrandingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    logoUrl: '',
    primaryColor: '#0066CC',
    secondaryColor: '#F0F4F8',
    customDomain: '',
    faviconUrl: '',
  });

  useEffect(() => {
    async function fetchBranding() {
      try {
        const response = await fetch('/api/branding', {
          headers: {
            'x-team-id': teamId,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch branding');
        }

        const data: BrandingData = await response.json();
        setBranding(data);
        setFormData({
          logoUrl: data.logoUrl || '',
          primaryColor: data.primaryColor,
          secondaryColor: data.secondaryColor,
          customDomain: data.customDomain || '',
          faviconUrl: data.faviconUrl || '',
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchBranding();
  }, [teamId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/branding', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-team-id': teamId,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update branding');
      }

      const updatedBranding: BrandingData = await response.json();
      setBranding(updatedBranding);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        White-Label Branding
      </h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          Error: {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
          Branding settings updated successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Logo URL
          </label>
          <input
            type="url"
            name="logoUrl"
            value={formData.logoUrl}
            onChange={handleChange}
            placeholder="https://example.com/logo.png"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {formData.logoUrl && (
            <img
              src={formData.logoUrl}
              alt="Logo preview"
              className="mt-2 h-12 w-auto"
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                name="primaryColor"
                value={formData.primaryColor}
                onChange={handleChange}
                className="h-10 w-14 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={formData.primaryColor}
                onChange={handleChange}
                name="primaryColor"
                placeholder="#0066CC"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secondary Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                name="secondaryColor"
                value={formData.secondaryColor}
                onChange={handleChange}
                className="h-10 w-14 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={formData.secondaryColor}
                onChange={handleChange}
                name="secondaryColor"
                placeholder="#F0F4F8"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Custom Domain
          </label>
          <input
            type="text"
            name="customDomain"
            value={formData.customDomain}
            onChange={handleChange}
            placeholder="analytics.yourcompany.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Note: Custom domain requires DNS configuration
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Favicon URL
          </label>
          <input
            type="url"
            name="faviconUrl"
            value={formData.faviconUrl}
            onChange={handleChange}
            placeholder="https://example.com/favicon.ico"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <Button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Branding Settings'}
        </Button>
      </form>
    </div>
  );
}
