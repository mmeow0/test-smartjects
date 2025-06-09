# NDA Approval Workflow Database Migrations

This document outlines the necessary database migrations to implement the NDA approval workflow where users submit NDA requests with files, and proposal owners approve/reject them.

## Migration 1: Update proposal_nda_signatures table

```sql
-- Add new columns to existing proposal_nda_signatures table
ALTER TABLE proposal_nda_signatures 
ADD COLUMN status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
ADD COLUMN approved_by_user_id UUID REFERENCES users(id),
ADD COLUMN pending_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN rejected_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN rejection_reason TEXT,
ADD COLUMN request_message TEXT;

-- Update existing records to have 'approved' status and approved_at timestamp
UPDATE proposal_nda_signatures 
SET status = 'approved', 
    approved_at = signed_at,
    pending_at = signed_at
WHERE status = 'pending';

-- Create index for better performance
CREATE INDEX idx_proposal_nda_signatures_status ON proposal_nda_signatures(status);
CREATE INDEX idx_proposal_nda_signatures_proposal_status ON proposal_nda_signatures(proposal_id, status);
```

## Migration 2: Create nda_request_files table

```sql
-- Create table for files attached to NDA requests
CREATE TABLE nda_request_files (
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

-- Create indexes
CREATE INDEX idx_nda_request_files_signature_id ON nda_request_files(nda_signature_id);
CREATE INDEX idx_nda_request_files_uploaded_at ON nda_request_files(uploaded_at);

-- Enable RLS (Row Level Security)
ALTER TABLE nda_request_files ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
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
```

## Migration 3: Add notification system for NDA requests

```sql
-- Create table for NDA-related notifications
CREATE TABLE nda_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nda_signature_id UUID NOT NULL REFERENCES proposal_nda_signatures(id) ON DELETE CASCADE,
  recipient_user_id UUID NOT NULL REFERENCES users(id),
  type VARCHAR(50) NOT NULL CHECK (type IN ('nda_request_submitted', 'nda_approved', 'nda_rejected')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_nda_notifications_recipient ON nda_notifications(recipient_user_id);
CREATE INDEX idx_nda_notifications_type ON nda_notifications(type);
CREATE INDEX idx_nda_notifications_unread ON nda_notifications(recipient_user_id, read_at) WHERE read_at IS NULL;

-- Enable RLS
ALTER TABLE nda_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own notifications" ON nda_notifications
  FOR SELECT USING (recipient_user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON nda_notifications
  FOR UPDATE USING (recipient_user_id = auth.uid());
```

## Migration 4: Create function to automatically create notifications

```sql
-- Function to create NDA notifications
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

-- Create trigger
CREATE TRIGGER nda_notification_trigger
  AFTER INSERT OR UPDATE ON proposal_nda_signatures
  FOR EACH ROW
  EXECUTE FUNCTION create_nda_notification();
```

## Migration 5: Update proposals table for private fields tracking

```sql
-- Add metadata about private fields to proposals table
ALTER TABLE proposals 
ADD COLUMN private_fields_updated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN private_fields_version INTEGER DEFAULT 1;

-- Update existing records
UPDATE proposals 
SET private_fields_updated_at = updated_at 
WHERE private_fields IS NOT NULL AND private_fields != '{}';

-- Create index
CREATE INDEX idx_proposals_private_fields_updated ON proposals(private_fields_updated_at) WHERE private_fields_updated_at IS NOT NULL;
```

## Migration 6: Create views for easier querying

```sql
-- View for NDA requests with all related data
CREATE VIEW nda_requests_detailed AS
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
  COALESCE(
    ARRAY_AGG(
      json_build_object(
        'id', nrf.id,
        'file_name', nrf.file_name,
        'file_size', nrf.file_size,
        'file_type', nrf.file_type,
        'file_path', nrf.file_path,
        'uploaded_at', nrf.uploaded_at
      ) ORDER BY nrf.uploaded_at
    ) FILTER (WHERE nrf.id IS NOT NULL),
    ARRAY[]::json[]
  ) as attached_files
FROM proposal_nda_signatures pns
JOIN proposals p ON p.id = pns.proposal_id
JOIN users u_signer ON u_signer.id = pns.signer_user_id
LEFT JOIN users u_approver ON u_approver.id = pns.approved_by_user_id
LEFT JOIN nda_request_files nrf ON nrf.nda_signature_id = pns.id
GROUP BY 
  pns.id, pns.proposal_id, pns.signer_user_id, pns.status, pns.request_message,
  pns.pending_at, pns.approved_at, pns.rejected_at, pns.rejection_reason, pns.approved_by_user_id,
  p.title, p.user_id, u_signer.name, u_signer.email, u_signer.avatar_url, u_approver.name;
```

## Summary of Changes

### New Workflow:
1. **User submits NDA request**: Status = 'pending', files attached, notification sent to proposal owner
2. **Proposal owner reviews**: Can see request details, attached files, and user information  
3. **Proposal owner approves/rejects**: Updates status, notification sent to requester
4. **Access granted**: Only approved NDA signatures grant access to private fields

### Key Features:
- **File attachment**: Users can attach documents when requesting NDA access
- **Approval workflow**: Proposal owners must explicitly approve NDA requests
- **Notifications**: Automatic notifications for all parties involved
- **Audit trail**: Complete history of request, approval/rejection with timestamps
- **Security**: RLS policies ensure proper access control to files and data

### Backward Compatibility:
- Existing NDA signatures are automatically marked as 'approved'
- No breaking changes to existing functionality
- New features are additive only