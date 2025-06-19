"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"

export default function UpgradeSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, refreshUser } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [sessionVerified, setSessionVerified] = useState(false)

  const sessionId = searchParams.get("session_id")

  useEffect(() => {
    const verifySession = async () => {
      if (!sessionId) {
        toast({
          title: "Invalid session",
          description: "No payment session found. Please try again.",
          variant: "destructive",
        })
        router.push("/upgrade")
        return
      }

      try {
        // Optionally verify the session with your backend
        const response = await fetch(`/api/stripe/verify-session?session_id=${sessionId}`)
        
        if (response.ok) {
          setSessionVerified(true)
          // Refresh user data to get updated account type
          if (refreshUser) {
            await refreshUser()
          }
        } else {
          throw new Error('Session verification failed')
        }
      } catch (error) {
        console.error('Session verification error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    verifySession()
  }, [sessionId, router, toast, refreshUser])

  const handleContinue = () => {
    const redirectTo = searchParams.get("redirect") || "/dashboard"
    router.push(redirectTo)
  }

  if (isLoading) {
    return (
      <div className="container max-w-2xl py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold mb-2">Verifying your payment...</h1>
          <p className="text-muted-foreground">Please wait while we confirm your subscription.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-2xl py-12">
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-800">Payment Successful!</CardTitle>
          <CardDescription className="text-green-700">
            Welcome to Smartjects Pro! Your account has been upgraded successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-white rounded-lg p-4 border">
            <h3 className="font-semibold mb-3">What's next?</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                Access to unlimited proposals and contracts
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                Advanced analytics and reporting features
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                Priority customer support
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                Milestone tracking and project management
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">Need help getting started?</h4>
            <p className="text-sm text-blue-700 mb-3">
              Check out our getting started guide or contact our support team for personalized assistance.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => router.push("/help")}>
                View Guide
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push("/support")}>
                Contact Support
              </Button>
            </div>
          </div>

          <div className="text-center">
            <Button onClick={handleContinue} className="w-full">
              Continue to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              You will receive a confirmation email shortly with your receipt and subscription details.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}