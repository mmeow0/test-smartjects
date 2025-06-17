create table "public"."business_functions" (
    "id" uuid not null default uuid_generate_v4(),
    "name" text not null
);


create table "public"."comments" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid,
    "smartject_id" uuid,
    "content" text not null,
    "created_at" timestamp with time zone default now()
);


create table "public"."contract_activities" (
    "id" uuid not null default uuid_generate_v4(),
    "contract_id" uuid,
    "type" text not null,
    "description" text not null,
    "user_id" uuid,
    "created_at" timestamp with time zone default now()
);


create table "public"."contract_deliverables" (
    "id" uuid not null default uuid_generate_v4(),
    "contract_id" uuid,
    "description" text not null,
    "created_at" timestamp with time zone default now()
);


create table "public"."contract_documents" (
    "id" uuid not null default uuid_generate_v4(),
    "contract_id" uuid,
    "name" text not null,
    "type" text not null,
    "size" text not null,
    "url" text not null,
    "uploaded_by" uuid,
    "uploaded_at" timestamp with time zone default now()
);


create table "public"."contract_extension_requests" (
    "id" uuid not null default uuid_generate_v4(),
    "contract_id" uuid not null,
    "requested_by" uuid not null,
    "current_end_date" timestamp with time zone not null,
    "new_end_date" timestamp with time zone not null,
    "extension_days" integer not null,
    "reason" text not null,
    "details" text not null,
    "status" text not null default 'pending'::text,
    "responded_by" uuid,
    "response_message" text,
    "responded_at" timestamp with time zone,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."contract_extension_requests" enable row level security;

create table "public"."contract_message_attachments" (
    "id" uuid not null default uuid_generate_v4(),
    "message_id" uuid not null,
    "name" text not null,
    "type" text not null,
    "size" text not null,
    "url" text not null,
    "created_at" timestamp with time zone default now()
);


alter table "public"."contract_message_attachments" enable row level security;

create table "public"."contract_messages" (
    "id" uuid not null default uuid_generate_v4(),
    "contract_id" uuid,
    "user_id" uuid,
    "content" text not null,
    "created_at" timestamp with time zone default now()
);


create table "public"."contract_milestone_comments" (
    "id" uuid not null default uuid_generate_v4(),
    "milestone_id" uuid,
    "user_id" uuid,
    "content" text not null,
    "created_at" timestamp with time zone default now()
);


create table "public"."contract_milestone_deliverables" (
    "id" uuid not null default uuid_generate_v4(),
    "milestone_id" uuid,
    "description" text not null,
    "completed" boolean not null default false,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


create table "public"."contract_milestone_messages" (
    "id" uuid not null default uuid_generate_v4(),
    "milestone_id" uuid not null,
    "sender_id" uuid not null,
    "content" text not null,
    "message_type" text not null default 'general'::text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."contract_milestone_messages" enable row level security;

create table "public"."contract_milestone_status_history" (
    "id" uuid not null default uuid_generate_v4(),
    "milestone_id" uuid not null,
    "changed_by" uuid not null,
    "old_status" text,
    "new_status" text not null,
    "action_type" text not null,
    "comments" text,
    "created_at" timestamp with time zone default now()
);


alter table "public"."contract_milestone_status_history" enable row level security;

create table "public"."contract_milestones" (
    "id" uuid not null default uuid_generate_v4(),
    "contract_id" uuid,
    "name" text not null,
    "description" text,
    "percentage" integer not null,
    "amount" text not null,
    "due_date" timestamp with time zone not null,
    "status" text not null default 'pending'::text,
    "completed_date" timestamp with time zone,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "submitted_for_review" boolean default false,
    "submitted_at" timestamp with time zone,
    "submitted_by" uuid,
    "reviewed_at" timestamp with time zone,
    "reviewed_by" uuid,
    "review_status" text,
    "review_comments" text
);


alter table "public"."contract_milestones" enable row level security;

create table "public"."contract_modification_requests" (
    "id" uuid not null default uuid_generate_v4(),
    "contract_id" uuid not null,
    "requested_by" uuid not null,
    "modification_type" text not null,
    "reason" text not null,
    "details" text not null,
    "urgency" text not null default 'normal'::text,
    "status" text not null default 'pending'::text,
    "responded_by" uuid,
    "response_message" text,
    "responded_at" timestamp with time zone,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."contract_modification_requests" enable row level security;

create table "public"."contracts" (
    "id" uuid not null default uuid_generate_v4(),
    "match_id" uuid,
    "provider_id" uuid,
    "needer_id" uuid,
    "title" text not null,
    "status" text not null default 'pending_start'::text,
    "start_date" timestamp with time zone not null,
    "end_date" timestamp with time zone not null,
    "exclusivity_ends" timestamp with time zone not null,
    "budget" text not null,
    "scope" text not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "provider_signed" boolean default false,
    "needer_signed" boolean default false,
    "proposal_id" uuid
);


alter table "public"."contracts" enable row level security;

create table "public"."deliverables" (
    "id" uuid not null default uuid_generate_v4(),
    "milestone_id" uuid,
    "description" text not null,
    "completed" boolean not null default false,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


create table "public"."document_versions" (
    "id" uuid not null default uuid_generate_v4(),
    "document_id" uuid,
    "version_number" integer not null,
    "author" uuid,
    "changes" text[],
    "created_at" timestamp with time zone default now()
);


create table "public"."industries" (
    "id" uuid not null default uuid_generate_v4(),
    "name" text not null
);


create table "public"."match_proposals" (
    "match_id" uuid not null,
    "proposal_id" uuid not null
);


create table "public"."matches" (
    "id" uuid not null default uuid_generate_v4(),
    "smartject_id" uuid,
    "status" text not null default 'new'::text,
    "matched_date" timestamp with time zone default now(),
    "provider_id" uuid,
    "needer_id" uuid,
    "updated_at" timestamp with time zone default now()
);


create table "public"."messages" (
    "id" uuid not null default uuid_generate_v4(),
    "match_id" uuid,
    "user_id" uuid,
    "content" text not null,
    "is_counter_offer" boolean not null default false,
    "counter_offer_budget" text,
    "counter_offer_timeline" text,
    "created_at" timestamp with time zone default now()
);


create table "public"."milestones" (
    "id" uuid not null default uuid_generate_v4(),
    "proposal_id" uuid,
    "name" text not null,
    "description" text,
    "percentage" integer not null,
    "amount" text not null,
    "due_date" timestamp with time zone not null,
    "status" text not null default 'pending'::text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


create table "public"."nda_notifications" (
    "id" uuid not null default gen_random_uuid(),
    "nda_signature_id" uuid not null,
    "recipient_user_id" uuid not null,
    "type" character varying(50) not null,
    "title" character varying(255) not null,
    "message" text not null,
    "read_at" timestamp with time zone,
    "created_at" timestamp with time zone default now()
);


alter table "public"."nda_notifications" enable row level security;

create table "public"."nda_request_files" (
    "id" uuid not null default gen_random_uuid(),
    "nda_signature_id" uuid not null,
    "file_name" character varying(255) not null,
    "file_size" bigint not null,
    "file_type" character varying(100) not null,
    "file_path" character varying(500) not null,
    "uploaded_at" timestamp with time zone default now(),
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."nda_request_files" enable row level security;

create table "public"."negotiation_files" (
    "id" uuid not null default gen_random_uuid(),
    "negotiation_id" uuid,
    "file_name" text not null,
    "file_url" text not null,
    "file_type" text not null,
    "file_size" integer not null,
    "uploaded_by" uuid,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now())
);


alter table "public"."negotiation_files" enable row level security;

create table "public"."negotiation_messages" (
    "id" uuid not null default gen_random_uuid(),
    "proposal_id" uuid not null,
    "sender_id" uuid not null,
    "content" text not null,
    "is_counter_offer" boolean default false,
    "counter_offer_budget" text,
    "counter_offer_timeline" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."negotiation_messages" enable row level security;

create table "public"."proposal_deliverables" (
    "id" uuid not null default gen_random_uuid(),
    "milestone_id" uuid,
    "description" text not null,
    "completed" boolean not null default false,
    "created_at" timestamp with time zone default now()
);


create table "public"."proposal_files" (
    "id" uuid not null default gen_random_uuid(),
    "proposal_id" uuid,
    "name" text not null,
    "size" text,
    "type" text,
    "created_at" timestamp with time zone default now(),
    "user_id" uuid,
    "path" text
);


create table "public"."proposal_milestones" (
    "id" uuid not null default gen_random_uuid(),
    "proposal_id" uuid,
    "name" text not null,
    "description" text,
    "status" text default 'pending'::text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "percentage" numeric,
    "amount" text
);


create table "public"."proposal_nda_signatures" (
    "id" uuid not null default gen_random_uuid(),
    "proposal_id" uuid not null,
    "signer_user_id" uuid not null,
    "signed_at" timestamp with time zone not null default now(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "status" character varying(20) default 'pending'::character varying,
    "approved_by_user_id" uuid,
    "pending_at" timestamp with time zone default now(),
    "approved_at" timestamp with time zone,
    "rejected_at" timestamp with time zone,
    "rejection_reason" text,
    "request_message" text
);


alter table "public"."proposal_nda_signatures" enable row level security;

create table "public"."proposals" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid,
    "smartject_id" uuid,
    "type" text not null,
    "title" text not null,
    "description" text,
    "scope" text,
    "timeline" text,
    "budget" text,
    "deliverables" text,
    "requirements" text,
    "expertise" text,
    "approach" text,
    "team" text,
    "additional_info" text,
    "status" text not null default 'draft'::text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "is_cooperation_proposal" boolean not null default false,
    "private_fields" jsonb default '{}'::jsonb,
    "private_fields_updated_at" timestamp with time zone,
    "private_fields_version" integer default 1
);


create table "public"."smartject_business_functions" (
    "smartject_id" uuid not null,
    "function_id" uuid not null
);


create table "public"."smartject_industries" (
    "smartject_id" uuid not null,
    "industry_id" uuid not null
);


create table "public"."smartject_tags" (
    "smartject_id" uuid not null,
    "tag_id" uuid not null
);


create table "public"."smartject_technologies" (
    "smartject_id" uuid not null,
    "technology_id" uuid not null
);


create table "public"."smartjects" (
    "id" uuid not null default uuid_generate_v4(),
    "title" text not null,
    "mission" text,
    "problematics" text,
    "scope" text,
    "audience" text,
    "how_it_works" text,
    "architecture" text,
    "innovation" text,
    "use_case" text,
    "image_url" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "research_papers" jsonb default '[]'::jsonb
);


create table "public"."tags" (
    "id" uuid not null default uuid_generate_v4(),
    "name" text not null
);


create table "public"."technologies" (
    "id" uuid not null default uuid_generate_v4(),
    "name" text not null
);


create table "public"."user_settings" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "email_notifications" boolean default true,
    "smartject_updates" boolean default true,
    "proposal_matches" boolean default true,
    "contract_updates" boolean default true,
    "marketing_emails" boolean default false,
    "profile_visibility" text default 'public'::text,
    "data_sharing" boolean default false,
    "theme" text default 'system'::text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."user_settings" enable row level security;

create table "public"."users" (
    "id" uuid not null default uuid_generate_v4(),
    "email" text not null,
    "name" text,
    "avatar_url" text,
    "account_type" text not null default 'free'::text,
    "created_at" timestamp with time zone default now(),
    "bio" text,
    "location" text,
    "company" text,
    "website" text
);


alter table "public"."users" enable row level security;

create table "public"."votes" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid,
    "smartject_id" uuid,
    "vote_type" text not null,
    "created_at" timestamp with time zone default now()
);


CREATE UNIQUE INDEX business_functions_name_key ON public.business_functions USING btree (name);

CREATE UNIQUE INDEX business_functions_pkey ON public.business_functions USING btree (id);

CREATE UNIQUE INDEX comments_pkey ON public.comments USING btree (id);

CREATE UNIQUE INDEX contract_activities_pkey ON public.contract_activities USING btree (id);

CREATE UNIQUE INDEX contract_deliverables_pkey ON public.contract_deliverables USING btree (id);

CREATE UNIQUE INDEX contract_documents_pkey ON public.contract_documents USING btree (id);

CREATE UNIQUE INDEX contract_extension_requests_pkey ON public.contract_extension_requests USING btree (id);

CREATE UNIQUE INDEX contract_message_attachments_pkey ON public.contract_message_attachments USING btree (id);

CREATE UNIQUE INDEX contract_messages_pkey ON public.contract_messages USING btree (id);

CREATE UNIQUE INDEX contract_milestone_comments_pkey ON public.contract_milestone_comments USING btree (id);

CREATE UNIQUE INDEX contract_milestone_deliverables_pkey ON public.contract_milestone_deliverables USING btree (id);

CREATE UNIQUE INDEX contract_milestones_pkey ON public.contract_milestones USING btree (id);

CREATE UNIQUE INDEX contract_modification_requests_pkey ON public.contract_modification_requests USING btree (id);

CREATE UNIQUE INDEX contracts_pkey ON public.contracts USING btree (id);

CREATE UNIQUE INDEX deliverables_pkey ON public.deliverables USING btree (id);

CREATE UNIQUE INDEX document_versions_pkey ON public.document_versions USING btree (id);

CREATE INDEX idx_contract_milestone_messages_milestone_id ON public.contract_milestone_messages USING btree (milestone_id);

CREATE INDEX idx_contract_milestone_messages_sender_id ON public.contract_milestone_messages USING btree (sender_id);

CREATE INDEX idx_contract_milestone_status_history_changed_by ON public.contract_milestone_status_history USING btree (changed_by);

CREATE INDEX idx_contract_milestone_status_history_milestone_id ON public.contract_milestone_status_history USING btree (milestone_id);

CREATE INDEX idx_matches_needer_id ON public.matches USING btree (needer_id);

CREATE INDEX idx_matches_provider_id ON public.matches USING btree (provider_id);

CREATE INDEX idx_matches_smartject_provider_needer ON public.matches USING btree (smartject_id, provider_id, needer_id);

CREATE INDEX idx_nda_notifications_recipient ON public.nda_notifications USING btree (recipient_user_id);

CREATE INDEX idx_nda_notifications_type ON public.nda_notifications USING btree (type);

CREATE INDEX idx_nda_notifications_unread ON public.nda_notifications USING btree (recipient_user_id, read_at) WHERE (read_at IS NULL);

CREATE INDEX idx_nda_request_files_signature_id ON public.nda_request_files USING btree (nda_signature_id);

CREATE INDEX idx_nda_request_files_uploaded_at ON public.nda_request_files USING btree (uploaded_at);

CREATE INDEX idx_negotiation_messages_created_at ON public.negotiation_messages USING btree (created_at);

CREATE INDEX idx_negotiation_messages_proposal_id ON public.negotiation_messages USING btree (proposal_id);

CREATE INDEX idx_negotiation_messages_sender_id ON public.negotiation_messages USING btree (sender_id);

CREATE INDEX idx_proposal_nda_signatures_proposal_id ON public.proposal_nda_signatures USING btree (proposal_id);

CREATE INDEX idx_proposal_nda_signatures_proposal_status ON public.proposal_nda_signatures USING btree (proposal_id, status);

CREATE INDEX idx_proposal_nda_signatures_proposal_user ON public.proposal_nda_signatures USING btree (proposal_id, signer_user_id);

CREATE INDEX idx_proposal_nda_signatures_signed_at ON public.proposal_nda_signatures USING btree (signed_at DESC);

CREATE INDEX idx_proposal_nda_signatures_signer_user_id ON public.proposal_nda_signatures USING btree (signer_user_id);

CREATE INDEX idx_proposal_nda_signatures_status ON public.proposal_nda_signatures USING btree (status);

CREATE INDEX idx_proposal_nda_signatures_user_status ON public.proposal_nda_signatures USING btree (signer_user_id, status);

CREATE INDEX idx_proposals_private_fields_updated ON public.proposals USING btree (private_fields_updated_at) WHERE (private_fields_updated_at IS NOT NULL);

CREATE UNIQUE INDEX industries_name_key ON public.industries USING btree (name);

CREATE UNIQUE INDEX industries_pkey ON public.industries USING btree (id);

CREATE UNIQUE INDEX match_proposals_pkey ON public.match_proposals USING btree (match_id, proposal_id);

CREATE UNIQUE INDEX matches_pkey ON public.matches USING btree (id);

CREATE UNIQUE INDEX matches_smartject_provider_needer_unique ON public.matches USING btree (smartject_id, provider_id, needer_id);

CREATE UNIQUE INDEX messages_pkey ON public.messages USING btree (id);

CREATE UNIQUE INDEX milestones_pkey ON public.milestones USING btree (id);

CREATE UNIQUE INDEX nda_notifications_pkey ON public.nda_notifications USING btree (id);

CREATE UNIQUE INDEX nda_request_files_pkey ON public.nda_request_files USING btree (id);

CREATE UNIQUE INDEX negotiation_files_pkey ON public.negotiation_files USING btree (id);

CREATE UNIQUE INDEX negotiation_messages_pkey ON public.negotiation_messages USING btree (id);

CREATE UNIQUE INDEX proposal_deliverables_pkey ON public.proposal_deliverables USING btree (id);

CREATE UNIQUE INDEX proposal_files_pkey ON public.proposal_files USING btree (id);

CREATE UNIQUE INDEX proposal_milestones_pkey ON public.proposal_milestones USING btree (id);

CREATE UNIQUE INDEX proposal_nda_signatures_pkey ON public.proposal_nda_signatures USING btree (id);

CREATE UNIQUE INDEX proposal_nda_signatures_proposal_id_signer_user_id_key ON public.proposal_nda_signatures USING btree (proposal_id, signer_user_id);

CREATE UNIQUE INDEX proposals_pkey ON public.proposals USING btree (id);

CREATE UNIQUE INDEX smartject_business_functions_pkey ON public.smartject_business_functions USING btree (smartject_id, function_id);

CREATE UNIQUE INDEX smartject_industries_pkey ON public.smartject_industries USING btree (smartject_id, industry_id);

CREATE UNIQUE INDEX smartject_tags_pkey ON public.smartject_tags USING btree (smartject_id, tag_id);

CREATE UNIQUE INDEX smartject_technologies_pkey ON public.smartject_technologies USING btree (smartject_id, technology_id);

CREATE UNIQUE INDEX smartjects_pkey ON public.smartjects USING btree (id);

CREATE UNIQUE INDEX tags_name_key ON public.tags USING btree (name);

CREATE UNIQUE INDEX tags_pkey ON public.tags USING btree (id);

CREATE UNIQUE INDEX technologies_name_key ON public.technologies USING btree (name);

CREATE UNIQUE INDEX technologies_pkey ON public.technologies USING btree (id);

CREATE UNIQUE INDEX user_settings_pkey ON public.user_settings USING btree (id);

CREATE UNIQUE INDEX user_settings_user_id_key ON public.user_settings USING btree (user_id);

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

CREATE UNIQUE INDEX votes_pkey ON public.votes USING btree (id);

CREATE UNIQUE INDEX votes_user_id_smartject_id_vote_type_key ON public.votes USING btree (user_id, smartject_id, vote_type);

alter table "public"."business_functions" add constraint "business_functions_pkey" PRIMARY KEY using index "business_functions_pkey";

alter table "public"."comments" add constraint "comments_pkey" PRIMARY KEY using index "comments_pkey";

alter table "public"."contract_activities" add constraint "contract_activities_pkey" PRIMARY KEY using index "contract_activities_pkey";

alter table "public"."contract_deliverables" add constraint "contract_deliverables_pkey" PRIMARY KEY using index "contract_deliverables_pkey";

alter table "public"."contract_documents" add constraint "contract_documents_pkey" PRIMARY KEY using index "contract_documents_pkey";

alter table "public"."contract_extension_requests" add constraint "contract_extension_requests_pkey" PRIMARY KEY using index "contract_extension_requests_pkey";

alter table "public"."contract_message_attachments" add constraint "contract_message_attachments_pkey" PRIMARY KEY using index "contract_message_attachments_pkey";

alter table "public"."contract_messages" add constraint "contract_messages_pkey" PRIMARY KEY using index "contract_messages_pkey";

alter table "public"."contract_milestone_comments" add constraint "contract_milestone_comments_pkey" PRIMARY KEY using index "contract_milestone_comments_pkey";

alter table "public"."contract_milestone_deliverables" add constraint "contract_milestone_deliverables_pkey" PRIMARY KEY using index "contract_milestone_deliverables_pkey";

alter table "public"."contract_milestones" add constraint "contract_milestones_pkey" PRIMARY KEY using index "contract_milestones_pkey";

alter table "public"."contract_modification_requests" add constraint "contract_modification_requests_pkey" PRIMARY KEY using index "contract_modification_requests_pkey";

alter table "public"."contracts" add constraint "contracts_pkey" PRIMARY KEY using index "contracts_pkey";

alter table "public"."deliverables" add constraint "deliverables_pkey" PRIMARY KEY using index "deliverables_pkey";

alter table "public"."document_versions" add constraint "document_versions_pkey" PRIMARY KEY using index "document_versions_pkey";

alter table "public"."industries" add constraint "industries_pkey" PRIMARY KEY using index "industries_pkey";

alter table "public"."match_proposals" add constraint "match_proposals_pkey" PRIMARY KEY using index "match_proposals_pkey";

alter table "public"."matches" add constraint "matches_pkey" PRIMARY KEY using index "matches_pkey";

alter table "public"."messages" add constraint "messages_pkey" PRIMARY KEY using index "messages_pkey";

alter table "public"."milestones" add constraint "milestones_pkey" PRIMARY KEY using index "milestones_pkey";

alter table "public"."nda_notifications" add constraint "nda_notifications_pkey" PRIMARY KEY using index "nda_notifications_pkey";

alter table "public"."nda_request_files" add constraint "nda_request_files_pkey" PRIMARY KEY using index "nda_request_files_pkey";

alter table "public"."negotiation_files" add constraint "negotiation_files_pkey" PRIMARY KEY using index "negotiation_files_pkey";

alter table "public"."negotiation_messages" add constraint "negotiation_messages_pkey" PRIMARY KEY using index "negotiation_messages_pkey";

alter table "public"."proposal_deliverables" add constraint "proposal_deliverables_pkey" PRIMARY KEY using index "proposal_deliverables_pkey";

alter table "public"."proposal_files" add constraint "proposal_files_pkey" PRIMARY KEY using index "proposal_files_pkey";

alter table "public"."proposal_milestones" add constraint "proposal_milestones_pkey" PRIMARY KEY using index "proposal_milestones_pkey";

alter table "public"."proposal_nda_signatures" add constraint "proposal_nda_signatures_pkey" PRIMARY KEY using index "proposal_nda_signatures_pkey";

alter table "public"."proposals" add constraint "proposals_pkey" PRIMARY KEY using index "proposals_pkey";

alter table "public"."smartject_business_functions" add constraint "smartject_business_functions_pkey" PRIMARY KEY using index "smartject_business_functions_pkey";

alter table "public"."smartject_industries" add constraint "smartject_industries_pkey" PRIMARY KEY using index "smartject_industries_pkey";

alter table "public"."smartject_tags" add constraint "smartject_tags_pkey" PRIMARY KEY using index "smartject_tags_pkey";

alter table "public"."smartject_technologies" add constraint "smartject_technologies_pkey" PRIMARY KEY using index "smartject_technologies_pkey";

alter table "public"."smartjects" add constraint "smartjects_pkey" PRIMARY KEY using index "smartjects_pkey";

alter table "public"."tags" add constraint "tags_pkey" PRIMARY KEY using index "tags_pkey";

alter table "public"."technologies" add constraint "technologies_pkey" PRIMARY KEY using index "technologies_pkey";

alter table "public"."user_settings" add constraint "user_settings_pkey" PRIMARY KEY using index "user_settings_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."votes" add constraint "votes_pkey" PRIMARY KEY using index "votes_pkey";

alter table "public"."business_functions" add constraint "business_functions_name_key" UNIQUE using index "business_functions_name_key";

alter table "public"."comments" add constraint "comments_smartject_id_fkey" FOREIGN KEY (smartject_id) REFERENCES smartjects(id) ON DELETE CASCADE not valid;

alter table "public"."comments" validate constraint "comments_smartject_id_fkey";

alter table "public"."comments" add constraint "comments_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."comments" validate constraint "comments_user_id_fkey";

alter table "public"."contract_activities" add constraint "contract_activities_contract_id_fkey" FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE not valid;

alter table "public"."contract_activities" validate constraint "contract_activities_contract_id_fkey";

alter table "public"."contract_activities" add constraint "contract_activities_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL not valid;

alter table "public"."contract_activities" validate constraint "contract_activities_user_id_fkey";

alter table "public"."contract_deliverables" add constraint "contract_deliverables_contract_id_fkey" FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE not valid;

alter table "public"."contract_deliverables" validate constraint "contract_deliverables_contract_id_fkey";

alter table "public"."contract_documents" add constraint "contract_documents_contract_id_fkey" FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE not valid;

alter table "public"."contract_documents" validate constraint "contract_documents_contract_id_fkey";

alter table "public"."contract_documents" add constraint "contract_documents_uploaded_by_fkey" FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."contract_documents" validate constraint "contract_documents_uploaded_by_fkey";

alter table "public"."contract_extension_requests" add constraint "contract_extension_requests_contract_id_fkey" FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE not valid;

alter table "public"."contract_extension_requests" validate constraint "contract_extension_requests_contract_id_fkey";

alter table "public"."contract_extension_requests" add constraint "contract_extension_requests_requested_by_fkey" FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."contract_extension_requests" validate constraint "contract_extension_requests_requested_by_fkey";

alter table "public"."contract_message_attachments" add constraint "contract_message_attachments_message_id_fkey" FOREIGN KEY (message_id) REFERENCES contract_messages(id) ON DELETE CASCADE not valid;

alter table "public"."contract_message_attachments" validate constraint "contract_message_attachments_message_id_fkey";

alter table "public"."contract_messages" add constraint "contract_messages_contract_id_fkey" FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE not valid;

alter table "public"."contract_messages" validate constraint "contract_messages_contract_id_fkey";

alter table "public"."contract_messages" add constraint "contract_messages_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."contract_messages" validate constraint "contract_messages_user_id_fkey";

alter table "public"."contract_milestone_comments" add constraint "contract_milestone_comments_milestone_id_fkey" FOREIGN KEY (milestone_id) REFERENCES contract_milestones(id) ON DELETE CASCADE not valid;

alter table "public"."contract_milestone_comments" validate constraint "contract_milestone_comments_milestone_id_fkey";

alter table "public"."contract_milestone_comments" add constraint "contract_milestone_comments_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."contract_milestone_comments" validate constraint "contract_milestone_comments_user_id_fkey";

alter table "public"."contract_milestone_deliverables" add constraint "contract_milestone_deliverables_milestone_id_fkey" FOREIGN KEY (milestone_id) REFERENCES contract_milestones(id) ON DELETE CASCADE not valid;

alter table "public"."contract_milestone_deliverables" validate constraint "contract_milestone_deliverables_milestone_id_fkey";

alter table "public"."contract_milestone_messages" add constraint "contract_milestone_messages_milestone_id_fkey" FOREIGN KEY (milestone_id) REFERENCES contract_milestones(id) ON DELETE CASCADE not valid;

alter table "public"."contract_milestone_messages" validate constraint "contract_milestone_messages_milestone_id_fkey";

alter table "public"."contract_milestone_messages" add constraint "contract_milestone_messages_sender_id_fkey" FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."contract_milestone_messages" validate constraint "contract_milestone_messages_sender_id_fkey";

alter table "public"."contract_milestone_status_history" add constraint "contract_milestone_status_history_changed_by_fkey" FOREIGN KEY (changed_by) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."contract_milestone_status_history" validate constraint "contract_milestone_status_history_changed_by_fkey";

alter table "public"."contract_milestone_status_history" add constraint "contract_milestone_status_history_milestone_id_fkey" FOREIGN KEY (milestone_id) REFERENCES contract_milestones(id) ON DELETE CASCADE not valid;

alter table "public"."contract_milestone_status_history" validate constraint "contract_milestone_status_history_milestone_id_fkey";

alter table "public"."contract_milestones" add constraint "contract_milestones_contract_id_fkey" FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE not valid;

alter table "public"."contract_milestones" validate constraint "contract_milestones_contract_id_fkey";

alter table "public"."contract_milestones" add constraint "contract_milestones_reviewed_by_fkey" FOREIGN KEY (reviewed_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."contract_milestones" validate constraint "contract_milestones_reviewed_by_fkey";

alter table "public"."contract_milestones" add constraint "contract_milestones_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'in_progress'::text, 'completed'::text, 'overdue'::text, 'pending_review'::text]))) not valid;

alter table "public"."contract_milestones" validate constraint "contract_milestones_status_check";

alter table "public"."contract_milestones" add constraint "contract_milestones_submitted_by_fkey" FOREIGN KEY (submitted_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."contract_milestones" validate constraint "contract_milestones_submitted_by_fkey";

alter table "public"."contract_modification_requests" add constraint "contract_modification_requests_contract_id_fkey" FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE not valid;

alter table "public"."contract_modification_requests" validate constraint "contract_modification_requests_contract_id_fkey";

alter table "public"."contract_modification_requests" add constraint "contract_modification_requests_requested_by_fkey" FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."contract_modification_requests" validate constraint "contract_modification_requests_requested_by_fkey";

alter table "public"."contracts" add constraint "contracts_match_id_fkey" FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE not valid;

alter table "public"."contracts" validate constraint "contracts_match_id_fkey";

alter table "public"."contracts" add constraint "contracts_needer_id_fkey" FOREIGN KEY (needer_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."contracts" validate constraint "contracts_needer_id_fkey";

alter table "public"."contracts" add constraint "contracts_proposal_id_fkey" FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE SET NULL not valid;

alter table "public"."contracts" validate constraint "contracts_proposal_id_fkey";

alter table "public"."contracts" add constraint "contracts_provider_id_fkey" FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."contracts" validate constraint "contracts_provider_id_fkey";

alter table "public"."contracts" add constraint "contracts_status_check" CHECK ((status = ANY (ARRAY['pending_start'::text, 'active'::text, 'completed'::text, 'cancelled'::text]))) not valid;

alter table "public"."contracts" validate constraint "contracts_status_check";

alter table "public"."deliverables" add constraint "deliverables_milestone_id_fkey" FOREIGN KEY (milestone_id) REFERENCES milestones(id) ON DELETE CASCADE not valid;

alter table "public"."deliverables" validate constraint "deliverables_milestone_id_fkey";

alter table "public"."document_versions" add constraint "document_versions_author_fkey" FOREIGN KEY (author) REFERENCES users(id) ON DELETE SET NULL not valid;

alter table "public"."document_versions" validate constraint "document_versions_author_fkey";

alter table "public"."document_versions" add constraint "document_versions_document_id_fkey" FOREIGN KEY (document_id) REFERENCES contract_documents(id) ON DELETE CASCADE not valid;

alter table "public"."document_versions" validate constraint "document_versions_document_id_fkey";

alter table "public"."industries" add constraint "industries_name_key" UNIQUE using index "industries_name_key";

alter table "public"."match_proposals" add constraint "match_proposals_match_id_fkey" FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE not valid;

alter table "public"."match_proposals" validate constraint "match_proposals_match_id_fkey";

alter table "public"."match_proposals" add constraint "match_proposals_proposal_id_fkey" FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE not valid;

alter table "public"."match_proposals" validate constraint "match_proposals_proposal_id_fkey";

alter table "public"."matches" add constraint "matches_needer_id_fkey" FOREIGN KEY (needer_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."matches" validate constraint "matches_needer_id_fkey";

alter table "public"."matches" add constraint "matches_provider_id_fkey" FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."matches" validate constraint "matches_provider_id_fkey";

alter table "public"."matches" add constraint "matches_smartject_id_fkey" FOREIGN KEY (smartject_id) REFERENCES smartjects(id) ON DELETE CASCADE not valid;

alter table "public"."matches" validate constraint "matches_smartject_id_fkey";

alter table "public"."matches" add constraint "matches_smartject_provider_needer_unique" UNIQUE using index "matches_smartject_provider_needer_unique";

alter table "public"."messages" add constraint "messages_match_id_fkey" FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE not valid;

alter table "public"."messages" validate constraint "messages_match_id_fkey";

alter table "public"."messages" add constraint "messages_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."messages" validate constraint "messages_user_id_fkey";

alter table "public"."milestones" add constraint "milestones_proposal_id_fkey" FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE not valid;

alter table "public"."milestones" validate constraint "milestones_proposal_id_fkey";

alter table "public"."milestones" add constraint "milestones_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'in_progress'::text, 'completed'::text, 'overdue'::text, 'pending_review'::text]))) not valid;

alter table "public"."milestones" validate constraint "milestones_status_check";

alter table "public"."nda_notifications" add constraint "nda_notifications_nda_signature_id_fkey" FOREIGN KEY (nda_signature_id) REFERENCES proposal_nda_signatures(id) ON DELETE CASCADE not valid;

alter table "public"."nda_notifications" validate constraint "nda_notifications_nda_signature_id_fkey";

alter table "public"."nda_notifications" add constraint "nda_notifications_recipient_user_id_fkey" FOREIGN KEY (recipient_user_id) REFERENCES users(id) not valid;

alter table "public"."nda_notifications" validate constraint "nda_notifications_recipient_user_id_fkey";

alter table "public"."nda_notifications" add constraint "nda_notifications_type_check" CHECK (((type)::text = ANY ((ARRAY['nda_request_submitted'::character varying, 'nda_approved'::character varying, 'nda_rejected'::character varying])::text[]))) not valid;

alter table "public"."nda_notifications" validate constraint "nda_notifications_type_check";

alter table "public"."nda_request_files" add constraint "nda_request_files_nda_signature_id_fkey" FOREIGN KEY (nda_signature_id) REFERENCES proposal_nda_signatures(id) ON DELETE CASCADE not valid;

alter table "public"."nda_request_files" validate constraint "nda_request_files_nda_signature_id_fkey";

alter table "public"."negotiation_files" add constraint "negotiation_files_negotiation_id_fkey" FOREIGN KEY (negotiation_id) REFERENCES negotiation_messages(id) ON DELETE CASCADE not valid;

alter table "public"."negotiation_files" validate constraint "negotiation_files_negotiation_id_fkey";

alter table "public"."negotiation_files" add constraint "negotiation_files_uploaded_by_fkey" FOREIGN KEY (uploaded_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."negotiation_files" validate constraint "negotiation_files_uploaded_by_fkey";

alter table "public"."negotiation_messages" add constraint "negotiation_messages_proposal_id_fkey" FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE not valid;

alter table "public"."negotiation_messages" validate constraint "negotiation_messages_proposal_id_fkey";

alter table "public"."negotiation_messages" add constraint "negotiation_messages_sender_id_fkey" FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."negotiation_messages" validate constraint "negotiation_messages_sender_id_fkey";

alter table "public"."proposal_deliverables" add constraint "proposal_deliverables_milestone_id_fkey" FOREIGN KEY (milestone_id) REFERENCES proposal_milestones(id) ON DELETE CASCADE not valid;

alter table "public"."proposal_deliverables" validate constraint "proposal_deliverables_milestone_id_fkey";

alter table "public"."proposal_files" add constraint "fk_proposal" FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE not valid;

alter table "public"."proposal_files" validate constraint "fk_proposal";

alter table "public"."proposal_files" add constraint "proposal_files_proposal_id_fkey" FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE not valid;

alter table "public"."proposal_files" validate constraint "proposal_files_proposal_id_fkey";

alter table "public"."proposal_files" add constraint "proposal_files_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."proposal_files" validate constraint "proposal_files_user_id_fkey";

alter table "public"."proposal_milestones" add constraint "proposal_milestones_proposal_id_fkey" FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE not valid;

alter table "public"."proposal_milestones" validate constraint "proposal_milestones_proposal_id_fkey";

alter table "public"."proposal_nda_signatures" add constraint "proposal_nda_signatures_approved_by_user_id_fkey" FOREIGN KEY (approved_by_user_id) REFERENCES users(id) not valid;

alter table "public"."proposal_nda_signatures" validate constraint "proposal_nda_signatures_approved_by_user_id_fkey";

alter table "public"."proposal_nda_signatures" add constraint "proposal_nda_signatures_proposal_id_fkey" FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE not valid;

alter table "public"."proposal_nda_signatures" validate constraint "proposal_nda_signatures_proposal_id_fkey";

alter table "public"."proposal_nda_signatures" add constraint "proposal_nda_signatures_proposal_id_signer_user_id_key" UNIQUE using index "proposal_nda_signatures_proposal_id_signer_user_id_key";

alter table "public"."proposal_nda_signatures" add constraint "proposal_nda_signatures_signer_user_id_fkey" FOREIGN KEY (signer_user_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."proposal_nda_signatures" validate constraint "proposal_nda_signatures_signer_user_id_fkey";

alter table "public"."proposal_nda_signatures" add constraint "proposal_nda_signatures_status_check" CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying])::text[]))) not valid;

alter table "public"."proposal_nda_signatures" validate constraint "proposal_nda_signatures_status_check";

alter table "public"."proposals" add constraint "proposals_smartject_id_fkey" FOREIGN KEY (smartject_id) REFERENCES smartjects(id) ON DELETE CASCADE not valid;

alter table "public"."proposals" validate constraint "proposals_smartject_id_fkey";

alter table "public"."proposals" add constraint "proposals_status_check" CHECK ((status = ANY (ARRAY['draft'::text, 'submitted'::text, 'accepted'::text, 'rejected'::text]))) not valid;

alter table "public"."proposals" validate constraint "proposals_status_check";

alter table "public"."proposals" add constraint "proposals_type_check" CHECK ((type = ANY (ARRAY['need'::text, 'provide'::text]))) not valid;

alter table "public"."proposals" validate constraint "proposals_type_check";

alter table "public"."proposals" add constraint "proposals_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."proposals" validate constraint "proposals_user_id_fkey";

alter table "public"."smartject_business_functions" add constraint "smartject_business_functions_function_id_fkey" FOREIGN KEY (function_id) REFERENCES business_functions(id) ON DELETE CASCADE not valid;

alter table "public"."smartject_business_functions" validate constraint "smartject_business_functions_function_id_fkey";

alter table "public"."smartject_business_functions" add constraint "smartject_business_functions_smartject_id_fkey" FOREIGN KEY (smartject_id) REFERENCES smartjects(id) ON DELETE CASCADE not valid;

alter table "public"."smartject_business_functions" validate constraint "smartject_business_functions_smartject_id_fkey";

alter table "public"."smartject_industries" add constraint "smartject_industries_industry_id_fkey" FOREIGN KEY (industry_id) REFERENCES industries(id) ON DELETE CASCADE not valid;

alter table "public"."smartject_industries" validate constraint "smartject_industries_industry_id_fkey";

alter table "public"."smartject_industries" add constraint "smartject_industries_smartject_id_fkey" FOREIGN KEY (smartject_id) REFERENCES smartjects(id) ON DELETE CASCADE not valid;

alter table "public"."smartject_industries" validate constraint "smartject_industries_smartject_id_fkey";

alter table "public"."smartject_tags" add constraint "smartject_tags_smartject_id_fkey" FOREIGN KEY (smartject_id) REFERENCES smartjects(id) ON DELETE CASCADE not valid;

alter table "public"."smartject_tags" validate constraint "smartject_tags_smartject_id_fkey";

alter table "public"."smartject_tags" add constraint "smartject_tags_tag_id_fkey" FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE not valid;

alter table "public"."smartject_tags" validate constraint "smartject_tags_tag_id_fkey";

alter table "public"."smartject_technologies" add constraint "smartject_technologies_smartject_id_fkey" FOREIGN KEY (smartject_id) REFERENCES smartjects(id) ON DELETE CASCADE not valid;

alter table "public"."smartject_technologies" validate constraint "smartject_technologies_smartject_id_fkey";

alter table "public"."smartject_technologies" add constraint "smartject_technologies_technology_id_fkey" FOREIGN KEY (technology_id) REFERENCES technologies(id) ON DELETE CASCADE not valid;

alter table "public"."smartject_technologies" validate constraint "smartject_technologies_technology_id_fkey";

alter table "public"."tags" add constraint "tags_name_key" UNIQUE using index "tags_name_key";

alter table "public"."technologies" add constraint "technologies_name_key" UNIQUE using index "technologies_name_key";

alter table "public"."user_settings" add constraint "user_settings_profile_visibility_check" CHECK ((profile_visibility = ANY (ARRAY['public'::text, 'registered'::text, 'private'::text]))) not valid;

alter table "public"."user_settings" validate constraint "user_settings_profile_visibility_check";

alter table "public"."user_settings" add constraint "user_settings_theme_check" CHECK ((theme = ANY (ARRAY['light'::text, 'dark'::text, 'system'::text]))) not valid;

alter table "public"."user_settings" validate constraint "user_settings_theme_check";

alter table "public"."user_settings" add constraint "user_settings_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."user_settings" validate constraint "user_settings_user_id_fkey";

alter table "public"."user_settings" add constraint "user_settings_user_id_key" UNIQUE using index "user_settings_user_id_key";

alter table "public"."users" add constraint "users_email_key" UNIQUE using index "users_email_key";

alter table "public"."votes" add constraint "votes_smartject_id_fkey" FOREIGN KEY (smartject_id) REFERENCES smartjects(id) ON DELETE CASCADE not valid;

alter table "public"."votes" validate constraint "votes_smartject_id_fkey";

alter table "public"."votes" add constraint "votes_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."votes" validate constraint "votes_user_id_fkey";

alter table "public"."votes" add constraint "votes_user_id_smartject_id_vote_type_key" UNIQUE using index "votes_user_id_smartject_id_vote_type_key";

alter table "public"."votes" add constraint "votes_vote_type_check" CHECK ((vote_type = ANY (ARRAY['believe'::text, 'need'::text, 'provide'::text]))) not valid;

alter table "public"."votes" validate constraint "votes_vote_type_check";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.can_view_private_fields(proposal_row proposals)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.create_nda_notification()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
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
$function$
;

create or replace view "public"."nda_requests_summary" as  SELECT pns.id,
    pns.proposal_id,
    pns.signer_user_id,
    pns.status,
    pns.request_message,
    pns.pending_at,
    pns.approved_at,
    pns.rejected_at,
    pns.rejection_reason,
    pns.approved_by_user_id,
    p.title AS proposal_title,
    p.user_id AS proposal_owner_id,
    u_signer.name AS signer_name,
    u_signer.email AS signer_email,
    u_signer.avatar_url AS signer_avatar,
    u_approver.name AS approver_name,
    count(nrf.id) AS attached_files_count
   FROM ((((proposal_nda_signatures pns
     JOIN proposals p ON ((p.id = pns.proposal_id)))
     JOIN users u_signer ON ((u_signer.id = pns.signer_user_id)))
     LEFT JOIN users u_approver ON ((u_approver.id = pns.approved_by_user_id)))
     LEFT JOIN nda_request_files nrf ON ((nrf.nda_signature_id = pns.id)))
  GROUP BY pns.id, pns.proposal_id, pns.signer_user_id, pns.status, pns.request_message, pns.pending_at, pns.approved_at, pns.rejected_at, pns.rejection_reason, pns.approved_by_user_id, p.title, p.user_id, u_signer.name, u_signer.email, u_signer.avatar_url, u_approver.name;


CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

grant delete on table "public"."business_functions" to "anon";

grant insert on table "public"."business_functions" to "anon";

grant references on table "public"."business_functions" to "anon";

grant select on table "public"."business_functions" to "anon";

grant trigger on table "public"."business_functions" to "anon";

grant truncate on table "public"."business_functions" to "anon";

grant update on table "public"."business_functions" to "anon";

grant delete on table "public"."business_functions" to "authenticated";

grant insert on table "public"."business_functions" to "authenticated";

grant references on table "public"."business_functions" to "authenticated";

grant select on table "public"."business_functions" to "authenticated";

grant trigger on table "public"."business_functions" to "authenticated";

grant truncate on table "public"."business_functions" to "authenticated";

grant update on table "public"."business_functions" to "authenticated";

grant delete on table "public"."business_functions" to "service_role";

grant insert on table "public"."business_functions" to "service_role";

grant references on table "public"."business_functions" to "service_role";

grant select on table "public"."business_functions" to "service_role";

grant trigger on table "public"."business_functions" to "service_role";

grant truncate on table "public"."business_functions" to "service_role";

grant update on table "public"."business_functions" to "service_role";

grant delete on table "public"."comments" to "anon";

grant insert on table "public"."comments" to "anon";

grant references on table "public"."comments" to "anon";

grant select on table "public"."comments" to "anon";

grant trigger on table "public"."comments" to "anon";

grant truncate on table "public"."comments" to "anon";

grant update on table "public"."comments" to "anon";

grant delete on table "public"."comments" to "authenticated";

grant insert on table "public"."comments" to "authenticated";

grant references on table "public"."comments" to "authenticated";

grant select on table "public"."comments" to "authenticated";

grant trigger on table "public"."comments" to "authenticated";

grant truncate on table "public"."comments" to "authenticated";

grant update on table "public"."comments" to "authenticated";

grant delete on table "public"."comments" to "service_role";

grant insert on table "public"."comments" to "service_role";

grant references on table "public"."comments" to "service_role";

grant select on table "public"."comments" to "service_role";

grant trigger on table "public"."comments" to "service_role";

grant truncate on table "public"."comments" to "service_role";

grant update on table "public"."comments" to "service_role";

grant delete on table "public"."contract_activities" to "anon";

grant insert on table "public"."contract_activities" to "anon";

grant references on table "public"."contract_activities" to "anon";

grant select on table "public"."contract_activities" to "anon";

grant trigger on table "public"."contract_activities" to "anon";

grant truncate on table "public"."contract_activities" to "anon";

grant update on table "public"."contract_activities" to "anon";

grant delete on table "public"."contract_activities" to "authenticated";

grant insert on table "public"."contract_activities" to "authenticated";

grant references on table "public"."contract_activities" to "authenticated";

grant select on table "public"."contract_activities" to "authenticated";

grant trigger on table "public"."contract_activities" to "authenticated";

grant truncate on table "public"."contract_activities" to "authenticated";

grant update on table "public"."contract_activities" to "authenticated";

grant delete on table "public"."contract_activities" to "service_role";

grant insert on table "public"."contract_activities" to "service_role";

grant references on table "public"."contract_activities" to "service_role";

grant select on table "public"."contract_activities" to "service_role";

grant trigger on table "public"."contract_activities" to "service_role";

grant truncate on table "public"."contract_activities" to "service_role";

grant update on table "public"."contract_activities" to "service_role";

grant delete on table "public"."contract_deliverables" to "anon";

grant insert on table "public"."contract_deliverables" to "anon";

grant references on table "public"."contract_deliverables" to "anon";

grant select on table "public"."contract_deliverables" to "anon";

grant trigger on table "public"."contract_deliverables" to "anon";

grant truncate on table "public"."contract_deliverables" to "anon";

grant update on table "public"."contract_deliverables" to "anon";

grant delete on table "public"."contract_deliverables" to "authenticated";

grant insert on table "public"."contract_deliverables" to "authenticated";

grant references on table "public"."contract_deliverables" to "authenticated";

grant select on table "public"."contract_deliverables" to "authenticated";

grant trigger on table "public"."contract_deliverables" to "authenticated";

grant truncate on table "public"."contract_deliverables" to "authenticated";

grant update on table "public"."contract_deliverables" to "authenticated";

grant delete on table "public"."contract_deliverables" to "service_role";

grant insert on table "public"."contract_deliverables" to "service_role";

grant references on table "public"."contract_deliverables" to "service_role";

grant select on table "public"."contract_deliverables" to "service_role";

grant trigger on table "public"."contract_deliverables" to "service_role";

grant truncate on table "public"."contract_deliverables" to "service_role";

grant update on table "public"."contract_deliverables" to "service_role";

grant delete on table "public"."contract_documents" to "anon";

grant insert on table "public"."contract_documents" to "anon";

grant references on table "public"."contract_documents" to "anon";

grant select on table "public"."contract_documents" to "anon";

grant trigger on table "public"."contract_documents" to "anon";

grant truncate on table "public"."contract_documents" to "anon";

grant update on table "public"."contract_documents" to "anon";

grant delete on table "public"."contract_documents" to "authenticated";

grant insert on table "public"."contract_documents" to "authenticated";

grant references on table "public"."contract_documents" to "authenticated";

grant select on table "public"."contract_documents" to "authenticated";

grant trigger on table "public"."contract_documents" to "authenticated";

grant truncate on table "public"."contract_documents" to "authenticated";

grant update on table "public"."contract_documents" to "authenticated";

grant delete on table "public"."contract_documents" to "service_role";

grant insert on table "public"."contract_documents" to "service_role";

grant references on table "public"."contract_documents" to "service_role";

grant select on table "public"."contract_documents" to "service_role";

grant trigger on table "public"."contract_documents" to "service_role";

grant truncate on table "public"."contract_documents" to "service_role";

grant update on table "public"."contract_documents" to "service_role";

grant delete on table "public"."contract_extension_requests" to "anon";

grant insert on table "public"."contract_extension_requests" to "anon";

grant references on table "public"."contract_extension_requests" to "anon";

grant select on table "public"."contract_extension_requests" to "anon";

grant trigger on table "public"."contract_extension_requests" to "anon";

grant truncate on table "public"."contract_extension_requests" to "anon";

grant update on table "public"."contract_extension_requests" to "anon";

grant delete on table "public"."contract_extension_requests" to "authenticated";

grant insert on table "public"."contract_extension_requests" to "authenticated";

grant references on table "public"."contract_extension_requests" to "authenticated";

grant select on table "public"."contract_extension_requests" to "authenticated";

grant trigger on table "public"."contract_extension_requests" to "authenticated";

grant truncate on table "public"."contract_extension_requests" to "authenticated";

grant update on table "public"."contract_extension_requests" to "authenticated";

grant delete on table "public"."contract_extension_requests" to "service_role";

grant insert on table "public"."contract_extension_requests" to "service_role";

grant references on table "public"."contract_extension_requests" to "service_role";

grant select on table "public"."contract_extension_requests" to "service_role";

grant trigger on table "public"."contract_extension_requests" to "service_role";

grant truncate on table "public"."contract_extension_requests" to "service_role";

grant update on table "public"."contract_extension_requests" to "service_role";

grant delete on table "public"."contract_message_attachments" to "anon";

grant insert on table "public"."contract_message_attachments" to "anon";

grant references on table "public"."contract_message_attachments" to "anon";

grant select on table "public"."contract_message_attachments" to "anon";

grant trigger on table "public"."contract_message_attachments" to "anon";

grant truncate on table "public"."contract_message_attachments" to "anon";

grant update on table "public"."contract_message_attachments" to "anon";

grant delete on table "public"."contract_message_attachments" to "authenticated";

grant insert on table "public"."contract_message_attachments" to "authenticated";

grant references on table "public"."contract_message_attachments" to "authenticated";

grant select on table "public"."contract_message_attachments" to "authenticated";

grant trigger on table "public"."contract_message_attachments" to "authenticated";

grant truncate on table "public"."contract_message_attachments" to "authenticated";

grant update on table "public"."contract_message_attachments" to "authenticated";

grant delete on table "public"."contract_message_attachments" to "service_role";

grant insert on table "public"."contract_message_attachments" to "service_role";

grant references on table "public"."contract_message_attachments" to "service_role";

grant select on table "public"."contract_message_attachments" to "service_role";

grant trigger on table "public"."contract_message_attachments" to "service_role";

grant truncate on table "public"."contract_message_attachments" to "service_role";

grant update on table "public"."contract_message_attachments" to "service_role";

grant delete on table "public"."contract_messages" to "anon";

grant insert on table "public"."contract_messages" to "anon";

grant references on table "public"."contract_messages" to "anon";

grant select on table "public"."contract_messages" to "anon";

grant trigger on table "public"."contract_messages" to "anon";

grant truncate on table "public"."contract_messages" to "anon";

grant update on table "public"."contract_messages" to "anon";

grant delete on table "public"."contract_messages" to "authenticated";

grant insert on table "public"."contract_messages" to "authenticated";

grant references on table "public"."contract_messages" to "authenticated";

grant select on table "public"."contract_messages" to "authenticated";

grant trigger on table "public"."contract_messages" to "authenticated";

grant truncate on table "public"."contract_messages" to "authenticated";

grant update on table "public"."contract_messages" to "authenticated";

grant delete on table "public"."contract_messages" to "service_role";

grant insert on table "public"."contract_messages" to "service_role";

grant references on table "public"."contract_messages" to "service_role";

grant select on table "public"."contract_messages" to "service_role";

grant trigger on table "public"."contract_messages" to "service_role";

grant truncate on table "public"."contract_messages" to "service_role";

grant update on table "public"."contract_messages" to "service_role";

grant delete on table "public"."contract_milestone_comments" to "anon";

grant insert on table "public"."contract_milestone_comments" to "anon";

grant references on table "public"."contract_milestone_comments" to "anon";

grant select on table "public"."contract_milestone_comments" to "anon";

grant trigger on table "public"."contract_milestone_comments" to "anon";

grant truncate on table "public"."contract_milestone_comments" to "anon";

grant update on table "public"."contract_milestone_comments" to "anon";

grant delete on table "public"."contract_milestone_comments" to "authenticated";

grant insert on table "public"."contract_milestone_comments" to "authenticated";

grant references on table "public"."contract_milestone_comments" to "authenticated";

grant select on table "public"."contract_milestone_comments" to "authenticated";

grant trigger on table "public"."contract_milestone_comments" to "authenticated";

grant truncate on table "public"."contract_milestone_comments" to "authenticated";

grant update on table "public"."contract_milestone_comments" to "authenticated";

grant delete on table "public"."contract_milestone_comments" to "service_role";

grant insert on table "public"."contract_milestone_comments" to "service_role";

grant references on table "public"."contract_milestone_comments" to "service_role";

grant select on table "public"."contract_milestone_comments" to "service_role";

grant trigger on table "public"."contract_milestone_comments" to "service_role";

grant truncate on table "public"."contract_milestone_comments" to "service_role";

grant update on table "public"."contract_milestone_comments" to "service_role";

grant delete on table "public"."contract_milestone_deliverables" to "anon";

grant insert on table "public"."contract_milestone_deliverables" to "anon";

grant references on table "public"."contract_milestone_deliverables" to "anon";

grant select on table "public"."contract_milestone_deliverables" to "anon";

grant trigger on table "public"."contract_milestone_deliverables" to "anon";

grant truncate on table "public"."contract_milestone_deliverables" to "anon";

grant update on table "public"."contract_milestone_deliverables" to "anon";

grant delete on table "public"."contract_milestone_deliverables" to "authenticated";

grant insert on table "public"."contract_milestone_deliverables" to "authenticated";

grant references on table "public"."contract_milestone_deliverables" to "authenticated";

grant select on table "public"."contract_milestone_deliverables" to "authenticated";

grant trigger on table "public"."contract_milestone_deliverables" to "authenticated";

grant truncate on table "public"."contract_milestone_deliverables" to "authenticated";

grant update on table "public"."contract_milestone_deliverables" to "authenticated";

grant delete on table "public"."contract_milestone_deliverables" to "service_role";

grant insert on table "public"."contract_milestone_deliverables" to "service_role";

grant references on table "public"."contract_milestone_deliverables" to "service_role";

grant select on table "public"."contract_milestone_deliverables" to "service_role";

grant trigger on table "public"."contract_milestone_deliverables" to "service_role";

grant truncate on table "public"."contract_milestone_deliverables" to "service_role";

grant update on table "public"."contract_milestone_deliverables" to "service_role";

grant delete on table "public"."contract_milestone_messages" to "anon";

grant insert on table "public"."contract_milestone_messages" to "anon";

grant references on table "public"."contract_milestone_messages" to "anon";

grant select on table "public"."contract_milestone_messages" to "anon";

grant trigger on table "public"."contract_milestone_messages" to "anon";

grant truncate on table "public"."contract_milestone_messages" to "anon";

grant update on table "public"."contract_milestone_messages" to "anon";

grant delete on table "public"."contract_milestone_messages" to "authenticated";

grant insert on table "public"."contract_milestone_messages" to "authenticated";

grant references on table "public"."contract_milestone_messages" to "authenticated";

grant select on table "public"."contract_milestone_messages" to "authenticated";

grant trigger on table "public"."contract_milestone_messages" to "authenticated";

grant truncate on table "public"."contract_milestone_messages" to "authenticated";

grant update on table "public"."contract_milestone_messages" to "authenticated";

grant delete on table "public"."contract_milestone_messages" to "service_role";

grant insert on table "public"."contract_milestone_messages" to "service_role";

grant references on table "public"."contract_milestone_messages" to "service_role";

grant select on table "public"."contract_milestone_messages" to "service_role";

grant trigger on table "public"."contract_milestone_messages" to "service_role";

grant truncate on table "public"."contract_milestone_messages" to "service_role";

grant update on table "public"."contract_milestone_messages" to "service_role";

grant delete on table "public"."contract_milestone_status_history" to "anon";

grant insert on table "public"."contract_milestone_status_history" to "anon";

grant references on table "public"."contract_milestone_status_history" to "anon";

grant select on table "public"."contract_milestone_status_history" to "anon";

grant trigger on table "public"."contract_milestone_status_history" to "anon";

grant truncate on table "public"."contract_milestone_status_history" to "anon";

grant update on table "public"."contract_milestone_status_history" to "anon";

grant delete on table "public"."contract_milestone_status_history" to "authenticated";

grant insert on table "public"."contract_milestone_status_history" to "authenticated";

grant references on table "public"."contract_milestone_status_history" to "authenticated";

grant select on table "public"."contract_milestone_status_history" to "authenticated";

grant trigger on table "public"."contract_milestone_status_history" to "authenticated";

grant truncate on table "public"."contract_milestone_status_history" to "authenticated";

grant update on table "public"."contract_milestone_status_history" to "authenticated";

grant delete on table "public"."contract_milestone_status_history" to "service_role";

grant insert on table "public"."contract_milestone_status_history" to "service_role";

grant references on table "public"."contract_milestone_status_history" to "service_role";

grant select on table "public"."contract_milestone_status_history" to "service_role";

grant trigger on table "public"."contract_milestone_status_history" to "service_role";

grant truncate on table "public"."contract_milestone_status_history" to "service_role";

grant update on table "public"."contract_milestone_status_history" to "service_role";

grant delete on table "public"."contract_milestones" to "anon";

grant insert on table "public"."contract_milestones" to "anon";

grant references on table "public"."contract_milestones" to "anon";

grant select on table "public"."contract_milestones" to "anon";

grant trigger on table "public"."contract_milestones" to "anon";

grant truncate on table "public"."contract_milestones" to "anon";

grant update on table "public"."contract_milestones" to "anon";

grant delete on table "public"."contract_milestones" to "authenticated";

grant insert on table "public"."contract_milestones" to "authenticated";

grant references on table "public"."contract_milestones" to "authenticated";

grant select on table "public"."contract_milestones" to "authenticated";

grant trigger on table "public"."contract_milestones" to "authenticated";

grant truncate on table "public"."contract_milestones" to "authenticated";

grant update on table "public"."contract_milestones" to "authenticated";

grant delete on table "public"."contract_milestones" to "service_role";

grant insert on table "public"."contract_milestones" to "service_role";

grant references on table "public"."contract_milestones" to "service_role";

grant select on table "public"."contract_milestones" to "service_role";

grant trigger on table "public"."contract_milestones" to "service_role";

grant truncate on table "public"."contract_milestones" to "service_role";

grant update on table "public"."contract_milestones" to "service_role";

grant delete on table "public"."contract_modification_requests" to "anon";

grant insert on table "public"."contract_modification_requests" to "anon";

grant references on table "public"."contract_modification_requests" to "anon";

grant select on table "public"."contract_modification_requests" to "anon";

grant trigger on table "public"."contract_modification_requests" to "anon";

grant truncate on table "public"."contract_modification_requests" to "anon";

grant update on table "public"."contract_modification_requests" to "anon";

grant delete on table "public"."contract_modification_requests" to "authenticated";

grant insert on table "public"."contract_modification_requests" to "authenticated";

grant references on table "public"."contract_modification_requests" to "authenticated";

grant select on table "public"."contract_modification_requests" to "authenticated";

grant trigger on table "public"."contract_modification_requests" to "authenticated";

grant truncate on table "public"."contract_modification_requests" to "authenticated";

grant update on table "public"."contract_modification_requests" to "authenticated";

grant delete on table "public"."contract_modification_requests" to "service_role";

grant insert on table "public"."contract_modification_requests" to "service_role";

grant references on table "public"."contract_modification_requests" to "service_role";

grant select on table "public"."contract_modification_requests" to "service_role";

grant trigger on table "public"."contract_modification_requests" to "service_role";

grant truncate on table "public"."contract_modification_requests" to "service_role";

grant update on table "public"."contract_modification_requests" to "service_role";

grant delete on table "public"."contracts" to "anon";

grant insert on table "public"."contracts" to "anon";

grant references on table "public"."contracts" to "anon";

grant select on table "public"."contracts" to "anon";

grant trigger on table "public"."contracts" to "anon";

grant truncate on table "public"."contracts" to "anon";

grant update on table "public"."contracts" to "anon";

grant delete on table "public"."contracts" to "authenticated";

grant insert on table "public"."contracts" to "authenticated";

grant references on table "public"."contracts" to "authenticated";

grant select on table "public"."contracts" to "authenticated";

grant trigger on table "public"."contracts" to "authenticated";

grant truncate on table "public"."contracts" to "authenticated";

grant update on table "public"."contracts" to "authenticated";

grant delete on table "public"."contracts" to "service_role";

grant insert on table "public"."contracts" to "service_role";

grant references on table "public"."contracts" to "service_role";

grant select on table "public"."contracts" to "service_role";

grant trigger on table "public"."contracts" to "service_role";

grant truncate on table "public"."contracts" to "service_role";

grant update on table "public"."contracts" to "service_role";

grant delete on table "public"."deliverables" to "anon";

grant insert on table "public"."deliverables" to "anon";

grant references on table "public"."deliverables" to "anon";

grant select on table "public"."deliverables" to "anon";

grant trigger on table "public"."deliverables" to "anon";

grant truncate on table "public"."deliverables" to "anon";

grant update on table "public"."deliverables" to "anon";

grant delete on table "public"."deliverables" to "authenticated";

grant insert on table "public"."deliverables" to "authenticated";

grant references on table "public"."deliverables" to "authenticated";

grant select on table "public"."deliverables" to "authenticated";

grant trigger on table "public"."deliverables" to "authenticated";

grant truncate on table "public"."deliverables" to "authenticated";

grant update on table "public"."deliverables" to "authenticated";

grant delete on table "public"."deliverables" to "service_role";

grant insert on table "public"."deliverables" to "service_role";

grant references on table "public"."deliverables" to "service_role";

grant select on table "public"."deliverables" to "service_role";

grant trigger on table "public"."deliverables" to "service_role";

grant truncate on table "public"."deliverables" to "service_role";

grant update on table "public"."deliverables" to "service_role";

grant delete on table "public"."document_versions" to "anon";

grant insert on table "public"."document_versions" to "anon";

grant references on table "public"."document_versions" to "anon";

grant select on table "public"."document_versions" to "anon";

grant trigger on table "public"."document_versions" to "anon";

grant truncate on table "public"."document_versions" to "anon";

grant update on table "public"."document_versions" to "anon";

grant delete on table "public"."document_versions" to "authenticated";

grant insert on table "public"."document_versions" to "authenticated";

grant references on table "public"."document_versions" to "authenticated";

grant select on table "public"."document_versions" to "authenticated";

grant trigger on table "public"."document_versions" to "authenticated";

grant truncate on table "public"."document_versions" to "authenticated";

grant update on table "public"."document_versions" to "authenticated";

grant delete on table "public"."document_versions" to "service_role";

grant insert on table "public"."document_versions" to "service_role";

grant references on table "public"."document_versions" to "service_role";

grant select on table "public"."document_versions" to "service_role";

grant trigger on table "public"."document_versions" to "service_role";

grant truncate on table "public"."document_versions" to "service_role";

grant update on table "public"."document_versions" to "service_role";

grant delete on table "public"."industries" to "anon";

grant insert on table "public"."industries" to "anon";

grant references on table "public"."industries" to "anon";

grant select on table "public"."industries" to "anon";

grant trigger on table "public"."industries" to "anon";

grant truncate on table "public"."industries" to "anon";

grant update on table "public"."industries" to "anon";

grant delete on table "public"."industries" to "authenticated";

grant insert on table "public"."industries" to "authenticated";

grant references on table "public"."industries" to "authenticated";

grant select on table "public"."industries" to "authenticated";

grant trigger on table "public"."industries" to "authenticated";

grant truncate on table "public"."industries" to "authenticated";

grant update on table "public"."industries" to "authenticated";

grant delete on table "public"."industries" to "service_role";

grant insert on table "public"."industries" to "service_role";

grant references on table "public"."industries" to "service_role";

grant select on table "public"."industries" to "service_role";

grant trigger on table "public"."industries" to "service_role";

grant truncate on table "public"."industries" to "service_role";

grant update on table "public"."industries" to "service_role";

grant delete on table "public"."match_proposals" to "anon";

grant insert on table "public"."match_proposals" to "anon";

grant references on table "public"."match_proposals" to "anon";

grant select on table "public"."match_proposals" to "anon";

grant trigger on table "public"."match_proposals" to "anon";

grant truncate on table "public"."match_proposals" to "anon";

grant update on table "public"."match_proposals" to "anon";

grant delete on table "public"."match_proposals" to "authenticated";

grant insert on table "public"."match_proposals" to "authenticated";

grant references on table "public"."match_proposals" to "authenticated";

grant select on table "public"."match_proposals" to "authenticated";

grant trigger on table "public"."match_proposals" to "authenticated";

grant truncate on table "public"."match_proposals" to "authenticated";

grant update on table "public"."match_proposals" to "authenticated";

grant delete on table "public"."match_proposals" to "service_role";

grant insert on table "public"."match_proposals" to "service_role";

grant references on table "public"."match_proposals" to "service_role";

grant select on table "public"."match_proposals" to "service_role";

grant trigger on table "public"."match_proposals" to "service_role";

grant truncate on table "public"."match_proposals" to "service_role";

grant update on table "public"."match_proposals" to "service_role";

grant delete on table "public"."matches" to "anon";

grant insert on table "public"."matches" to "anon";

grant references on table "public"."matches" to "anon";

grant select on table "public"."matches" to "anon";

grant trigger on table "public"."matches" to "anon";

grant truncate on table "public"."matches" to "anon";

grant update on table "public"."matches" to "anon";

grant delete on table "public"."matches" to "authenticated";

grant insert on table "public"."matches" to "authenticated";

grant references on table "public"."matches" to "authenticated";

grant select on table "public"."matches" to "authenticated";

grant trigger on table "public"."matches" to "authenticated";

grant truncate on table "public"."matches" to "authenticated";

grant update on table "public"."matches" to "authenticated";

grant delete on table "public"."matches" to "service_role";

grant insert on table "public"."matches" to "service_role";

grant references on table "public"."matches" to "service_role";

grant select on table "public"."matches" to "service_role";

grant trigger on table "public"."matches" to "service_role";

grant truncate on table "public"."matches" to "service_role";

grant update on table "public"."matches" to "service_role";

grant delete on table "public"."messages" to "anon";

grant insert on table "public"."messages" to "anon";

grant references on table "public"."messages" to "anon";

grant select on table "public"."messages" to "anon";

grant trigger on table "public"."messages" to "anon";

grant truncate on table "public"."messages" to "anon";

grant update on table "public"."messages" to "anon";

grant delete on table "public"."messages" to "authenticated";

grant insert on table "public"."messages" to "authenticated";

grant references on table "public"."messages" to "authenticated";

grant select on table "public"."messages" to "authenticated";

grant trigger on table "public"."messages" to "authenticated";

grant truncate on table "public"."messages" to "authenticated";

grant update on table "public"."messages" to "authenticated";

grant delete on table "public"."messages" to "service_role";

grant insert on table "public"."messages" to "service_role";

grant references on table "public"."messages" to "service_role";

grant select on table "public"."messages" to "service_role";

grant trigger on table "public"."messages" to "service_role";

grant truncate on table "public"."messages" to "service_role";

grant update on table "public"."messages" to "service_role";

grant delete on table "public"."milestones" to "anon";

grant insert on table "public"."milestones" to "anon";

grant references on table "public"."milestones" to "anon";

grant select on table "public"."milestones" to "anon";

grant trigger on table "public"."milestones" to "anon";

grant truncate on table "public"."milestones" to "anon";

grant update on table "public"."milestones" to "anon";

grant delete on table "public"."milestones" to "authenticated";

grant insert on table "public"."milestones" to "authenticated";

grant references on table "public"."milestones" to "authenticated";

grant select on table "public"."milestones" to "authenticated";

grant trigger on table "public"."milestones" to "authenticated";

grant truncate on table "public"."milestones" to "authenticated";

grant update on table "public"."milestones" to "authenticated";

grant delete on table "public"."milestones" to "service_role";

grant insert on table "public"."milestones" to "service_role";

grant references on table "public"."milestones" to "service_role";

grant select on table "public"."milestones" to "service_role";

grant trigger on table "public"."milestones" to "service_role";

grant truncate on table "public"."milestones" to "service_role";

grant update on table "public"."milestones" to "service_role";

grant delete on table "public"."nda_notifications" to "anon";

grant insert on table "public"."nda_notifications" to "anon";

grant references on table "public"."nda_notifications" to "anon";

grant select on table "public"."nda_notifications" to "anon";

grant trigger on table "public"."nda_notifications" to "anon";

grant truncate on table "public"."nda_notifications" to "anon";

grant update on table "public"."nda_notifications" to "anon";

grant delete on table "public"."nda_notifications" to "authenticated";

grant insert on table "public"."nda_notifications" to "authenticated";

grant references on table "public"."nda_notifications" to "authenticated";

grant select on table "public"."nda_notifications" to "authenticated";

grant trigger on table "public"."nda_notifications" to "authenticated";

grant truncate on table "public"."nda_notifications" to "authenticated";

grant update on table "public"."nda_notifications" to "authenticated";

grant delete on table "public"."nda_notifications" to "service_role";

grant insert on table "public"."nda_notifications" to "service_role";

grant references on table "public"."nda_notifications" to "service_role";

grant select on table "public"."nda_notifications" to "service_role";

grant trigger on table "public"."nda_notifications" to "service_role";

grant truncate on table "public"."nda_notifications" to "service_role";

grant update on table "public"."nda_notifications" to "service_role";

grant delete on table "public"."nda_request_files" to "anon";

grant insert on table "public"."nda_request_files" to "anon";

grant references on table "public"."nda_request_files" to "anon";

grant select on table "public"."nda_request_files" to "anon";

grant trigger on table "public"."nda_request_files" to "anon";

grant truncate on table "public"."nda_request_files" to "anon";

grant update on table "public"."nda_request_files" to "anon";

grant delete on table "public"."nda_request_files" to "authenticated";

grant insert on table "public"."nda_request_files" to "authenticated";

grant references on table "public"."nda_request_files" to "authenticated";

grant select on table "public"."nda_request_files" to "authenticated";

grant trigger on table "public"."nda_request_files" to "authenticated";

grant truncate on table "public"."nda_request_files" to "authenticated";

grant update on table "public"."nda_request_files" to "authenticated";

grant delete on table "public"."nda_request_files" to "service_role";

grant insert on table "public"."nda_request_files" to "service_role";

grant references on table "public"."nda_request_files" to "service_role";

grant select on table "public"."nda_request_files" to "service_role";

grant trigger on table "public"."nda_request_files" to "service_role";

grant truncate on table "public"."nda_request_files" to "service_role";

grant update on table "public"."nda_request_files" to "service_role";

grant delete on table "public"."negotiation_files" to "anon";

grant insert on table "public"."negotiation_files" to "anon";

grant references on table "public"."negotiation_files" to "anon";

grant select on table "public"."negotiation_files" to "anon";

grant trigger on table "public"."negotiation_files" to "anon";

grant truncate on table "public"."negotiation_files" to "anon";

grant update on table "public"."negotiation_files" to "anon";

grant delete on table "public"."negotiation_files" to "authenticated";

grant insert on table "public"."negotiation_files" to "authenticated";

grant references on table "public"."negotiation_files" to "authenticated";

grant select on table "public"."negotiation_files" to "authenticated";

grant trigger on table "public"."negotiation_files" to "authenticated";

grant truncate on table "public"."negotiation_files" to "authenticated";

grant update on table "public"."negotiation_files" to "authenticated";

grant delete on table "public"."negotiation_files" to "service_role";

grant insert on table "public"."negotiation_files" to "service_role";

grant references on table "public"."negotiation_files" to "service_role";

grant select on table "public"."negotiation_files" to "service_role";

grant trigger on table "public"."negotiation_files" to "service_role";

grant truncate on table "public"."negotiation_files" to "service_role";

grant update on table "public"."negotiation_files" to "service_role";

grant delete on table "public"."negotiation_messages" to "anon";

grant insert on table "public"."negotiation_messages" to "anon";

grant references on table "public"."negotiation_messages" to "anon";

grant select on table "public"."negotiation_messages" to "anon";

grant trigger on table "public"."negotiation_messages" to "anon";

grant truncate on table "public"."negotiation_messages" to "anon";

grant update on table "public"."negotiation_messages" to "anon";

grant delete on table "public"."negotiation_messages" to "authenticated";

grant insert on table "public"."negotiation_messages" to "authenticated";

grant references on table "public"."negotiation_messages" to "authenticated";

grant select on table "public"."negotiation_messages" to "authenticated";

grant trigger on table "public"."negotiation_messages" to "authenticated";

grant truncate on table "public"."negotiation_messages" to "authenticated";

grant update on table "public"."negotiation_messages" to "authenticated";

grant delete on table "public"."negotiation_messages" to "service_role";

grant insert on table "public"."negotiation_messages" to "service_role";

grant references on table "public"."negotiation_messages" to "service_role";

grant select on table "public"."negotiation_messages" to "service_role";

grant trigger on table "public"."negotiation_messages" to "service_role";

grant truncate on table "public"."negotiation_messages" to "service_role";

grant update on table "public"."negotiation_messages" to "service_role";

grant delete on table "public"."proposal_deliverables" to "anon";

grant insert on table "public"."proposal_deliverables" to "anon";

grant references on table "public"."proposal_deliverables" to "anon";

grant select on table "public"."proposal_deliverables" to "anon";

grant trigger on table "public"."proposal_deliverables" to "anon";

grant truncate on table "public"."proposal_deliverables" to "anon";

grant update on table "public"."proposal_deliverables" to "anon";

grant delete on table "public"."proposal_deliverables" to "authenticated";

grant insert on table "public"."proposal_deliverables" to "authenticated";

grant references on table "public"."proposal_deliverables" to "authenticated";

grant select on table "public"."proposal_deliverables" to "authenticated";

grant trigger on table "public"."proposal_deliverables" to "authenticated";

grant truncate on table "public"."proposal_deliverables" to "authenticated";

grant update on table "public"."proposal_deliverables" to "authenticated";

grant delete on table "public"."proposal_deliverables" to "service_role";

grant insert on table "public"."proposal_deliverables" to "service_role";

grant references on table "public"."proposal_deliverables" to "service_role";

grant select on table "public"."proposal_deliverables" to "service_role";

grant trigger on table "public"."proposal_deliverables" to "service_role";

grant truncate on table "public"."proposal_deliverables" to "service_role";

grant update on table "public"."proposal_deliverables" to "service_role";

grant delete on table "public"."proposal_files" to "anon";

grant insert on table "public"."proposal_files" to "anon";

grant references on table "public"."proposal_files" to "anon";

grant select on table "public"."proposal_files" to "anon";

grant trigger on table "public"."proposal_files" to "anon";

grant truncate on table "public"."proposal_files" to "anon";

grant update on table "public"."proposal_files" to "anon";

grant delete on table "public"."proposal_files" to "authenticated";

grant insert on table "public"."proposal_files" to "authenticated";

grant references on table "public"."proposal_files" to "authenticated";

grant select on table "public"."proposal_files" to "authenticated";

grant trigger on table "public"."proposal_files" to "authenticated";

grant truncate on table "public"."proposal_files" to "authenticated";

grant update on table "public"."proposal_files" to "authenticated";

grant delete on table "public"."proposal_files" to "service_role";

grant insert on table "public"."proposal_files" to "service_role";

grant references on table "public"."proposal_files" to "service_role";

grant select on table "public"."proposal_files" to "service_role";

grant trigger on table "public"."proposal_files" to "service_role";

grant truncate on table "public"."proposal_files" to "service_role";

grant update on table "public"."proposal_files" to "service_role";

grant delete on table "public"."proposal_milestones" to "anon";

grant insert on table "public"."proposal_milestones" to "anon";

grant references on table "public"."proposal_milestones" to "anon";

grant select on table "public"."proposal_milestones" to "anon";

grant trigger on table "public"."proposal_milestones" to "anon";

grant truncate on table "public"."proposal_milestones" to "anon";

grant update on table "public"."proposal_milestones" to "anon";

grant delete on table "public"."proposal_milestones" to "authenticated";

grant insert on table "public"."proposal_milestones" to "authenticated";

grant references on table "public"."proposal_milestones" to "authenticated";

grant select on table "public"."proposal_milestones" to "authenticated";

grant trigger on table "public"."proposal_milestones" to "authenticated";

grant truncate on table "public"."proposal_milestones" to "authenticated";

grant update on table "public"."proposal_milestones" to "authenticated";

grant delete on table "public"."proposal_milestones" to "service_role";

grant insert on table "public"."proposal_milestones" to "service_role";

grant references on table "public"."proposal_milestones" to "service_role";

grant select on table "public"."proposal_milestones" to "service_role";

grant trigger on table "public"."proposal_milestones" to "service_role";

grant truncate on table "public"."proposal_milestones" to "service_role";

grant update on table "public"."proposal_milestones" to "service_role";

grant delete on table "public"."proposal_nda_signatures" to "anon";

grant insert on table "public"."proposal_nda_signatures" to "anon";

grant references on table "public"."proposal_nda_signatures" to "anon";

grant select on table "public"."proposal_nda_signatures" to "anon";

grant trigger on table "public"."proposal_nda_signatures" to "anon";

grant truncate on table "public"."proposal_nda_signatures" to "anon";

grant update on table "public"."proposal_nda_signatures" to "anon";

grant delete on table "public"."proposal_nda_signatures" to "authenticated";

grant insert on table "public"."proposal_nda_signatures" to "authenticated";

grant references on table "public"."proposal_nda_signatures" to "authenticated";

grant select on table "public"."proposal_nda_signatures" to "authenticated";

grant trigger on table "public"."proposal_nda_signatures" to "authenticated";

grant truncate on table "public"."proposal_nda_signatures" to "authenticated";

grant update on table "public"."proposal_nda_signatures" to "authenticated";

grant delete on table "public"."proposal_nda_signatures" to "service_role";

grant insert on table "public"."proposal_nda_signatures" to "service_role";

grant references on table "public"."proposal_nda_signatures" to "service_role";

grant select on table "public"."proposal_nda_signatures" to "service_role";

grant trigger on table "public"."proposal_nda_signatures" to "service_role";

grant truncate on table "public"."proposal_nda_signatures" to "service_role";

grant update on table "public"."proposal_nda_signatures" to "service_role";

grant delete on table "public"."proposals" to "anon";

grant insert on table "public"."proposals" to "anon";

grant references on table "public"."proposals" to "anon";

grant select on table "public"."proposals" to "anon";

grant trigger on table "public"."proposals" to "anon";

grant truncate on table "public"."proposals" to "anon";

grant update on table "public"."proposals" to "anon";

grant delete on table "public"."proposals" to "authenticated";

grant insert on table "public"."proposals" to "authenticated";

grant references on table "public"."proposals" to "authenticated";

grant select on table "public"."proposals" to "authenticated";

grant trigger on table "public"."proposals" to "authenticated";

grant truncate on table "public"."proposals" to "authenticated";

grant update on table "public"."proposals" to "authenticated";

grant delete on table "public"."proposals" to "service_role";

grant insert on table "public"."proposals" to "service_role";

grant references on table "public"."proposals" to "service_role";

grant select on table "public"."proposals" to "service_role";

grant trigger on table "public"."proposals" to "service_role";

grant truncate on table "public"."proposals" to "service_role";

grant update on table "public"."proposals" to "service_role";

grant delete on table "public"."smartject_business_functions" to "anon";

grant insert on table "public"."smartject_business_functions" to "anon";

grant references on table "public"."smartject_business_functions" to "anon";

grant select on table "public"."smartject_business_functions" to "anon";

grant trigger on table "public"."smartject_business_functions" to "anon";

grant truncate on table "public"."smartject_business_functions" to "anon";

grant update on table "public"."smartject_business_functions" to "anon";

grant delete on table "public"."smartject_business_functions" to "authenticated";

grant insert on table "public"."smartject_business_functions" to "authenticated";

grant references on table "public"."smartject_business_functions" to "authenticated";

grant select on table "public"."smartject_business_functions" to "authenticated";

grant trigger on table "public"."smartject_business_functions" to "authenticated";

grant truncate on table "public"."smartject_business_functions" to "authenticated";

grant update on table "public"."smartject_business_functions" to "authenticated";

grant delete on table "public"."smartject_business_functions" to "service_role";

grant insert on table "public"."smartject_business_functions" to "service_role";

grant references on table "public"."smartject_business_functions" to "service_role";

grant select on table "public"."smartject_business_functions" to "service_role";

grant trigger on table "public"."smartject_business_functions" to "service_role";

grant truncate on table "public"."smartject_business_functions" to "service_role";

grant update on table "public"."smartject_business_functions" to "service_role";

grant delete on table "public"."smartject_industries" to "anon";

grant insert on table "public"."smartject_industries" to "anon";

grant references on table "public"."smartject_industries" to "anon";

grant select on table "public"."smartject_industries" to "anon";

grant trigger on table "public"."smartject_industries" to "anon";

grant truncate on table "public"."smartject_industries" to "anon";

grant update on table "public"."smartject_industries" to "anon";

grant delete on table "public"."smartject_industries" to "authenticated";

grant insert on table "public"."smartject_industries" to "authenticated";

grant references on table "public"."smartject_industries" to "authenticated";

grant select on table "public"."smartject_industries" to "authenticated";

grant trigger on table "public"."smartject_industries" to "authenticated";

grant truncate on table "public"."smartject_industries" to "authenticated";

grant update on table "public"."smartject_industries" to "authenticated";

grant delete on table "public"."smartject_industries" to "service_role";

grant insert on table "public"."smartject_industries" to "service_role";

grant references on table "public"."smartject_industries" to "service_role";

grant select on table "public"."smartject_industries" to "service_role";

grant trigger on table "public"."smartject_industries" to "service_role";

grant truncate on table "public"."smartject_industries" to "service_role";

grant update on table "public"."smartject_industries" to "service_role";

grant delete on table "public"."smartject_tags" to "anon";

grant insert on table "public"."smartject_tags" to "anon";

grant references on table "public"."smartject_tags" to "anon";

grant select on table "public"."smartject_tags" to "anon";

grant trigger on table "public"."smartject_tags" to "anon";

grant truncate on table "public"."smartject_tags" to "anon";

grant update on table "public"."smartject_tags" to "anon";

grant delete on table "public"."smartject_tags" to "authenticated";

grant insert on table "public"."smartject_tags" to "authenticated";

grant references on table "public"."smartject_tags" to "authenticated";

grant select on table "public"."smartject_tags" to "authenticated";

grant trigger on table "public"."smartject_tags" to "authenticated";

grant truncate on table "public"."smartject_tags" to "authenticated";

grant update on table "public"."smartject_tags" to "authenticated";

grant delete on table "public"."smartject_tags" to "service_role";

grant insert on table "public"."smartject_tags" to "service_role";

grant references on table "public"."smartject_tags" to "service_role";

grant select on table "public"."smartject_tags" to "service_role";

grant trigger on table "public"."smartject_tags" to "service_role";

grant truncate on table "public"."smartject_tags" to "service_role";

grant update on table "public"."smartject_tags" to "service_role";

grant delete on table "public"."smartject_technologies" to "anon";

grant insert on table "public"."smartject_technologies" to "anon";

grant references on table "public"."smartject_technologies" to "anon";

grant select on table "public"."smartject_technologies" to "anon";

grant trigger on table "public"."smartject_technologies" to "anon";

grant truncate on table "public"."smartject_technologies" to "anon";

grant update on table "public"."smartject_technologies" to "anon";

grant delete on table "public"."smartject_technologies" to "authenticated";

grant insert on table "public"."smartject_technologies" to "authenticated";

grant references on table "public"."smartject_technologies" to "authenticated";

grant select on table "public"."smartject_technologies" to "authenticated";

grant trigger on table "public"."smartject_technologies" to "authenticated";

grant truncate on table "public"."smartject_technologies" to "authenticated";

grant update on table "public"."smartject_technologies" to "authenticated";

grant delete on table "public"."smartject_technologies" to "service_role";

grant insert on table "public"."smartject_technologies" to "service_role";

grant references on table "public"."smartject_technologies" to "service_role";

grant select on table "public"."smartject_technologies" to "service_role";

grant trigger on table "public"."smartject_technologies" to "service_role";

grant truncate on table "public"."smartject_technologies" to "service_role";

grant update on table "public"."smartject_technologies" to "service_role";

grant delete on table "public"."smartjects" to "anon";

grant insert on table "public"."smartjects" to "anon";

grant references on table "public"."smartjects" to "anon";

grant select on table "public"."smartjects" to "anon";

grant trigger on table "public"."smartjects" to "anon";

grant truncate on table "public"."smartjects" to "anon";

grant update on table "public"."smartjects" to "anon";

grant delete on table "public"."smartjects" to "authenticated";

grant insert on table "public"."smartjects" to "authenticated";

grant references on table "public"."smartjects" to "authenticated";

grant select on table "public"."smartjects" to "authenticated";

grant trigger on table "public"."smartjects" to "authenticated";

grant truncate on table "public"."smartjects" to "authenticated";

grant update on table "public"."smartjects" to "authenticated";

grant delete on table "public"."smartjects" to "service_role";

grant insert on table "public"."smartjects" to "service_role";

grant references on table "public"."smartjects" to "service_role";

grant select on table "public"."smartjects" to "service_role";

grant trigger on table "public"."smartjects" to "service_role";

grant truncate on table "public"."smartjects" to "service_role";

grant update on table "public"."smartjects" to "service_role";

grant delete on table "public"."tags" to "anon";

grant insert on table "public"."tags" to "anon";

grant references on table "public"."tags" to "anon";

grant select on table "public"."tags" to "anon";

grant trigger on table "public"."tags" to "anon";

grant truncate on table "public"."tags" to "anon";

grant update on table "public"."tags" to "anon";

grant delete on table "public"."tags" to "authenticated";

grant insert on table "public"."tags" to "authenticated";

grant references on table "public"."tags" to "authenticated";

grant select on table "public"."tags" to "authenticated";

grant trigger on table "public"."tags" to "authenticated";

grant truncate on table "public"."tags" to "authenticated";

grant update on table "public"."tags" to "authenticated";

grant delete on table "public"."tags" to "service_role";

grant insert on table "public"."tags" to "service_role";

grant references on table "public"."tags" to "service_role";

grant select on table "public"."tags" to "service_role";

grant trigger on table "public"."tags" to "service_role";

grant truncate on table "public"."tags" to "service_role";

grant update on table "public"."tags" to "service_role";

grant delete on table "public"."technologies" to "anon";

grant insert on table "public"."technologies" to "anon";

grant references on table "public"."technologies" to "anon";

grant select on table "public"."technologies" to "anon";

grant trigger on table "public"."technologies" to "anon";

grant truncate on table "public"."technologies" to "anon";

grant update on table "public"."technologies" to "anon";

grant delete on table "public"."technologies" to "authenticated";

grant insert on table "public"."technologies" to "authenticated";

grant references on table "public"."technologies" to "authenticated";

grant select on table "public"."technologies" to "authenticated";

grant trigger on table "public"."technologies" to "authenticated";

grant truncate on table "public"."technologies" to "authenticated";

grant update on table "public"."technologies" to "authenticated";

grant delete on table "public"."technologies" to "service_role";

grant insert on table "public"."technologies" to "service_role";

grant references on table "public"."technologies" to "service_role";

grant select on table "public"."technologies" to "service_role";

grant trigger on table "public"."technologies" to "service_role";

grant truncate on table "public"."technologies" to "service_role";

grant update on table "public"."technologies" to "service_role";

grant delete on table "public"."user_settings" to "anon";

grant insert on table "public"."user_settings" to "anon";

grant references on table "public"."user_settings" to "anon";

grant select on table "public"."user_settings" to "anon";

grant trigger on table "public"."user_settings" to "anon";

grant truncate on table "public"."user_settings" to "anon";

grant update on table "public"."user_settings" to "anon";

grant delete on table "public"."user_settings" to "authenticated";

grant insert on table "public"."user_settings" to "authenticated";

grant references on table "public"."user_settings" to "authenticated";

grant select on table "public"."user_settings" to "authenticated";

grant trigger on table "public"."user_settings" to "authenticated";

grant truncate on table "public"."user_settings" to "authenticated";

grant update on table "public"."user_settings" to "authenticated";

grant delete on table "public"."user_settings" to "service_role";

grant insert on table "public"."user_settings" to "service_role";

grant references on table "public"."user_settings" to "service_role";

grant select on table "public"."user_settings" to "service_role";

grant trigger on table "public"."user_settings" to "service_role";

grant truncate on table "public"."user_settings" to "service_role";

grant update on table "public"."user_settings" to "service_role";

grant delete on table "public"."users" to "anon";

grant insert on table "public"."users" to "anon";

grant references on table "public"."users" to "anon";

grant select on table "public"."users" to "anon";

grant trigger on table "public"."users" to "anon";

grant truncate on table "public"."users" to "anon";

grant update on table "public"."users" to "anon";

grant delete on table "public"."users" to "authenticated";

grant insert on table "public"."users" to "authenticated";

grant references on table "public"."users" to "authenticated";

grant select on table "public"."users" to "authenticated";

grant trigger on table "public"."users" to "authenticated";

grant truncate on table "public"."users" to "authenticated";

grant update on table "public"."users" to "authenticated";

grant delete on table "public"."users" to "service_role";

grant insert on table "public"."users" to "service_role";

grant references on table "public"."users" to "service_role";

grant select on table "public"."users" to "service_role";

grant trigger on table "public"."users" to "service_role";

grant truncate on table "public"."users" to "service_role";

grant update on table "public"."users" to "service_role";

grant delete on table "public"."votes" to "anon";

grant insert on table "public"."votes" to "anon";

grant references on table "public"."votes" to "anon";

grant select on table "public"."votes" to "anon";

grant trigger on table "public"."votes" to "anon";

grant truncate on table "public"."votes" to "anon";

grant update on table "public"."votes" to "anon";

grant delete on table "public"."votes" to "authenticated";

grant insert on table "public"."votes" to "authenticated";

grant references on table "public"."votes" to "authenticated";

grant select on table "public"."votes" to "authenticated";

grant trigger on table "public"."votes" to "authenticated";

grant truncate on table "public"."votes" to "authenticated";

grant update on table "public"."votes" to "authenticated";

grant delete on table "public"."votes" to "service_role";

grant insert on table "public"."votes" to "service_role";

grant references on table "public"."votes" to "service_role";

grant select on table "public"."votes" to "service_role";

grant trigger on table "public"."votes" to "service_role";

grant truncate on table "public"."votes" to "service_role";

grant update on table "public"."votes" to "service_role";

create policy "Users can create extension requests for their contracts"
on "public"."contract_extension_requests"
as permissive
for insert
to public
with check (((EXISTS ( SELECT 1
   FROM contracts
  WHERE ((contracts.id = contract_extension_requests.contract_id) AND ((contracts.provider_id = auth.uid()) OR (contracts.needer_id = auth.uid()))))) AND (requested_by = auth.uid())));


create policy "Users can view extension requests for their contracts"
on "public"."contract_extension_requests"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM contracts
  WHERE ((contracts.id = contract_extension_requests.contract_id) AND ((contracts.provider_id = auth.uid()) OR (contracts.needer_id = auth.uid()))))));


create policy "Users can view message attachments for their contracts"
on "public"."contract_message_attachments"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM (contract_messages
     JOIN contracts ON ((contracts.id = contract_messages.contract_id)))
  WHERE ((contract_messages.id = contract_message_attachments.message_id) AND ((contracts.provider_id = auth.uid()) OR (contracts.needer_id = auth.uid()))))));


create policy "milestone_messages_insert_policy"
on "public"."contract_milestone_messages"
as permissive
for insert
to public
with check (((sender_id = auth.uid()) AND (milestone_id IN ( SELECT cm.id
   FROM (contract_milestones cm
     JOIN contracts c ON ((cm.contract_id = c.id)))
  WHERE ((c.provider_id = auth.uid()) OR (c.needer_id = auth.uid()))))));


create policy "milestone_messages_select_policy"
on "public"."contract_milestone_messages"
as permissive
for select
to public
using ((milestone_id IN ( SELECT cm.id
   FROM (contract_milestones cm
     JOIN contracts c ON ((cm.contract_id = c.id)))
  WHERE ((c.provider_id = auth.uid()) OR (c.needer_id = auth.uid())))));


create policy "milestone_messages_update_policy"
on "public"."contract_milestone_messages"
as permissive
for update
to public
using (((sender_id = auth.uid()) AND (milestone_id IN ( SELECT cm.id
   FROM (contract_milestones cm
     JOIN contracts c ON ((cm.contract_id = c.id)))
  WHERE ((c.provider_id = auth.uid()) OR (c.needer_id = auth.uid()))))));


create policy "milestone_status_history_insert_policy"
on "public"."contract_milestone_status_history"
as permissive
for insert
to public
with check (((changed_by = auth.uid()) AND (milestone_id IN ( SELECT cm.id
   FROM (contract_milestones cm
     JOIN contracts c ON ((cm.contract_id = c.id)))
  WHERE ((c.provider_id = auth.uid()) OR (c.needer_id = auth.uid()))))));


create policy "milestone_status_history_select_policy"
on "public"."contract_milestone_status_history"
as permissive
for select
to public
using ((milestone_id IN ( SELECT cm.id
   FROM (contract_milestones cm
     JOIN contracts c ON ((cm.contract_id = c.id)))
  WHERE ((c.provider_id = auth.uid()) OR (c.needer_id = auth.uid())))));


create policy "milestone_select_policy"
on "public"."contract_milestones"
as permissive
for select
to public
using ((contract_id IN ( SELECT c.id
   FROM contracts c
  WHERE ((c.provider_id = auth.uid()) OR (c.needer_id = auth.uid())))));


create policy "milestone_update_policy"
on "public"."contract_milestones"
as permissive
for update
to public
using ((contract_id IN ( SELECT c.id
   FROM contracts c
  WHERE ((c.provider_id = auth.uid()) OR (c.needer_id = auth.uid())))));


create policy "Users can create modification requests for their contracts"
on "public"."contract_modification_requests"
as permissive
for insert
to public
with check (((EXISTS ( SELECT 1
   FROM contracts
  WHERE ((contracts.id = contract_modification_requests.contract_id) AND ((contracts.provider_id = auth.uid()) OR (contracts.needer_id = auth.uid()))))) AND (requested_by = auth.uid())));


create policy "Users can view modification requests for their contracts"
on "public"."contract_modification_requests"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM contracts
  WHERE ((contracts.id = contract_modification_requests.contract_id) AND ((contracts.provider_id = auth.uid()) OR (contracts.needer_id = auth.uid()))))));


