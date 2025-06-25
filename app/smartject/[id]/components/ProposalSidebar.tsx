import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface User {
  id: string;
  accountType: "free" | "paid";
}

interface ProposalSidebarProps {
  user: User | null;
  isAuthenticated: boolean;
  smartjectId: string;
  onCreateProposal: () => void;
}

export function ProposalSidebar({
  user,
  isAuthenticated,
  smartjectId,
  onCreateProposal,
}: ProposalSidebarProps) {
  const isPaidUser = isAuthenticated && user?.accountType === "paid";

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Create a Proposal</CardTitle>
        <CardDescription>
          {isPaidUser
            ? "Submit your proposal for this smartject"
            : "Upgrade to create proposals"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-4">
          {isPaidUser
            ? "Create a detailed proposal specifying how you can implement this smartject or what your requirements are."
            : "Paid accounts can create detailed proposals for smartjects they need or can provide."}
        </p>
        {isPaidUser ? (
          <Button className="w-full" onClick={onCreateProposal}>
            Create Proposal
          </Button>
        ) : (
          <Button
            className="w-full"
            asChild
            disabled={!isAuthenticated}
          >
            <Link href={isAuthenticated ? "/upgrade" : "/auth/login"}>
              {isAuthenticated
                ? "Upgrade to Paid Account"
                : "Log In to Create Proposal"}
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
