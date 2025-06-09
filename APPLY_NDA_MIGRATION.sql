-- =====================================================
-- NDA Approval Workflow Migration Script
-- =====================================================
-- This script applies all necessary database changes for the NDA approval workflow
-- Run this script to fix the issue where users get immediate access to private fields

-- Step 1: Add status and approval columns to existing table
-- =====================================================
ALTER TABLE proposal_nda_signatures 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS approved_by_user_id UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS pending_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS request_message TEXT;

-- Step 2: Update existing NDA signatures to approved status
-- =====================================================
-- This ensures existing signatures continue to work while new ones require approval
UPDATE proposal_nda_signatures 
SET 
  status = 'approved',
  approved_at = COALESCE(signed_at, created_at),
  pending_at = COALESCE(signed_at, created_at)
WHERE status = 'pending' OR status IS NULL;

-- Step 3: Create indexes for better performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_proposal_nda_signatures_status 
ON proposal_nda_signatures(status);

CREATE INDEX IF NOT EXISTS idx_proposal_nda_signatures_proposal_status 
ON proposal_nda_signatures(proposal_id, status);

CREATE INDEX IF NOT EXISTS idx_proposal_nda_signatures_user_status 
ON proposal_nda_signatures(signer_user_id, status);

-- Step 4: Create file storage table
-- =====================================================
CREATE TABLE IF NOT EXISTS nda_request_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nda_signature_id UUID NOT NULL REFERENCES proposal_nda_signatures(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for file table
CREATE INDEX IF NOT EXISTS idx_nda_request_files_signature_id 
ON nda_request_files(nda_signature_id);

CREATE INDEX IF NOT EXISTS idx_nda_request_files_uploaded_at 
ON nda_request_files(uploaded_at);

-- Step 5: Enable RLS for file table
-- =====================================================
ALTER TABLE nda_request_files ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view files for their own NDA requests" ON nda_request_files;
DROP POLICY IF EXISTS "Proposal owners can view NDA request files" ON nda_request_files;
DROP POLICY IF EXISTS "Users can insert files for their own NDA requests" ON nda_request_files;

-- Create RLS policies for file access
CREATE POLICY "Users can view files for their own NDA requests" ON nda_request_files
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM proposal_nda_signatures pns 
      WHERE pns.id = nda_request_files.nda_signature_id 
      AND pns.signer_user_id = auth.uid()
    )
  );

CREATE POLICY "Proposal owners can view NDA request files" ON nda_request_files
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM proposal_nda_signatures pns 
      JOIN proposals p ON p.id = pns.proposal_id
      WHERE pns.id = nda_request_files.nda_signature_id 
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert files for their own NDA requests" ON nda_request_files
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM proposal_nda_signatures pns 
      WHERE pns.id = nda_request_files.nda_signature_id 
      AND pns.signer_user_id = auth.uid()
    )
  );

