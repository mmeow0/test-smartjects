"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Printer, Download, Eye, FileText, History } from "lucide-react"
import { DocumentVersionHistory, type DocumentVersion } from "./document-version-history"

interface ContractParty {
  id: string
  name: string
  email: string
  avatar?: string
}

interface MilestoneType {
  id: string
  name: string
  description: string
  percentage: number
  amount: string
  dueDate: string
  status: string
  completedDate?: string
  deliverables: string[]
}

interface ContractDocumentPreviewProps {
  contractId: string
  title: string
  smartjectTitle: string
  provider: ContractParty
  needer: ContractParty
  startDate: string
  endDate: string
  exclusivityEnds: string
  budget: string
  scope: string
  deliverables: string[]
  paymentSchedule: MilestoneType[]
  versions?: DocumentVersion[]
}

export function ContractDocumentPreview({
  contractId,
  title,
  smartjectTitle,
  provider,
  needer,
  startDate,
  endDate,
  exclusivityEnds,
  budget,
  scope,
  deliverables,
  paymentSchedule,
  versions = [],
}: ContractDocumentPreviewProps) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("preview")
  const [currentVersion, setCurrentVersion] = useState(
    versions.length > 0 ? Math.max(...versions.map((v) => v.versionNumber)) : 1,
  )

  // If no versions are provided, create a default current version
  const defaultVersion: DocumentVersion = {
    id: "current",
    versionNumber: 1,
    date: new Date().toISOString(),
    author: "System",
    changes: ["Initial contract creation"],
  }

  const documentVersions = versions.length > 0 ? versions : [defaultVersion]

  const handleVersionChange = (version: DocumentVersion) => {
    setCurrentVersion(version.versionNumber)
    // In a real app, we would fetch the contract data for this specific version
    // For now, we'll just update the version number
  }

  const handlePrint = () => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const content = document.getElementById("contract-print-content")?.innerHTML

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title} - Contract</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.5;
              margin: 0;
              padding: 20px;
              color: #000;
            }
            .contract-document {
              max-width: 800px;
              margin: 0 auto;
            }
            .contract-header {
              text-align: center;
              margin-bottom: 30px;
            }
            .contract-title {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .contract-subtitle {
              font-size: 18px;
              margin-bottom: 20px;
            }
            .contract-id {
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
            .parties {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
            }
            .party {
              width: 48%;
            }
            .party-title {
              font-weight: bold;
              margin-bottom: 5px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
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

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)} className="flex items-center gap-2">
        <Eye className="h-4 w-4" />
        <span>Preview Document</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Contract Document Preview</DialogTitle>
            <DialogDescription>Preview how your contract will look when printed or saved as PDF</DialogDescription>
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
              <div id="contract-print-content" className="contract-document">
                <div className="contract-header">
                  <div className="contract-title">{title}</div>
                  <div className="contract-subtitle">Agreement for {smartjectTitle}</div>
                  <div className="contract-id">Contract ID: {contractId}</div>
                  <div className="version-info">
                    Version {currentVersion} • Last updated:{" "}
                    {new Date(
                      documentVersions.find((v) => v.versionNumber === currentVersion)?.date || new Date(),
                    ).toLocaleDateString()}
                  </div>
                </div>

                <div className="section">
                  <div className="section-title">1. Parties</div>
                  <div className="parties">
                    <div className="party">
                      <div className="party-title">Provider:</div>
                      <div>{provider.name}</div>
                      <div>{provider.email}</div>
                    </div>
                    <div className="party">
                      <div className="party-title">Client:</div>
                      <div>{needer.name}</div>
                      <div>{needer.email}</div>
                    </div>
                  </div>
                </div>

                <div className="section">
                  <div className="section-title">2. Term</div>
                  <p>
                    This Agreement shall commence on <strong>{new Date(startDate).toLocaleDateString()}</strong> and
                    continue until <strong>{new Date(endDate).toLocaleDateString()}</strong>, unless terminated earlier
                    in accordance with the terms of this Agreement.
                  </p>
                  <p>
                    The exclusivity period extends until{" "}
                    <strong>{new Date(exclusivityEnds).toLocaleDateString()}</strong>.
                  </p>
                </div>

                <div className="section">
                  <div className="section-title">3. Project Scope</div>
                  <p>{scope}</p>
                </div>

                <div className="section">
                  <div className="section-title">4. Deliverables</div>
                  <ul>
                    {deliverables.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="section">
                  <div className="section-title">5. Payment Terms</div>
                  <p>
                    The total contract value is <strong>{budget}</strong>, payable according to the following schedule:
                  </p>

                  <table>
                    <thead>
                      <tr>
                        <th>Milestone</th>
                        <th>Description</th>
                        <th>Amount</th>
                        <th>Due Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentSchedule.map((milestone) => (
                        <tr key={milestone.id}>
                          <td>{milestone.name}</td>
                          <td>{milestone.description}</td>
                          <td>{milestone.amount}</td>
                          <td>{new Date(milestone.dueDate).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="section">
                  <div className="section-title">6. Intellectual Property</div>
                  <p>
                    Upon full payment of all fees due under this Agreement, the Provider grants to the Client all
                    intellectual property rights to the deliverables, except for any third-party materials and
                    Provider's pre-existing intellectual property, which shall remain the property of their respective
                    owners.
                  </p>
                </div>

                <div className="section">
                  <div className="section-title">7. Confidentiality</div>
                  <p>
                    Both parties agree to maintain the confidentiality of any proprietary or sensitive information
                    shared during the course of this Agreement. This obligation shall survive the termination of this
                    Agreement.
                  </p>
                </div>

                <div className="section">
                  <div className="section-title">8. Termination</div>
                  <p>
                    Either party may terminate this Agreement for material breach if such breach is not cured within 30
                    days of written notice. Upon termination, the Client shall pay for all services rendered up to the
                    date of termination.
                  </p>
                </div>

                <div className="signature-section">
                  <div className="section-title">9. Signatures</div>
                  <p>
                    By signing below, the parties acknowledge that they have read, understood, and agree to the terms
                    and conditions of this Agreement.
                  </p>

                  <div className="parties">
                    <div className="party">
                      <div className="party-title">Provider:</div>
                      <div className="signature-box">
                        <div className="signature-line"></div>
                        <div className="signature-name">{provider.name}</div>
                        <div className="signature-date">Date: ____________________</div>
                      </div>
                    </div>
                    <div className="party">
                      <div className="party-title">Client:</div>
                      <div className="signature-box">
                        <div className="signature-line"></div>
                        <div className="signature-name">{needer.name}</div>
                        <div className="signature-date">Date: ____________________</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="footer">
                  <p>This document is generated by Smartjects Platform. Contract ID: {contractId}</p>
                  <p>Version {currentVersion} • Page 1 of 1</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="raw" className="border rounded-md p-6">
              <pre className="whitespace-pre-wrap text-sm">
                {`CONTRACT AGREEMENT

${title}
Agreement for ${smartjectTitle}
Contract ID: ${contractId}
Version ${currentVersion} • Last updated: ${new Date(documentVersions.find((v) => v.versionNumber === currentVersion)?.date || new Date()).toLocaleDateString()}

1. PARTIES

Provider:
${provider.name}
${provider.email}

Client:
${needer.name}
${needer.email}

2. TERM

This Agreement shall commence on ${new Date(startDate).toLocaleDateString()} and continue until ${new Date(endDate).toLocaleDateString()}, unless terminated earlier in accordance with the terms of this Agreement.

The exclusivity period extends until ${new Date(exclusivityEnds).toLocaleDateString()}.

3. PROJECT SCOPE

${scope}

4. DELIVERABLES

${deliverables.map((item) => `- ${item}`).join("\n")}

5. PAYMENT TERMS

The total contract value is ${budget}, payable according to the following schedule:

${paymentSchedule
  .map(
    (milestone) =>
      `- ${milestone.name}: ${milestone.amount} (${milestone.percentage}%) due on ${new Date(milestone.dueDate).toLocaleDateString()}
  Description: ${milestone.description}`,
  )
  .join("\n\n")}

6. INTELLECTUAL PROPERTY

Upon full payment of all fees due under this Agreement, the Provider grants to the Client all intellectual property rights to the deliverables, except for any third-party materials and Provider's pre-existing intellectual property, which shall remain the property of their respective owners.

7. CONFIDENTIALITY

Both parties agree to maintain the confidentiality of any proprietary or sensitive information shared during the course of this Agreement. This obligation shall survive the termination of this Agreement.

8. TERMINATION

Either party may terminate this Agreement for material breach if such breach is not cured within 30 days of written notice. Upon termination, the Client shall pay for all services rendered up to the date of termination.

9. SIGNATURES

Provider: ${provider.name}
Signature: __________________________ Date: ______________

Client: ${needer.name}
Signature: __________________________ Date: ______________

This document is generated by Smartjects Platform.
Contract ID: ${contractId}
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
