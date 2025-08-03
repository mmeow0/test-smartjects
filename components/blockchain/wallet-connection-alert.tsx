"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/hooks/use-wallet"
import { Wallet, AlertCircle } from "lucide-react"

interface WalletConnectionAlertProps {
  title?: string
  description?: string
  onConnect?: () => void
  className?: string
}

export function WalletConnectionAlert({
  title = "Wallet Connection Required",
  description = "You need to connect your wallet to proceed with this action.",
  onConnect,
  className,
}: WalletConnectionAlertProps) {
  const { isConnected, isConnecting, connect } = useWallet()

  // Don't show if wallet is already connected
  if (isConnected) {
    return null
  }

  const handleConnect = async () => {
    await connect()
    onConnect?.()
  }

  return (
    <Alert className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="mt-2">
        <div className="space-y-3">
          <p>{description}</p>
          <Button
            onClick={handleConnect}
            disabled={isConnecting}
            size="sm"
            className="gap-2"
          >
            <Wallet className="h-4 w-4" />
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
