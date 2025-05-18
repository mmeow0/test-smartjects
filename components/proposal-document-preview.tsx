"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Printer, Download, Eye, FileText, History } from "lucide-react"
import { DocumentVersionHistory, type DocumentVersion } from "./document-version-history"

interface ProposalDocumentPreviewProps {
  proposalId: string
  title: string
  smartjectTitle: string
  type: "need" | "provide"
  description: string
  scope: string
  timeline: string
  budget: string
  deliverables: string
  requirements?: string
  expertise?: string
  approach?: string
  team?: string
  additionalInfo?: string
  userName: string
  userEmail: string
  createdAt: string
  versions?: DocumentVersion[]
}

export function ProposalDocumentPreview({
  proposalId,
  title,
  smartjectTitle,
  type,
  description,
  scope,
  timeline,
  budget,
  deliverables,
  requirements,
  expertise,
  approach,
  team,
  additionalInfo,
  userName,
  userEmail,
  createdAt,
  versions = [],
}: ProposalDocumentPreviewProps) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("preview")
  const [currentVersion, setCurrentVersion] = useState(
    versions.length > 0 ? Math.max(...versions.map((v) => v.versionNumber)) : 1,
  )

  // If no versions are provided, create a default current version
  const defaultVersion: DocumentVersion = {
    id: "current",
    versionNumber: 1,
    date: createdAt,
    author: userName,
    changes: ["Initial proposal creation"],
  }

  const documentVersions = versions.length > 0 ? versions : [defaultVersion]

  const handleVersionChange = (version: DocumentVersion) => {
    setCurrentVersion(version.versionNumber)
    // In a real app, we would fetch the proposal data for this specific version
    // For now, we'll just update the version number
  }

  const handlePrint = () => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const content = document.getElementById("proposal-print-content")?.innerHTML

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title} - Proposal</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.5;
              margin: 0;
              padding: 20px;
              color: #000;
            }
            .proposal-document {
              max-width: 800px;
              margin: 0 auto;
            }
            .proposal-header {
              text-align: center;
              margin-bottom: 30px;
            }
            .proposal-title {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .proposal-subtitle {
              font-size: 18px;
              margin-bottom: 20px;
            }
            .proposal-id {
              font-size: 14px;
              color: #666;
            }
            .version-info {
              font-size: 12px;
              color: #666;
              margin-top: 5px;
            }
            .section {
              margin-bottom: 20px;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 10px;
              border-bottom: 1px solid #ddd;
              padding-bottom: 5px;
            }
            .contact-info {
              margin-bottom: 20px;
            }
            .contact-name {
              font-weight: bold;
            }
            .signature-section {
              margin-top: 40px;
            }
            .signature-box {
              margin-top: 10px;
              margin-bottom: 30px;
            }
            .signature-line {
              border-top: 1px solid #000;
              width: 250px;
              margin-top: 50px;
              margin-bottom: 5px;
            }
            .signature-name {
              font-weight: bold;
            }
            .signature-date {
              margin-top: 5px;
              color: #666;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
            ul {
              padding-left: 20px;
            }
            @media print {
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `)

    printWindow.document.close()
    printWindow.focus()

    // Add a slight delay to ensure content is loaded before printing
    setTimeout(() => {
      printWindow.print()
      // Don't close the window after printing so user can see the print preview
    }, 500)
  }

  const handleDownloadPDF = () => {
    // In a real app, this would generate and download a PDF
    // For now, we'll just show a message
    alert("PDF download functionality would be implemented here")
  }

  // Format deliverables as a list
  const deliverablesList = deliverables
    .split(/\n|,/)
    .filter((item) => item.trim())
    .map((item) => item.trim())

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)} className="flex items-center gap-2">
        <Eye className="h-4 w-4" />
        <span>Preview Document</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Proposal Document Preview</DialogTitle>
            <DialogDescription>Preview how your proposal will look when printed or saved as PDF</DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="preview">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="raw">
                <FileText className="h-4 w-4 mr-2" />
                Raw Text
              </TabsTrigger>
              <TabsTrigger value="history">
                <History className="h-4 w-4 mr-2" />
                Version History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="border rounded-md p-6 bg-white">
              <div id="proposal-print-content" className="proposal-document">
                <div className="proposal-header">
                  <div className="proposal-title">{title}</div>
                  <div className="proposal-subtitle">
                    {type === "need" ? "Request for Implementation" : "Implementation Offer"} for {smartjectTitle}
                  </div>
                  <div className="proposal-id">Proposal ID: {proposalId}</div>
                  <div className="proposal-date">Date: {new Date(createdAt).toLocaleDateString()}</div>
                  <div className="version-info">
                    Version {currentVersion} • Last updated:{" "}
                    {new Date(
                      documentVersions.find((v) => v.versionNumber === currentVersion)?.date || new Date(),
                    ).toLocaleDateString()}
                  </div>
                </div>

                <div className="contact-info">
                  <div className="contact-name">{userName}</div>
                  <div>{userEmail}</div>
                </div>

                <div className="section">
                  <div className="section-title">1. Executive Summary</div>
                  <p>{description}</p>
                </div>

                <div className="section">
                  <div className="section-title">2. Project Scope</div>
                  <p>{scope}</p>
                </div>

                <div className="section">
                  <div className="section-title">3. Timeline and Budget</div>
                  <p>
                    <strong>Estimated Timeline:</strong> {timeline}
                  </p>
                  <p>
                    <strong>Estimated Budget:</strong> {budget}
                  </p>
                </div>

                <div className="section">
                  <div className="section-title">4. Deliverables</div>
                  {deliverablesList.length > 0 ? (
                    <ul>
                      {deliverablesList.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>{deliverables}</p>
                  )}
                </div>

                {type === "need" && requirements && (
                  <div className="section">
                    <div className="section-title">5. Requirements</div>
                    <p>{requirements}</p>
                  </div>
                )}

                {type === "provide" && (
                  <>
                    {expertise && (
                      <div className="section">
                        <div className="section-title">5. Expertise & Experience</div>
                        <p>{expertise}</p>
                      </div>
                    )}

                    {approach && (
                      <div className="section">
                        <div className="section-title">6. Implementation Approach</div>
                        <p>{approach}</p>
                      </div>
                    )}

                    {team && (
                      <div className="section">
                        <div className="section-title">7. Team & Resources</div>
                        <p>{team}</p>
                      </div>
                    )}
                  </>
                )}

                {additionalInfo && (
                  <div className="section">
                    <div className="section-title">{type === "provide" ? "8" : "6"}. Additional Information</div>
                    <p>{additionalInfo}</p>
                  </div>
                )}

                <div className="signature-section">
                  <div className="section-title">{type === "provide" ? "9" : "7"}. Authorization</div>
                  <p>
                    This proposal is valid for 30 days from the date of submission. By signing below, you acknowledge
                    that you have the authority to enter into this agreement on behalf of your organization.
                  </p>

                  <div className="signature-box">
                    <div className="signature-line"></div>
                    <div className="signature-name">Authorized Signature</div>
                    <div className="signature-date">Date: ____________________</div>
                  </div>

                  <div className="signature-box">
                    <div className="signature-line"></div>
                    <div className="signature-name">Print Name and Title</div>
                  </div>
                </div>

                <div className="footer">
                  <p>This document is generated by Smartjects Platform. Proposal ID: {proposalId}</p>
                  <p>Version {currentVersion} • Page 1 of 1</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="raw" className="border rounded-md p-6">
              <pre className="whitespace-pre-wrap text-sm">
                {`PROPOSAL

${title}
${type === "need" ? "Request for Implementation" : "Implementation Offer"} for ${smartjectTitle}
Proposal ID: ${proposalId}
Date: ${new Date(createdAt).toLocaleDateString()}
Version ${currentVersion} • Last updated: ${new Date(documentVersions.find((v) => v.versionNumber === currentVersion)?.date || new Date()).toLocaleDateString()}

${userName}
${userEmail}

1. EXECUTIVE SUMMARY

${description}

2. PROJECT SCOPE

${scope}

3. TIMELINE AND BUDGET

Estimated Timeline: ${timeline}
Estimated Budget: ${budget}

4. DELIVERABLES

${deliverablesList.map((item) => `- ${item}`).join("\n")}

${
  type === "need" && requirements
    ? `5. REQUIREMENTS

${requirements}
`
    : ""
}

${
  type === "provide" && expertise
    ? `5. EXPERTISE & EXPERIENCE

${expertise}
`
    : ""
}

${
  type === "provide" && approach
    ? `6. IMPLEMENTATION APPROACH

${approach}
`
    : ""
}

${
  type === "provide" && team
    ? `7. TEAM & RESOURCES

${team}
`
    : ""
}

${
  additionalInfo
    ? `${type === "provide" ? "8" : "6"}. ADDITIONAL INFORMATION

${additionalInfo}
`
    : ""
}

${type === "provide" ? "9" : "7"}. AUTHORIZATION

This proposal is valid for 30 days from the date of submission. By signing below, you acknowledge that you have the authority to enter into this agreement on behalf of your organization.

Authorized Signature: __________________________ Date: ______________

Print Name and Title: __________________________

This document is generated by Smartjects Platform.
Proposal ID: ${proposalId}
Version ${currentVersion}
`}
              </pre>
            </TabsContent>

            <TabsContent value="history" className="border rounded-md p-6">
              <DocumentVersionHistory
                versions={documentVersions}
                currentVersion={currentVersion}
                onVersionChange={handleVersionChange}
              />
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={handleDownloadPDF}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
