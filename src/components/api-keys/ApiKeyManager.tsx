// src/components/api-keys/ApiKeyManager.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  secret?: string;
  isActive: boolean;
  lastUsedAt?: string;
  createdAt: string;
}

interface ApiKeyManagerProps {
  teamId: string;
}

export function ApiKeyManager({ teamId }: ApiKeyManagerProps) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNewKeyForm, setShowNewKeyForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeySecret, setNewKeySecret] = useState<string | null>(null);

  useEffect(() => {
    fetchApiKeys();
  }, [teamId]);

  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/api-keys', {
        headers: {
          'x-team-id': teamId,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch API keys');
      }

      const keys: ApiKey[] = await response.json();
      setApiKeys(keys);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);

    try {
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-team-id': teamId,
        },
        body: JSON.stringify({ name: newKeyName }),
      });

      if (!response.ok) {
        throw new Error('Failed to create API key');
      }

      const newKey: ApiKey = await response.json();
      setNewKeySecret(newKey.secret);
      setApiKeys([...apiKeys, { ...newKey, secret: undefined }]);
      setNewKeyName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key?')) {
      return;
    }

    try {
      const response = await fetch(`/api/api-keys?id=${keyId}`, {
        method: 'DELETE',
        headers: {
          'x-team-id': teamId,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete API key');
      }

      setApiKeys(apiKeys.filter((k) => k.id !== keyId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">API Keys</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          Error: {error}
        </div>
      )}

      {newKeySecret && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm font-medium text-blue-900 mb-2">
            New API Key Created! Save your secret now - it won't be shown again.
          </p>
          <div className="bg-white p-3 rounded font-mono text-sm mb-4 break-all">
            {newKeySecret}
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(newKeySecret);
              setNewKeySecret(null);
            }}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Copy & Close
          </button>
        </div>
      )}

      {!showNewKeyForm && (
        <Button
          onClick={() => setShowNewKeyForm(true)}
          className="mb-6 bg-blue-600 text-white hover:bg-blue-700"
        >
          Create New API Key
        </Button>
      )}

      {showNewKeyForm && (
        <form onSubmit={handleCreateKey} className="mb-6 p-4 bg-gray-50 rounded">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="e.g., Production API Key"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              required
            />
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              type="submit"
              disabled={creating}
              className="bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create'}
            </Button>
            <Button
              type="button"
              onClick={() => setShowNewKeyForm(false)}
              className="bg-gray-300 text-gray-900 hover:bg-gray-400"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {apiKeys.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No API keys yet. Create one to get started.
        </div>
      ) : (
        <div className="space-y-4">
          {apiKeys.map((key) => (
            <div
              key={key.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded border border-gray-200"
            >
              <div className="flex-1">
                <p className="font-medium text-gray-900">{key.name}</p>
                <p className="text-sm text-gray-600 font-mono mt-1">
                  {key.key}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Created {new Date(key.createdAt).toLocaleDateString()}
                  {key.lastUsedAt && (
                    <>
                      {' • Last used: '}
                      {new Date(key.lastUsedAt).toLocaleDateString()}
                    </>
                  )}
                </p>
              </div>
              <button
                onClick={() => handleDeleteKey(key.id)}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
