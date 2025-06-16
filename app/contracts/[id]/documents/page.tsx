"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Download, FileText, Upload, Loader2, Calendar, User } from "lucide-react"
import { contractService } from "@/lib/services"

interface ContractDocument {
  id: string
  name: string
  type: string
  size: string
  url: string
  uploadedAt: string
  uploadedBy: string
}

export default function ContractDocumentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [contract, setContract] = useState<any>(null)
  const [documents, setDocuments] = useState<ContractDocument[]>([])
  const [error, setError] = useState<string | null>(null)

  // Load contract and documents data
  useEffect(() => {
    const loadData = async () => {
      if (!isAuthenticated) {
        router.push("/auth/login")
        return
      }
      
      if (user?.accountType !== "paid") {
        router.push("/upgrade")
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        // Load contract data
        const contractData = await contractService.getContractById(id)
        if (!contractData) {
          setError("Contract not found or access denied")
          setIsLoading(false)
          return
        }

        setContract(contractData)

        // Load documents
        const documentsData = await contractService.getContractDocuments(id)
        setDocuments(documentsData)

        setIsLoading(false)
      } catch (error) {
        console.error("Error loading contract documents:", error)
        setError("Failed to load contract documents")
        setIsLoading(false)
      }
    }

    loadData()
  }, [isAuthenticated, user, id, router])

  // Redirect if not authenticated or not paid
  if (!isAuthenticated || user?.accountType !== "paid") {
    return null
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <Card className="w-full max-w-4xl">
            <CardHeader className="text-center">
              <CardTitle>Loading...</CardTitle>
              <CardDescription>Please wait while we load your contract documents.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !contract) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <Card className="w-full max-w-4xl">
            <CardHeader className="text-center">
              <CardTitle>Error</CardTitle>
              <CardDescription>{error || "Contract not found"}</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-4">
              <Button onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
      // TODO: Implement actual file upload to storage
      // For now, just show a success message
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate upload

      toast({
        title: "Document uploaded",
        description: `${file.name} has been uploaded successfully.`,
      })

      // Reload documents
      const updatedDocuments = await contractService.getContractDocuments(id)
      setDocuments(updatedDocuments)

    } catch (error) {
      console.error("Error uploading document:", error)
      toast({
        title: "Upload failed",
        description: "Failed to upload document. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      // Reset file input
      event.target.value = ""
    }
  }

  const handleDownload = (document: ContractDocument) => {
    // TODO: Implement actual download
    toast({
      title: "Download started",
      description: `Downloading ${document.name}...`,
    })
  }

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return <FileText className="h-8 w-8 text-red-500" />
      case 'doc':
      case 'docx':
        return <FileText className="h-8 w-8 text-blue-500" />
      case 'xls':
      case 'xlsx':
        return <FileText className="h-8 w-8 text-green-500" />
      default:
        return <FileText className="h-8 w-8 text-gray-500" />
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Contract
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Contract Documents</h1>
          <p className="text-muted-foreground">
            For contract: <span className="font-medium">{contract.title}</span>
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload New Document</CardTitle>
            <CardDescription>
              Upload documents related to this contract. Supported formats: PDF, DOC, DOCX, XLS, XLSX
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/80 transition-colors"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {isUploading ? (
                    <Loader2 className="h-8 w-8 mb-4 animate-spin text-muted-foreground" />
                  ) : (
                    <Upload className="h-8 w-8 mb-4 text-muted-foreground" />
                  )}
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">
                      {isUploading ? "Uploading..." : "Click to upload"}
                    </span>
                    {!isUploading && " or drag and drop"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PDF, DOC, DOCX, XLS, XLSX (MAX. 10MB)
                  </p>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        <Card>
          <CardHeader>
            <CardTitle>All Documents ({documents.length})</CardTitle>
            <CardDescription>
              Documents uploaded for this contract
            </CardDescription>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No documents uploaded yet.</p>
                <p className="text-sm">Upload your first document to get started.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {documents.map((document) => (
                  <div
                    key={document.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {getFileIcon(document.type)}
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">{document.name}</h3>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(document.uploadedAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {document.uploadedBy}
                          </span>
                          <span>{document.size}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(document)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}