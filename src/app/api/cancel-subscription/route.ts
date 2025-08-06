import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

export async function POST(req: NextRequest) {
  try {
    const { subscriptionId, customerId } = await req.json();

    if (!subscriptionId && !customerId) {
      return NextResponse.json(
        { error: 'Subscription ID or Customer ID is required' },
        { status: 400 }
      );
    }

    let subscription;

    if (subscriptionId) {
      // Cancel specific subscription
      subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true, // Cancel at end of billing period
        metadata: {
          cancelled_by: 'customer',
          cancelled_at: new Date().toISOString(),
        },
      });
    } else if (customerId) {
      // Find and cancel active subscriptions for customer
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'active',
        limit: 10,
      });

      if (subscriptions.data.length === 0) {
        return NextResponse.json(
          { error: 'No active subscriptions found' },
          { status: 404 }
        );
      }

      // Cancel the first active subscription
      subscription = await stripe.subscriptions.update(subscriptions.data[0].id, {
        cancel_at_period_end: true,
        metadata: {
          cancelled_by: 'customer',
          cancelled_at: new Date().toISOString(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        cancel_at_period_end: subscription.cancel_at_period_end,
        current_period_end: subscription.current_period_end,
      },
      message: 'Subscription will be cancelled at the end of the current billing period.',
    });

  } catch (error) {
    console.error('Error cancelling subscription:', error);
    
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    return NextResponse.json(
      { 
        error: 'Failed to cancel subscription',
        ...(isDevelopment && { details: error instanceof Error ? error.message : 'Unknown error' })
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check subscription status
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customer_id');
    const subscriptionId = searchParams.get('subscription_id');

    if (!customerId && !subscriptionId) {
      return NextResponse.json(
        { error: 'Customer ID or Subscription ID is required' },
        { status: 400 }
      );
    }

    let subscriptions;

    if (subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      subscriptions = [subscription];
    } else if (customerId) {
      const result = await stripe.subscriptions.list({
        customer: customerId,
        limit: 10,
      });
      subscriptions = result.data;
    }

    return NextResponse.json({
      subscriptions: subscriptions?.map(sub => ({
        id: sub.id,
        status: sub.status,
        cancel_at_period_end: sub.cancel_at_period_end,
        current_period_start: sub.current_period_start,
        current_period_end: sub.current_period_end,
        cancelled_at: sub.cancelled_at,
      })) || [],
    });

  } catch (error) {
    console.error('Error fetching subscription:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch subscription details' },
      { status: 500 }
    );
  }
}