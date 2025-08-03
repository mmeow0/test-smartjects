"use client";

import React, { useState } from "react";
import { useWallet } from "@/contexts/wallet-context";
import { WalletModal } from "@/components/wallet/wallet-modal";
import { WalletConnect } from "@/components/blockchain/wallet-connect";
import { WalletCard } from "@/components/wallet/wallet-card";
import { WalletConnection } from "@/components/wallet/wallet-connection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Code2,
  Wallet,
  AlertCircle,
  CheckCircle,
  Copy,
  ExternalLink,
  Zap,
} from "lucide-react";

/**
 * Example component demonstrating various wallet integration patterns
 */
export function WalletUsageExample() {
  const {
    address,
    isConnected,
    isConnecting,
    balance,
    chain,
    connectWallet,
    disconnectWallet,
    copyAddress,
    truncateAddress,
    openExplorer,
  } = useWallet();

  const { toast } = useToast();
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  // Example: Check wallet before action
  const handleProtectedAction = () => {
    if (!isConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to perform this action.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Protected action executed successfully!",
    });
  };

  // Example: Custom connect handler
  const handleCustomConnect = async () => {
    try {
      await connectWallet("io.metamask"); // Specify wallet type
      toast({
        title: "Connected",
        description: "MetaMask wallet connected successfully!",
      });
    } catch (error) {
      console.error("Connection error:", error);
    }
  };

  // Example: Send transaction (mock)
  const handleSendTransaction = async () => {
    if (!isConnected) {
      toast({
        title: "No Wallet",
        description: "Connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    // Mock transaction - in real app, use your blockchain service
    toast({
      title: "Transaction Sent",
      description: "Transaction is being processed...",
    });

    // Mock transaction hash
    setTransactionHash("0x" + Math.random().toString(36).substring(2, 15));
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Wallet Integration Examples</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Explore different ways to integrate Web3 wallet functionality into your SmartJects application
        </p>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Current Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Status</p>
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Connected</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">Disconnected</span>
                  </>
                )}
              </div>
            </div>

            {isConnected && (
              <>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Address</p>
                  <div className="flex items-center gap-2">
                    <code className="text-sm">{truncateAddress(address!)}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyAddress}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Balance</p>
                  <p className="font-medium">{balance || "Loading..."}</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Component Examples */}
      <Tabs defaultValue="modal" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="modal">Modal</TabsTrigger>
          <TabsTrigger value="connect">Connect</TabsTrigger>
          <TabsTrigger value="card">Card</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>

        {/* Modal Example */}
        <TabsContent value="modal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Wallet Modal Component</CardTitle>
              <CardDescription>
                Full-featured modal with wallet selection and management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <WalletModal />
                <WalletModal
                  trigger={
                    <Button variant="outline">
                      Custom Trigger
                    </Button>
                  }
                />
              </div>

              <Separator />

              <div className="rounded-lg bg-muted p-4">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Code2 className="h-4 w-4" />
                  Usage
                </h4>
                <pre className="text-sm overflow-x-auto">
{`import { WalletModal } from "@/components/wallet/wallet-modal";

// Basic usage
<WalletModal />

// With custom trigger
<WalletModal
  trigger={<Button>Connect</Button>}
  onOpenChange={(open) => console.log(open)}
/>`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Connect Component Example */}
        <TabsContent value="connect" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Wallet Connect Component</CardTitle>
              <CardDescription>
                Versatile component with compact and full views
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">Compact View</h4>
                <WalletConnect compact />
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3">Full Card View</h4>
                <WalletConnect
                  onConnect={(addr) => {
                    toast({
                      title: "Connected!",
                      description: `Wallet ${truncateAddress(addr)} connected`,
                    });
                  }}
                  onDisconnect={() => {
                    toast({
                      title: "Disconnected",
                      description: "Wallet has been disconnected",
                    });
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Card Component Example */}
        <TabsContent value="card" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Wallet Card Component</CardTitle>
              <CardDescription>
                Status card with customizable features
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-3">Full Features</h4>
                <WalletCard
                  showActions
                  showNetwork
                />
              </div>

              <div>
                <h4 className="font-medium mb-3">Compact Version</h4>
                <WalletCard
                  compact
                  showActions={false}
                  showNetwork={false}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Custom Implementation Example */}
        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Implementation</CardTitle>
              <CardDescription>
                Using the wallet context directly for custom UI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Custom UI */}
              <div className="space-y-4">
                {!isConnected ? (
                  <div className="text-center py-8 border-2 border-dashed rounded-lg">
                    <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-semibold mb-2">No Wallet Connected</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Connect your wallet to get started
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button onClick={() => connectWallet()}>
                        Connect Any Wallet
                      </Button>
                      <Button variant="outline" onClick={handleCustomConnect}>
                        Connect MetaMask
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">Connected Account</p>
                        <p className="font-mono">{address}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={openExplorer}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={disconnectWallet}
                        >
                          Disconnect
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Balance</p>
                        <p className="text-lg font-semibold">{balance || "0 ETH"}</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Network</p>
                        <p className="text-lg font-semibold">{chain?.name || "Unknown"}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Example Actions */}
              <div className="space-y-3">
                <h4 className="font-medium">Example Actions</h4>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleProtectedAction}
                  >
                    Protected Action
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleSendTransaction}
                    disabled={!isConnected}
                  >
                    Send Transaction
                  </Button>
                </div>

                {transactionHash && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Transaction Hash</AlertTitle>
                    <AlertDescription>
                      <code className="text-xs">{transactionHash}</code>
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <Separator />

              {/* Code Example */}
              <div className="rounded-lg bg-muted p-4">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Code2 className="h-4 w-4" />
                  Direct Context Usage
                </h4>
                <pre className="text-sm overflow-x-auto">
{`import { useWallet } from "@/contexts/wallet-context";

function MyComponent() {
  const {
    address,
    isConnected,
    connectWallet,
    disconnectWallet
  } = useWallet();

  if (!isConnected) {
    return <Button onClick={connectWallet}>Connect</Button>;
  }

  return <div>Connected: {address}</div>;
}`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle>Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
              <span className="text-sm">Always check connection status before blockchain operations</span>
            </li>
            <li className="flex gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
              <span className="text-sm">Use the shared wallet context instead of creating separate connections</span>
            </li>
            <li className="flex gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
              <span className="text-sm">Handle errors gracefully and provide user feedback</span>
            </li>
            <li className="flex gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
              <span className="text-sm">Test with multiple wallets and networks</span>
            </li>
            <li className="flex gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
              <span className="text-sm">Auto-reconnection is handled automatically by the provider</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
