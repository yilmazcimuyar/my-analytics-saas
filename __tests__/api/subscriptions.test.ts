// __tests__/api/subscriptions.test.ts
import { GET, POST } from '@/app/api/subscriptions/route';
import { getTeamSubscription, createTeamSubscription, upgradeSubscription } from '@/lib/subscription';
import { getTeamUsage, getUsagePercentage } from '@/lib/usage';
import { NextRequest } from 'next/server';

jest.mock('@/lib/subscription');
jest.mock('@/lib/usage');

describe('/api/subscriptions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockRequest = (method = 'GET', body?: any, teamId = 'team-123') => {
    const request = {
      headers: new Map([
        ['x-team-id', teamId],
        body && ['content-type', 'application/json'],
      ].filter(Boolean) as [string, string][]),
      json: () => Promise.resolve(body || {}),
      text: () => Promise.resolve(JSON.stringify(body || {})),
    } as unknown as NextRequest;
    return request;
  };

  describe('GET', () => {
    it('should return subscription with usage', async () => {
      const mockSub = {
        id: 'sub-123',
        plan: 'PRO',
        status: 'ACTIVE',
      };
      const mockUsage = { eventCount: 50000n };

      (getTeamSubscription as jest.Mock).mockResolvedValueOnce(mockSub);
      (getTeamUsage as jest.Mock).mockResolvedValueOnce(mockUsage);
      (getUsagePercentage as jest.Mock).mockResolvedValueOnce(25);

      const request = mockRequest('GET');
      const response = await GET(request);

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.subscription).toEqual(mockSub);
      expect(data.usage).toEqual(mockUsage);
      expect(data.usagePercentage).toBe(25);
    });

    it('should return 400 if team ID missing', async () => {
      const request = mockRequest('GET', undefined, '');
      const response = await GET(request as any);

      expect(response.status).toBe(400);
    });

    it('should return 404 if no subscription found', async () => {
      (getTeamSubscription as jest.Mock).mockResolvedValueOnce(null);

      const request = mockRequest('GET');
      const response = await GET(request);

      expect(response.status).toBe(404);
    });
  });

  describe('POST', () => {
    it('should create subscription with action=create', async () => {
      const mockSub = { id: 'sub-123', plan: 'HOBBY' };
      (createTeamSubscription as jest.Mock).mockResolvedValueOnce(mockSub);

      const body = {
        action: 'create',
        plan: 'HOBBY',
        email: 'user@example.com',
        teamName: 'Test Team',
      };

      const request = mockRequest('POST', body);
      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(createTeamSubscription).toHaveBeenCalledWith(
        'team-123',
        'user@example.com',
        'Test Team',
        'HOBBY'
      );
    });

    it('should upgrade subscription with action=upgrade', async () => {
      const mockSub = { id: 'sub-123', plan: 'PRO' };
      (upgradeSubscription as jest.Mock).mockResolvedValueOnce(mockSub);

      const body = {
        action: 'upgrade',
        plan: 'PRO',
      };

      const request = mockRequest('POST', body);
      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(upgradeSubscription).toHaveBeenCalledWith('team-123', 'PRO');
    });

    it('should return 400 for invalid action', async () => {
      const body = { action: 'invalid' };

      const request = mockRequest('POST', body);
      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('should return 400 if email missing for create action', async () => {
      const body = {
        action: 'create',
        plan: 'HOBBY',
        teamName: 'Test Team',
        // email is missing
      };

      const request = mockRequest('POST', body);
      const response = await POST(request);

      expect(response.status).toBe(400);
    });
  });
});
