"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { getStripe } from "@/lib/stripe"

export default function UpgradePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated, upgradeAccount } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual">("annual")

  const handleUpgrade = async () => {
    if (!isAuthenticated) {
      const redirectUrl = `/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      router.push(redirectUrl)
      return
    }

    setIsLoading(true)
    try {
      // Create Stripe checkout session
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: selectedPlan,
          userId: user.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe checkout
      const stripe = await getStripe()
      if (!stripe) {
        throw new Error('Stripe failed to initialize')
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      })

      if (error) {
        throw new Error(error.message)
      }
    } catch (error) {
      console.error('Upgrade error:', error)
      
      let errorTitle = "Upgrade failed"
      let errorDescription = "There was an error upgrading your account. Please try again."
      
      if (error instanceof Error) {
        // Handle specific error types
        if (error.message.includes('fetch')) {
          errorTitle = "Connection Error"
          errorDescription = "Unable to connect to payment service. Please check your internet connection and try again."
        } else if (error.message.includes('Payment system not configured')) {
          errorTitle = "Service Unavailable"
          errorDescription = "Payment system is temporarily unavailable. Please try again later or contact support."
        } else if (error.message.includes('User not found')) {
          errorTitle = "Account Error"
          errorDescription = "There was an issue with your account. Please try logging out and back in."
        } else if (error.message.includes('Invalid plan type')) {
          errorTitle = "Plan Error"
          errorDescription = "Invalid subscription plan selected. Please refresh the page and try again."
        } else {
          errorDescription = error.message
        }
      }
      
      // Check if it's a network error
      if (!navigator.onLine) {
        errorTitle = "No Internet Connection"
        errorDescription = "Please check your internet connection and try again."
      }
      
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const features = [
    "View smartjects",
    "Unlimited proposals",
    "Unlimited contracts",
    "Advanced analytics",
    "Priority support",
    "Milestone tracking",
  ]

  const freeFeatures = features.slice(0, 1)

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
    <div className="container max-w-6xl py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Upgrade Your Smartjects Experience</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Unlock the full potential of Smartjects with our premium features and take your business to the next level.
        </p>
      </div>

      <div className="flex justify-center mb-8">
        <div className="inline-flex items-center bg-muted p-1 rounded-lg">
          <Button
            variant={selectedPlan === "monthly" ? "default" : "ghost"}
            onClick={() => setSelectedPlan("monthly")}
            className="rounded-md"
          >
            Monthly
          </Button>
          <Button
            variant={selectedPlan === "annual" ? "default" : "ghost"}
            onClick={() => setSelectedPlan("annual")}
            className="rounded-md"
          >
            Annual (Save 20%)
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Free Plan</CardTitle>
            <CardDescription>For individuals just getting started</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  {index < freeFeatures.length ? (
                    <Check className="mr-2 h-5 w-5 text-green-500" />
                  ) : (
                    <X className="mr-2 h-5 w-5 text-red-500" />
                  )}
                  <span className={index >= freeFeatures.length ? "text-muted-foreground" : ""}>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" disabled={true}>
              Current Plan
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-yellow-400">
          <CardHeader>
            <div className="bg-yellow-300 text-black px-3 py-1 rounded-full text-sm font-medium w-fit mb-2">
              Recommended
            </div>
            <CardTitle>Pro Plan</CardTitle>
            <CardDescription>For professionals and businesses</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">${selectedPlan === "monthly" ? "299" : "240"}</span>
              <span className="text-muted-foreground">/month</span>
              {selectedPlan === "annual" && (
                <div className="text-sm text-muted-foreground">Billed annually (${240 * 12}/year)</div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className="mr-2 h-5 w-5 text-green-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleUpgrade} disabled={isLoading || user?.accountType === "paid"}>
              {isLoading ? "Processing..." : user?.accountType === "paid" ? "Current Plan" : "Upgrade Now"}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto space-y-6 text-left">
          <div>
            <h3 className="font-bold mb-2">Can I cancel my subscription?</h3>
            <p className="text-muted-foreground">
              Yes, you can cancel your subscription at any time. If you cancel, you'll still have access to Pro features
              until the end of your billing period.
            </p>
          </div>
          <div>
            <h3 className="font-bold mb-2">Is there a free trial?</h3>
            <p className="text-muted-foreground">
              We don't offer a free trial, but we do have a 30-day money-back guarantee if you're not satisfied with the
              Pro plan.
            </p>
          </div>
          <div>
            <h3 className="font-bold mb-2">What payment methods do you accept?</h3>
            <p className="text-muted-foreground">
              We accept all major credit cards, PayPal, and bank transfers for annual plans.
            </p>
          </div>
          <div>
            <h3 className="font-bold mb-2">Can I upgrade or downgrade later?</h3>
            <p className="text-muted-foreground">
              Yes, you can upgrade to the Pro plan at any time. If you need to downgrade, you can do so from your
              account settings.
            </p>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}
