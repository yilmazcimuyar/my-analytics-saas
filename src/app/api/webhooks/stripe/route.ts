// src/app/api/webhooks/stripe/route.ts
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { handleSubscriptionStatusUpdate } from '@/lib/subscription';
import { db } from '@/lib/db';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

async function handleInvoicePaid(event: any) {
  const invoice = event.data.object;
  console.log('Invoice paid:', invoice.id);
}

async function handleInvoiceFailed(event: any) {
  const invoice = event.data.object;
  console.log('Invoice failed:', invoice.id);
}

async function handleCustomerSubscriptionDeleted(event: any) {
  const subscription = event.data.object;
  console.log('Subscription deleted:', subscription.id);
  
  try {
    await handleSubscriptionStatusUpdate(subscription.id, 'CANCELLED');
  } catch (error) {
    console.error('Error handling subscription deletion:', error);
  }
}

async function handleCustomerSubscriptionUpdated(event: any) {
  const subscription = event.data.object;
  console.log('Subscription updated:', subscription.id);

  const dbSubscription = await db.subscription.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (!dbSubscription) {
    return;
  }

  let status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' = 'ACTIVE';
  if (subscription.status === 'canceled') {
    status = 'CANCELLED';
  } else if (subscription.status === 'past_due' || subscription.status === 'incomplete') {
    status = 'EXPIRED';
  }

  await db.subscription.update({
    where: { id: dbSubscription.id },
    data: {
      status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  });
}

async function handleCheckoutSessionCompleted(event: any) {
  const session = event.data.object;
  console.log('Checkout session completed:', session.id);

  if (session.payment_status === 'paid') {
    // Update subscription status in database
    if (session.subscription) {
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
      const teamId = subscription.metadata?.teamId;

      if (teamId) {
        const dbSubscription = await db.subscription.findFirst({
          where: { stripeSubscriptionId: subscription.id },
        });

        if (dbSubscription) {
          await db.subscription.update({
            where: { id: dbSubscription.id },
            data: {
              status: 'ACTIVE',
              currentPeriodStart: new Date(subscription.current_period_start * 1000),
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
          });
        }
      }
    }
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const sig = headersList.get('stripe-signature');

  if (!sig || !endpointSecret) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'invoice.paid':
        await handleInvoicePaid(event);
        break;
      case 'invoice.payment_failed':
        await handleInvoiceFailed(event);
        break;
      case 'customer.subscription.deleted':
        await handleCustomerSubscriptionDeleted(event);
        break;
      case 'customer.subscription.updated':
        await handleCustomerSubscriptionUpdated(event);
        break;
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
