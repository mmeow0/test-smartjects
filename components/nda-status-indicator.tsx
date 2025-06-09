"use client";

import { Badge } from "@/components/ui/badge";
import {
  Shield,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  EyeOff,
  AlertTriangle,
} from "lucide-react";
import type { NDARequest } from "@/lib/types";

interface NDAStatusIndicatorProps {
  isProposalOwner: boolean;
  hasPrivateFields: boolean;
  hasApprovedNDA: boolean;
  userNdaRequest?: NDARequest | null;
  compact?: boolean;
  className?: string;
}

export function NDAStatusIndicator({
  isProposalOwner,
  hasPrivateFields,
  hasApprovedNDA,
  userNdaRequest,
  compact = false,
  className = "",
}: NDAStatusIndicatorProps) {
  // If no private fields, no NDA needed
  if (!hasPrivateFields) {
    return (
      <Badge variant="outline" className={`${className} text-gray-600`}>
        <Eye className="h-3 w-3 mr-1" />
        Public Access
      </Badge>
    );
  }

  // Proposal owner has automatic access
  if (isProposalOwner) {
    return (
      <Badge variant="default" className={`${className} bg-blue-100 text-blue-800`}>
        <Shield className="h-3 w-3 mr-1" />
        Owner Access
      </Badge>
    );
  }

  // User has approved NDA
  if (hasApprovedNDA) {
    return (
      <Badge variant="default" className={`${className} bg-green-100 text-green-800`}>
        <CheckCircle className="h-3 w-3 mr-1" />
        {compact ? "Approved" : "NDA Approved"}
      </Badge>
    );
  }

  // User has pending NDA request
  if (userNdaRequest?.status === "pending") {
    return (
      <Badge variant="secondary" className={`${className} bg-yellow-100 text-yellow-800`}>
        <Clock className="h-3 w-3 mr-1" />
        {compact ? "Pending" : "NDA Pending"}
      </Badge>
    );
  }

  // User has rejected NDA request
  if (userNdaRequest?.status === "rejected") {
    return (
      <Badge variant="destructive" className={`${className} bg-red-100 text-red-800`}>
        <XCircle className="h-3 w-3 mr-1" />
        {compact ? "Rejected" : "NDA Rejected"}
      </Badge>
    );
  }

  // User needs to request NDA access
  return (
    <Badge variant="outline" className={`${className} text-orange-600 border-orange-300`}>
      <EyeOff className="h-3 w-3 mr-1" />
      {compact ? "Request Needed" : "NDA Required"}
    </Badge>
  );
}

// Extended version with more details and actions
interface NDAStatusCardProps extends NDAStatusIndicatorProps {
  onRequestNDA?: () => void;
  proposalTitle?: string;
}

export function NDAStatusCard({
  isProposalOwner,
  hasPrivateFields,
  hasApprovedNDA,
  userNdaRequest,
  onRequestNDA,
  proposalTitle,
  className = "",
}: NDAStatusCardProps) {
  if (!hasPrivateFields) {
    return (
      <div className={`p-4 rounded-lg border bg-gray-50 ${className}`}>
        <div className="flex items-center gap-3">
          <Eye className="h-5 w-5 text-gray-600" />
          <div>
            <h4 className="font-medium text-gray-900">Public Proposal</h4>
            <p className="text-sm text-gray-600">
              All information is publicly accessible
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isProposalOwner) {
    return (
      <div className={`p-4 rounded-lg border bg-blue-50 border-blue-200 ${className}`}>
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-blue-600" />
          <div>
            <h4 className="font-medium text-blue-900">Proposal Owner</h4>
            <p className="text-sm text-blue-700">
              You have full access to all private fields
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (hasApprovedNDA) {
    return (
      <div className={`p-4 rounded-lg border bg-green-50 border-green-200 ${className}`}>
        <div className="flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div>
            <h4 className="font-medium text-green-900">NDA Approved</h4>
            <p className="text-sm text-green-700">
              You can view all private proposal information
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (userNdaRequest?.status === "pending") {
    return (
      <div className={`p-4 rounded-lg border bg-yellow-50 border-yellow-200 ${className}`}>
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-yellow-600" />
          <div className="flex-1">
            <h4 className="font-medium text-yellow-900">Request Under Review</h4>
            <p className="text-sm text-yellow-700">
              Your NDA request is being reviewed by the proposal owner
            </p>
            {userNdaRequest.pendingAt && (
              <p className="text-xs text-yellow-600 mt-1">
                Submitted: {new Date(userNdaRequest.pendingAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (userNdaRequest?.status === "rejected") {
    return (
      <div className={`p-4 rounded-lg border bg-red-50 border-red-200 ${className}`}>
        <div className="flex items-center gap-3">
          <XCircle className="h-5 w-5 text-red-600" />
          <div className="flex-1">
            <h4 className="font-medium text-red-900">Request Rejected</h4>
            <p className="text-sm text-red-700">
              Your NDA request was not approved
            </p>
            {userNdaRequest.rejectionReason && (
              <p className="text-xs text-red-600 mt-1">
                Reason: {userNdaRequest.rejectionReason}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-lg border bg-orange-50 border-orange-200 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          <div>
            <h4 className="font-medium text-orange-900">NDA Required</h4>
            <p className="text-sm text-orange-700">
              Request access to view private proposal details
            </p>
          </div>
        </div>
        {onRequestNDA && (
          <button
            onClick={onRequestNDA}
            className="px-3 py-1 text-sm font-medium text-orange-800 bg-orange-100 rounded-md hover:bg-orange-200 transition-colors"
          >
            Request Access
          </button>
        )}
      </div>
    </div>
  );
}