-- Step 6: Create notification system
-- =====================================================
CREATE TABLE IF NOT EXISTS nda_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nda_signature_id UUID NOT NULL REFERENCES proposal_nda_signatures(id) ON DELETE CASCADE,
  recipient_user_id UUID NOT NULL REFERENCES users(id),
  type VARCHAR(50) NOT NULL CHECK (type IN ('nda_request_submitted', 'nda_approved', 'nda_rejected')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for notifications
CREATE INDEX IF NOT EXISTS idx_nda_notifications_recipient 
ON nda_notifications(recipient_user_id);

CREATE INDEX IF NOT EXISTS idx_nda_notifications_type 
ON nda_notifications(type);

CREATE INDEX IF NOT EXISTS idx_nda_notifications_unread 
ON nda_notifications(recipient_user_id, read_at) WHERE read_at IS NULL;

-- Enable RLS for notifications
ALTER TABLE nda_notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing notification policies if they exist
DROP POLICY IF EXISTS "Users can view their own notifications" ON nda_notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON nda_notifications;

-- Create RLS policies for notifications
CREATE POLICY "Users can view their own notifications" ON nda_notifications
  FOR SELECT USING (recipient_user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON nda_notifications
  FOR UPDATE USING (recipient_user_id = auth.uid());

-- Step 7: Create notification trigger function
-- =====================================================
CREATE OR REPLACE FUNCTION create_nda_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Notification for NDA request submission
  IF TG_OP = 'INSERT' AND NEW.status = 'pending' THEN
    INSERT INTO nda_notifications (nda_signature_id, recipient_user_id, type, title, message)
    SELECT 
      NEW.id,
      p.user_id,
      'nda_request_submitted',
      'New NDA Request',
      'A user has requested access to private fields in your proposal: ' || p.title
    FROM proposals p 
    WHERE p.id = NEW.proposal_id;
  END IF;

  -- Notification for NDA approval
  IF TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status = 'approved' THEN
    INSERT INTO nda_notifications (nda_signature_id, recipient_user_id, type, title, message)
    SELECT 
      NEW.id,
      NEW.signer_user_id,
      'nda_approved',
      'NDA Request Approved',
      'Your NDA request has been approved for proposal: ' || p.title
    FROM proposals p 
    WHERE p.id = NEW.proposal_id;
  END IF;

  -- Notification for NDA rejection
  IF TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status = 'rejected' THEN
    INSERT INTO nda_notifications (nda_signature_id, recipient_user_id, type, title, message)
    SELECT 
      NEW.id,
      NEW.signer_user_id,
      'nda_rejected',
      'NDA Request Rejected',
      'Your NDA request has been rejected for proposal: ' || p.title ||
      CASE WHEN NEW.rejection_reason IS NOT NULL THEN '. Reason: ' || NEW.rejection_reason ELSE '' END
    FROM proposals p 
    WHERE p.id = NEW.proposal_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS nda_notification_trigger ON proposal_nda_signatures;

-- Create trigger
CREATE TRIGGER nda_notification_trigger
  AFTER INSERT OR UPDATE ON proposal_nda_signatures
  FOR EACH ROW
  EXECUTE FUNCTION create_nda_notification();

-- Step 8: Add private fields tracking to proposals
-- =====================================================
ALTER TABLE proposals 
ADD COLUMN IF NOT EXISTS private_fields_updated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS private_fields_version INTEGER DEFAULT 1;

-- Update existing records
UPDATE proposals 
SET private_fields_updated_at = updated_at 
WHERE private_fields IS NOT NULL 
AND private_fields != '{}' 
AND private_fields_updated_at IS NULL;

-- Create index for private fields tracking
CREATE INDEX IF NOT EXISTS idx_proposals_private_fields_updated 
ON proposals(private_fields_updated_at) 
WHERE private_fields_updated_at IS NOT NULL;

-- Step 9: Create storage bucket (if using Supabase)
-- =====================================================
-- Note: This may need to be run separately in Supabase dashboard or via API
-- INSERT INTO storage.buckets (id, name, public) VALUES ('nda-files', 'nda-files', false)
-- ON CONFLICT (id) DO NOTHING;

-- Step 10: Create helpful view for NDA management
-- =====================================================
CREATE OR REPLACE VIEW nda_requests_summary AS
SELECT 
  pns.id,
  pns.proposal_id,
  pns.signer_user_id,
  pns.status,
  pns.request_message,
  pns.pending_at,
  pns.approved_at,
  pns.rejected_at,
  pns.rejection_reason,
  pns.approved_by_user_id,
  p.title as proposal_title,
  p.user_id as proposal_owner_id,
  u_signer.name as signer_name,
  u_signer.email as signer_email,
  u_signer.avatar_url as signer_avatar,
  u_approver.name as approver_name,
  COUNT(nrf.id) as attached_files_count
FROM proposal_nda_signatures pns
JOIN proposals p ON p.id = pns.proposal_id
JOIN users u_signer ON u_signer.id = pns.signer_user_id
LEFT JOIN users u_approver ON u_approver.id = pns.approved_by_user_id
LEFT JOIN nda_request_files nrf ON nrf.nda_signature_id = pns.id
GROUP BY 
  pns.id, pns.proposal_id, pns.signer_user_id, pns.status, pns.request_message,
  pns.pending_at, pns.approved_at, pns.rejected_at, pns.rejection_reason, pns.approved_by_user_id,
  p.title, p.user_id, u_signer.name, u_signer.email, u_signer.avatar_url, u_approver.name;

-- =====================================================
-- Migration Complete!
-- =====================================================

-- Verification queries (run these to confirm migration worked):
-- 
-- 1. Check if status column was added:
-- SELECT column_name FROM information_schema.columns 
-- WHERE table_name = 'proposal_nda_signatures' AND column_name = 'status';
--
-- 2. Check existing signatures are marked as approved:
-- SELECT status, COUNT(*) FROM proposal_nda_signatures GROUP BY status;
--
-- 3. Verify new tables exist:
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_name IN ('nda_request_files', 'nda_notifications');
--
-- 4. Test the trigger function:
-- SELECT routine_name FROM information_schema.routines 
-- WHERE routine_name = 'create_nda_notification';

-- =====================================================
-- Post-Migration Notes:
-- =====================================================
-- 
-- 1. New NDA requests will be created with status='pending' 
-- 2. Only approved signatures grant access to private fields
-- 3. Proposal owners can approve/reject requests via UI
-- 4. File uploads will work after storage bucket is configured
-- 5. Notifications will be automatically created for all NDA events
-- 
-- If you see "Database Migration Required" message after running this script,
-- restart your application server to clear any cached schema information.