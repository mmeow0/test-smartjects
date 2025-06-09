# NDA Approval Workflow Documentation

## Overview

The NDA (Non-Disclosure Agreement) approval workflow allows proposal owners to control access to private proposal information through a request-and-approval system. Users must submit NDA requests with supporting documents, which proposal owners can review and approve/reject.

## Workflow Process

### 1. User Perspective

#### Step 1: Request NDA Access
- User views a proposal with private fields
- Clicks "Request NDA Access" button
- Fills out request form with:
  - Required message explaining why they need access
  - Optional supporting documents (portfolio, credentials, etc.)
- Submits request

#### Step 2: Wait for Review
- Request status shows as "Pending Review"
- User receives confirmation that request was submitted
- User can view their request status on the proposal page

#### Step 3: Receive Decision
- User gets notified when proposal owner makes a decision
- If approved: Gains access to all private fields
- If rejected: Cannot access private fields, may see rejection reason

### 2. Proposal Owner Perspective

#### Step 1: Receive Notifications
- Gets notified when users submit NDA requests
- Can see pending requests count in "NDA Management" tab

#### Step 2: Review Requests
- Reviews user's message and qualifications
- Downloads and examines attached documents
- Evaluates user's credibility and need for access

#### Step 3: Make Decision
- **Approve**: User gains immediate access to private fields
- **Reject**: User denied access, optional rejection reason provided

## Database Schema Changes

### Required Migrations

1. **Update `proposal_nda_signatures` table**:
   ```sql
   ALTER TABLE proposal_nda_signatures 
   ADD COLUMN status VARCHAR(20) DEFAULT 'pending',
   ADD COLUMN approved_by_user_id UUID REFERENCES users(id),
   ADD COLUMN pending_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
   ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE,
   ADD COLUMN rejected_at TIMESTAMP WITH TIME ZONE,
   ADD COLUMN rejection_reason TEXT,
   ADD COLUMN request_message TEXT;
   ```

2. **Create `nda_request_files` table**:
   ```sql
   CREATE TABLE nda_request_files (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     nda_signature_id UUID NOT NULL REFERENCES proposal_nda_signatures(id),
     file_name VARCHAR(255) NOT NULL,
     file_size BIGINT NOT NULL,
     file_type VARCHAR(100) NOT NULL,
     file_path VARCHAR(500) NOT NULL,
     uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

3. **Create `nda_notifications` table**:
   ```sql
   CREATE TABLE nda_notifications (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     nda_signature_id UUID NOT NULL REFERENCES proposal_nda_signatures(id),
     recipient_user_id UUID NOT NULL REFERENCES users(id),
     type VARCHAR(50) NOT NULL,
     title VARCHAR(255) NOT NULL,
     message TEXT NOT NULL,
     read_at TIMESTAMP WITH TIME ZONE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

4. **Create Supabase Storage Bucket**:
   ```sql
   INSERT INTO storage.buckets (id, name, public) VALUES ('nda-files', 'nda-files', false);
   ```

## Implementation Details

### Key Components

1. **`NDARequestForm`**: User interface for submitting NDA requests
2. **`NDARequestsManager`**: Proposal owner interface for managing requests
3. **`NDAStatusIndicator`**: Shows current NDA status throughout the UI
4. **`ndaService`**: Backend service handling all NDA operations

### Service Methods

```typescript
// Submit NDA request with files
await ndaService.submitNDARequest(proposalId, userId, message, files);

// Get user's request status
await ndaService.getUserNDARequest(proposalId, userId);

// Get pending requests (proposal owner)
await ndaService.getPendingNDARequests(proposalId);

// Approve/reject requests
await ndaService.approveNDARequest(requestId, approverId);
await ndaService.rejectNDARequest(requestId, approverId, reason);

// Check access permissions
await ndaService.canViewPrivateFields(proposalId, userId, proposalOwnerId);
```

### File Upload Features

- **Supported formats**: PDF, DOC, DOCX, TXT, JPG, PNG
- **File size limit**: 10MB per file
- **File count limit**: 5 files per request
- **Storage**: Supabase Storage with security policies
- **Download**: Proposal owners can download attached files

## Security Considerations

### Access Control
- Only proposal owners can approve/reject NDA requests
- Only approved NDA signers can view private fields
- Files are stored securely with row-level security policies
- API endpoints validate user permissions

### Data Protection
- Private fields are only accessible after NDA approval
- File downloads are restricted to authorized users
- Audit trail maintained for all NDA actions
- Notifications sent for transparency

## Usage Examples

### For Users

```tsx
// Check if user can request NDA
const canRequestNDA = !isProposalOwner && !hasApprovedNDA && !userNdaRequest;

// Show request form
{canRequestNDA && (
  <NDARequestForm
    proposalId={proposalId}
    proposalTitle={proposal.title}
    onRequestSubmitted={handleNdaRequestSubmitted}
  />
)}

// Show status indicator
<NDAStatusIndicator
  isProposalOwner={isProposalOwner}
  hasPrivateFields={hasPrivateFields}
  hasApprovedNDA={hasApprovedNDA}
  userNdaRequest={userNdaRequest}
/>
```

### For Proposal Owners

```tsx
// Add NDA management tab
{isProposalOwner && hasPrivateFields && (
  <TabsTrigger value="nda-management">
    NDA Management
  </TabsTrigger>
)}

// Show requests manager
<NDARequestsManager
  proposalId={proposal.id}
  proposalTitle={proposal.title}
  isProposalOwner={isProposalOwner}
  onRequestsUpdated={handleNdaRequestsUpdated}
/>
```

## Best Practices

### For Users
1. **Provide clear reasoning**: Explain why you need access to private information
2. **Include relevant documents**: Attach portfolio, credentials, or references
3. **Be professional**: Use formal language in request messages
4. **Be patient**: Allow time for proposal owners to review requests

### For Proposal Owners
1. **Review thoroughly**: Check user's background and attached documents
2. **Respond promptly**: Don't leave users waiting unnecessarily
3. **Provide feedback**: Give clear rejection reasons when declining requests
4. **Document decisions**: Keep records of approval/rejection rationale

## Troubleshooting

### Common Issues

1. **File upload fails**:
   - Check file size (max 10MB)
   - Verify file format is supported
   - Ensure stable internet connection

2. **Request not visible**:
   - Verify user has submitted request
   - Check proposal owner is viewing correct proposal
   - Refresh page to update status

3. **Access denied after approval**:
   - Clear browser cache
   - Reload proposal page
   - Verify NDA status in database

### Error Messages

- **"User has already submitted NDA request"**: User cannot submit multiple requests
- **"File too large"**: File exceeds 10MB limit
- **"Invalid file type"**: File format not supported
- **"Authentication required"**: User must be logged in

## Future Enhancements

1. **Email notifications**: Send email alerts for NDA events
2. **Request expiration**: Auto-expire old pending requests
3. **Bulk approval**: Approve multiple requests at once
4. **Template messages**: Pre-written request templates
5. **Analytics**: Track NDA request patterns and approval rates

## Migration Checklist

- [ ] Apply database migrations
- [ ] Create Supabase storage bucket
- [ ] Set up storage policies
- [ ] Configure notification triggers
- [ ] Test file upload/download
- [ ] Verify access controls
- [ ] Update existing NDA signatures to 'approved' status
- [ ] Deploy components to production