// src/app/api/subscriptions/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe, PLANS } from '@/lib/stripe';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plan } = body;
    const teamId = request.headers.get('x-team-id');

    if (!teamId) {
      return NextResponse.json({ error: 'Team ID required' }, { status: 400 });
    }

    if (!plan || !PLANS[plan]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    if (plan === 'HOBBY') {
      return NextResponse.json(
        { error: 'Hobby plan does not require checkout' },
        { status: 400 }
      );
    }

    // Get or create team info
    const team = await db.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    const subscription = await db.subscription.findUnique({
      where: { teamId },
    });

    let customerId = subscription?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        name: team.name,
        metadata: {
          teamId,
        },
      });
      customerId = customer.id;
    }

    const baseUrl = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: PLANS[plan].stripeProductId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${baseUrl}/dashboard/settings/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/dashboard/settings/billing?cancelled=true`,
      metadata: {
        teamId,
        plan,
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
