# NDA Templates Feature Documentation

## Overview

The NDA Templates feature allows proposal creators to upload Non-Disclosure Agreement (NDA) template documents that users must download, fill out, and submit when requesting access to private information in proposals. This ensures proper legal documentation for confidential data sharing.

## Key Features

- **Template Upload**: Proposal owners can upload NDA template documents (PDF, Word, Text files)
- **Template Download**: Users requesting NDA access can download the template
- **Integration with NDA Requests**: Templates are presented in the NDA request flow
- **Automatic Management**: Templates are tied to proposals and managed through the UI
- **Security**: Only proposal owners can upload/manage templates, authenticated users can download them

## Database Schema Changes

### New Table: `proposal_nda_templates`

```sql
CREATE TABLE "public"."proposal_nda_templates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "proposal_id" UUID NOT NULL,
    "template_name" VARCHAR(255) NOT NULL,
    "file_path" VARCHAR(500) NOT NULL,
    "file_type" VARCHAR(100) NOT NULL,
    "file_size" BIGINT NOT NULL,
    "uploaded_by" UUID NOT NULL,
    "uploaded_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

### Constraints and Indexes

- **Primary Key**: `id`
- **Foreign Keys**: 
  - `proposal_id` → `proposals(id)` ON DELETE CASCADE
  - `uploaded_by` → `users(id)` ON DELETE CASCADE
- **Unique Constraint**: One template per proposal (`proposal_id`)
- **Indexes**: On `proposal_id`, `uploaded_by`, and `uploaded_at`

### Row Level Security (RLS)

- **Owners Policy**: Proposal owners can manage their NDA templates
- **View Policy**: Authenticated users can view templates for proposals with private fields

## Service Methods (`ndaService`)

### Core Template Methods

#### `uploadNDATemplate(proposalId: string, templateFile: File, userId?: string)`
- Uploads an NDA template file for a proposal
- Validates file type and proposal ownership
- Stores file in Supabase storage under `nda-templates/{proposalId}/`
- Replaces existing template if one exists
- **Returns**: `NDATemplate | null`

#### `getNDATemplate(proposalId: string)`
- Retrieves template metadata for a proposal
- **Returns**: `NDATemplate | null`

#### `downloadNDATemplate(proposalId: string)`
- Downloads the template file as a Blob
- **Returns**: `Blob | null`

#### `deleteNDATemplate(proposalId: string, userId?: string)`
- Deletes template from both database and storage
- Validates proposal ownership
- **Returns**: `boolean`

#### `hasNDATemplate(proposalId: string)`
- Checks if a proposal has an NDA template
- **Returns**: `boolean`

#### `getNDATemplateDownloadUrl(proposalId: string)`
- Generates a signed URL for direct template download (1 hour expiry)
- **Returns**: `string | null`

### Draft Proposal Handling

All template methods gracefully handle draft proposals:
- Draft proposals (IDs starting with "draft") cannot have templates
- Methods return appropriate responses without errors
- UI shows informative messages for draft states

## UI Components

### `NDATemplateManager`

**Location**: `components/nda-template-manager.tsx`

**Props**:
- `proposalId: string` - The proposal ID
- `isProposalOwner: boolean` - Whether current user owns the proposal
- `onTemplateChange?: () => void` - Callback when template changes

**Features**:
- **Upload Interface**: File selection with validation (PDF, DOC, DOCX, TXT, max 10MB)
- **Template Display**: Shows existing template with download and delete options
- **Draft Handling**: Informative message for draft proposals
- **Permission-Based UI**: Different views for owners vs non-owners

### `NDARequestForm` (Enhanced)

**Location**: `components/nda-request-form.tsx`

**New Features**:
- **Template Section**: Displays available NDA template with download button
- **Template Integration**: Encourages users to download, fill, and submit template
- **Conditional Display**: Only shows template section if template exists

## Integration Points

### 1. Proposal Creation (`app/proposals/create/page.tsx`)
- **Location**: Step 5 (Documents & Review)
- **Condition**: Only shows when proposal has private fields enabled
- **Functionality**: Upload template for new proposals (disabled for drafts)

### 2. Proposal Editing (`app/proposals/edit/[id]/page.tsx`)
- **Location**: Step 5 (Documents & Review)
- **Condition**: Only shows when proposal has private fields enabled
- **Functionality**: Full template management for existing proposals

### 3. Proposal Detail View (`app/proposals/[id]/page.tsx`)
- **Location**: NDA Management tab
- **Condition**: Only for proposal owners with private fields
- **Functionality**: View and manage existing templates

### 4. NDA Request Flow (`components/nda-request-form.tsx`)
- **Location**: In the request dialog
- **Condition**: Shows if template exists for the proposal
- **Functionality**: Download template before submitting request

## User Workflow

### For Proposal Owners:

1. **Create Proposal** with private fields
2. **Upload NDA Template** in step 5 or after saving
3. **Manage Template** through proposal detail page
4. **Review NDA Requests** that include completed templates

### For Users Requesting Access:

1. **View Proposal** with private information
2. **See NDA Template** in request form
3. **Download Template** and fill it out
4. **Submit NDA Request** with completed template
5. **Gain Access** once approved by proposal owner

## File Handling

### Supported Formats
- **PDF**: `.pdf`
- **Microsoft Word**: `.doc`, `.docx`
- **Text Files**: `.txt`

### Validation
- **File Size**: Maximum 10MB per template
- **File Type**: Validated by MIME type and extension
- **Security**: Files stored in isolated storage buckets

### Storage Structure
```
proposals/
└── nda-templates/
    └── {proposalId}/
        └── nda-template-{proposalId}-{timestamp}.{ext}
