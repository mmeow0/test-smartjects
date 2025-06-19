import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_CONFIG, validateStripeConfig } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  console.log('🚀 Checkout API called')
  
  try {
    // Log environment variables status (without exposing values)
    console.log('📋 Environment check:', {
      STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: !!process.env.STRIPE_WEBHOOK_SECRET,
      STRIPE_PRICE_ID_MONTHLY: !!process.env.STRIPE_PRICE_ID_MONTHLY,
      STRIPE_PRICE_ID_ANNUAL: !!process.env.STRIPE_PRICE_ID_ANNUAL,
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    })

    // Validate Stripe configuration
    if (!stripe) {
      console.error('❌ Stripe not initialized - check STRIPE_SECRET_KEY')
      return NextResponse.json(
        { error: 'Payment system not configured' },
        { status: 500 }
      )
    }
    console.log('✅ Stripe initialized')

    if (!validateStripeConfig()) {
      console.error('❌ Stripe configuration incomplete')
      return NextResponse.json(
        { error: 'Payment system configuration incomplete' },
        { status: 500 }
      )
    }
    console.log('✅ Stripe configuration valid')

    const body = await request.json()
    console.log('📄 Request body received:', { plan: body.plan, userId: body.userId ? 'present' : 'missing' })
    
    const { plan, userId } = body
    
    if (!userId) {
      console.error('❌ Missing userId in request')
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }
    console.log('✅ UserId validated:', userId)

    // Get user profile from database
    console.log('🔍 Fetching user profile from Supabase...')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('id', userId)
      .single()

    if (profileError) {
      console.error('❌ Supabase error:', profileError)
      return NextResponse.json(
        { error: 'Database error: ' + profileError.message },
        { status: 500 }
      )
    }

    if (!userProfile) {
      console.error('❌ User not found:', userId)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    console.log('✅ User profile found:', { id: userProfile.id, email: userProfile.email })
    
    if (!plan || !['monthly', 'annual'].includes(plan)) {
      console.error('❌ Invalid plan:', plan)
      return NextResponse.json(
        { error: 'Invalid plan type' },
        { status: 400 }
      )
    }
    console.log('✅ Plan validated:', plan)

    // Get the price ID based on the selected plan
    const priceId = STRIPE_CONFIG.products.pro[plan as 'monthly' | 'annual']
    console.log('🔍 Price ID lookup:', { plan, priceId: priceId ? 'found' : 'not found' })

    if (!priceId) {
      console.error('❌ Price configuration not found for plan:', plan)
      console.error('Available config:', STRIPE_CONFIG.products.pro)
      return NextResponse.json(
        { error: 'Price configuration not found' },
        { status: 500 }
      )
    }
    console.log('✅ Price ID found:', priceId)

    // Create Stripe checkout session
    console.log('🛒 Creating Stripe checkout session...')
    console.log('Session config:', {
      mode: STRIPE_CONFIG.mode,
      success_url: STRIPE_CONFIG.success_url,
      cancel_url: STRIPE_CONFIG.cancel_url,
      customer_email: userProfile.email,
      client_reference_id: userProfile.id,
    })

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

    console.log('✅ Checkout session created:', checkoutSession.id)

    return NextResponse.json({ 
      sessionId: checkoutSession.id,
      url: checkoutSession.url 
    })

  } catch (error) {
    console.error('❌ Checkout API Error:', error)
    
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}