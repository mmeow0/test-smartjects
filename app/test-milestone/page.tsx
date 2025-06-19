"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { CheckCircle, Eye, FileText } from "lucide-react"

export default function TestMilestonePage() {
  const router = useRouter()

  // Test IDs - replace these with real IDs from your database
  const testContractId = "test-contract-123"
  const testMilestoneId = "test-milestone-456"

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Milestone Navigation Test</h1>
          <p className="text-muted-foreground">
            Test page for milestone functionality
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Complete Milestone Workflow</CardTitle>
            <CardDescription>
              Full lifecycle of milestone execution and approval
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-medium mb-3">Step 1: View Milestone (Any User)</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Both provider and client can view milestone details at any time
              </p>
              <Button
                className="w-full justify-start"
                onClick={() => router.push(`/contracts/${testContractId}/milestone/${testMilestoneId}`)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Milestone Details
              </Button>
            </div>

            <div>
              <h4 className="font-medium mb-3">Step 2: Start Work (Provider Only)</h4>
              <p className="text-sm text-muted-foreground mb-2">
                When milestone is <strong>PENDING</strong> → Provider clicks "Start Work" button
              </p>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push(`/contracts/${testContractId}/milestone/${testMilestoneId}`)}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Go to Milestone (Start Work button visible when pending)
              </Button>
            </div>

            <div>
              <h4 className="font-medium mb-3">Step 3: Submit for Review (Provider Only)</h4>
              <p className="text-sm text-muted-foreground mb-2">
                When milestone is <strong>IN_PROGRESS</strong> → Provider submits work for review
              </p>
              <Button
                className="w-full justify-start"
                onClick={() => router.push(`/contracts/${testContractId}/milestone/${testMilestoneId}/complete`)}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete & Submit for Review
              </Button>
            </div>

            <div>
              <h4 className="font-medium mb-3">Step 4: Review & Approve/Reject (Client Only)</h4>
              <p className="text-sm text-muted-foreground mb-2">
                When milestone is <strong>SUBMITTED</strong> → Client reviews and decides
              </p>
              <Button
                className="w-full justify-start"
                onClick={() => router.push(`/contracts/${testContractId}/milestone/${testMilestoneId}/review`)}
              >
                <FileText className="h-4 w-4 mr-2" />
                Review Milestone
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Milestone Status Flow</CardTitle>
            <CardDescription>
              Complete lifecycle with user actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <div>
                  <span className="text-sm font-medium">1. PENDING</span>
                  <p className="text-xs text-muted-foreground">Provider sees "Start Work" button</p>
                </div>
              </div>
              <div className="ml-6 text-xs text-muted-foreground">↓ Provider clicks "Start Work"</div>
              
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div>
                  <span className="text-sm font-medium">2. IN_PROGRESS</span>
                  <p className="text-xs text-muted-foreground">Provider sees "Complete Milestone" button</p>
                </div>
              </div>
              <div className="ml-6 text-xs text-muted-foreground">↓ Provider submits work for review</div>
              
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <div>
                  <span className="text-sm font-medium">3. SUBMITTED</span>
                  <p className="text-xs text-muted-foreground">Client sees "Review Milestone" button</p>
                </div>
              </div>
              <div className="ml-6 text-xs text-muted-foreground">↓ Client approves or requests revisions</div>
              
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <span className="text-sm font-medium">4. COMPLETED</span>
                  <p className="text-xs text-muted-foreground">Milestone approved - payment processed</p>
                </div>
              </div>
              
              <div className="border-l-2 border-orange-200 ml-6 pl-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <div>
                    <span className="text-sm font-medium">REJECTED (Alternative)</span>
                    <p className="text-xs text-muted-foreground">Returns to IN_PROGRESS for revisions</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contract Pages</CardTitle>
            <CardDescription>
              Navigate to contract-related pages
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => router.push('/contracts')}
            >
              <FileText className="h-4 w-4 mr-2" />
              All Contracts
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => router.push(`/contracts/${testContractId}`)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Contract Details
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Permissions Summary</CardTitle>
            <CardDescription>
              Who can do what at each stage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-blue-600 mb-2">👨‍💻 Provider Actions</h4>
                <ul className="text-sm space-y-1">
                  <li>• Start work (when pending)</li>
                  <li>• Submit for review (when in progress)</li>
                  <li>• Upload files and mark deliverables</li>
                  <li>• Send messages at any time</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-green-600 mb-2">👤 Client Actions</h4>
                <ul className="text-sm space-y-1">
                  <li>• Review submissions (when submitted)</li>
                  <li>• Approve or request revisions</li>
                  <li>• View all milestone details</li>
                  <li>• Send messages at any time</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Test Contract ID: <code className="bg-muted px-2 py-1 rounded">{testContractId}</code>
          </p>
          <p className="text-sm text-muted-foreground">
            Test Milestone ID: <code className="bg-muted px-2 py-1 rounded">{testMilestoneId}</code>
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Replace with real IDs from your database for testing
          </p>
        </div>
      </div>
    </div>
  )
}