// __tests__/lib/subscription.test.ts
import { createTeamSubscription, getTeamSubscription, upgradeSubscription } from '@/lib/subscription';
import { db } from '@/lib/db';
import { PLANS } from '@/lib/stripe';

// Mock Stripe
jest.mock('@/lib/stripe', () => ({
  stripe: {
    customers: {
      create: jest.fn(),
    },
    subscriptions: {
      create: jest.fn(),
      update: jest.fn(),
    },
  },
  createStripeCustomer: jest.fn(),
  PLANS: {
    HOBBY: { stripeProductId: undefined, monthlyLimit: 100000 },
    PRO: { stripeProductId: 'price_pro_test', monthlyLimit: null },
    ENTERPRISE: { stripeProductId: undefined, monthlyLimit: null },
  },
}));

// Mock Prisma
jest.mock('@/lib/db', () => ({
  db: {
    subscription: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('Subscription Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTeamSubscription', () => {
    it('should create HOBBY subscription without Stripe', async () => {
      const mockDb = db as any;
      mockDb.subscription.create.mockResolvedValueOnce({
        id: 'sub-123',
        teamId: 'team-123',
        plan: 'HOBBY',
        status: 'ACTIVE',
      });

      const result = await createTeamSubscription(
        'team-123',
        'user@example.com',
        'Test Company',
        'HOBBY'
      );

      expect(result).toEqual({
        id: 'sub-123',
        teamId: 'team-123',
        plan: 'HOBBY',
        status: 'ACTIVE',
      });
      expect(mockDb.subscription.create).toHaveBeenCalled();
    });

    it('should throw error if subscription already exists', async () => {
      const mockDb = db as any;
      mockDb.subscription.findUnique.mockResolvedValueOnce({
        id: 'sub-123',
        teamId: 'team-123',
      });

      await expect(
        createTeamSubscription('team-123', 'user@example.com', 'Test', 'HOBBY')
      ).rejects.toThrow('Team already has a subscription');
    });
  });

  describe('getTeamSubscription', () => {
    it('should retrieve team subscription', async () => {
      const mockDb = db as any;
      const mockSub = {
        id: 'sub-123',
        teamId: 'team-123',
        plan: 'PRO',
        status: 'ACTIVE',
        usage: [],
      };

      mockDb.subscription.findUnique.mockResolvedValueOnce(mockSub);

      const result = await getTeamSubscription('team-123');

      expect(result).toEqual(mockSub);
      expect(mockDb.subscription.findUnique).toHaveBeenCalledWith({
        where: { teamId: 'team-123' },
        include: { usage: true },
      });
    });
  });

  describe('upgradeSubscription', () => {
    it('should upgrade from HOBBY to PRO', async () => {
      const mockDb = db as any;
      mockDb.subscription.findUnique.mockResolvedValueOnce({
        id: 'sub-123',
        teamId: 'team-123',
        plan: 'HOBBY',
        stripeSubscriptionId: 'stripe_sub_123',
      });

      mockDb.subscription.update.mockResolvedValueOnce({
        id: 'sub-123',
        teamId: 'team-123',
        plan: 'PRO',
      });

      const result = await upgradeSubscription('team-123', 'PRO');

      expect(result.plan).toBe('PRO');
      expect(mockDb.subscription.update).toHaveBeenCalled();
    });
  });
});
