# NDA Migration Instructions

## 🚨 URGENT: Fix Required for NDA Access Control

**Problem**: Users currently get immediate access to private proposal fields when requesting NDA access, instead of waiting for proposal owner approval.

**Solution**: Apply database migration to add approval workflow.

---

## 📋 Prerequisites

- [ ] Database admin access (PostgreSQL/Supabase)
- [ ] Ability to run SQL commands
- [ ] Application server restart capability
- [ ] Backup of current database (recommended)

---

## 🔧 Step 1: Apply Database Migration

### Option A: Run the Complete Migration Script

```bash
# Run the complete migration file
psql -h your-host -d your-database -U your-user -f APPLY_NDA_MIGRATION.sql
```

### Option B: Manual Step-by-Step Execution

1. **Add Status Columns**:
```sql
ALTER TABLE proposal_nda_signatures 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS approved_by_user_id UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS pending_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS request_message TEXT;
```

2. **Mark Existing Signatures as Approved**:
```sql
UPDATE proposal_nda_signatures 
SET 
  status = 'approved',
  approved_at = COALESCE(signed_at, created_at),
  pending_at = COALESCE(signed_at, created_at)
WHERE status = 'pending' OR status IS NULL;
```

3. **Create Indexes**:
```sql
CREATE INDEX IF NOT EXISTS idx_proposal_nda_signatures_status ON proposal_nda_signatures(status);
CREATE INDEX IF NOT EXISTS idx_proposal_nda_signatures_proposal_status ON proposal_nda_signatures(proposal_id, status);
```

4. **Create File Storage Table**:
```sql
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
```

---

## ✅ Step 2: Verify Migration

Run these queries to confirm the migration was successful:

1. **Check Status Column Exists**:
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'proposal_nda_signatures' AND column_name = 'status';
```
Expected: Returns `status`

2. **Check Existing Signatures Status**:
```sql
SELECT status, COUNT(*) FROM proposal_nda_signatures GROUP BY status;
```
Expected: All existing signatures should show `approved`

3. **Verify New Tables**:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('nda_request_files', 'nda_notifications');
```
Expected: Returns both table names

---

## 🔄 Step 3: Restart Application

**Important**: Restart your application server to clear any cached database schema.

```bash
# Example restart commands (adjust for your setup)
pm2 restart your-app
# OR
docker-compose restart
# OR
kubectl rollout restart deployment/your-app
```

---

## 🧪 Step 4: Test the Fix

1. **Test NDA Request Flow**:
   - [ ] User submits NDA request
   - [ ] Status shows "Pending Review" (not immediate access)
   - [ ] Private fields remain hidden
   - [ ] Proposal owner sees request in "NDA Management" tab
   - [ ] Owner approves request
   - [ ] User gains access to private fields

2. **Check Console Logs**:
   - [ ] No "Database Migration Required" warnings
   - [ ] Debug logs show `Can View Private Fields: false` before approval
   - [ ] Debug logs show `Can View Private Fields: true` after approval

---

## 🚨 Troubleshooting

### Issue: Still seeing "Database Migration Required" warning
**Solution**: 
1. Verify status column exists
2. Restart application server
3. Clear browser cache

### Issue: Users still get immediate access
**Solution**:
1. Check existing NDA signatures have `status = 'approved'`
2. Verify new requests create with `status = 'pending'`
3. Restart application

### Issue: Console errors about missing columns
**Solution**:
1. Re-run the migration script
2. Check database user permissions
3. Verify table exists

### Issue: No "NDA Management" tab for proposal owners
**Solution**:
1. Proposal must have private fields
2. User must be proposal owner
3. Clear browser cache

---

## 📊 Expected Behavior After Migration

### ✅ Correct Flow:
1. User clicks "Request NDA Access"
2. Fills form with message/files
3. Status shows "Pending Review"
4. Private fields remain hidden
5. Proposal owner reviews in "NDA Management"
6. Owner approves/rejects
7. User gets notification
8. If approved: private fields become visible

### ❌ Previous Incorrect Flow:
1. User clicks "Sign NDA"
2. Immediate access to private fields

---

## 🔐 Security Notes

- New requests require explicit approval
- Only approved signatures grant access
- All actions are logged and tracked
- File uploads are secured with RLS policies

---

## 📞 Support

If you encounter issues:

1. **Check migration status**: Run verification queries
2. **Review logs**: Check application and database logs
3. **Test environment**: Try on staging first
4. **Contact team**: Provide error messages and migration output

---

## 🎯 Success Criteria

Migration is successful when:
- [ ] No "Database Migration Required" warnings
- [ ] NDA requests create with "pending" status
- [ ] Private fields hidden until approval
- [ ] Proposal owners can manage requests
- [ ] Approval flow works end-to-end
- [ ] No console errors related to NDA

**Timeline**: This fix should be applied immediately to prevent unauthorized access to private proposal information.