create policy "Allow inserting any NDA notifications"
on "public"."nda_notifications"
as permissive
for insert
to public
with check (true);


create policy "Users can update their own notifications"
on "public"."nda_notifications"
as permissive
for update
to public
using ((recipient_user_id = auth.uid()));


create policy "Users can view their own notifications"
on "public"."nda_notifications"
as permissive
for select
to public
using ((recipient_user_id = auth.uid()));


create policy "Proposal owners can view NDA request files"
on "public"."nda_request_files"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM (proposal_nda_signatures pns
     JOIN proposals p ON ((p.id = pns.proposal_id)))
  WHERE ((pns.id = nda_request_files.nda_signature_id) AND (p.user_id = auth.uid())))));


create policy "Users can insert files for their own NDA requests"
on "public"."nda_request_files"
as permissive
for insert
to public
with check ((EXISTS ( SELECT 1
   FROM proposal_nda_signatures pns
  WHERE ((pns.id = nda_request_files.nda_signature_id) AND (pns.signer_user_id = auth.uid())))));


create policy "Users can view files for their own NDA requests"
on "public"."nda_request_files"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM proposal_nda_signatures pns
  WHERE ((pns.id = nda_request_files.nda_signature_id) AND (pns.signer_user_id = auth.uid())))));


create policy "Users can delete their own files"
on "public"."negotiation_files"
as permissive
for delete
to public
using ((uploaded_by = auth.uid()));


