"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { blockchainService } from "@/lib/services/blockchain.service"
import { Loader2, Wallet, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

interface TestResult {
  name: string
  status: 'pending' | 'success' | 'error' | 'warning'
  message: string
  details?: string
}

export function TestBlockchain() {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<TestResult[]>([])
  const [walletAddress, setWalletAddress] = useState<string | null>(null)

  const addResult = (result: TestResult) => {
    setResults(prev => [...prev, result])
  }

  const updateLastResult = (updates: Partial<TestResult>) => {
    setResults(prev => {
      const newResults = [...prev]
      const lastIndex = newResults.length - 1
      if (lastIndex >= 0) {
        newResults[lastIndex] = { ...newResults[lastIndex], ...updates }
      }
      return newResults
    })
  }

  const runTests = async () => {
    setIsRunning(true)
    setResults([])

    try {
      // Test 1: Wallet Connection
      addResult({ name: "Wallet Connection", status: 'pending', message: "Connecting to MetaMask..." })

      try {
        const address = await blockchainService.connectWallet()
        if (address) {
          setWalletAddress(address)
          updateLastResult({
            status: 'success',
            message: `Connected successfully`,
            details: `Address: ${address}`
          })
        } else {
          updateLastResult({
            status: 'error',
            message: "Failed to connect wallet",
            details: "No address returned"
          })
        }
      } catch (error: any) {
        updateLastResult({
          status: 'error',
          message: "Wallet connection failed",
          details: error.message
        })
      }

      // Test 2: Check if wallet is connected
      addResult({ name: "Wallet Status Check", status: 'pending', message: "Checking wallet status..." })

      try {
        const isConnected = await blockchainService.isWalletConnected()
        const currentAddress = await blockchainService.getWalletAddress()

        updateLastResult({
          status: isConnected ? 'success' : 'warning',
          message: isConnected ? "Wallet is connected" : "Wallet not connected",
          details: `Current address: ${currentAddress || 'None'}`
        })
      } catch (error: any) {
        updateLastResult({
          status: 'error',
          message: "Failed to check wallet status",
          details: error.message
        })
      }

      // Test 3: Get Balance
      addResult({ name: "Balance Check", status: 'pending', message: "Getting wallet balance..." })

      try {
        const balance = await blockchainService.getWalletBalance()
        updateLastResult({
          status: balance ? 'success' : 'warning',
          message: balance ? `Balance: ${balance} MATIC` : "Could not retrieve balance",
          details: balance ? `Available funds: ${balance} MATIC` : "Balance is null or zero"
        })
      } catch (error: any) {
        updateLastResult({
          status: 'error',
          message: "Failed to get balance",
          details: error.message
        })
      }

      // Test 4: Test Contract Address
      addResult({ name: "Contract Configuration", status: 'pending', message: "Checking contract addresses..." })

      try {
        const factoryAddress = process.env.NEXT_PUBLIC_ESCROW_FACTORY_ADDRESS
        if (factoryAddress && factoryAddress !== "") {
          updateLastResult({
            status: 'success',
            message: "Factory contract address configured",
            details: `Address: ${factoryAddress}`
          })
        } else {
          updateLastResult({
            status: 'warning',
            message: "Factory contract address not configured",
            details: "Set NEXT_PUBLIC_ESCROW_FACTORY_ADDRESS in environment"
          })
        }
      } catch (error: any) {
        updateLastResult({
          status: 'error',
          message: "Error checking contract configuration",
          details: error.message
        })
      }

      // Test 5: Test Escrow Address Lookup (if factory is deployed)
      if (process.env.NEXT_PUBLIC_ESCROW_FACTORY_ADDRESS) {
        addResult({ name: "Escrow Lookup Test", status: 'pending', message: "Testing escrow address lookup..." })

        try {
          const testContractId = "test-contract-123"
          const escrowAddress = await blockchainService.getEscrowAddress(testContractId)

          updateLastResult({
            status: escrowAddress ? 'success' : 'warning',
            message: escrowAddress ? "Escrow lookup successful" : "No escrow found (expected for test)",
            details: escrowAddress ? `Escrow address: ${escrowAddress}` : "This is normal for a test contract ID"
          })
        } catch (error: any) {
          updateLastResult({
            status: 'error',
            message: "Escrow lookup failed",
            details: error.message
          })
        }
      }

    } catch (error: any) {
      addResult({
        name: "General Error",
        status: 'error',
        message: "Unexpected error during testing",
        details: error.message
      })
    } finally {
      setIsRunning(false)
    }
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pending': return 'border-blue-200 bg-blue-50'
      case 'success': return 'border-green-200 bg-green-50'
      case 'error': return 'border-red-200 bg-red-50'
      case 'warning': return 'border-yellow-200 bg-yellow-50'
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Blockchain Integration Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Test the blockchain service integration with Thirdweb
            </p>
            {walletAddress && (
              <p className="text-xs text-green-600 mt-1">
                Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </p>
            )}
          </div>
          <Button
            onClick={runTests}
            disabled={isRunning}
            className="min-w-[120px]"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              'Run Tests'
            )}
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium">Test Results:</h3>
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}
              >
                <div className="flex items-start gap-3">
                  {getStatusIcon(result.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">{result.name}</h4>
                    </div>
                    <p className="text-sm mt-1">{result.message}</p>
                    {result.details && (
                      <p className="text-xs text-muted-foreground mt-2 font-mono">
                        {result.details}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isRunning && results.length === 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Click "Run Tests" to verify your blockchain integration setup.
              Make sure you have MetaMask installed and are connected to the correct network.
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Prerequisites:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>MetaMask installed and connected</li>
            <li>Connected to Polygon Amoy testnet</li>
            <li>NEXT_PUBLIC_THIRDWEB_CLIENT_ID configured</li>
            <li>NEXT_PUBLIC_ESCROW_FACTORY_ADDRESS configured (optional)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
