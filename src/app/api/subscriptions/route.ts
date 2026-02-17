// src/app/api/subscriptions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getTeamSubscription, createTeamSubscription, upgradeSubscription } from '@/lib/subscription';
import { getTeamUsage, getUsagePercentage } from '@/lib/usage';
import { db } from '@/lib/db';

// GET /api/subscriptions - Get current subscription info
export async function GET(request: NextRequest) {
  try {
    const teamId = request.headers.get('x-team-id');
    if (!teamId) {
      return NextResponse.json({ error: 'Team ID required' }, { status: 400 });
    }

    const subscription = await getTeamSubscription(teamId);
    if (!subscription) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
    }

    const usage = await getTeamUsage(teamId);
    const usagePercentage = await getUsagePercentage(teamId);

    return NextResponse.json({
      subscription,
      usage,
      usagePercentage,
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/subscriptions - Create or upgrade subscription
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, plan, email, teamName } = body;
    const teamId = request.headers.get('x-team-id');

    if (!teamId) {
      return NextResponse.json({ error: 'Team ID required' }, { status: 400 });
    }

    if (action === 'create') {
      if (!email || !teamName) {
        return NextResponse.json(
          { error: 'Email and team name required' },
          { status: 400 }
        );
      }

      const subscription = await createTeamSubscription(
        teamId,
        email,
        teamName,
        plan || 'HOBBY'
      );

      return NextResponse.json(subscription, { status: 201 });
    }

    if (action === 'upgrade') {
      if (!plan) {
        return NextResponse.json(
          { error: 'Plan required' },
          { status: 400 }
        );
      }

      const subscription = await upgradeSubscription(teamId, plan);
      return NextResponse.json(subscription);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error managing subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
