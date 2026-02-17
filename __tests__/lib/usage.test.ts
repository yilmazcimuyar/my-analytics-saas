// __tests__/lib/usage.test.ts
import { getTeamUsage, incrementEventCount, checkUsageLimit, getUsagePercentage } from '@/lib/usage';
import { db } from '@/lib/db';
import { PLANS } from '@/lib/stripe';

jest.mock('@/lib/db');
jest.mock('@/lib/stripe', () => ({
  PLANS: {
    HOBBY: { monthlyLimit: 100000 },
    PRO: { monthlyLimit: null },
    ENTERPRISE: { monthlyLimit: null },
  },
}));

describe('Usage Tracking', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('incrementEventCount', () => {
    it('should increment event count for existing usage record', async () => {
      const mockDb = db as any;

      mockDb.subscription.findUnique.mockResolvedValueOnce({
        id: 'sub-123',
        plan: 'HOBBY',
      });

      mockDb.usage.findUnique.mockResolvedValueOnce({
        id: 'usage-123',
        eventCount: 5000n,
        limitReached: false,
      });

      mockDb.usage.update.mockResolvedValueOnce({
        id: 'usage-123',
        eventCount: 5001n,
        limitReached: false,
      });

      const result = await incrementEventCount('team-123', 1);

      expect(result.eventCount).toBe(5001n);
      expect(mockDb.usage.update).toHaveBeenCalled();
    });

    it('should create new usage record if not exists', async () => {
      const mockDb = db as any;

      mockDb.subscription.findUnique.mockResolvedValueOnce({
        id: 'sub-123',
        plan: 'HOBBY',
      });

      mockDb.usage.findUnique.mockResolvedValueOnce(null);

      mockDb.usage.create.mockResolvedValueOnce({
        id: 'usage-456',
        eventCount: 1n,
        limitReached: false,
      });

      const result = await incrementEventCount('team-123', 1);

      expect(result.eventCount).toBe(1n);
      expect(mockDb.usage.create).toHaveBeenCalled();
    });

    it('should mark limitReached when hobby plan exceeds 100k', async () => {
      const mockDb = db as any;

      mockDb.subscription.findUnique.mockResolvedValueOnce({
        id: 'sub-123',
        plan: 'HOBBY',
      });

      mockDb.usage.findUnique.mockResolvedValueOnce({
        id: 'usage-123',
        eventCount: 99999n,
        limitReached: false,
      });

      mockDb.usage.update.mockResolvedValueOnce({
        id: 'usage-123',
        eventCount: 100001n,
        limitReached: true,
      });

      const result = await incrementEventCount('team-123', 2);

      expect(result.limitReached).toBe(true);
    });
  });

  describe('checkUsageLimit', () => {
    it('should return false if limit not reached', async () => {
      const mockDb = db as any;

      mockDb.subscription.findUnique.mockResolvedValueOnce(null);

      const result = await checkUsageLimit('team-123');

      expect(result).toBe(false);
    });

    it('should return true if limit reached', async () => {
      const mockDb = db as any;

      mockDb.usage.findUnique.mockResolvedValueOnce({
        limitReached: true,
      });

      mockDb.subscription.findUnique.mockResolvedValueOnce({
        plan: 'HOBBY',
      });

      const result = await checkUsageLimit('team-123');

      expect(result).toBe(true);
    });
  });

  describe('getUsagePercentage', () => {
    it('should calculate usage percentage correctly', async () => {
      const mockDb = db as any;

      mockDb.usage.findUnique.mockResolvedValueOnce({
        eventCount: 50000n,
      });

      mockDb.subscription.findUnique.mockResolvedValueOnce({
        plan: 'HOBBY',
      });

      const result = await getUsagePercentage('team-123');

      expect(result).toBe(50); // 50000 / 100000 * 100
    });

    it('should return 0 for unlimited plans', async () => {
      const mockDb = db as any;

      mockDb.usage.findUnique.mockResolvedValueOnce({
        eventCount: 1000000n,
      });

      mockDb.subscription.findUnique.mockResolvedValueOnce({
        plan: 'PRO',
      });

      const result = await getUsagePercentage('team-123');

      expect(result).toBe(0); // Unlimited plan
    });
  });
});
