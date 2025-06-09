# NDA Feature Usage Examples

This document provides practical examples of how to use the NDA feature in the Smartjects platform.

## For Developers

### 1. Using PrivateFieldManager Component

```tsx
import { PrivateFieldManager } from '@/components/private-field-manager';

function ProposalForm() {
  const [publicScope, setPublicScope] = useState("");
  const [privateScope, setPrivateScope] = useState("");
  const [hasScopePrivateField, setHasScopePrivateField] = useState(false);

  return (
    <PrivateFieldManager
      fieldName="scope"
      label="Project Scope"
      publicValue={publicScope}
      privateValue={privateScope}
      onPublicChangeAction={setPublicScope}
      onPrivateChangeAction={setPrivateScope}
      fieldType="textarea"
      placeholder="Define the scope of the project"
      privatePlaceholder="Confidential scope details..."
      rows={4}
      hasPrivateField={hasScopePrivateField}
      onTogglePrivateFieldAction={setHasScopePrivateField}
      isProposalOwner={true}
    />
  );
}
```

### 2. Using NDAManager Component

```tsx
import { NDAManager } from '@/components/private-field-manager';
import { useState, useEffect } from 'react';
import { ndaService } from '@/lib/services/nda.service';

function NegotiationPage({ proposalId, proposalOwnerId }) {
  const [signatures, setSignatures] = useState([]);

  useEffect(() => {
    const loadSignatures = async () => {
      const sigs = await ndaService.getProposalSignatures(proposalId);
      setSignatures(sigs);
    };
    loadSignatures();
  }, [proposalId]);

  const handleSignatureUpdate = (newSignatures) => {
    setSignatures(newSignatures);
    // Refresh page or update state as needed
  };

  return (
    <NDAManager
      proposalId={proposalId}
      proposalOwnerId={proposalOwnerId}
      signatures={signatures}
      onSignatureUpdateAction={handleSignatureUpdate}
      isNegotiationActive={true}
    />
  );
}
```

### 3. Working with NDA Service

```tsx
import { ndaService } from '@/lib/services/nda.service';

// Check if user can view private fields
const canView = await ndaService.canViewPrivateFields(
  proposalId, 
  userId, 
  proposalOwnerId
);

// Sign an NDA
const signature = await ndaService.signNDA(proposalId, userId);

// Get all signatures for a proposal
const signatures = await ndaService.getProposalSignatures(proposalId);

// Check if proposal has private fields
const hasPrivateFields = await ndaService.proposalHasPrivateFields(proposalId);
```

### 4. Conditional Rendering Based on NDA Status

