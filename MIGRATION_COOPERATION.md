# Migration Guide: Adding Cooperation Proposal Flag

This document outlines the database migration required to support cooperation proposals in the Smartjects platform.

## Overview

A new boolean flag `is_cooperation_proposal` has been added to allow users to mark their "need" or "provide" proposals as cooperation/partnership proposals. This flag enables a simplified workflow that skips detailed project planning steps and goes directly to document upload and submission.

## Database Changes Required

### 1. Add is_cooperation_proposal Column

The `proposals` table needs a new boolean column to track whether a proposal is for cooperation.

**PostgreSQL Migration SQL:**

```sql
-- Add the new column with default value false
ALTER TABLE proposals 
ADD COLUMN is_cooperation_proposal BOOLEAN NOT NULL DEFAULT false;

-- Add a comment to document the column purpose
COMMENT ON COLUMN proposals.is_cooperation_proposal IS 'Flag indicating if this is a cooperation/partnership proposal';
```

### 2. Create Index (Optional but Recommended)

For better query performance when filtering cooperation proposals:

```sql
-- Create index for cooperation proposal queries
CREATE INDEX idx_proposals_cooperation ON proposals (is_cooperation_proposal);

-- Create composite index for type + cooperation queries
CREATE INDEX idx_proposals_type_cooperation ON proposals (type, is_cooperation_proposal);
```

### 3. Update Views or Stored Procedures (If Any)

If you have any database views or stored procedures that work with proposals, update them to include the new column:

```sql
-- Example: Update a view to include the new column
-- DROP VIEW IF EXISTS proposal_summary;
-- CREATE VIEW proposal_summary AS
-- SELECT 
--   id,
--   title,
--   type,
--   is_cooperation_proposal,
--   status,
--   created_at
-- FROM proposals;
```

## Migration Steps

### Step 1: Backup Database
```bash
# Create a backup before making changes
pg_dump your_database_name > backup_before_cooperation_flag.sql
```

### Step 2: Apply Schema Changes
Execute the SQL statements above in your database management tool or via command line:

```bash
# Connect to your database and run the migration
psql your_database_name << EOF
ALTER TABLE proposals 
ADD COLUMN is_cooperation_proposal BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN proposals.is_cooperation_proposal IS 'Flag indicating if this is a cooperation/partnership proposal';

CREATE INDEX idx_proposals_cooperation ON proposals (is_cooperation_proposal);
CREATE INDEX idx_proposals_type_cooperation ON proposals (type, is_cooperation_proposal);
EOF
```

### Step 3: Verify Migration
```sql
-- Check that the column was added correctly
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'proposals' AND column_name = 'is_cooperation_proposal';

-- Test inserting a cooperation proposal
INSERT INTO proposals (
    user_id, 
    smartject_id, 
    type, 
    title, 
    description, 
    is_cooperation_proposal,
    status
) VALUES (
    'test-user-id',
    'test-smartject-id', 
    'need',
    'Test Cooperation Proposal',
    'Test description',
    true,
    'draft'
);

-- Verify the data
SELECT id, title, type, is_cooperation_proposal FROM proposals WHERE title = 'Test Cooperation Proposal';

-- Clean up test data
DELETE FROM proposals WHERE title = 'Test Cooperation Proposal';
```

### Step 4: Update Application Types
The TypeScript types have been updated in the codebase:
- `lib/types.ts` - Added `isCooperationProposal` field to ProposalType interface
- `lib/types.ts` - Added `is_cooperation_proposal` field to Database type definitions
- `lib/services/proposal.service.ts` - Updated to handle the new field

## Application Behavior Changes

### For Proposals with Cooperation Flag = true:
1. **Step Navigation**: Users skip from Step 1 (Basic Information) directly to Step 5 (Documents & Review)
2. **UI Display**: Shows checkbox "This is a proposal for cooperation (partnership or collaboration)"
3. **Required Fields**: Only title, description, and smartjectId are required
4. **Empty Fields**: Budget, timeline, scope, deliverables, requirements, expertise, approach, team are stored as empty strings
5. **Milestones**: Payment milestones are not applicable and not collected
6. **Summary View**: Simplified summary showing only essential information

### Database Storage:
- Cooperation proposals maintain their original type ("need" or "provide")
- The `is_cooperation_proposal` flag is set to `true`
- Non-applicable fields are stored as empty strings rather than null
- All other proposal functionality remains the same

### UI Workflow:
1. User selects "I Need" or "I Provide" 
2. User can check "This is a proposal for cooperation"
3. If checked, the "Next" button becomes "Skip to Review"
4. User goes directly from Step 1 to Step 5
5. Budget/timeline sections are hidden in summary

## Data Queries

### Common Query Patterns:

```sql
-- Get all cooperation proposals
SELECT * FROM proposals WHERE is_cooperation_proposal = true;

-- Get cooperation proposals by type
SELECT * FROM proposals WHERE type = 'need' AND is_cooperation_proposal = true;

-- Get regular (non-cooperation) proposals
SELECT * FROM proposals WHERE is_cooperation_proposal = false;

-- Count proposals by type and cooperation flag
SELECT 
    type,
    is_cooperation_proposal,
    COUNT(*) as count
FROM proposals 
GROUP BY type, is_cooperation_proposal;
```

## Rollback Plan

If you need to rollback this migration:

```sql
-- Remove the indexes
DROP INDEX IF EXISTS idx_proposals_cooperation;
DROP INDEX IF EXISTS idx_proposals_type_cooperation;

-- Remove the column
ALTER TABLE proposals DROP COLUMN IF EXISTS is_cooperation_proposal;
```

**Note**: This rollback will lose all cooperation flag data. Make sure to backup the data if you might need to restore it later.

## Performance Considerations

- The new boolean column adds minimal storage overhead
- Indexes are recommended for queries filtering by cooperation flag
- The default value `false` ensures existing proposals are not affected
- No data migration is required for existing records

## Testing Checklist

- [ ] Can create cooperation proposals (checkbox checked)
- [ ] Can create regular proposals (checkbox unchecked)
- [ ] Cooperation proposals skip intermediate steps
- [ ] Regular proposals follow normal workflow
- [ ] Database stores cooperation flag correctly
- [ ] Summary view shows appropriate fields for each type
- [ ] Existing proposals are unaffected
- [ ] Can edit cooperation proposals
- [ ] Can convert regular proposals to cooperation and vice versa

## Security Considerations

- No additional RLS policies needed (uses existing proposal security)
- The cooperation flag doesn't affect access control
- Existing authorization logic remains unchanged

## Monitoring and Analytics

Consider adding monitoring for:
- Percentage of proposals marked as cooperation
- Conversion rates between cooperation and regular proposals
- Success rates of cooperation vs regular proposals

```sql
-- Analytics query example
SELECT 
    DATE_TRUNC('month', created_at) as month,
    type,
    is_cooperation_proposal,
    COUNT(*) as proposal_count,
    COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY DATE_TRUNC('month', created_at)) as percentage
FROM proposals 
WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY 1, 2, 3
ORDER BY 1 DESC, 2, 3;
```

## Notes

- This approach maintains backward compatibility
- No changes to existing proposal types or workflows
- The feature can be deployed before or after the database migration
- Frontend gracefully handles missing database column during transition
- All existing APIs continue to work without modification