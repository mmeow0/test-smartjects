"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  Check,
  FileText,
  Lock,
  Shield,
  UserCheck,
  Users,
  Clock,
  Download,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth-provider";
import type { NDASignature } from "@/lib/types";

interface NDAManagerProps {
  proposalId: string;
  proposalOwnerId: string;
  signatures: NDASignature[];
  onSignatureUpdateAction: (signatures: NDASignature[]) => void;
  isNegotiationActive?: boolean;
}

export function NDAManager({
  proposalId,
  proposalOwnerId,
  signatures,
  onSignatureUpdateAction,
  isNegotiationActive = false,
}: NDAManagerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [showNDADialog, setShowNDADialog] = useState(false);
  const [isAgreedToTerms, setIsAgreedToTerms] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [showSignaturesList, setShowSignaturesList] = useState(false);

  const isProposalOwner = user?.id === proposalOwnerId;
  const userSignature = signatures.find(sig => sig.signerUserId === user?.id);
  const hasUserSigned = !!userSignature;

  const handleSignNDA = async () => {
    if (!user || !isAgreedToTerms) return;

    setIsSigning(true);
    try {
      // Here you would call your API service to save the NDA signature
      // const signature = await ndaService.signNDA(proposalId, user.id);
      
      // Mock implementation for now
      const newSignature: NDASignature = {
        id: `nda-${Date.now()}`,
        proposalId,
        signerUserId: user.id,
        signedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      const updatedSignatures = [...signatures, newSignature];
      onSignatureUpdateAction(updatedSignatures);

      toast({
        title: "NDA Signed Successfully",
        description: "You can now view confidential information in this proposal.",
      });

      setShowNDADialog(false);
      setIsAgreedToTerms(false);
    } catch (error) {
      console.error("Error signing NDA:", error);
      toast({
        title: "Error",
        description: "Failed to sign NDA. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSigning(false);
    }
  };

  const renderNDAContent = () => (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      <div className="text-sm text-gray-700 space-y-3">
        <h3 className="font-semibold text-base">Non-Disclosure Agreement (NDA)</h3>
        
        <p>
          This Non-Disclosure Agreement ("Agreement") is entered into between the proposal owner 
          and you for the purpose of protecting confidential information shared during the 
          proposal negotiation process.
        </p>

        <div className="space-y-2">
          <h4 className="font-medium">1. Definition of Confidential Information</h4>
          <p className="text-sm pl-4">
            Confidential Information includes all technical data, trade secrets, know-how, 
            research, product plans, products, services, customers, customer lists, markets, 
            software, developments, inventions, processes, formulas, technology, designs, 
            drawings, engineering, hardware configuration information, marketing, finances, 
            or other business information.
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">2. Obligations</h4>
          <p className="text-sm pl-4">
            You agree to hold and maintain the Confidential Information in strict confidence 
            and not to disclose it to any third parties without prior written consent.
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">3. Duration</h4>
          <p className="text-sm pl-4">
            This agreement remains in effect for a period of 5 years from the date of signature 
            or until the information becomes publicly available through no breach of this agreement.
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">4. Return of Information</h4>
          <p className="text-sm pl-4">
            Upon request or termination of discussions, you agree to return or destroy all 
            materials containing Confidential Information.
          </p>
        </div>
      </div>
    </div>
  );

  const renderSignatureStatus = () => {
    if (hasUserSigned) {
      return (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-green-800">
                  NDA Signed
                </h3>
                <p className="text-sm text-green-600">
                  You have access to confidential information in this proposal.
                </p>
                <p className="text-xs text-green-500 mt-1">
                  Signed on {new Date(userSignature.signedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (isNegotiationActive && !isProposalOwner) {
      return (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                  <Lock className="h-5 w-5 text-amber-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-amber-800">
                  NDA Required
                </h3>
                <p className="text-sm text-amber-600">
                  Sign an NDA to view confidential information in this proposal.
                </p>
                <Button
                  onClick={() => setShowNDADialog(true)}
                  size="sm"
                  className="mt-2 bg-amber-600 hover:bg-amber-700"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Sign NDA
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return null;
  };

  const renderSignaturesList = () => {
    if (!isProposalOwner || signatures.length === 0) {
      return null;
    }

    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4" />
              NDA Signatures ({signatures.length})
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSignaturesList(!showSignaturesList)}
            >
              {showSignaturesList ? "Hide" : "View All"}
            </Button>
          </div>
        </CardHeader>
        {showSignaturesList && (
          <CardContent className="pt-0">
            <div className="space-y-3">
              {signatures.map((signature) => (
                <div key={signature.id} className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-green-100 text-green-700">
                      <UserCheck className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">User {signature.signerUserId}</p>
                    <p className="text-xs text-muted-foreground">
                      Signed on {new Date(signature.signedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    <Check className="h-3 w-3 mr-1" />
                    Signed
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {renderSignatureStatus()}
      {renderSignaturesList()}

      {/* NDA Signing Dialog */}
      <Dialog open={showNDADialog} onOpenChange={setShowNDADialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Non-Disclosure Agreement
            </DialogTitle>
            <DialogDescription>
              Please review and sign this NDA to access confidential information in this proposal.
            </DialogDescription>
          </DialogHeader>

          {renderNDAContent()}

          <div className="flex items-center space-x-2 pt-4">
            <Checkbox
              id="agree-terms"
              checked={isAgreedToTerms}
              onCheckedChange={(checked) => setIsAgreedToTerms(checked === true)}
            />
            <label htmlFor="agree-terms" className="text-sm cursor-pointer">
              I have read, understood, and agree to the terms of this Non-Disclosure Agreement
            </label>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowNDADialog(false);
                setIsAgreedToTerms(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSignNDA}
              disabled={!isAgreedToTerms || isSigning}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSigning ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Signing...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Sign NDA
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}