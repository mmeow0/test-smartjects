# NDA Feature Implementation Guide

This document outlines the implementation of the NDA (Non-Disclosure Agreement) feature for the Smartjects platform, which allows proposal creators to add confidential fields that require NDA signing to view.

## Overview

The NDA feature enables proposal creators to:
- Add confidential versions of any field in the proposal creation process (from Project Details step onwards)
- Require users to sign an NDA during negotiations to view confidential information
- Track who has signed NDAs for each proposal
- Control access to sensitive information throughout the negotiation process

## Database Migrations

### 1. Add Private Fields Column to Proposals Table

```sql
-- Add JSONB column to store private/confidential field data
ALTER TABLE proposals ADD COLUMN private_fields JSONB DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN proposals.private_fields IS 'Stores confidential field data that requires NDA to access';
```

### 2. Create NDA Signatures Table

```sql
-- Create table to track NDA signatures
CREATE TABLE proposal_nda_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  signer_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  signed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Ensure one signature per user per proposal
  UNIQUE(proposal_id, signer_user_id)
);

-- Add comments for documentation
COMMENT ON TABLE proposal_nda_signatures IS 'Tracks NDA signatures for proposal access';
COMMENT ON COLUMN proposal_nda_signatures.proposal_id IS 'Reference to the proposal requiring NDA';
COMMENT ON COLUMN proposal_nda_signatures.signer_user_id IS 'User who signed the NDA';
COMMENT ON COLUMN proposal_nda_signatures.signed_at IS 'When the NDA was signed';
```

### 3. Create Indexes for Performance

```sql
-- Index for fast lookup of signatures by proposal
CREATE INDEX idx_proposal_nda_signatures_proposal_id ON proposal_nda_signatures(proposal_id);

-- Index for fast lookup of signatures by user
CREATE INDEX idx_proposal_nda_signatures_signer_user_id ON proposal_nda_signatures(signer_user_id);

-- Composite index for permission checks
CREATE INDEX idx_proposal_nda_signatures_proposal_user ON proposal_nda_signatures(proposal_id, signer_user_id);

-- Index for recent signatures
CREATE INDEX idx_proposal_nda_signatures_signed_at ON proposal_nda_signatures(signed_at DESC);
```

### 4. Row Level Security (RLS) Policies

```sql
-- Enable RLS on the NDA signatures table
ALTER TABLE proposal_nda_signatures ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view signatures for proposals they own or have signed
CREATE POLICY "Users can view relevant NDA signatures" ON proposal_nda_signatures
  FOR SELECT USING (
    signer_user_id = auth.uid() OR 
    proposal_id IN (
      SELECT id FROM proposals WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can insert their own signatures
CREATE POLICY "Users can sign NDAs" ON proposal_nda_signatures
  FOR INSERT WITH CHECK (signer_user_id = auth.uid());

-- Policy: Proposal owners can view all signatures for their proposals
CREATE POLICY "Proposal owners can view all signatures" ON proposal_nda_signatures
  FOR SELECT USING (
    proposal_id IN (
      SELECT id FROM proposals WHERE user_id = auth.uid()
    )
  );
```

### 5. Update Proposals RLS for Private Fields

```sql
-- Add policy to protect private fields in proposals
CREATE OR REPLACE FUNCTION can_view_private_fields(proposal_row proposals)
RETURNS BOOLEAN AS $$
BEGIN
  -- Proposal owner can always view private fields
  IF proposal_row.user_id = auth.uid() THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user has signed NDA for this proposal
  IF EXISTS (
    SELECT 1 FROM proposal_nda_signatures 
    WHERE proposal_id = proposal_row.id 
    AND signer_user_id = auth.uid()
  ) THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Data Structure

### Private Fields JSON Structure

The `private_fields` column stores confidential data in the following format:

```json
{
  "scope": "Confidential project scope details...",
  "timeline": "Internal timeline information...",
  "budget": "Detailed budget breakdown...",
  "deliverables": "Sensitive deliverable details...",
  "requirements": "Confidential requirements...",
  "expertise": "Proprietary expertise information...",
  "approach": "Confidential implementation approach...",
  "team": "Internal team structure details...",
  "additionalInfo": "Other confidential information..."
}
```

### Usage in Application

```typescript
// Example: Check if user can view private fields
const canView = await ndaService.canViewPrivateFields(
  proposalId, 
  userId, 
  proposalOwnerId
);

// Example: Sign NDA
const signature = await ndaService.signNDA(proposalId, userId);

// Example: Get proposal with appropriate field visibility
const proposal = await proposalService.getProposalById(proposalId);
if (canView) {
  // Show both public and private fields
  console.log(proposal.privateFields);
} else {
  // Show only public fields
  console.log("NDA required to view confidential information");
}
```

## Security Considerations

### 1. Data Protection
- Private fields are stored in JSONB format in the database
- Access is controlled through RLS policies
- NDA signatures are required before private data exposure

### 2. Access Control
- Only proposal owners can always view private fields
- Other users must sign NDA to gain access
- NDA signatures are tracked with timestamps
- One signature per user per proposal (enforced by unique constraint)

### 3. Audit Trail
- All NDA signatures are logged with timestamps
- Signature history is maintained for compliance
- Row-level security ensures data isolation

## Implementation Components

### 1. Backend Services
- `ndaService`: Handles NDA signing and verification
- `proposalService`: Extended to support private fields
- Database policies for access control

### 2. Frontend Components
- `PrivateFieldManager`: Handles public/private field input
- `NDAManager`: Manages NDA signing process
- Form updates in proposal creation/editing

### 3. UI/UX Features
- Toggle switches for enabling private fields
- Visual indicators for confidential content
- NDA signing dialog with legal terms
- Access control indicators in negotiation interface

## Testing the Feature

### 1. Create a Proposal with Private Fields
1. Navigate to proposal creation
2. In Step 2 (Project Details) or Step 3, toggle private field switches
3. Fill in both public and private versions of fields
4. Submit the proposal

### 2. Test NDA Workflow
1. Navigate to negotiation page as a different user
2. Verify that private fields are hidden
3. Sign the NDA through the interface
4. Confirm that private fields become visible

### 3. Verify Access Control
1. Check that only signed users can view private data
2. Verify that proposal owners always have access
3. Test that unsigned users see access restrictions

## Rollback Instructions

If you need to rollback the feature:

```sql
-- Remove the NDA signatures table
DROP TABLE IF EXISTS proposal_nda_signatures CASCADE;

-- Remove the private fields column
ALTER TABLE proposals DROP COLUMN IF EXISTS private_fields;

-- Remove the helper function
DROP FUNCTION IF EXISTS can_view_private_fields(proposals);
```

## Future Enhancements

1. **NDA Templates**: Support for custom NDA terms per proposal
2. **Expiration**: Add NDA expiration dates
3. **Bulk Operations**: Allow bulk NDA management
4. **Analytics**: Track NDA signing patterns
5. **Notifications**: Email notifications for NDA requests
6. **Document Attachments**: Support for custom NDA documents

## Support

For questions or issues with the NDA feature implementation:
1. Check the database migration status
2. Verify RLS policies are active
3. Test with appropriate user permissions
4. Review the component integration in the frontend

## Compliance Notes

This implementation provides a basic NDA framework. For production use in regulated environments, consider:
- Legal review of NDA terms
- Compliance with data protection regulations
- Enhanced audit logging
- Document retention policies
- User consent management