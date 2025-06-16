"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/components/auth-provider"
import { useRequirePaidAccount } from "@/hooks/use-auth-guard"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Upload, FileText, X, Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { contractService } from "@/lib/services"

interface UploadFile {
  file: File
  id: string
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

export default function ContractUploadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const router = useRouter()
  const { isLoading: authLoading, user, canAccess } = useRequirePaidAccount()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [contract, setContract] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [description, setDescription] = useState("")

  // Load contract data
  // Load contract data and check access
  useEffect(() => {
    const loadContract = async () => {
      if (authLoading || !canAccess) {
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const contractData = await contractService.getContractById(id)
        
        if (!contractData) {
          setError("Contract not found or access denied")
          setIsLoading(false)
          return
        }

        setContract(contractData)
        setIsLoading(false)
        
      } catch (error) {
        console.error("Error loading contract:", error)
        setError("Failed to load contract data")
        setIsLoading(false)
      }
    }

    loadContract()
  }, [authLoading, canAccess, user, id, router])

  // Redirect if not authenticated or not paid
  if (authLoading || !canAccess) {
    return null
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <Card className="w-full max-w-3xl">
            <CardHeader className="text-center">
              <CardTitle>Loading...</CardTitle>
              <CardDescription>Please wait while we load your contract details.</CardDescription>
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
          <Card className="w-full max-w-3xl">
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

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is too large. Maximum file size is 10MB.`,
          variant: "destructive",
        })
        return false
      }

      // Check file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/jpeg',
        'image/png',
        'text/plain'
      ]

      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported file type.`,
          variant: "destructive",
        })
        return false
      }

      return true
    })

    const newUploadFiles: UploadFile[] = validFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      progress: 0,
      status: 'pending'
    }))

    setUploadFiles(prev => [...prev, ...newUploadFiles])
  }

  const removeFile = (fileId: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const uploadFile = async (uploadFile: UploadFile) => {
    setUploadFiles(prev => prev.map(f => 
      f.id === uploadFile.id ? { ...f, status: 'uploading', progress: 0 } : f
    ))

    try {
      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100))
        setUploadFiles(prev => prev.map(f => 
          f.id === uploadFile.id ? { ...f, progress } : f
        ))
      }

      // TODO: Implement actual file upload to storage and database
      // This would typically involve:
      // 1. Upload file to cloud storage (AWS S3, etc.)
      // 2. Save file metadata to database via contract service
      
      setUploadFiles(prev => prev.map(f => 
        f.id === uploadFile.id ? { ...f, status: 'success', progress: 100 } : f
      ))

      toast({
        title: "Upload successful",
        description: `${uploadFile.file.name} has been uploaded successfully.`,
      })

    } catch (error) {
      console.error("Upload error:", error)
      setUploadFiles(prev => prev.map(f => 
        f.id === uploadFile.id ? { 
          ...f, 
          status: 'error', 
          error: 'Upload failed. Please try again.' 
        } : f
      ))
    }
  }

  const uploadAllFiles = async () => {
    const pendingFiles = uploadFiles.filter(f => f.status === 'pending')
    
    // Upload files one by one
    for (const file of pendingFiles) {
      await uploadFile(file)
    }

    // Check if all uploads were successful
    const allSuccessful = uploadFiles.every(f => f.status === 'success')
    
    if (allSuccessful && uploadFiles.length > 0) {
      toast({
        title: "All uploads completed",
        description: "All documents have been uploaded successfully.",
      })
      
      // Redirect to contract page after successful upload
      setTimeout(() => {
        router.push(`/contracts/${id}`)
      }, 2000)
    }
  }

  const getFileIcon = (file: File) => {
    if (file.type.includes('pdf')) {
      return <FileText className="h-6 w-6 text-red-500" />
    } else if (file.type.includes('word')) {
      return <FileText className="h-6 w-6 text-blue-500" />
    } else if (file.type.includes('excel') || file.type.includes('spreadsheet')) {
      return <FileText className="h-6 w-6 text-green-500" />
    } else {
      return <FileText className="h-6 w-6 text-gray-500" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'uploading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      default:
        return null
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Contract
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Upload Documents</h1>
          <p className="text-muted-foreground">
            For contract: <span className="font-medium">{contract.title}</span>
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Upload Area */}
        <Card>
          <CardHeader>
            <CardTitle>Upload New Documents</CardTitle>
            <CardDescription>
              Upload documents related to this contract. Supported formats: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, TXT (Max 10MB per file)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted-foreground/25 hover:border-muted-foreground/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                id="file-upload"
                type="file"
                multiple
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
                onChange={handleFileInput}
              />
              
              <div className="space-y-4">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <p className="text-lg font-medium mb-2">
                    Drop files here or{" "}
                    <label
                      htmlFor="file-upload"
                      className="text-primary cursor-pointer hover:text-primary/80"
                    >
                      browse
                    </label>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supports PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, TXT files up to 10MB each
                  </p>
                </div>
              </div>
            </div>

            {/* Optional Description */}
            <div className="mt-6 space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Add a description for these documents..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* File List */}
        {uploadFiles.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Files to Upload ({uploadFiles.length})</CardTitle>
              <CardDescription>
                Review and upload your selected files
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {uploadFiles.map((uploadFile) => (
                  <div
                    key={uploadFile.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {getFileIcon(uploadFile.file)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {uploadFile.file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(uploadFile.file.size)}
                        </p>
                        {uploadFile.status === 'uploading' && (
                          <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                            <div
                              className="bg-primary h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${uploadFile.progress}%` }}
                            />
                          </div>
                        )}
                        {uploadFile.status === 'error' && uploadFile.error && (
                          <p className="text-xs text-red-500 mt-1">{uploadFile.error}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getStatusIcon(uploadFile.status)}
                      {uploadFile.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(uploadFile.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setUploadFiles([])}
                  disabled={uploadFiles.some(f => f.status === 'uploading')}
                >
                  Clear All
                </Button>
                <Button
                  onClick={uploadAllFiles}
                  disabled={
                    uploadFiles.length === 0 || 
                    uploadFiles.every(f => f.status === 'success') ||
                    uploadFiles.some(f => f.status === 'uploading')
                  }
                  className="min-w-[120px]"
                >
                  {uploadFiles.some(f => f.status === 'uploading') ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload All
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}