create policy "Users can insert files for negotiations they are part of or aut"
on "public"."negotiation_files"
as permissive
for insert
to public
with check ((EXISTS ( SELECT 1
   FROM (negotiation_messages nm
     JOIN proposals p ON ((p.id = nm.proposal_id)))
  WHERE ((nm.id = negotiation_files.negotiation_id) AND ((nm.sender_id = auth.uid()) OR (p.user_id = auth.uid()))))));


create policy "Users can insert files for negotiations they are part of"
on "public"."negotiation_files"
as permissive
for insert
to public
with check ((EXISTS ( SELECT 1
   FROM negotiation_messages nm
  WHERE ((nm.id = negotiation_files.negotiation_id) AND (nm.sender_id = auth.uid())))));


create policy "Users can view files for negotiations they are part of or autho"
on "public"."negotiation_files"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM (negotiation_messages nm
     JOIN proposals p ON ((p.id = nm.proposal_id)))
  WHERE ((nm.id = negotiation_files.negotiation_id) AND ((nm.sender_id = auth.uid()) OR (p.user_id = auth.uid()))))));


create policy "Users can view files for negotiations they are part of"
on "public"."negotiation_files"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM negotiation_messages nm
  WHERE ((nm.id = negotiation_files.negotiation_id) AND (nm.sender_id = auth.uid())))));


