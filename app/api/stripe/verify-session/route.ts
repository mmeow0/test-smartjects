import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function GET(request: NextRequest) {
  try {
    // Validate Stripe configuration
    if (!stripe) {
      console.error('Stripe not initialized - check STRIPE_SECRET_KEY')
      return NextResponse.json(
        { error: 'Payment system not configured' },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Check if the session was completed successfully
    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      )
    }

    // Return session verification data
    return NextResponse.json({
      verified: true,
      sessionId: session.id,
      paymentStatus: session.payment_status,
      customerEmail: session.customer_email,
      userId: session.metadata?.userId || session.client_reference_id,
      plan: session.metadata?.plan,
      amountTotal: session.amount_total,
      currency: session.currency,
      createdAt: new Date(session.created * 1000).toISOString(),
    })

  } catch (error) {
    console.error('Error verifying session:', error)
    
    // Handle specific Stripe errors
    if (error instanceof Error && error.message.includes('No such checkout session')) {
      return NextResponse.json(
        { error: 'Invalid session ID' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: 'Session verification failed' },
      { status: 500 }
    )
  }
}