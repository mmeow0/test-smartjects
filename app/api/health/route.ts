import { NextResponse } from 'next/server'
import { stripe, validateStripeConfig } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const healthCheck = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      status: 'healthy',
      checks: {
        environment_variables: {
          STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
          STRIPE_WEBHOOK_SECRET: !!process.env.STRIPE_WEBHOOK_SECRET,
          STRIPE_PRICE_ID_MONTHLY: !!process.env.STRIPE_PRICE_ID_MONTHLY,
          STRIPE_PRICE_ID_ANNUAL: !!process.env.STRIPE_PRICE_ID_ANNUAL,
          NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
          NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
          NEXT_PUBLIC_APP_URL: !!process.env.NEXT_PUBLIC_APP_URL,
        },
        stripe: {
          initialized: !!stripe,
          config_valid: stripe ? validateStripeConfig() : false,
        },
        supabase: {
          url_available: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          service_key_available: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        }
      }
    }

    // Test Supabase connection
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        )
        
        // Simple query to test connection
        const { error } = await supabase.from('users').select('count').limit(1)
        healthCheck.checks.supabase.connection = !error
        if (error) {
          healthCheck.checks.supabase.error = error.message
        }
      } else {
        healthCheck.checks.supabase.connection = false
        healthCheck.checks.supabase.error = 'Missing environment variables'
      }
    } catch (error) {
      healthCheck.checks.supabase.connection = false
      healthCheck.checks.supabase.error = error instanceof Error ? error.message : 'Unknown error'
    }

    // Test Stripe connection
    try {
      if (stripe) {
        // Simple Stripe API call to test connection
        await stripe.products.list({ limit: 1 })
        healthCheck.checks.stripe.connection = true
      } else {
        healthCheck.checks.stripe.connection = false
        healthCheck.checks.stripe.error = 'Stripe not initialized'
      }
    } catch (error) {
      healthCheck.checks.stripe.connection = false
      healthCheck.checks.stripe.error = error instanceof Error ? error.message : 'Unknown error'
    }

    // Determine overall status
    const envVarsOk = Object.values(healthCheck.checks.environment_variables).every(Boolean)
    const stripeOk = healthCheck.checks.stripe.initialized && healthCheck.checks.stripe.connection
    const supabaseOk = healthCheck.checks.supabase.connection

    if (!envVarsOk || !stripeOk || !supabaseOk) {
      healthCheck.status = 'degraded'
    }

    return NextResponse.json(healthCheck)

  } catch (error) {
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}