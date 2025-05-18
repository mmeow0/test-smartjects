"use client"

import { useEffect, useState } from "react"
import { Calendar } from "lucide-react"

interface Milestone {
  id: string
  name: string
  description: string
  percentage: number
  amount: string
  dueDate: string
}

interface MilestoneTimelineProps {
  milestones: Milestone[]
  projectStartDate: Date
  projectEndDate: Date
}

export function MilestoneTimeline({ milestones, projectStartDate, projectEndDate }: MilestoneTimelineProps) {
  const [sortedMilestones, setSortedMilestones] = useState<Milestone[]>([])

  // Sort milestones by due date
  useEffect(() => {
    const sorted = [...milestones].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    setSortedMilestones(sorted)
  }, [milestones])

  // Calculate project duration in days
  const projectDuration = Math.ceil((projectEndDate.getTime() - projectStartDate.getTime()) / (1000 * 60 * 60 * 24))

  // Calculate today's position in the timeline
  const today = new Date()
  const projectElapsed = Math.max(
    0,
    Math.min(
      ((today.getTime() - projectStartDate.getTime()) / (projectEndDate.getTime() - projectStartDate.getTime())) * 100,
      100,
    ),
  )

  if (milestones.length === 0) {
    return (
      <div className="border border-dashed rounded-md p-6 flex flex-col items-center justify-center text-center text-muted-foreground">
        <Calendar className="h-8 w-8 mb-2" />
        <p>No milestones to display</p>
        <p className="text-sm">Add milestones to visualize the project timeline</p>
      </div>
    )
  }

  return (
    <div className="w-full py-8">
      {/* Timeline header */}
      <div className="flex justify-between mb-2 text-xs text-muted-foreground">
        <div>{projectStartDate.toLocaleDateString()}</div>
        <div>{projectEndDate.toLocaleDateString()}</div>
      </div>

      {/* Timeline bar */}
      <div className="relative h-1 bg-muted rounded-full mb-8">
        {/* Progress indicator */}
        <div className="absolute top-0 left-0 h-1 bg-primary rounded-full" style={{ width: `${projectElapsed}%` }} />

        {/* Today marker */}
        {projectElapsed > 0 && projectElapsed < 100 && (
          <div className="absolute top-0 w-0.5 h-3 bg-primary -translate-y-1" style={{ left: `${projectElapsed}%` }}>
            <div className="absolute -left-7 -top-6 text-xs font-medium bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
              Today
            </div>
          </div>
        )}

        {/* Milestone markers */}
        {sortedMilestones.map((milestone, index) => {
          const milestoneDate = new Date(milestone.dueDate)
          const position = Math.max(
            0,
            Math.min(
              ((milestoneDate.getTime() - projectStartDate.getTime()) /
                (projectEndDate.getTime() - projectStartDate.getTime())) *
                100,
              100,
            ),
          )

          // Alternate labels above and below to prevent overlap
          const isAbove = index % 2 === 0

          return (
            <div
              key={milestone.id}
              className="absolute top-0 w-3 h-3 bg-primary rounded-full -translate-x-1.5 -translate-y-1"
              style={{ left: `${position}%` }}
            >
              <div className={`absolute ${isAbove ? "-top-16" : "top-4"} -left-16 w-32 text-center`}>
                <div className="text-xs font-medium">{milestone.name}</div>
                <div className="text-xs text-muted-foreground">{milestoneDate.toLocaleDateString()}</div>
                <div className="text-xs font-medium">{milestone.percentage}%</div>
              </div>
              <div className={`absolute ${isAbove ? "-top-8" : "top-3"} left-1.5 w-0.5 h-8 bg-primary/30`} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
