import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe, webhookSecret } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import { userService } from '@/lib/services/user.service'
import Stripe from 'stripe'

// Server-side Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key for server operations
)

// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = webhookSecret

export async function POST(request: NextRequest) {
  // Validate Stripe configuration
  if (!stripe) {
    console.error('Stripe not initialized - check STRIPE_SECRET_KEY')
    return NextResponse.json(
      { error: 'Payment system not configured' },
      { status: 500 }
    )
  }

  if (!endpointSecret) {
    console.error('Webhook secret not configured - check STRIPE_WEBHOOK_SECRET')
    return NextResponse.json(
      { error: 'Webhook not configured' },
      { status: 500 }
    )
  }

  const body = await request.text()
  const sig = headers().get('stripe-signature') as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err: any) {
    console.error(`Webhook signature verification failed.`, err.message)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
      
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break
      
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break
      
      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId || session.client_reference_id
  const plan = session.metadata?.plan
  
  if (!userId) {
    console.error('No user ID found in checkout session')
    return
  }

  console.log(`Checkout completed for user ${userId} with plan ${plan}`)
  
  try {
    // Update user in Supabase
    const { error } = await supabase
      .from('users')
      .update({
        account_type: 'paid',
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: session.subscription as string,
        subscription_plan: plan,
        subscription_status: 'active',
        subscription_created_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) {
      console.error('Error updating user after checkout:', error)
    } else {
      console.log(`Successfully updated user ${userId} to paid account`)
    }
  } catch (error) {
    console.error('Error in handleCheckoutSessionCompleted:', error)
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId
  
  if (!userId) {
    console.error('No user ID found in subscription metadata')
    return
  }

  console.log(`Subscription created for user ${userId}`)
  
  try {
    const { error } = await supabase
      .from('users')
      .update({
        stripe_subscription_id: subscription.id,
        subscription_status: subscription.status,
        subscription_current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      })
      .eq('id', userId)

    if (error) {
      console.error('Error updating user subscription:', error)
    } else {
      console.log(`Successfully updated subscription for user ${userId}`)
    }
  } catch (error) {
    console.error('Error in handleSubscriptionCreated:', error)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId
  
  if (!userId) {
    console.error('No user ID found in subscription metadata')
    return
  }

  console.log(`Subscription updated for user ${userId}`)
  
  try {
    const { error } = await supabase
      .from('users')
      .update({
        subscription_status: subscription.status,
        subscription_current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      })
      .eq('id', userId)

    if (error) {
      console.error('Error updating subscription:', error)
    } else {
      console.log(`Successfully updated subscription for user ${userId}`)
    }
  } catch (error) {
    console.error('Error in handleSubscriptionUpdated:', error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId
  
  if (!userId) {
    console.error('No user ID found in subscription metadata')
    return
  }

  console.log(`Subscription deleted for user ${userId}`)
  
  try {
    const { error } = await supabase
      .from('users')
      .update({
        account_type: 'free',
        subscription_status: 'canceled',
        subscription_canceled_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) {
      console.error('Error updating user after subscription deletion:', error)
    } else {
      console.log(`Successfully downgraded user ${userId} to free account`)
    }
  } catch (error) {
    console.error('Error in handleSubscriptionDeleted:', error)
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string
  
  if (subscriptionId) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const userId = subscription.metadata?.userId
    
    if (userId) {
      console.log(`Payment succeeded for user ${userId}`)
      
      try {
        // Update user payment status
        const { error: userError } = await supabase
          .from('users')
          .update({
            subscription_status: 'active',
            last_payment_date: new Date().toISOString(),
          })
          .eq('id', userId)

        if (userError) {
          console.error('Error updating user payment status:', userError)
        }

        // Optionally create payment history record
        // You can create a payment_history table in Supabase if needed
        /*
        const { error: paymentError } = await supabase
          .from('payment_history')
          .insert({
            user_id: userId,
            stripe_invoice_id: invoice.id,
            amount: invoice.amount_paid / 100, // Convert from cents
            currency: invoice.currency,
            status: 'succeeded',
          })
        */
      } catch (error) {
        console.error('Error in handleInvoicePaymentSucceeded:', error)
      }
    }
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string
  
  if (subscriptionId) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const userId = subscription.metadata?.userId
    
    if (userId) {
      console.log(`Payment failed for user ${userId}`)
      
      try {
        // Update user subscription status to past_due
        const { error: userError } = await supabase
          .from('users')
          .update({
            subscription_status: 'past_due',
          })
          .eq('id', userId)

        if (userError) {
          console.error('Error updating user after payment failure:', userError)
        }

        // Optionally create payment history record
        /*
        const { error: paymentError } = await supabase
          .from('payment_history')
          .insert({
            user_id: userId,
            stripe_invoice_id: invoice.id,
            amount: invoice.amount_due / 100, // Convert from cents
            currency: invoice.currency,
            status: 'failed',
          })
        */

        // TODO: Send notification email to user about payment failure
      } catch (error) {
        console.error('Error in handleInvoicePaymentFailed:', error)
      }
    }
  }
}