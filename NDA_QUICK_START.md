# NDA Feature Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### 1. Run Database Migrations
Execute these SQL commands in your database:

```sql
-- Add private fields support
ALTER TABLE proposals ADD COLUMN private_fields JSONB DEFAULT '{}';

-- Create NDA signatures table
CREATE TABLE proposal_nda_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  signer_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  signed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(proposal_id, signer_user_id)
);

-- Create indexes
CREATE INDEX idx_proposal_nda_signatures_proposal_id ON proposal_nda_signatures(proposal_id);
CREATE INDEX idx_proposal_nda_signatures_signer_user_id ON proposal_nda_signatures(signer_user_id);

-- Enable RLS
ALTER TABLE proposal_nda_signatures ENABLE ROW LEVEL SECURITY;

-- Basic RLS policy
CREATE POLICY "Users can view relevant NDA signatures" ON proposal_nda_signatures
  FOR SELECT USING (
    signer_user_id = auth.uid() OR 
    proposal_id IN (SELECT id FROM proposals WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can sign NDAs" ON proposal_nda_signatures
  FOR INSERT WITH CHECK (signer_user_id = auth.uid());
```

### 2. Verify Installation
No additional npm packages needed - everything uses existing dependencies.

## 🧪 Quick Test (2 minutes)

### Test the Feature:

1. **Create Proposal with Private Fields**
   - Go to `/proposals/create`
   - Fill Step 1 normally
   - In Step 2 (Project Details), toggle "Add confidential version" for any field
   - Fill both public and private versions
   - Submit proposal

2. **Test NDA Flow**
   - Switch to different user account
   - Navigate to negotiation page for that proposal
   - Verify private fields show "🔒 NDA Required"
   - Click "Sign NDA" in right sidebar
   - Review terms and sign
   - Verify private fields become visible

3. **Verify as Owner**
   - Switch back to proposal owner
   - Check signature list in negotiation sidebar

## 📁 Key Files

```
Components:
├── /components/private-field-manager/
│   ├── private-field-manager.tsx    # Main field component
│   ├── nda-manager.tsx             # NDA signing interface
│   └── nda-test-utils.tsx          # Testing utilities

Services:
├── /lib/services/
│   ├── nda.service.ts              # NDA operations
│   └── proposal.service.ts         # Extended with private fields

Pages:
├── /app/proposals/create/page.tsx   # ✅ Integrated
├── /app/proposals/edit/[id]/page.tsx # ✅ Integrated
└── /app/matches/[id]/negotiate/[proposalId]/page.tsx # ✅ Integrated
```

## 🔧 Usage Examples

### Add Private Field Support to Any Form:
```tsx
import { PrivateFieldManager } from '@/components/private-field-manager';

<PrivateFieldManager
  fieldName="scope"
  label="Project Scope"
  publicValue={publicScope}
  privateValue={privateScope}
  onPublicChangeAction={setPublicScope}
  onPrivateChangeAction={setPrivateScope}
  fieldType="textarea"
  hasPrivateField={hasScopePrivateField}
  onTogglePrivateFieldAction={setHasScopePrivateField}
  isProposalOwner={true}
/>
```

### Add NDA Manager to Any Page:
```tsx
import { NDAManager } from '@/components/private-field-manager';

<NDAManager
  proposalId={proposalId}
  proposalOwnerId={proposal.userId}
  signatures={ndaSignatures}
  onSignatureUpdateAction={handleSignatureUpdate}
  isNegotiationActive={true}
/>
```

### Check NDA Access:
```tsx
import { ndaService } from '@/lib/services/nda.service';

const canView = await ndaService.canViewPrivateFields(
  proposalId, 
  userId, 
  proposalOwnerId
);
```

## 🎯 What Users See

### Proposal Creator:
- ✅ Toggle switches to enable private fields
- ✅ Dual input (public + private versions)
- ✅ Visual indicators for confidential content
- ✅ Can always see all fields

### Other Users (Before NDA):
- ✅ See public fields normally
- ✅ See "🔒 NDA Required" for private fields
- ✅ "Sign NDA" button in sidebar

### Other Users (After NDA):
- ✅ See all fields (public + private)
- ✅ Visual distinction for confidential content
- ✅ Signature confirmation in sidebar

## ⚡ Troubleshooting

### Common Issues:

**1. Private fields not showing toggle**
- Verify you're on Step 2+ of proposal creation
- Check `isProposalOwner={true}` prop

**2. NDA button not appearing**
- Ensure proposal has private fields with content
- Verify user is not the proposal owner
- Check negotiation is active

**3. Import errors**
```tsx
// Use direct imports if index imports fail:
import { ndaService } from '@/lib/services/nda.service';
import { proposalService } from '@/lib/services/proposal.service';
```

**4. TypeScript errors**
- All prop names end with "Action" (e.g., `onPublicChangeAction`)
- Use `as const` for status types: `status: "draft" as const`

### Debug Tool:
```tsx
import { NDATestUtils } from '@/components/private-field-manager/nda-test-utils';

// Add to any page for debugging
<NDATestUtils proposalId="test-proposal-id" />
```

## 🏁 Success Checklist

- [ ] Database migrations completed
- [ ] Can create proposal with private fields
- [ ] Private fields toggle on/off correctly
- [ ] Can edit existing proposals with private fields
- [ ] Non-owners see restricted access initially
- [ ] NDA signing works in negotiation sidebar
- [ ] Private fields become visible after signing
- [ ] Proposal owners can see signature list
- [ ] No TypeScript errors in console

## 📚 Full Documentation

For detailed information, see:
- `NDA_FEATURE_README.md` - Complete technical guide
- `NDA_IMPLEMENTATION_SUMMARY.md` - Implementation overview
- `USAGE_EXAMPLE.md` - Detailed examples

## 🆘 Need Help?

1. Check browser console for errors
2. Verify database migrations ran successfully
3. Use `NDATestUtils` component for debugging
4. Review the complete documentation files

**That's it! The NDA feature is ready to use.** 🎉