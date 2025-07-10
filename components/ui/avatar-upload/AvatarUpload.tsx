"use client";

import React, { useState, useRef } from "react";
import { X, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { avatarService } from "@/lib/services/avatar.service";
import { cn } from "@/lib/utils";

interface AvatarUploadProps {
  userId: string;
  currentAvatar?: string;
  userName?: string;
  onAvatarChange?: (avatarUrl: string | null) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function AvatarUpload({
  userId,
  currentAvatar,
  userName = "",
  onAvatarChange,
  className,
  size = "md",
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const sizeClasses = {
    sm: "h-12 w-12",
    md: "h-16 w-16",
    lg: "h-24 w-24",
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file before showing preview
    const validation = avatarService.validateAvatarFile(file);
    if (!validation.valid) {
      toast({
        title: "Invalid file",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    if (!userId) return;

    setIsUploading(true);
    try {
      const result = await avatarService.uploadAvatar(userId, file);

      if (result.success && result.avatarUrl) {
        toast({
          title: "Avatar updated",
          description: "Your profile picture has been updated successfully.",
        });
        onAvatarChange?.(result.avatarUrl);
        setPreview(null);
      } else {
        toast({
          title: "Upload failed",
          description:
            result.error || "Failed to upload avatar. Please try again.",
          variant: "destructive",
        });
        setPreview(null);
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Upload failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      setPreview(null);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async () => {
    if (!userId || !currentAvatar) return;

    setIsDeleting(true);
    try {
      const result = await avatarService.deleteAvatar(userId);

      if (result.success) {
        toast({
          title: "Avatar removed",
          description: "Your profile picture has been removed.",
        });
        onAvatarChange?.(null);
      } else {
        toast({
          title: "Delete failed",
          description:
            result.error || "Failed to remove avatar. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting avatar:", error);
      toast({
        title: "Delete failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const displayAvatar = preview || currentAvatar;
  const isLoading = isUploading || isDeleting;

  return (
    <div className={cn("relative inline-block mb-4", className)}>
      <div className="relative group">
        {/* Avatar Display */}
        <Avatar
          className={cn(sizeClasses[size], "transition-all duration-200")}
        >
          <AvatarImage
            src={displayAvatar || "/placeholder.svg"}
            alt={userName || "User avatar"}
            className={cn(
              "transition-all duration-200",
              isLoading && "opacity-50",
            )}
          />
          <AvatarFallback
            className={cn(
              "transition-all duration-200",
              isLoading && "opacity-50",
            )}
          >
            {userName.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>

        {/* Loading Overlay */}
        {isLoading && (
          <div
            className={cn(
              "absolute inset-0 rounded-full bg-background/80 backdrop-blur-sm",
              "flex items-center justify-center",
            )}
          >
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-2 w-full">
        <Button
          variant="outline"
          size="sm"
          onClick={handleUploadClick}
          disabled={isLoading}
          className="flex items-center gap-2 w-full"
        >
          <Upload className="h-3 w-3" />
          {currentAvatar ? "Change" : "Upload"}
        </Button>

        {currentAvatar && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={isLoading}
            className="flex items-center gap-2 w-full"
          >
            <X className="h-3 w-3" />
            Remove
          </Button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isLoading}
      />
    </div>
  );
}
