"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle,
  Check,
  X,
  Shield,
  User,
  FileText,
  Lock,
  Unlock,
  TestTube,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth-provider";
import { ndaService } from "@/lib/services/nda.service";
import { proposalService } from "@/lib/services/proposal.service";
import type { NDASignature, ProposalType } from "@/lib/types";

interface NDATestUtilsProps {
  proposalId?: string;
  onTestComplete?: (results: TestResults) => void;
}

interface TestResults {
  testName: string;
  passed: boolean;
  message: string;
  timestamp: string;
}

interface TestState {
  isRunning: boolean;
  results: TestResults[];
  currentTest: string;
}

export function NDATestUtils({ proposalId, onTestComplete }: NDATestUtilsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [testProposalId, setTestProposalId] = useState(proposalId || "");
  const [testUserId, setTestUserId] = useState(user?.id || "");
  const [testState, setTestState] = useState<TestState>({
    isRunning: false,
    results: [],
    currentTest: "",
  });
  
  const [proposal, setProposal] = useState<ProposalType | null>(null);
  const [ndaSignatures, setNdaSignatures] = useState<NDASignature[]>([]);
  const [canViewPrivate, setCanViewPrivate] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  const addTestResult = (testName: string, passed: boolean, message: string) => {
    const result: TestResults = {
      testName,
      passed,
      message,
      timestamp: new Date().toISOString(),
    };
    
    setTestState(prev => ({
      ...prev,
      results: [...prev.results, result],
    }));
    
    onTestComplete?.(result);
  };

  const runTest = async (testName: string, testFn: () => Promise<void>) => {
    setTestState(prev => ({ ...prev, currentTest: testName }));
    
    try {
      await testFn();
      addTestResult(testName, true, "Test passed successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      addTestResult(testName, false, `Test failed: ${message}`);
    }
  };

  const loadTestData = async () => {
    if (!testProposalId) return;
    
    try {
      const [proposalData, signatures] = await Promise.all([
        proposalService.getProposalById(testProposalId),
        ndaService.getProposalSignatures(testProposalId),
      ]);
      
      setProposal(proposalData);
      setNdaSignatures(signatures);
      
      if (proposalData && testUserId) {
        const canView = await ndaService.canViewPrivateFields(
          testProposalId,
          testUserId,
          proposalData.userId
        );
        setCanViewPrivate(canView);
      }
    } catch (error) {
      console.error("Error loading test data:", error);
      toast({
        title: "Error",
        description: "Failed to load test data",
        variant: "destructive",
      });
    }
  };

  const runAllTests = async () => {
    if (!testProposalId || !testUserId) {
      toast({
        title: "Missing Test Data",
        description: "Please provide proposal ID and user ID",
        variant: "destructive",
      });
      return;
    }

    setTestState({
      isRunning: true,
      results: [],
      currentTest: "",
    });

    // Test 1: Load proposal data
    await runTest("Load Proposal Data", async () => {
      const proposalData = await proposalService.getProposalById(testProposalId);
      if (!proposalData) {
        throw new Error("Proposal not found");
      }
      setProposal(proposalData);
    });

    // Test 2: Check initial NDA signatures
    await runTest("Load NDA Signatures", async () => {
      const signatures = await ndaService.getProposalSignatures(testProposalId);
      setNdaSignatures(signatures);
    });

    // Test 3: Check private field access (before signing)
    await runTest("Check Initial Private Access", async () => {
      if (!proposal) throw new Error("Proposal not loaded");
      
      const canView = await ndaService.canViewPrivateFields(
        testProposalId,
        testUserId,
        proposal.userId
      );
      
      setCanViewPrivate(canView);
      
      // If user is not the owner and hasn't signed, they shouldn't have access
      if (testUserId !== proposal.userId && canView) {
        throw new Error("User has unexpected access to private fields");
      }
    });

    // Test 4: Test NDA signing (if user is not owner)
    if (proposal && testUserId !== proposal.userId) {
      await runTest("Sign NDA", async () => {
        const existingSignature = await ndaService.getUserSignature(testProposalId, testUserId);
        
        if (!existingSignature) {
          const signature = await ndaService.signNDA(testProposalId, testUserId);
          if (!signature) {
            throw new Error("Failed to sign NDA");
          }
          
          // Refresh signatures
          const updatedSignatures = await ndaService.getProposalSignatures(testProposalId);
          setNdaSignatures(updatedSignatures);
        }
      });

      // Test 5: Check private field access (after signing)
      await runTest("Check Post-Signature Private Access", async () => {
        if (!proposal) throw new Error("Proposal not loaded");
        
        const canView = await ndaService.canViewPrivateFields(
          testProposalId,
          testUserId,
          proposal.userId
        );
        
        setCanViewPrivate(canView);
        
        if (!canView) {
          throw new Error("User should have access after signing NDA");
        }
      });
    }

    // Test 6: Check if proposal has private fields
    await runTest("Check Private Fields Existence", async () => {
      const hasPrivateFields = await ndaService.proposalHasPrivateFields(testProposalId);
      
      if (proposal?.privateFields) {
        const hasContent = Object.values(proposal.privateFields).some(
          value => typeof value === "string" && value.trim().length > 0
        );
        
        if (hasContent !== hasPrivateFields) {
          throw new Error("Private fields detection mismatch");
        }
      }
    });

    setTestState(prev => ({ ...prev, isRunning: false, currentTest: "" }));
    
    toast({
      title: "Tests Complete",
      description: `Completed ${testState.results.length} tests`,
    });
  };

  const clearResults = () => {
    setTestState({
      isRunning: false,
      results: [],
      currentTest: "",
    });
  };

  useEffect(() => {
    if (testProposalId) {
      loadTestData();
    }
  }, [testProposalId, testUserId]);

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          NDA Feature Test Utils
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Test Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Test Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="proposal-id">Proposal ID</Label>
              <Input
                id="proposal-id"
                value={testProposalId}
                onChange={(e) => setTestProposalId(e.target.value)}
                placeholder="Enter proposal ID to test"
              />
            </div>
            <div>
              <Label htmlFor="user-id">Test User ID</Label>
              <Input
                id="user-id"
                value={testUserId}
                onChange={(e) => setTestUserId(e.target.value)}
                placeholder="Enter user ID for testing"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={runAllTests}
              disabled={testState.isRunning || !testProposalId || !testUserId}
            >
              {testState.isRunning ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <TestTube className="h-4 w-4 mr-2" />
                  Run All Tests
                </>
              )}
            </Button>
            
            <Button variant="outline" onClick={clearResults}>
              Clear Results
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setShowDebugInfo(!showDebugInfo)}
            >
              {showDebugInfo ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Hide Debug
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Show Debug
                </>
              )}
            </Button>
          </div>
        </div>

        <Separator />

        {/* Current Test Status */}
        {testState.isRunning && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
              <span className="text-blue-800">
                Running: {testState.currentTest}
              </span>
            </div>
          </div>
        )}

        {/* Test Results */}
        {testState.results.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Test Results</h3>
            <div className="space-y-2">
              {testState.results.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-md border ${
                    result.passed
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {result.passed ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-red-600" />
                      )}
                      <span className="font-medium">{result.testName}</span>
                    </div>
                    <Badge variant={result.passed ? "default" : "destructive"}>
                      {result.passed ? "PASS" : "FAIL"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Debug Information */}
        {showDebugInfo && (
          <div className="space-y-4">
            <Separator />
            <h3 className="text-lg font-semibold">Debug Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Proposal Info</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div>
                    <span className="font-medium">ID:</span> {proposal?.id || "Not loaded"}
                  </div>
                  <div>
                    <span className="font-medium">Owner:</span> {proposal?.userId || "Unknown"}
                  </div>
                  <div>
                    <span className="font-medium">Type:</span> {proposal?.type || "Unknown"}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Has Private Fields:</span>
                    {proposal?.privateFields && 
                     Object.values(proposal.privateFields).some(v => v && v.trim().length > 0) ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <X className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Access Control</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Can View Private:</span>
                    {canViewPrivate ? (
                      <Unlock className="h-4 w-4 text-green-600" />
                    ) : (
                      <Lock className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <span className="font-medium">NDA Signatures:</span> {ndaSignatures.length}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">User Signed:</span>
                    {ndaSignatures.some(sig => sig.signerUserId === testUserId) ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <X className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* NDA Signatures List */}
            {ndaSignatures.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">NDA Signatures</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {ndaSignatures.map((sig) => (
                      <div key={sig.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3" />
                          <span>{sig.signerUserId}</span>
                        </div>
                        <span className="text-muted-foreground">
                          {new Date(sig.signedAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Private Fields Preview */}
            {proposal?.privateFields && showDebugInfo && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Private Fields Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={JSON.stringify(proposal.privateFields, null, 2)}
                    readOnly
                    rows={6}
                    className="font-mono text-xs"
                  />
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}