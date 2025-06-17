import { getSupabaseBrowserClient } from "../supabase";
import type { NDASignature, NDARequest, NDARequestFile } from "../types";

export const ndaService = {
  // Submit NDA request for a proposal (with optional files and message)
  async submitNDARequest(
    proposalId: string, 
    userId: string, 
    requestMessage?: string,
    files?: File[]
  ): Promise<NDARequest | null> {
    const supabase = getSupabaseBrowserClient();

    try {
      // Get current user if userId not provided
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error("User not authenticated");
        }
        userId = user.id;
      }

      // Check if user has already submitted NDA request for this proposal
      const existingRequest = await this.getUserNDARequest(proposalId, userId);
      if (existingRequest) {
        throw new Error("User has already submitted NDA request for this proposal");
      }

      const { data: ndaData, error: ndaError } = await supabase
        .from("proposal_nda_signatures")
        .insert({
          proposal_id: proposalId,
          signer_user_id: userId,
          status: 'pending',
          request_message: requestMessage,
          pending_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      // If status column doesn't exist, throw error requiring migration
      if (ndaError?.code === '42703' || ndaError?.message?.includes('column "status"')) {
        throw new Error('Database migration required: status column missing from proposal_nda_signatures table');
      }

      if (ndaError) {
        console.error("Error submitting NDA request:", ndaError);
        throw new Error("Failed to submit NDA request");
      }

      // TODO: Enable file upload after storage and migrations are configured
      const uploadedFiles: NDARequestFile[] = [];
      if (files && files.length > 0) {
        console.log(`File upload temporarily disabled. ${files.length} files would be uploaded:`, files.map(f => f.name));
        // Temporarily skip file upload until storage is configured
        // for (const file of files) {
        //   const fileExtension = file.name.split('.').pop();
        //   const fileName = `${ndaData.id}/${Date.now()}-${file.name}`;
        //   
        //   // Upload file to storage
        //   const { data: uploadData, error: uploadError } = await supabase.storage
        //     .from('nda-files')
        //     .upload(fileName, file);
        //
        //   if (uploadError) {
        //     console.error("Error uploading file:", uploadError);
        //     continue; // Skip this file but don't fail the whole request
        //   }
        //
        //   // Save file metadata
        //   const { data: fileData, error: fileError } = await supabase
        //     .from("nda_request_files")
        //     .insert({
        //       nda_signature_id: ndaData.id,
        //       file_name: file.name,
        //       file_size: file.size,
        //       file_type: file.type,
        //       file_path: uploadData.path,
        //     })
        //     .select()
        //     .single();
        //
        //   if (!fileError && fileData) {
        //     uploadedFiles.push({
        //       id: fileData.id as string,
        //       ndaSignatureId: fileData.nda_signature_id as string,
        //       fileName: fileData.file_name as string,
        //       fileSize: fileData.file_size as number,
        //       fileType: fileData.file_type as string,
        //       filePath: fileData.file_path as string,
        //       uploadedAt: fileData.uploaded_at as string,
        //     });
        //   }
        // }
      }

      return {
        id: ndaData.id as string,
        proposalId: ndaData.proposal_id as string,
        signerUserId: ndaData.signer_user_id as string,
        status: ndaData.status as 'pending' | 'approved' | 'rejected',
        requestMessage: ndaData.request_message as string | undefined,
        pendingAt: ndaData.pending_at as string,
        approvedAt: ndaData.approved_at as string | undefined,
        rejectedAt: ndaData.rejected_at as string | undefined,
        rejectionReason: ndaData.rejection_reason as string | undefined,
        approvedByUserId: ndaData.approved_by_user_id as string | undefined,
        attachedFiles: uploadedFiles,
      };
    } catch (error) {
      console.error("Error in submitNDARequest:", error);
      throw error;
    }
  },

  // Legacy method for backward compatibility
  async signNDA(proposalId: string, userId: string): Promise<NDASignature | null> {
    const request = await this.submitNDARequest(proposalId, userId);
    if (!request) return null;
    
    return {
      id: request.id,
      proposalId: request.proposalId,
      signerUserId: request.signerUserId,
      signedAt: request.pendingAt,
      createdAt: request.pendingAt,
    };
  },

  // Get all signatures for a proposal
  async getProposalSignatures(proposalId: string): Promise<NDASignature[]> {
    const supabase = getSupabaseBrowserClient();

    try {
      const { data, error } = await supabase
        .from("proposal_nda_signatures")
        .select("*")
        .eq("proposal_id", proposalId)
        .order("signed_at", { ascending: false });

      if (error) {
        console.error("Error fetching proposal signatures:", error);
        return [];
      }

      return data.map((signature: any) => ({
        id: signature.id as string,
        proposalId: signature.proposal_id as string,
        signerUserId: signature.signer_user_id as string,
        signedAt: signature.signed_at as string,
        createdAt: signature.created_at as string,
      }));
    } catch (error) {
      console.error("Error in getProposalSignatures:", error);
      return [];
    }
  },

  // Check if a specific user has signed NDA for a proposal (approved only)
  async getUserSignature(proposalId: string, userId: string): Promise<NDASignature | null> {
    const supabase = getSupabaseBrowserClient();

    try {
      const { data, error } = await supabase
        .from("proposal_nda_signatures")
        .select("*")
        .eq("proposal_id", proposalId)
        .eq("signer_user_id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No rows returned
          return null;
        }
        console.error("Error fetching user signature:", error);
        return null;
      }

      // STRICT CHECK: Only allow access if status column exists and is 'approved'
      if (!data.hasOwnProperty('status')) {
        console.log('NDA access denied: status column not found, migration required');
        return null;
      }

      if (data.status !== 'approved') {
        console.log(`NDA access denied: status is '${data.status}', not 'approved'`);
        return null;
      }

      console.log('NDA access granted: status is approved');

      return {
        id: data.id as string,
        proposalId: data.proposal_id as string,
        signerUserId: data.signer_user_id as string,
        signedAt: (data.approved_at || data.signed_at) as string,
        createdAt: data.created_at as string,
      };
    } catch (error) {
      console.error("Error in getUserSignature:", error);
      return null;
    }
  },

  // Get user's NDA request (any status)
  async getUserNDARequest(proposalId: string, userId: string): Promise<NDARequest | null> {
    const supabase = getSupabaseBrowserClient();

    try {
      const { data, error } = await supabase
        .from("proposal_nda_signatures")
        .select(`*`)
        .eq("proposal_id", proposalId)
        .eq("signer_user_id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null;
        }
        console.error("Error fetching user NDA request:", error);
        return null;
      }

      return {
        id: data.id as string,
        proposalId: data.proposal_id as string,
        signerUserId: data.signer_user_id as string,
        status: data.status as 'pending' | 'approved' | 'rejected',
        requestMessage: data.request_message as string | undefined,
        pendingAt: data.pending_at as string,
        approvedAt: data.approved_at as string | undefined,
        rejectedAt: data.rejected_at as string | undefined,
        rejectionReason: data.rejection_reason as string | undefined,
        approvedByUserId: data.approved_by_user_id as string | undefined,
        // TODO: Uncomment after migration is applied
        // attachedFiles: (data.nda_request_files as any[])?.map((file: any) => ({
        //   id: file.id as string,
        //   ndaSignatureId: file.nda_signature_id as string,
        //   fileName: file.file_name as string,
        //   fileSize: file.file_size as number,
        //   fileType: file.file_type as string,
        //   filePath: file.file_path as string,
        //   uploadedAt: file.uploaded_at as string,
        // })) || [],
        attachedFiles: [],
      };
    } catch (error) {
      console.error("Error in getUserNDARequest:", error);
      return null;
    }
  },

  // Check if user has access to private fields (either owner or signed NDA)
  // Check if a specific user can view private fields (must have approved NDA)
  async canViewPrivateFields(proposalId: string, userId: string, proposalOwnerId: string): Promise<boolean> {
    // If user is the proposal owner, they can always view private fields
    if (userId === proposalOwnerId) {
      return true;
    }

    // Check if user has approved NDA signature
    const signature = await this.getUserSignature(proposalId, userId);
    return !!signature;
  },

  // Get approved signatures with user details
  async getProposalSignaturesWithUsers(proposalId: string): Promise<Array<NDASignature & { signerName?: string, signerAvatar?: string }>> {
    const supabase = getSupabaseBrowserClient();

    try {
      const { data, error } = await supabase
        .from("proposal_nda_signatures")
        .select(`
          *,
          users:signer_user_id (
            name,
            avatar_url
          )
        `)
        .eq("proposal_id", proposalId)
        .eq("status", "approved")
        .order("approved_at", { ascending: false });

      if (error) {
        console.error("Error fetching proposal signatures with users:", error);
        return [];
      }

      // Only include signatures that have status column and are explicitly approved
      return data
        .filter((signature: any) => signature.hasOwnProperty('status') && signature.status === 'approved')
        .map((signature: any) => ({
          id: signature.id as string,
          proposalId: signature.proposal_id as string,
          signerUserId: signature.signer_user_id as string,
          signedAt: signature.approved_at as string,
          createdAt: signature.created_at as string,
          signerName: signature.users?.name as string,
          signerAvatar: signature.users?.avatar_url as string,
        }));
    } catch (error) {
      console.error("Error in getProposalSignaturesWithUsers:", error);
      return [];
    }
  },

  // Get approved NDA requests for a proposal
  async getApprovedNDARequests(proposalId: string): Promise<NDARequest[]> {
    const supabase = getSupabaseBrowserClient();

    try {
      const { data, error } = await supabase
        .from("proposal_nda_signatures")
        .select(`
          *,
          users:signer_user_id (
            name,
            email,
            avatar_url
          )
        `)
        .eq("proposal_id", proposalId)
        .eq("status", "approved")
        .order("approved_at", { ascending: false });

      if (error) {
        console.error("Error fetching approved NDA requests:", error);
        return [];
      }

      return data.map((request: any) => ({
        id: request.id,
        proposalId: request.proposal_id,
        signerUserId: request.signer_user_id,
        status: request.status,
        requestMessage: request.request_message,
        pendingAt: request.pending_at,
        approvedAt: request.approved_at,
        rejectedAt: request.rejected_at,
        rejectionReason: request.rejection_reason,
        approvedByUserId: request.approved_by_user_id,
        signerName: request.users?.name,
        signerEmail: request.users?.email,
        signerAvatar: request.users?.avatar_url,
        attachedFiles: [],
      }));
    } catch (error) {
      console.error("Error in getApprovedNDARequests:", error);
      return [];
    }
  },

  // Get pending NDA requests for proposal owner to review
  async getPendingNDARequests(proposalId: string): Promise<NDARequest[]> {
    const supabase = getSupabaseBrowserClient();

    try {
      const { data, error } = await supabase
        .from("proposal_nda_signatures")
        .select(`
          *,
          users:signer_user_id (
            name,
            email,
            avatar_url
          )
        `)
        .eq("proposal_id", proposalId)
        .eq("status", "pending")
        .order("pending_at", { ascending: false });

      if (error) {
        console.error("Error fetching pending NDA requests:", error);
        return [];
      }

      return data.map((request: any) => ({
        id: request.id,
        proposalId: request.proposal_id,
        signerUserId: request.signer_user_id,
        status: request.status,
        requestMessage: request.request_message,
        pendingAt: request.pending_at,
        approvedAt: request.approved_at,
        rejectedAt: request.rejected_at,
        rejectionReason: request.rejection_reason,
        approvedByUserId: request.approved_by_user_id,
        signerName: request.users?.name,
        signerEmail: request.users?.email,
        signerAvatar: request.users?.avatar_url,
        // TODO: Uncomment after migration is applied
        // attachedFiles: request.nda_request_files?.map((file: any) => ({
        //   id: file.id,
        //   ndaSignatureId: file.nda_signature_id,
        //   fileName: file.file_name,
        //   fileSize: file.file_size,
        //   fileType: file.file_type,
        //   filePath: file.file_path,
        //   uploadedAt: file.uploaded_at,
        // })) || [],
        attachedFiles: [],
      }));
    } catch (error) {
      console.error("Error in getPendingNDARequests:", error);
      return [];
    }
  },

  // Approve NDA request
  async approveNDARequest(requestId: string, approverId: string): Promise<boolean> {
    const supabase = getSupabaseBrowserClient();

    try {
      console.log('=== Approving NDA Request ===');
      console.log('Request ID:', requestId);
      console.log('Approver ID:', approverId);

      // Get current user if approverId not provided
      if (!approverId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error("User not authenticated");
        }
        approverId = user.id;
        console.log('Using authenticated user ID:', approverId);
      }

      const { data, error } = await supabase
        .from("proposal_nda_signatures")
        .update({
          status: 'approved',
          approved_by_user_id: approverId,
          approved_at: new Date().toISOString(),
        })
        .eq("id", requestId)
        .eq("status", "pending")
        .select();

      if (error) {
        console.error("Error approving NDA request:", error);
        return false;
      }

      console.log('NDA request approved successfully:', data);
      console.log('============================');
      return true;
    } catch (error) {
      console.error("Error in approveNDARequest:", error);
      return false;
    }
  },

  // Reject NDA request
  async rejectNDARequest(requestId: string, approverId: string, reason?: string): Promise<boolean> {
    const supabase = getSupabaseBrowserClient();

    try {
      console.log('=== Rejecting NDA Request ===');
      console.log('Request ID:', requestId);
      console.log('Approver ID:', approverId);
      console.log('Rejection reason:', reason);

      // Get current user if approverId not provided
      if (!approverId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error("User not authenticated");
        }
        approverId = user.id;
        console.log('Using authenticated user ID:', approverId);
      }

      const { data, error } = await supabase
        .from("proposal_nda_signatures")
        .update({
          status: 'rejected',
          approved_by_user_id: approverId,
          rejected_at: new Date().toISOString(),
          rejection_reason: reason,
        })
        .eq("id", requestId)
        .eq("status", "pending")
        .select();

      if (error) {
        console.error("Error rejecting NDA request:", error);
        return false;
      }

      console.log('NDA request rejected successfully:', data);
      console.log('============================');
      return true;
    } catch (error) {
      console.error("Error in rejectNDARequest:", error);
      return false;
    }
  },

  // Download NDA request file
  async downloadNDAFile(filePath: string): Promise<Blob | null> {
    // TODO: Enable file download after storage is configured
    console.log("File download temporarily disabled for path:", filePath);
    return null;
    
    // const supabase = getSupabaseBrowserClient();
    //
    // try {
    //   const { data, error } = await supabase.storage
    //     .from('nda-files')
    //     .download(filePath);
    //
    //   if (error) {
    //     console.error("Error downloading file:", error);
    //     return null;
    //   }
    //
    //   return data;
    // } catch (error) {
    //   console.error("Error in downloadNDAFile:", error);
    //   return null;
    // }
  },

  // Remove NDA signature (for admin purposes or user request)
  async removeSignature(proposalId: string, userId: string): Promise<boolean> {
    const supabase = getSupabaseBrowserClient();

    try {
      const { error } = await supabase
        .from("proposal_nda_signatures")
        .delete()
        .eq("proposal_id", proposalId)
        .eq("signer_user_id", userId);

      if (error) {
        console.error("Error removing signature:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in removeSignature:", error);
      return false;
    }
  },

  // Get all proposals that user has approved NDA for
  async getUserSignedProposals(userId: string): Promise<string[]> {
    const supabase = getSupabaseBrowserClient();

    try {
      const { data, error } = await supabase
        .from("proposal_nda_signatures")
        .select("proposal_id")
        .eq("signer_user_id", userId)
        .eq("status", "approved");

      if (error) {
        console.error("Error fetching user signed proposals:", error);
        return [];
      }

      return data.map((signature: any) => signature.proposal_id);
    } catch (error) {
      console.error("Error in getUserSignedProposals:", error);
      return [];
    }
  },

  // Check if proposal has any private fields that require NDA
  async proposalHasPrivateFields(proposalId: string): Promise<boolean> {
    const supabase = getSupabaseBrowserClient();

    try {
      const { data, error } = await supabase
        .from("proposals")
        .select("private_fields")
        .eq("id", proposalId)
        .single();

      if (error) {
        console.error("Error checking proposal private fields:", error);
        return false;
      }

      // Check if private_fields exists and has any non-empty values
      if (!data.private_fields) {
        return false;
      }

      const privateFields = data.private_fields;
      return Object.values(privateFields).some((value: any) => 
        typeof value === "string" && value.trim().length > 0
      );
    } catch (error) {
      console.error("Error in proposalHasPrivateFields:", error);
      return false;
    }
  },
};