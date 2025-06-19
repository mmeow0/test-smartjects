import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_CONFIG, validateStripeConfig } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    // Validate Stripe configuration
    if (!stripe) {
      console.error('Stripe not initialized - check STRIPE_SECRET_KEY')
      return NextResponse.json(
        { error: 'Payment system not configured' },
        { status: 500 }
      )
    }

    if (!validateStripeConfig()) {
      return NextResponse.json(
        { error: 'Payment system configuration incomplete' },
        { status: 500 }
      )
    }

    const { plan, userId } = await request.json()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get user profile from database
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('id', userId)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    if (!plan || !['monthly', 'annual'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan type' },
        { status: 400 }
      )
    }

    // Get the price ID based on the selected plan
    const priceId = STRIPE_CONFIG.products.pro[plan as 'monthly' | 'annual']

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price configuration not found' },
        { status: 500 }
      )
    }

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: STRIPE_CONFIG.mode,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: STRIPE_CONFIG.success_url,
      cancel_url: STRIPE_CONFIG.cancel_url,
      customer_email: userProfile.email || undefined,
      client_reference_id: userProfile.id,
      metadata: {
        userId: userProfile.id,
        plan: plan,
      },
      subscription_data: {
        metadata: {
          userId: userProfile.id,
          plan: plan,
        },
      },
      allow_promotion_codes: true,
    })

    return NextResponse.json({ 
      sessionId: checkoutSession.id,
      url: checkoutSession.url 
    })

  } catch (error) {
    console.error('Error creating checkout session:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}