create policy "Anyone can insert a message to proposal owner"
on "public"."negotiation_messages"
as permissive
for insert
to public
with check (((sender_id = auth.uid()) AND (proposal_id IN ( SELECT proposals.id
   FROM proposals))));


create policy "Users can delete their own negotiation messages"
on "public"."negotiation_messages"
as permissive
for delete
to public
using ((sender_id = auth.uid()));


create policy "Users can update their own negotiation messages"
on "public"."negotiation_messages"
as permissive
for update
to public
using ((sender_id = auth.uid()))
with check ((sender_id = auth.uid()));


create policy "Users can view their negotiation messages"
on "public"."negotiation_messages"
as permissive
for select
to public
using (((sender_id = auth.uid()) OR (proposal_id IN ( SELECT proposals.id
   FROM proposals
  WHERE (proposals.user_id = auth.uid())))));


create policy "Allow delete for owner"
on "public"."proposal_files"
as permissive
for delete
to public
using ((user_id = auth.uid()));


create policy "Allow insert for owner"
on "public"."proposal_files"
as permissive
for insert
to public
with check ((user_id = auth.uid()));


create policy "Allow read access to authenticated users"
on "public"."proposal_files"
as permissive
for select
to authenticated
using (true);


create policy "Allow update for owner"
on "public"."proposal_files"
as permissive
for update
to public
using ((user_id = auth.uid()));