```

## Security Considerations

### Access Control
- **Upload**: Only proposal owners can upload templates
- **Download**: Only authenticated users can download templates
- **Delete**: Only proposal owners can delete their templates
- **View**: Templates only visible for proposals with private fields

### Data Protection
- Templates stored in secure Supabase storage
- Signed URLs with limited expiry (1 hour)
- RLS policies enforce access restrictions
- File type validation prevents malicious uploads

### Privacy
- Templates are proposal-specific and not shared across proposals
- User activity tracked through standard audit logging
- Files automatically cleaned up when proposals are deleted

## Error Handling

### Common Scenarios
- **File Too Large**: User-friendly error message with size limit
- **Invalid File Type**: Clear indication of supported formats
- **Draft Proposals**: Informative messages about saving requirements
- **Permission Denied**: Appropriate feedback for unauthorized access
- **Storage Failures**: Graceful fallback with cleanup

### Technical Errors
- Database errors logged and handled gracefully
- Storage upload failures trigger cleanup
- Network issues provide retry options where appropriate

## Future Enhancements

### Potential Improvements
- **Multiple Templates**: Support for different template types
- **Version Control**: Track template changes over time
- **Template Library**: Pre-built template options
- **Digital Signatures**: Integration with e-signature services
- **Template Validation**: Automatic checking of completed templates

### Integration Opportunities
- **Contract Generation**: Auto-populate contracts from NDA data
- **Legal Review**: Integration with legal service providers
- **Compliance Tracking**: Audit trails for regulatory requirements
- **Notification System**: Enhanced alerts for template-related events

## Migration Guide

### Database Migration
Run the migration file: `20241225000000_add_nda_templates.sql`

### Code Updates
The feature is backward compatible and doesn't require changes to existing code.

### Testing
- Verify template upload/download functionality
- Test permission controls
- Validate file type restrictions
- Check draft proposal handling
- Confirm cleanup on proposal deletion

## Support and Troubleshooting

### Common Issues
1. **Templates not appearing**: Check if proposal has private fields enabled
2. **Upload failures**: Verify file size and type restrictions
3. **Permission errors**: Ensure user is proposal owner
4. **Download issues**: Check signed URL generation and expiry

### Debug Information
Enable detailed logging in `ndaService` methods for troubleshooting upload, download, and permission issues.