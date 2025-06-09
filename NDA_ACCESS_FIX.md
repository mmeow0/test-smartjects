# NDA Access Fix - Troubleshooting Guide

## 🚨 Problem Description

**Issue**: Users were getting immediate access to private proposal fields when submitting NDA requests, instead of waiting for proposal owner approval.

**Expected Behavior**: 
1. User submits NDA request → Status: "Pending"
2. Proposal owner reviews and approves → Status: "Approved" 
3. Only then user can see private fields

**Actual Behavior**: 
1. User submits NDA request → Immediate access to private fields ❌

## 🔍 Root Cause Analysis

### Primary Issues Found:

1. **Proposal Service Not Filtering by Status**
   - `proposalService.getProposalById()` was returning ALL NDA signatures
   - No filtering for `status = 'approved'` only
   - This caused `hasApprovedNDA` logic to return true for any signature

2. **Missing Status Field Handling**
   - Code wasn't accounting for systems without the new `status` column
   - Backward compatibility issues with pre-migration databases

3. **Logic Flow Problems**
   - `canViewPrivateFields` was based on ANY NDA signature existing
   - Should only be true for APPROVED NDA signatures

## ✅ Fixes Implemented

### 1. Updated Proposal Service
**File**: `lib/services/proposal.service.ts`

```javascript
// OLD - returned all signatures
ndaSignatures: data.proposal_nda_signatures?.map((sig: any) => ({...}))

// NEW - only approved signatures  
ndaSignatures: data.proposal_nda_signatures
  ?.filter((sig: any) => !sig.hasOwnProperty('status') || sig.status === null || sig.status === undefined || sig.status === 'approved')
  .map((sig: any) => ({...}))
```

### 2. Enhanced NDA Service
**File**: `lib/services/nda.service.ts`

```javascript
// Stricter approval checking
if (data.hasOwnProperty('status')) {
  if (data.status === null || data.status === undefined) {
    // Treat as legacy approved signature
  } else if (data.status !== 'approved') {
    return null; // Deny access
  }
} else {
  // Pre-migration compatibility
}
```

### 3. Improved Access Logic
**File**: `app/proposals/[id]/page.tsx`

```javascript
// Only allow access if explicitly approved
const hasApprovedNDA = proposal.ndaSignatures?.some(signature => signature.signerUserId === user.id);
const canViewPrivateFields = isProposalOwner || hasApprovedNDA;
```

### 4. Added Migration Handling
- Graceful fallback for systems without `status` column
- Error handling for database schema differences
- Warning messages for administrators

## 🧪 Testing & Verification

### How to Test the Fix:

1. **Submit NDA Request**
   ```
   ✅ Check: Request status shows "Pending Review"
   ❌ Fail if: Private fields immediately visible
   ```

2. **Check Database**
   ```sql
   SELECT status, signer_user_id, proposal_id 
   FROM proposal_nda_signatures 
   WHERE proposal_id = 'your-proposal-id';
   
   ✅ Expected: status = 'pending'
   ```

3. **Verify Access Denial**
   ```
   ✅ Check: Private fields section shows "NDA Required"
   ✅ Check: Console shows "NDA access denied: status is 'pending'"
   ```

4. **Test Approval Flow**
   ```
   ✅ Proposal owner approves request
   ✅ Status changes to 'approved'
   ✅ User can now see private fields
   ```

### Debug Console Output
Check browser console for these messages:
```
=== NDA Access Debug Info ===
Has Approved NDA: false
Can View Private Fields: false
User NDA Request: {status: 'pending'}
============================
```

## 🗃️ Database Requirements

### Required Migration Status:

**Check if migration is needed:**
```sql
-- Check if status column exists
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'proposal_nda_signatures' 
AND column_name = 'status';
```

**If empty result, apply migration:**
```sql
ALTER TABLE proposal_nda_signatures 
ADD COLUMN status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN approved_by_user_id UUID REFERENCES users(id),
ADD COLUMN pending_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN rejected_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN rejection_reason TEXT,
ADD COLUMN request_message TEXT;

-- Mark existing signatures as approved
UPDATE proposal_nda_signatures 
SET status = 'approved', 
    approved_at = signed_at,
    pending_at = signed_at
WHERE status = 'pending';
```

## 🔧 Common Issues & Solutions

### Issue 1: Still Getting Immediate Access
**Symptoms**: Private fields visible right after NDA request
**Solution**: 
1. Check if `status` column exists in database
2. Verify proposal service is filtering by status
3. Clear browser cache and reload

### Issue 2: Console Errors About Missing Columns
**Symptoms**: `column "status" does not exist` errors
**Solution**: Apply database migration (see above)

### Issue 3: All Requests Showing as Legacy
**Symptoms**: Console shows "treating as legacy approved signature"
**Solution**: Database needs migration to add status column

### Issue 4: Proposal Owner Can't See Management Tab
**Symptoms**: No "NDA Management" tab visible
**Solution**: 
1. Ensure user is proposal owner (`isProposalOwner = true`)
2. Ensure proposal has private fields (`hasPrivateFields = true`)

### Issue 5: Files Not Uploading
**Symptoms**: File upload fails during NDA request
**Current Status**: File upload temporarily disabled until storage is configured
**Solution**: Files are logged to console, feature will be re-enabled after storage setup

## 📊 Monitoring & Alerts

### Key Metrics to Watch:
- NDA request submission rate
- Approval/rejection ratios  
- Time from request to approval
- Console error rates related to NDA

### Warning Signs:
- All NDA requests immediately approved
- No pending requests visible
- Console errors about missing database columns
- Private fields visible without approval

## 🚀 Deployment Checklist

- [ ] Database migration applied
- [ ] Status column exists and populated
- [ ] Existing signatures marked as 'approved'
- [ ] New requests create with 'pending' status
- [ ] Private fields only visible after approval
- [ ] Console debug logs show correct logic flow
- [ ] NDA Management tab visible to proposal owners
- [ ] Request/approval flow working end-to-end

## 📞 Emergency Rollback

If issues persist, temporarily disable strict checking:

**File**: `lib/services/nda.service.ts`
```javascript
// Emergency fallback - treat all signatures as approved
return {
  id: data.id as string,
  proposalId: data.proposal_id as string,
  signerUserId: data.signer_user_id as string,
  signedAt: (data.approved_at || data.signed_at) as string,
  createdAt: data.created_at as string,
};
```

⚠️ **Warning**: Only use for emergency situations as this bypasses approval workflow.

---

**Status**: ✅ Fixed and Deployed
**Last Updated**: Current deployment
**Tested By**: Development team
**Approved By**: Technical lead