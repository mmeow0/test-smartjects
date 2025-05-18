"use client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight } from "lucide-react"

export interface DocumentVersion {
  id: string
  versionNumber: number
  date: string
  author: string
  changes: string[]
}

interface DocumentVersionHistoryProps {
  versions: DocumentVersion[]
  currentVersion: number
  onVersionChange: (version: DocumentVersion) => void
}

export function DocumentVersionHistory({ versions, currentVersion, onVersionChange }: DocumentVersionHistoryProps) {
  const sortedVersions = [...versions].sort((a, b) => b.versionNumber - a.versionNumber)
  const currentVersionData = sortedVersions.find((v) => v.versionNumber === currentVersion) || sortedVersions[0]

  const handlePrevVersion = () => {
    const prevVersion = sortedVersions.find((v) => v.versionNumber === currentVersion - 1)
    if (prevVersion) {
      onVersionChange(prevVersion)
    }
  }

  const handleNextVersion = () => {
    const nextVersion = sortedVersions.find((v) => v.versionNumber === currentVersion + 1)
    if (nextVersion) {
      onVersionChange(nextVersion)
    }
  }

  const hasPrevVersion = sortedVersions.some((v) => v.versionNumber === currentVersion - 1)
  const hasNextVersion = sortedVersions.some((v) => v.versionNumber === currentVersion + 1)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Document Version History</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrevVersion} disabled={!hasPrevVersion}>
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={handleNextVersion} disabled={!hasNextVersion}>
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="border rounded-md p-4 bg-muted/20">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h4 className="font-medium">Version {currentVersionData.versionNumber}</h4>
            <p className="text-sm text-muted-foreground">
              Last updated: {new Date(currentVersionData.date).toLocaleDateString()} by {currentVersionData.author}
            </p>
          </div>
          <Badge variant={currentVersion === sortedVersions[0].versionNumber ? "default" : "outline"}>
            {currentVersion === sortedVersions[0].versionNumber ? "Latest" : "Historical"}
          </Badge>
        </div>

        <div>
          <h5 className="text-sm font-medium mb-2">Changes in this version:</h5>
          <ul className="list-disc pl-5 space-y-1">
            {currentVersionData.changes.map((change, index) => (
              <li key={index} className="text-sm">
                {change}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        {sortedVersions.map((version) => (
          <Button
            key={version.id}
            variant={version.versionNumber === currentVersion ? "default" : "outline"}
            size="sm"
            onClick={() => onVersionChange(version)}
          >
            v{version.versionNumber}
          </Button>
        ))}
      </div>

      <div className="space-y-4 mt-6">
        <h3 className="text-lg font-medium">All Versions</h3>
        <div className="space-y-4">
          {sortedVersions.map((version) => (
            <div
              key={version.id}
              className={`border rounded-md p-4 ${version.versionNumber === currentVersion ? "border-primary bg-primary/5" : ""}`}
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">Version {version.versionNumber}</h4>
                  {version.versionNumber === sortedVersions[0].versionNumber && <Badge>Latest</Badge>}
                </div>
                <span className="text-sm text-muted-foreground">{new Date(version.date).toLocaleDateString()}</span>
              </div>
              <p className="text-sm mb-2">Author: {version.author}</p>
              <div>
                <h5 className="text-sm font-medium mb-1">Changes:</h5>
                <ul className="list-disc pl-5 space-y-1">
                  {version.changes.map((change, index) => (
                    <li key={index} className="text-sm">
                      {change}
                    </li>
                  ))}
                </ul>
              </div>
              {version.versionNumber !== currentVersion && (
                <Button variant="link" size="sm" className="p-0 h-auto mt-2" onClick={() => onVersionChange(version)}>
                  View this version
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
