"use client";

import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Lock, Unlock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PrivateFieldManagerProps {
  fieldName: string;
  label: string;
  publicValue: string;
  privateValue: string;
  onPublicChangeAction: (value: string) => void;
  onPrivateChangeAction: (value: string) => void;
  fieldType?: "input" | "textarea";
  placeholder?: string;
  privatePlaceholder?: string;
  rows?: number;
  disabled?: boolean;
  hasPrivateField: boolean;
  onTogglePrivateFieldAction: (enabled: boolean) => void;
  // NDA related props
  isNDARequired?: boolean;
  hasUserSignedNDA?: boolean;
  canViewPrivateFields?: boolean;
  isProposalOwner?: boolean;
}

export function PrivateFieldManager({
  fieldName,
  label,
  publicValue,
  privateValue,
  onPublicChangeAction,
  onPrivateChangeAction,
  fieldType = "input",
  placeholder,
  privatePlaceholder,
  rows = 4,
  disabled = false,
  hasPrivateField,
  onTogglePrivateFieldAction,
  isNDARequired = false,
  hasUserSignedNDA = false,
  canViewPrivateFields = false,
  isProposalOwner = false,
}: PrivateFieldManagerProps) {
  const [showPrivatePreview, setShowPrivatePreview] = useState(false);

  const renderField = (
    value: string,
    onChangeAction: (value: string) => void,
    fieldPlaceholder?: string,
    isPrivate = false
  ) => {
    const commonProps = {
      id: isPrivate ? `${fieldName}-private` : fieldName,
      name: isPrivate ? `${fieldName}-private` : fieldName,
      value,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        onChangeAction(e.target.value),
      placeholder: fieldPlaceholder,
      disabled,
      className: isPrivate ? "border-amber-200 bg-amber-50/30" : "",
    };

    return fieldType === "textarea" ? (
      <Textarea {...commonProps} rows={rows} />
    ) : (
      <Input {...commonProps} />
    );
  };

  const renderPrivateFieldContent = () => {
    // If user can view private fields (signed NDA or is owner)
    if (canViewPrivateFields || isProposalOwner) {
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label
              htmlFor={`${fieldName}-private`}
              className="text-amber-700 flex items-center gap-2"
            >
              <Lock className="h-4 w-4" />
              Confidential {label}
            </Label>
            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
              <Lock className="h-3 w-3 mr-1" />
              NDA Required
            </Badge>
          </div>
          {renderField(
            privateValue,
            onPrivateChangeAction,
            privatePlaceholder || `Confidential ${label.toLowerCase()}...`,
            true
          )}
          <p className="text-xs text-amber-600">
            This information is only visible to users who have signed an NDA.
          </p>
        </div>
      );
    }

    // If NDA is required but user hasn't signed
    if (isNDARequired && !hasUserSignedNDA) {
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-muted-foreground flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Confidential {label}
            </Label>
            <Badge variant="outline" className="border-amber-200 text-amber-700">
              <Lock className="h-3 w-3 mr-1" />
              NDA Required
            </Badge>
          </div>
          <div className="border border-dashed border-amber-200 rounded-md p-4 bg-amber-50/30">
            <div className="flex items-center justify-center space-x-2 text-amber-700">
              <Lock className="h-5 w-5" />
              <span className="text-sm font-medium">
                Sign NDA to view confidential information
              </span>
            </div>
            <p className="text-xs text-amber-600 text-center mt-2">
              This proposal contains confidential information that requires a signed NDA to access.
            </p>
          </div>
        </div>
      );
    }

    // Show preview toggle for cases where there might be private content
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-muted-foreground flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Confidential {label}
          </Label>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPrivatePreview(!showPrivatePreview)}
              className="text-xs"
            >
              {showPrivatePreview ? (
                <>
                  <EyeOff className="h-3 w-3 mr-1" />
                  Hide Preview
                </>
              ) : (
                <>
                  <Eye className="h-3 w-3 mr-1" />
                  Show Preview
                </>
              )}
            </Button>
          </div>
        </div>
        {showPrivatePreview && (
          <div className="border border-dashed border-gray-200 rounded-md p-4 bg-gray-50">
            <div className="flex items-center justify-center space-x-2 text-gray-500">
              <Lock className="h-5 w-5" />
              <span className="text-sm">
                {privateValue ? "Confidential content exists" : "No confidential content"}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Public field */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor={fieldName} className="flex items-center gap-2">
            <Unlock className="h-4 w-4 text-green-600" />
            {label} (Public)
          </Label>
          {isProposalOwner && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center space-x-2">
                    <Label
                      htmlFor={`${fieldName}-private-toggle`}
                      className="text-sm text-muted-foreground"
                    >
                      Add confidential version
                    </Label>
                    <Switch
                      id={`${fieldName}-private-toggle`}
                      checked={hasPrivateField}
                      onCheckedChange={onTogglePrivateFieldAction}
                      disabled={disabled}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add a confidential version of this field that requires NDA to view</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        {renderField(publicValue, onPublicChangeAction, placeholder)}
        <p className="text-xs text-muted-foreground">
          This information is visible to all users viewing the proposal.
        </p>
      </div>

      {/* Private field - only show if enabled */}
      {hasPrivateField && (
        <Card className="border-amber-200">
          <CardContent className="pt-4">
            {renderPrivateFieldContent()}
          </CardContent>
        </Card>
      )}

      {/* Warning for proposal owners */}
      {isProposalOwner && hasPrivateField && (
        <div className="flex items-start space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5" />
          <div className="text-xs text-blue-700">
            <p className="font-medium">Confidential Information Notice</p>
            <p>
              The confidential version of this field will only be visible to users who sign an NDA 
              during the negotiation process. Make sure sensitive information is only in the confidential field.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}