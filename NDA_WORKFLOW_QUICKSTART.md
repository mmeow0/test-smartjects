# NDA Workflow Quick Start Guide

## 🚀 What's New

We've implemented a **two-step NDA approval system** that replaces the old instant NDA signing. Now users must **request access** to private proposal fields, and **proposal owners must approve** these requests.

## 🔄 How It Works

### Before (Old System)
1. User clicks "Sign NDA" 
2. ✅ Instant access to private fields

### After (New System)  
1. User submits **NDA request** with message + files
2. 📋 Proposal owner **reviews request**
3. ✅ Owner approves → User gets access
4. ❌ Owner rejects → User denied access

## 👤 For Users (Requesting Access)

### Step 1: Submit Request
- Go to proposal with private fields
- Click **"Request NDA Access"** button
- Fill out the form:
  - ✍️ **Required**: Explain why you need access
  - 📎 **Optional**: Attach supporting documents (portfolio, credentials)
- Submit request

### Step 2: Wait for Approval
- Status shows as **"Pending Review"** 
- You'll get notified when owner decides
- Check proposal page for status updates

### Step 3: Get Access (if approved)
- ✅ **Approved**: You can now see all private fields
- ❌ **Rejected**: No access, may include reason

## 🏢 For Proposal Owners (Managing Requests)

### Step 1: Review Requests
- New **"NDA Management"** tab appears on your proposals
- See pending requests with user info
- Download and review attached documents

### Step 2: Make Decision
- **Approve**: User gets immediate access to private fields
- **Reject**: User denied access, can add rejection reason

## 🛠️ Setup Required

### Database Migrations Needed
Run these SQL commands (see `migrations/nda_approval_workflow.md` for full details):

```sql
-- 1. Update existing table
ALTER TABLE proposal_nda_signatures 
ADD COLUMN status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN approved_by_user_id UUID REFERENCES users(id),
ADD COLUMN request_message TEXT;

-- 2. Create file storage table  
CREATE TABLE nda_request_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nda_signature_id UUID REFERENCES proposal_nda_signatures(id),
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL
);

-- 3. Mark existing signatures as approved
UPDATE proposal_nda_signatures SET status = 'approved' WHERE status = 'pending';
```

### Storage Setup
Create Supabase storage bucket for file uploads:
```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('nda-files', 'nda-files', false);
```

## ✨ Key Features

### 🔒 Enhanced Security
- Two-step approval process
- File attachment support
- Audit trail for all actions
- Row-level security policies

### 📄 File Support
- **Formats**: PDF, DOC, DOCX, TXT, JPG, PNG
- **Size limit**: 10MB per file
- **Count limit**: 5 files per request
- **Secure storage**: Only authorized users can download

### 🔔 Status Tracking
- **Pending**: Request under review
- **Approved**: Full access granted  
- **Rejected**: Access denied with optional reason

### 📊 Management Tools
- Proposal owners get dedicated NDA management interface
- Bulk request handling
- Download attached documents
- Rejection with custom messages

## 🎯 Quick Actions

### I want to request access to a proposal
1. Find proposal with private fields
2. Look for **orange "NDA Required"** badge
3. Click **"Request NDA Access"** button
4. Fill form and submit

### I want to manage NDA requests for my proposal
1. Go to your proposal page
2. Click **"NDA Management"** tab
3. Review pending requests
4. Approve/reject with one click

### I want to check my request status
1. Go back to the proposal page
2. Look for status in the NDA section:
   - 🟡 **Yellow**: Pending review
   - 🟢 **Green**: Approved
   - 🔴 **Red**: Rejected

## 🆕 What Changed on Proposal Pages

### New UI Elements
- **NDA Status Cards**: Show current access status
- **Request Form Dialog**: Submit NDA requests with files
- **Management Tab**: Owner interface for handling requests
- **Status Timeline**: Track request history

### Updated Access Control
- Private fields only visible after **approval** (not just request)
- Clear visual indicators for access status
- Better error messages and guidance

## 📞 Need Help?

### Common Issues
- **Can't submit request**: Check if you already have a pending/approved request
- **Files won't upload**: Verify size (10MB max) and format
- **Not seeing private fields**: Ensure your NDA request was approved

### Support
- Check full documentation in `docs/nda-workflow.md`
- Review migration file: `migrations/nda_approval_workflow.md`
- Contact technical team for database setup assistance

---

**🎉 Ready to use!** The new NDA workflow provides better security and control while maintaining a smooth user experience.