create policy "Allow users to insert their own NDA request"
on "public"."proposal_nda_signatures"
as permissive
for insert
to public
with check ((auth.uid() = signer_user_id));


create policy "Proposal owners can view all signatures"
on "public"."proposal_nda_signatures"
as permissive
for select
to public
using ((proposal_id IN ( SELECT proposals.id
   FROM proposals
  WHERE (proposals.user_id = auth.uid()))));


create policy "Users can sign NDAs"
on "public"."proposal_nda_signatures"
as permissive
for insert
to public
with check ((signer_user_id = auth.uid()));


create policy "Users can update their own NDA signatures"
on "public"."proposal_nda_signatures"
as permissive
for update
to public
using (((signer_user_id = auth.uid()) OR (proposal_id IN ( SELECT proposals.id
   FROM proposals
  WHERE (proposals.user_id = auth.uid())))))
with check (((signer_user_id = auth.uid()) OR (proposal_id IN ( SELECT proposals.id
   FROM proposals
  WHERE (proposals.user_id = auth.uid())))));


create policy "Users can view relevant NDA signatures"
on "public"."proposal_nda_signatures"
as permissive
for select
to public
using (((signer_user_id = auth.uid()) OR (proposal_id IN ( SELECT proposals.id
   FROM proposals
  WHERE (proposals.user_id = auth.uid())))));


create policy "Users can delete their own settings"
on "public"."user_settings"
as permissive
for delete
to public
using ((auth.uid() = user_id));


create policy "Users can insert their own settings"
on "public"."user_settings"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can update their own settings"
on "public"."user_settings"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Users can view their own settings"
on "public"."user_settings"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Allow logged-in users to read their user row"
on "public"."users"
as permissive
for select
to public
using ((auth.uid() = id));


create policy "Public can see basic user info"
on "public"."users"
as permissive
for select
to public
using (true);


create policy "Users can insert own data"
on "public"."users"
as permissive
for insert
to public
with check ((id = auth.uid()));


create policy "Users can update own data"
on "public"."users"
as permissive
for update
to public
using ((id = auth.uid()))
with check ((id = auth.uid()));


create policy "Users can view own data"
on "public"."users"
as permissive
for select
to public
using ((id = auth.uid()));


CREATE TRIGGER update_negotiation_messages_updated_at BEFORE UPDATE ON public.negotiation_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER nda_notification_trigger AFTER INSERT OR UPDATE ON public.proposal_nda_signatures FOR EACH ROW EXECUTE FUNCTION create_nda_notification();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


