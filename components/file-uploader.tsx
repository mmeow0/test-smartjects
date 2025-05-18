"use client"

import type React from "react"

import { useState, useRef } from "react"
import { X, Upload, FileText, ImageIcon, File } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface FileUploaderProps {
  onFilesChange: (files: File[]) => void
  maxFiles?: number
  maxSizeMB?: number
  acceptedFileTypes?: string
}

export function FileUploader({
  onFilesChange,
  maxFiles = 5,
  maxSizeMB = 10,
  acceptedFileTypes = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.zip",
}: FileUploaderProps) {
  const [files, setFiles] = useState<File[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`File ${file.name} is too large. Maximum size is ${maxSizeMB}MB.`)
      return false
    }

    // Check file type
    const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`
    if (!acceptedFileTypes.includes(fileExtension)) {
      alert(`File ${file.name} has an unsupported format.`)
      return false
    }

    return true
  }

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return

    if (files.length + newFiles.length > maxFiles) {
      alert(`You can only upload a maximum of ${maxFiles} files.`)
      return
    }

    const validFiles: File[] = []
    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i]
      if (validateFile(file)) {
        validFiles.push(file)

        // Simulate upload progress
        simulateUploadProgress(file.name)
      }
    }

    const updatedFiles = [...files, ...validFiles]
    setFiles(updatedFiles)
    onFilesChange(updatedFiles)
  }

  const simulateUploadProgress = (fileName: string) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 10) + 5
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
      }
      setUploadProgress((prev) => ({ ...prev, [fileName]: progress }))
    }, 200)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    handleFiles(e.dataTransfer.files)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
  }

  const handleButtonClick = () => {
    inputRef.current?.click()
  }

  const removeFile = (fileName: string) => {
    const updatedFiles = files.filter((file) => file.name !== fileName)
    setFiles(updatedFiles)
    onFilesChange(updatedFiles)

    // Remove progress tracking
    setUploadProgress((prev) => {
      const newProgress = { ...prev }
      delete newProgress[fileName]
      return newProgress
    })
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase()

    if (["jpg", "jpeg", "png", "gif", "svg"].includes(extension || "")) {
      return <ImageIcon className="h-5 w-5 text-blue-500" />
    } else if (["pdf", "doc", "docx"].includes(extension || "")) {
      return <FileText className="h-5 w-5 text-red-500" />
    } else {
      return <File className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          onChange={handleChange}
          accept={acceptedFileTypes}
          className="hidden"
        />
        <div className="flex flex-col items-center justify-center space-y-2">
          <Upload className="h-10 w-10 text-muted-foreground" />
          <h3 className="text-lg font-medium">Drag and drop files here</h3>
          <p className="text-sm text-muted-foreground">
            or click to browse (max {maxFiles} files, {maxSizeMB}MB each)
          </p>
          <Button type="button" variant="outline" onClick={handleButtonClick}>
            Select Files
          </Button>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium">
            Uploaded Files ({files.length}/{maxFiles})
          </h4>
          <ul className="space-y-2">
            {files.map((file) => (
              <li key={file.name} className="flex items-center justify-between p-2 border rounded-md">
                <div className="flex items-center space-x-2">
                  {getFileIcon(file.name)}
                  <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                  <span className="text-xs text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                </div>
                <div className="flex items-center space-x-2">
                  {uploadProgress[file.name] < 100 ? (
                    <div className="w-24">
                      <Progress value={uploadProgress[file.name]} className="h-1" />
                    </div>
                  ) : (
                    <span className="text-xs text-green-600">Complete</span>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => removeFile(file.name)}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove file</span>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
