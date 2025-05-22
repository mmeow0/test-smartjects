"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/components/auth-provider"
import { ArrowLeft, Calendar, Check, DollarSign, FileText, MessageSquare, Star, Users } from "lucide-react"

export default function CompareProposalsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)

  // Redirect if not authenticated or not a paid user
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login")
    } else if (user?.accountType !== "paid") {
      router.push("/upgrade")
    } else {
      // Simulate loading data
      setTimeout(() => {
        setIsLoading(false)
      }, 1000)
    }
  }, [isAuthenticated, router, user])

  if (!isAuthenticated || user?.accountType !== "paid" || isLoading) {
    return null
  }

  // Mock data for the match
  const match = {
    id: id,
    smartjectId: "smartject-1",
    smartjectTitle: "AI-Powered Supply Chain Optimization",
    matchedDate: "2023-12-05",
    status: "new",
    proposals: [
      {
        id: "proposal-1",
        providerId: "user-101",
        providerName: "Tech Solutions Inc.",
        providerRating: 4.8,
        providerCompletedProjects: 12,
        budget: "$15,000",
        timeline: "3 months",
        matchScore: 92,
        approach:
          "We will use a phased approach, starting with data integration, followed by model development, dashboard creation, and finally deployment and training.",
        expertise:
          "Our team has 5+ years of experience implementing AI solutions for supply chain optimization across various industries.",
        team: "1 Project Manager, 2 Data Scientists, 1 UI/UX Designer, 1 Integration Specialist",
        deliverables: [
          "Data integration framework",
          "Machine learning prediction model",
          "Real-time monitoring dashboard",
          "Documentation and training materials",
        ],
        files: 3,
        responseTime: "Usually responds within 24 hours",
      },
      {
        id: "proposal-2",
        providerId: "user-102",
        providerName: "AI Innovations",
        providerRating: 4.5,
        providerCompletedProjects: 8,
        budget: "$18,000",
        timeline: "2.5 months",
        matchScore: 87,
        approach:
          "We utilize an agile methodology with two-week sprints, focusing on delivering working components throughout the project lifecycle.",
        expertise:
          "Specialized in machine learning for logistics and supply chain with a team of former industry professionals.",
        team: "1 Project Lead, 3 ML Engineers, 1 Data Engineer, 1 QA Specialist",
        deliverables: [
          "Custom ML algorithms",
          "API integration layer",
          "Web-based dashboard",
          "Mobile companion app",
          "Knowledge transfer sessions",
        ],
        files: 2,
        responseTime: "Usually responds within 12 hours",
      },
      {
        id: "proposal-3",
        providerId: "user-103",
        providerName: "DataSmart Systems",
        providerRating: 4.2,
        providerCompletedProjects: 5,
        budget: "$12,500",
        timeline: "4 months",
        matchScore: 81,
        approach:
          "We focus on thorough requirements gathering and validation before development, ensuring alignment with business goals.",
        expertise: "Specialized in data-driven solutions with experience in manufacturing and distribution sectors.",
        team: "1 Business Analyst, 2 Data Scientists, 1 Full-stack Developer",
        deliverables: [
          "Requirements documentation",
          "Predictive models",
          "Integration APIs",
          "Web dashboard",
          "Monthly support (3 months)",
        ],
        files: 4,
        responseTime: "Usually responds within 48 hours",
      },
    ],
  }

  const compareCategories = [
    { name: "Budget", icon: <DollarSign className="h-4 w-4" /> },
    { name: "Timeline", icon: <Calendar className="h-4 w-4" /> },
    { name: "Match Score", icon: <Check className="h-4 w-4" /> },
    { name: "Approach", icon: null },
    { name: "Team", icon: <Users className="h-4 w-4" /> },
    { name: "Deliverables", icon: <FileText className="h-4 w-4" /> },
  ]

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Compare Proposals</h1>
          <p className="text-muted-foreground">
            For smartject: <span className="font-medium">{match.smartjectTitle}</span>
          </p>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Provider Comparison</CardTitle>
          <CardDescription>Compare the providers who submitted proposals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1">
              <div className="h-10"></div>
              {match.proposals.map((proposal, index) => (
                <div key={index} className="mb-6">
                  <div className="flex items-center mb-2">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarFallback>{proposal.providerName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">{proposal.providerName}</h4>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                        <span>{proposal.providerRating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <div className="flex items-center mb-1">
                      <Users className="h-3 w-3 mr-1" />
                      <span>{proposal.providerCompletedProjects} completed projects</span>
                    </div>
                    <div className="flex items-center">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      <span>{proposal.responseTime}</span>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => router.push(`/proposals/${proposal.id}`)}
                    >
                      View Proposal
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="md:col-span-3 border rounded-md">
              <table className="w-full">
                <tbody>
                  {compareCategories.map((category, categoryIndex) => (
                    <tr key={categoryIndex} className={categoryIndex % 2 === 0 ? "bg-muted/50" : ""}>
                      <td className="p-3 border-r font-medium flex items-center">
                        {category.icon && <span className="mr-2">{category.icon}</span>}
                        {category.name}
                      </td>
                      {match.proposals.map((proposal, proposalIndex) => {
                        let content
                        switch (category.name) {
                          case "Budget":
                            content = proposal.budget
                            break
                          case "Timeline":
                            content = proposal.timeline
                            break
                          case "Match Score":
                            content = (
                              <Badge variant="outline" className="bg-primary/10">
                                {proposal.matchScore}% Match
                              </Badge>
                            )
                            break
                          case "Approach":
                            content = proposal.approach
                            break
                          case "Team":
                            content = proposal.team
                            break
                          case "Deliverables":
                            content = (
                              <ul className="list-disc pl-5">
                                {proposal.deliverables.map((item, i) => (
                                  <li key={i}>{item}</li>
                                ))}
                              </ul>
                            )
                            break
                          default:
                            content = "N/A"
                        }
                        return (
                          <td
                            key={proposalIndex}
                            className={`p-3 ${proposalIndex < match.proposals.length - 1 ? "border-r" : ""}`}
                          >
                            {content}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.push(`/matches/${id}`)}>
          Back to Match Details
        </Button>
      </div>
    </div>
  )
}