```tsx
function ProposalFieldDisplay({ proposal, currentUserId }) {
  const [canViewPrivate, setCanViewPrivate] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await ndaService.canViewPrivateFields(
        proposal.id,
        currentUserId,
        proposal.userId
      );
      setCanViewPrivate(hasAccess);
    };
    checkAccess();
  }, [proposal.id, currentUserId, proposal.userId]);

  return (
    <div>
      <h3>Project Scope</h3>
      <p>{proposal.scope}</p>
      
      {proposal.privateFields?.scope && (
        <div>
          {canViewPrivate ? (
            <div className="bg-amber-50 p-3 rounded border-amber-200">
              <h4 className="font-medium text-amber-800">Confidential Details</h4>
              <p>{proposal.privateFields.scope}</p>
            </div>
          ) : (
            <div className="bg-gray-100 p-3 rounded border border-dashed">
              <p className="text-gray-600">
                🔒 Sign NDA to view confidential information
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

## For End Users

### 1. Creating a Proposal with Confidential Fields

**Step 1: Start Creating a Proposal**
1. Navigate to proposal creation page
2. Fill in basic information (Step 1)
3. Continue to Project Details (Step 2)

**Step 2: Enable Confidential Fields**
1. For any field you want to keep confidential, toggle the "Add confidential version" switch
2. Fill in the public version (what everyone can see)
3. Fill in the private version (requires NDA to view)

**Example:**
- **Public Budget**: "$10,000 - $15,000"
- **Private Budget**: "Budget breakdown: $12,000 base + $2,000 for proprietary algorithm licensing + $1,000 contingency"

**Step 3: Complete and Submit**
1. Continue through remaining steps
2. Review your proposal
3. Submit when ready

### 2. Viewing Proposals with Confidential Information

**As Proposal Owner:**
- You can always see all information (public and private)
- No NDA required

**As Other User:**
1. Navigate to the proposal or negotiation page
2. You'll see public information immediately
3. Private fields will show "🔒 NDA Required" placeholder
4. Click "Sign NDA" button to access confidential information

**Signing an NDA:**
1. Click "Sign NDA" button
2. Review the legal terms in the popup
3. Check "I agree to the terms" checkbox
4. Click "Sign NDA"
5. Confidential information becomes visible immediately

### 3. During Negotiations

**Viewing Confidential Information:**
- Once you sign an NDA, you can see private fields throughout negotiations
- Your signature is tracked and timestamped
- Proposal owners can see who has signed NDAs

**Status Indicators:**
- 🔓 Green: Public information (visible to all)
- 🔒 Amber: Confidential information (NDA required)
- ✅ Green badge: You have signed the NDA
- 👥 User list: Shows who has signed NDAs (for proposal owners)

## Common Use Cases

### 1. Budget Confidentiality
```
Public: "Competitive budget based on project scope"
Private: "Budget: $50,000 total
- Development: $30,000
- Licensing: $15,000  
- Support: $5,000
- Willing to negotiate 10% flexibility"
```

### 2. Technical Approach
```
Public: "Modern web application using industry best practices"
Private: "Technology stack:
- React 18 with Next.js
- Supabase for backend
- Proprietary ML algorithm for recommendations
- AWS deployment with specific security configurations"
```

### 3. Team Information
```
Public: "Experienced development team with relevant expertise"
Private: "Team composition:
- 2 Senior developers (John Smith, Jane Doe)
- 1 UI/UX designer (Bob Johnson)
- 1 Project manager (Alice Wilson)
- Available 40 hours/week starting immediately"
```

### 4. Client Requirements
```
Public: "Integration with existing systems required"
Private: "Must integrate with:
- Salesforce CRM (specific API v48)
- Internal ERP system (SAP)
- Legacy database (Oracle 11g)
- Specific compliance requirements (SOX, GDPR)"
```

## Best Practices

### For Proposal Creators
1. **Use Sparingly**: Only make truly sensitive information private
2. **Clear Public Info**: Ensure public fields provide enough detail for initial evaluation
3. **Value Proposition**: Use private fields to provide detailed value after NDA
4. **Professional Content**: Private fields should contain professional, relevant information

### For Developers
1. **Error Handling**: Always handle cases where NDA service calls might fail
2. **Loading States**: Show appropriate loading indicators during NDA operations
3. **Type Safety**: Use proper TypeScript types for all NDA-related data
4. **Security**: Never expose private field data without proper authorization

### For System Administrators
1. **Monitor Usage**: Track NDA signing patterns and proposal success rates
2. **Legal Review**: Ensure NDA terms meet your organization's legal requirements
3. **Performance**: Monitor database performance with private field queries
4. **Backup Strategy**: Include private fields in backup and recovery procedures

## Troubleshooting

### Common Issues

**1. NDA Button Not Appearing**
- Check if proposal has private fields: `ndaService.proposalHasPrivateFields(proposalId)`
- Verify user is not the proposal owner
- Ensure negotiation is active

**2. Private Fields Not Showing After Signing**
- Refresh the page or component state
- Verify signature was recorded: `ndaService.getUserSignature(proposalId, userId)`
- Check browser console for errors

**3. Type Errors**
- Ensure all components use the correct prop names (ending with "Action")
- Check TypeScript compilation
- Verify import paths are correct

**4. Database Errors**
- Verify all migrations have been run
- Check RLS policies are enabled
- Ensure user has proper permissions

### Debug Steps
1. Open browser developer tools
2. Check console for error messages
3. Use Network tab to verify API calls
4. Use the NDATestUtils component for comprehensive testing

## Testing

### Manual Testing Checklist
- [ ] Create proposal with private fields
- [ ] View proposal as different user
- [ ] Verify private fields are hidden
- [ ] Sign NDA successfully
- [ ] Verify private fields become visible
- [ ] Check signature appears in database
- [ ] Test as proposal owner (should always see all fields)

### Automated Testing
```tsx
import { NDATestUtils } from '@/components/private-field-manager/nda-test-utils';

// Use in development environment
function TestPage() {
  return (
    <NDATestUtils 
      proposalId="test-proposal-id"
      onTestComplete={(result) => console.log('Test result:', result)}
    />
  );
}
```

This comprehensive example should help both developers integrate the NDA feature and end users understand how to use it effectively.