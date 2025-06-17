"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Printer, Download, Eye, FileText, History, File } from "lucide-react"
import { DocumentVersionHistory, type DocumentVersion } from "./document-version-history"

interface Deliverable {
  id: string
  description: string
  completed: boolean
}

interface Milestone {
  id: string
  name: string
  description: string
  percentage: number
  amount: string
  deliverables: Deliverable[]
}

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
  milestones?: Milestone[]
  files?: string[]
  organizationName?: string
  contactPhone?: string
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
  milestones = [],
  files = [],
  organizationName,
  contactPhone,
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
              font-family: 'Georgia', 'Times New Roman', Times, serif;
              font-size: 12pt;
              line-height: 1.8;
              margin: 0;
              padding: 40px;
              color: #1a1a1a;
              background: #fff;
            }
            .proposal-document {
              max-width: 900px;
              margin: 0 auto;
              background: #fff;
              box-shadow: 0 4px 20px rgba(0,0,0,0.08);
              padding: 50px 60px;
              position: relative;
            }
            .proposal-document::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 8px;
              background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%);
            }
            .proposal-header {
              text-align: center;
              margin-bottom: 50px;
              border-bottom: 3px double #2563eb;
              padding-bottom: 30px;
              position: relative;
            }
            .proposal-header::after {
              content: '⚡';
              position: absolute;
              bottom: -15px;
              left: 50%;
              transform: translateX(-50%);
              background: #fff;
              color: #2563eb;
              font-size: 24px;
              padding: 0 15px;
            }
            .proposal-title {
              font-size: 32px;
              font-weight: bold;
              margin-bottom: 15px;
              color: #1e40af;
              text-transform: uppercase;
              letter-spacing: 2px;
              text-shadow: 0 1px 2px rgba(30, 64, 175, 0.1);
              font-family: 'Arial', sans-serif;
            }
            .proposal-subtitle {
              font-size: 20px;
              margin-bottom: 25px;
              color: #4b5563;
              font-style: italic;
              font-weight: 500;
            }
            .proposal-id {
              font-size: 14px;
              color: #6b7280;
              font-weight: 600;
              background: #f3f4f6;
              padding: 8px 16px;
              border-radius: 20px;
              display: inline-block;
              margin: 10px 0;
            }
            .proposal-date {
              font-size: 14px;
              color: #6b7280;
              margin-top: 5px;
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
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 20px;
              border-bottom: 3px solid #2563eb;
              padding-bottom: 12px;
              color: #1e40af;
              text-transform: uppercase;
              letter-spacing: 1px;
              position: relative;
              font-family: 'Arial', sans-serif;
            }
            .section-title::after {
              content: '';
              position: absolute;
              bottom: -3px;
              left: 0;
              width: 60px;
              height: 3px;
              background: #60a5fa;
            }
            .contact-info {
              margin-bottom: 35px;
              padding: 25px;
              background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
              border-left: 6px solid #2563eb;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.05);
              position: relative;
            }
            .contact-info::before {
              content: '👤';
              position: absolute;
              top: -10px;
              left: 20px;
              background: #2563eb;
              color: white;
              width: 30px;
              height: 30px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 16px;
            }
            .contact-name {
              font-weight: bold;
            }
            .signature-section {
              margin-top: 50px;
              page-break-inside: avoid;
            }
            .signature-box {
              margin-top: 20px;
              margin-bottom: 30px;
            }
            .signature-line {
              border-top: 2px solid #1e40af;
              width: 280px;
              margin-top: 50px;
              margin-bottom: 8px;
              position: relative;
            }
            .signature-line::after {
              content: '✓';
              position: absolute;
              right: -20px;
              top: -15px;
              color: #10b981;
              font-weight: bold;
              font-size: 16px;
            }
            .signature-name {
              font-weight: bold;
              color: #374151;
              font-size: 14px;
            }
            .signature-date {
              margin-top: 8px;
              color: #6b7280;
              font-size: 13px;
            }
            .footer {
              margin-top: 50px;
              text-align: center;
              font-size: 11px;
              color: #6b7280;
              border-top: 2px solid #e5e7eb;
              padding-top: 20px;
              background: #f9fafb;
              margin-left: -60px;
              margin-right: -60px;
              margin-bottom: -50px;
              padding-left: 60px;
              padding-right: 60px;
              padding-bottom: 30px;
            }
            .footer p {
              margin: 5px 0;
            }
            .footer::before {
              content: 'SMARTJECTS PLATFORM';
              display: block;
              font-weight: bold;
              font-size: 10px;
              letter-spacing: 2px;
              color: #2563eb;
              margin-bottom: 10px;
            }
            ul {
              padding-left: 25px;
              margin: 15px 0;
            }
            li {
              margin-bottom: 8px;
            }
            .milestone-box {
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 20px;
              margin-bottom: 20px;
              background: #f8fafc;
            }
            .milestone-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 15px;
            }
            .milestone-name {
              font-weight: bold;
              font-size: 16px;
              color: #1e40af;
            }
            .milestone-percentage {
              background: #2563eb;
              color: white;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 14px;
              font-weight: bold;
            }
            .milestone-deliverables {
              margin-top: 15px;
            }
            .milestone-deliverables h5 {
              margin: 0 0 10px 0;
              font-size: 14px;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .file-list {
              background: #f1f5f9;
              padding: 15px;
              border-radius: 6px;
              margin: 15px 0;
            }
            .file-item {
              display: flex;
              align-items: center;
              margin-bottom: 8px;
              font-size: 14px;
            }
            .file-item:last-child {
              margin-bottom: 0;
            }
            .section p {
              margin-bottom: 15px;
              text-align: justify;
            }
            .budget-timeline-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 30px;
              margin: 20px 0;
            }
            .info-box {
              background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
              padding: 25px;
              border-radius: 12px;
              border-left: 6px solid #10b981;
              box-shadow: 0 3px 12px rgba(0,0,0,0.06);
              position: relative;
            }
            .info-box strong {
              color: #065f46;
              font-weight: 700;
            }
            .info-box::before {
              content: '';
              position: absolute;
              top: 15px;
              right: 15px;
              width: 8px;
              height: 8px;
              background: #10b981;
              border-radius: 50%;
            }
            @media print {
              body {
                padding: 0;
                font-size: 11pt;
                line-height: 1.6;
              }
              .proposal-document {
                box-shadow: none;
                padding: 30px;
                max-width: none;
              }
              .proposal-header::after,
              .contact-info::before,
              .info-box::before {
                display: none;
              }
              .section {
                page-break-inside: avoid;
              }
              .milestone-box {
                page-break-inside: avoid;
              }
              .signature-section {
                page-break-before: auto;
                margin-top: 50px;
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

  const handleExportJSON = () => {
    const proposalData = {
      id: proposalId,
      title,
      smartjectTitle,
      type,
      description,
      scope,
      timeline,
      budget,
      deliverables: deliverablesList,
      requirements,
      expertise,
      approach,
      team,
      additionalInfo,
      author: {
        name: userName,
        email: userEmail,
        organization: organizationName,
        phone: contactPhone,
      },
      milestones,
      attachedFiles: files,
      metadata: {
        createdAt,
        version: currentVersion,
        lastUpdated: documentVersions.find((v) => v.versionNumber === currentVersion)?.date,
        status: "draft",
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      },
    }

    const dataStr = JSON.stringify(proposalData, null, 2)
    const blob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `proposal-${proposalId}-v${currentVersion}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
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
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="preview">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="raw">
                <FileText className="h-4 w-4 mr-2" />
                Raw Text
              </TabsTrigger>
              <TabsTrigger value="json">
                <File className="h-4 w-4 mr-2" />
                JSON Data
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
                  <div className="contact-name" style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "8px" }}>
                    {userName}
                  </div>
                  {organizationName && (
                    <div style={{ fontSize: "16px", fontWeight: "500", color: "#4b5563", marginBottom: "5px" }}>
                      {organizationName}
                    </div>
                  )}
                  <div style={{ marginBottom: "3px" }}>{userEmail}</div>
                  {contactPhone && <div>Phone: {contactPhone}</div>}
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
                  <div className="budget-timeline-grid">
                    <div className="info-box">
                      <p>
                        <strong>Estimated Timeline:</strong> {timeline}
                      </p>
                    </div>
                    <div className="info-box">
                      <p>
                        <strong>Estimated Budget:</strong> {budget}
                      </p>
                      {milestones.length > 0 && (
                        <p>
                          <strong>Payment Structure:</strong> {milestones.length} milestone{milestones.length > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>
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

                {milestones.length > 0 && (
                  <div className="section">
                    <div className="section-title">5. Project Milestones</div>
                    {milestones.map((milestone, index) => (
                      <div key={milestone.id} className="milestone-box">
                        <div className="milestone-header">
                          <div className="milestone-name">
                            Milestone {index + 1}: {milestone.name}
                          </div>
                          <div className="milestone-percentage">{milestone.percentage}%</div>
                        </div>
                        <p>{milestone.description}</p>
                        {milestone.amount && (
                          <p>
                            <strong>Payment Amount:</strong> {milestone.amount}
                          </p>
                        )}
                        {milestone.deliverables.length > 0 && (
                          <div className="milestone-deliverables">
                            <h5>Milestone Deliverables:</h5>
                            <ul>
                              {milestone.deliverables.map((deliverable) => (
                                <li key={deliverable.id}>{deliverable.description}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {files.length > 0 && (
                  <div className="section">
                    <div className="section-title">{milestones.length > 0 ? "6" : "5"}. Attached Documents</div>
                    <div className="file-list">
                      {files.map((file, index) => (
                        <div key={index} className="file-item">
                          📎 {file}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {type === "need" && requirements && (
                  <div className="section">
                    <div className="section-title">{files.length > 0 || milestones.length > 0 ? (files.length > 0 && milestones.length > 0 ? "7" : "6") : "5"}. Requirements</div>
                    <p>{requirements}</p>
                  </div>
                )}

                {type === "provide" && (
                  <>
                    {expertise && (
                      <div className="section">
                        <div className="section-title">{files.length > 0 || milestones.length > 0 ? (files.length > 0 && milestones.length > 0 ? "7" : "6") : "5"}. Expertise & Experience</div>
                        <p>{expertise}</p>
                      </div>
                    )}

                    {approach && (
                      <div className="section">
                        <div className="section-title">{files.length > 0 || milestones.length > 0 ? (files.length > 0 && milestones.length > 0 ? "8" : "7") : "6"}. Implementation Approach</div>
                        <p>{approach}</p>
                      </div>
                    )}

                    {team && (
                      <div className="section">
                        <div className="section-title">{files.length > 0 || milestones.length > 0 ? (files.length > 0 && milestones.length > 0 ? "9" : "8") : "7"}. Team & Resources</div>
                        <p>{team}</p>
                      </div>
                    )}
                  </>
                )}

                {additionalInfo && (
                  <div className="section">
                    <div className="section-title">
                      {(() => {
                        let sectionNum = type === "provide" ? 5 : 5;
                        if (files.length > 0) sectionNum++;
                        if (milestones.length > 0) sectionNum++;
                        if (type === "need" && requirements) sectionNum++;
                        if (type === "provide" && expertise) sectionNum++;
                        if (type === "provide" && approach) sectionNum++;
                        if (type === "provide" && team) sectionNum++;
                        return sectionNum;
                      })()}. Additional Information
                    </div>
                    <p>{additionalInfo}</p>
                  </div>
                )}

                <div className="signature-section">
                  <div className="section-title">
                    {(() => {
                      let sectionNum = type === "provide" ? 5 : 5;
                      if (files.length > 0) sectionNum++;
                      if (milestones.length > 0) sectionNum++;
                      if (type === "need" && requirements) sectionNum++;
                      if (type === "provide" && expertise) sectionNum++;
                      if (type === "provide" && approach) sectionNum++;
                      if (type === "provide" && team) sectionNum++;
                      if (additionalInfo) sectionNum++;
                      return sectionNum;
                    })()}. Terms & Authorization
                  </div>
                  
                  <div style={{ background: '#fef3c7', padding: '20px', borderRadius: '8px', border: '1px solid #f59e0b', marginBottom: '25px' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#92400e', fontSize: '16px' }}>⚠️ Important Terms</h4>
                    <ul style={{ margin: '0', paddingLeft: '20px', color: '#92400e' }}>
                      <li>This proposal is valid for <strong>30 days</strong> from the date of submission</li>
                      <li>All terms and pricing are binding upon acceptance</li>
                      <li>Changes to scope may affect timeline and budget</li>
                      <li>Payment terms as outlined in milestones (if applicable)</li>
                    </ul>
                  </div>

                  <p style={{ marginBottom: '30px', fontStyle: 'italic' }}>
                    By signing below, you acknowledge that you have read, understood, and agree to all terms outlined in this proposal.
                    You confirm that you have the authority to enter into this agreement on behalf of your organization.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '40px' }}>
                    <div className="signature-box">
                      <div style={{ marginBottom: '15px', fontWeight: 'bold', color: '#1e40af' }}>CLIENT ACCEPTANCE</div>
                      <div className="signature-line"></div>
                      <div className="signature-name">Authorized Signature</div>
                      <div className="signature-date">Date: ____________________</div>
                      <div style={{ marginTop: '20px' }}>
                        <div className="signature-line"></div>
                        <div className="signature-name">Print Name and Title</div>
                      </div>
                    </div>

                    <div className="signature-box">
                      <div style={{ marginBottom: '15px', fontWeight: 'bold', color: '#1e40af' }}>PROPOSAL SUBMITTED BY</div>
                      <div className="signature-line"></div>
                      <div className="signature-name">{userName}</div>
                      <div className="signature-date">Date: {new Date(createdAt).toLocaleDateString()}</div>
                      <div style={{ marginTop: '20px' }}>
                        <div className="signature-line"></div>
                        <div className="signature-name">{organizationName || 'Individual Contractor'}</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '40px', padding: '15px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '6px' }}>
                    <h5 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 'bold' }}>Next Steps:</h5>
                    <ol style={{ margin: '0', paddingLeft: '20px', fontSize: '13px' }}>
                      <li>Review all terms and conditions carefully</li>
                      <li>Sign and return this document within the validity period</li>
                      <li>Initial project communication will begin within 2 business days of acceptance</li>
                      <li>Project kickoff meeting will be scheduled within 5 business days</li>
                    </ol>
                  </div>
                </div>

                <div className="footer">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', textAlign: 'center', marginBottom: '15px' }}>
                    <div>
                      <strong>Document Info</strong><br/>
                      ID: {proposalId}<br/>
                      Version: {currentVersion}
                    </div>
                    <div>
                      <strong>Generated</strong><br/>
                      {new Date().toLocaleDateString()}<br/>
                      {new Date().toLocaleTimeString()}
                    </div>
                    <div>
                      <strong>Status</strong><br/>
                      Professional Proposal<br/>
                      Ready for Review
                    </div>
                  </div>
                  <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '15px', fontSize: '10px' }}>
                    <p>This document contains confidential and proprietary information. Distribution is restricted to authorized parties only.</p>
                    <p>© {new Date().getFullYear()} Smartjects Platform. All rights reserved. | Generated with advanced proposal management technology.</p>
                  </div>
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

═══════════════════════════════════════════════════════════════════════════════
CONTACT INFORMATION
═══════════════════════════════════════════════════════════════════════════════

👤 ${userName}${organizationName ? `\n   ${organizationName}` : ""}
📧 ${userEmail}${contactPhone ? `\n📞 ${contactPhone}` : ""}

1. EXECUTIVE SUMMARY

${description}

2. PROJECT SCOPE

${scope}

3. TIMELINE AND BUDGET

Estimated Timeline: ${timeline}
Estimated Budget: ${budget}${milestones.length > 0 ? `\nPayment Structure: ${milestones.length} milestone${milestones.length > 1 ? 's' : ''}` : ""}

4. DELIVERABLES

${deliverablesList.map((item) => `- ${item}`).join("\n")}

${
  milestones.length > 0
    ? `5. PROJECT MILESTONES

${milestones.map((milestone, index) => `Milestone ${index + 1}: ${milestone.name} (${milestone.percentage}%)
${milestone.description}${milestone.amount ? `\nPayment Amount: ${milestone.amount}` : ""}${milestone.deliverables.length > 0 ? `\nMilestone Deliverables:\n${milestone.deliverables.map(d => `- ${d.description}`).join('\n')}` : ""}`).join('\n\n')}

`
    : ""
}

${
  files.length > 0
    ? `${milestones.length > 0 ? "6" : "5"}. ATTACHED DOCUMENTS

${files.map((file) => `📎 ${file}`).join("\n")}

`
    : ""
}

${
  type === "need" && requirements
    ? `${files.length > 0 || milestones.length > 0 ? (files.length > 0 && milestones.length > 0 ? "7" : "6") : "5"}. REQUIREMENTS

${requirements}
`
    : ""
}

${
  type === "provide" && expertise
    ? `${files.length > 0 || milestones.length > 0 ? (files.length > 0 && milestones.length > 0 ? "7" : "6") : "5"}. EXPERTISE & EXPERIENCE

${expertise}
`
    : ""
}

${
  type === "provide" && approach
    ? `${files.length > 0 || milestones.length > 0 ? (files.length > 0 && milestones.length > 0 ? "8" : "7") : "6"}. IMPLEMENTATION APPROACH

${approach}
`
    : ""
}

${
  type === "provide" && team
    ? `${files.length > 0 || milestones.length > 0 ? (files.length > 0 && milestones.length > 0 ? "9" : "8") : "7"}. TEAM & RESOURCES

${team}
`
    : ""
}

${
  additionalInfo
    ? `${(() => {
        let sectionNum = type === "provide" ? 5 : 5;
        if (files.length > 0) sectionNum++;
        if (milestones.length > 0) sectionNum++;
        if (type === "need" && requirements) sectionNum++;
        if (type === "provide" && expertise) sectionNum++;
        if (type === "provide" && approach) sectionNum++;
        if (type === "provide" && team) sectionNum++;
        return sectionNum;
      })()} ADDITIONAL INFORMATION

${additionalInfo}
`
    : ""
}

${(() => {
  let sectionNum = type === "provide" ? 5 : 5;
  if (files.length > 0) sectionNum++;
  if (milestones.length > 0) sectionNum++;
  if (type === "need" && requirements) sectionNum++;
  if (type === "provide" && expertise) sectionNum++;
  if (type === "provide" && approach) sectionNum++;
  if (type === "provide" && team) sectionNum++;
  if (additionalInfo) sectionNum++;
  return sectionNum;
})()} TERMS & AUTHORIZATION

⚠️ IMPORTANT TERMS:
• This proposal is valid for 30 days from the date of submission
• All terms and pricing are binding upon acceptance
• Changes to scope may affect timeline and budget
• Payment terms as outlined in milestones (if applicable)

By signing below, you acknowledge that you have read, understood, and agree to all terms outlined in this proposal. You confirm that you have the authority to enter into this agreement on behalf of your organization.

CLIENT ACCEPTANCE                    PROPOSAL SUBMITTED BY
Authorized Signature: _____________  ${userName}
Date: ____________________________  Date: ${new Date(createdAt).toLocaleDateString()}
Print Name and Title: _____________  ${organizationName || 'Individual Contractor'}

NEXT STEPS:
1. Review all terms and conditions carefully
2. Sign and return this document within the validity period
3. Initial project communication will begin within 2 business days of acceptance
4. Project kickoff meeting will be scheduled within 5 business days

═══════════════════════════════════════════════════════════════════════════════
SMARTJECTS PLATFORM

Document Info          Generated                Status
ID: ${proposalId}      ${new Date().toLocaleDateString()}        Professional Proposal
Version: ${currentVersion}    ${new Date().toLocaleTimeString()}        Ready for Review

This document contains confidential and proprietary information. 
Distribution is restricted to authorized parties only.

© ${new Date().getFullYear()} Smartjects Platform. All rights reserved.
Generated with advanced proposal management technology.
`}
              </pre>
            </TabsContent>

            <TabsContent value="json" className="border rounded-md p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Proposal Data (JSON Format)</h3>
                <p className="text-sm text-gray-600 mb-4">
                  This JSON format can be used for API integrations, data backup, or importing into other systems.
                </p>
              </div>
              <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded overflow-auto max-h-96">
                {JSON.stringify(
                  {
                    id: proposalId,
                    title,
                    smartjectTitle,
                    type,
                    description,
                    scope,
                    timeline,
                    budget,
                    deliverables: deliverablesList,
                    requirements,
                    expertise,
                    approach,
                    team,
                    additionalInfo,
                    author: {
                      name: userName,
                      email: userEmail,
                      organization: organizationName,
                      phone: contactPhone,
                    },
                    milestones,
                    attachedFiles: files,
                    metadata: {
                      createdAt,
                      version: currentVersion,
                      lastUpdated: documentVersions.find((v) => v.versionNumber === currentVersion)?.date,
                      status: "draft",
                      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    },
                  },
                  null,
                  2,
                )}
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

          <div className="flex justify-between items-center mt-6 pt-4 border-t">
            <div className="text-sm text-gray-500">
              Document ready for export • Version {currentVersion}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportJSON}>
                <Download className="h-4 w-4 mr-2" />
                Export JSON
              </Button>
              <Button variant="outline" onClick={handleDownloadPDF}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print Document
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
