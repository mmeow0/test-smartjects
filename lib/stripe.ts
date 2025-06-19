import { loadStripe, Stripe } from '@stripe/stripe-js'
import StripeServer from 'stripe'

// Environment variable validation
const getRequiredEnvVar = (name: string): string => {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

// Client-side Stripe instance
let stripePromise: Promise<Stripe | null>

export const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    if (!publishableKey) {
      console.error('Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY')
      return Promise.resolve(null)
    }
    stripePromise = loadStripe(publishableKey)
  }
  return stripePromise
}

// Server-side Stripe instance - only initialize if we have the secret key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY
export const stripe = stripeSecretKey ? new StripeServer(stripeSecretKey, {
  apiVersion: '2024-06-20',
  typescript: true,
}) : null

// Stripe webhook endpoint secret
export const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

// Product and price configurations
export const STRIPE_CONFIG = {
  products: {
    pro: {
      monthly: process.env.STRIPE_PRICE_ID_MONTHLY || '',
      annual: process.env.STRIPE_PRICE_ID_ANNUAL || '',
    },
  },
  currency: 'usd',
  mode: 'subscription' as const,
  success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/upgrade?canceled=true`,
}

// Function to validate Stripe configuration
export const validateStripeConfig = () => {
  const requiredEnvVars = [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'STRIPE_PRICE_ID_MONTHLY',
    'STRIPE_PRICE_ID_ANNUAL',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'
  ]
  
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar])
  
  if (missing.length > 0) {
    console.warn(`Missing Stripe environment variables: ${missing.join(', ')}`)
    return false
  }
  
  return true
}

// Helper function to format amount for display
export const formatAmountForDisplay = (amount: number, currency: string): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
  }).format(amount / 100)
}

// Helper function to format amount for Stripe
export const formatAmountForStripe = (amount: number, currency: string): number => {
  return Math.round(amount * 100)
}