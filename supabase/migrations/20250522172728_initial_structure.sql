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
    "updated_at" timestamp with time zone default now()
);


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
    "updated_at" timestamp with time zone default now()
);


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
    "matched_date" timestamp with time zone default now()
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
    "updated_at" timestamp with time zone default now()
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


create table "public"."users" (
    "id" uuid not null default uuid_generate_v4(),
    "email" text not null,
    "name" text,
    "avatar_url" text,
    "account_type" text not null default 'free'::text,
    "created_at" timestamp with time zone default now()
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

CREATE UNIQUE INDEX contract_messages_pkey ON public.contract_messages USING btree (id);

CREATE UNIQUE INDEX contract_milestone_comments_pkey ON public.contract_milestone_comments USING btree (id);

CREATE UNIQUE INDEX contract_milestone_deliverables_pkey ON public.contract_milestone_deliverables USING btree (id);

CREATE UNIQUE INDEX contract_milestones_pkey ON public.contract_milestones USING btree (id);

CREATE UNIQUE INDEX contracts_pkey ON public.contracts USING btree (id);

CREATE UNIQUE INDEX deliverables_pkey ON public.deliverables USING btree (id);

CREATE UNIQUE INDEX document_versions_pkey ON public.document_versions USING btree (id);

CREATE UNIQUE INDEX industries_name_key ON public.industries USING btree (name);

CREATE UNIQUE INDEX industries_pkey ON public.industries USING btree (id);

CREATE UNIQUE INDEX match_proposals_pkey ON public.match_proposals USING btree (match_id, proposal_id);

CREATE UNIQUE INDEX matches_pkey ON public.matches USING btree (id);

CREATE UNIQUE INDEX messages_pkey ON public.messages USING btree (id);

CREATE UNIQUE INDEX milestones_pkey ON public.milestones USING btree (id);

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

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

CREATE UNIQUE INDEX votes_pkey ON public.votes USING btree (id);

CREATE UNIQUE INDEX votes_user_id_smartject_id_vote_type_key ON public.votes USING btree (user_id, smartject_id, vote_type);

alter table "public"."business_functions" add constraint "business_functions_pkey" PRIMARY KEY using index "business_functions_pkey";

alter table "public"."comments" add constraint "comments_pkey" PRIMARY KEY using index "comments_pkey";

alter table "public"."contract_activities" add constraint "contract_activities_pkey" PRIMARY KEY using index "contract_activities_pkey";

alter table "public"."contract_deliverables" add constraint "contract_deliverables_pkey" PRIMARY KEY using index "contract_deliverables_pkey";

alter table "public"."contract_documents" add constraint "contract_documents_pkey" PRIMARY KEY using index "contract_documents_pkey";

alter table "public"."contract_messages" add constraint "contract_messages_pkey" PRIMARY KEY using index "contract_messages_pkey";

alter table "public"."contract_milestone_comments" add constraint "contract_milestone_comments_pkey" PRIMARY KEY using index "contract_milestone_comments_pkey";

alter table "public"."contract_milestone_deliverables" add constraint "contract_milestone_deliverables_pkey" PRIMARY KEY using index "contract_milestone_deliverables_pkey";

alter table "public"."contract_milestones" add constraint "contract_milestones_pkey" PRIMARY KEY using index "contract_milestones_pkey";

alter table "public"."contracts" add constraint "contracts_pkey" PRIMARY KEY using index "contracts_pkey";

alter table "public"."deliverables" add constraint "deliverables_pkey" PRIMARY KEY using index "deliverables_pkey";

alter table "public"."document_versions" add constraint "document_versions_pkey" PRIMARY KEY using index "document_versions_pkey";

alter table "public"."industries" add constraint "industries_pkey" PRIMARY KEY using index "industries_pkey";

alter table "public"."match_proposals" add constraint "match_proposals_pkey" PRIMARY KEY using index "match_proposals_pkey";

alter table "public"."matches" add constraint "matches_pkey" PRIMARY KEY using index "matches_pkey";

alter table "public"."messages" add constraint "messages_pkey" PRIMARY KEY using index "messages_pkey";

alter table "public"."milestones" add constraint "milestones_pkey" PRIMARY KEY using index "milestones_pkey";

alter table "public"."proposals" add constraint "proposals_pkey" PRIMARY KEY using index "proposals_pkey";

alter table "public"."smartject_business_functions" add constraint "smartject_business_functions_pkey" PRIMARY KEY using index "smartject_business_functions_pkey";

alter table "public"."smartject_industries" add constraint "smartject_industries_pkey" PRIMARY KEY using index "smartject_industries_pkey";

alter table "public"."smartject_tags" add constraint "smartject_tags_pkey" PRIMARY KEY using index "smartject_tags_pkey";

alter table "public"."smartject_technologies" add constraint "smartject_technologies_pkey" PRIMARY KEY using index "smartject_technologies_pkey";

alter table "public"."smartjects" add constraint "smartjects_pkey" PRIMARY KEY using index "smartjects_pkey";

alter table "public"."tags" add constraint "tags_pkey" PRIMARY KEY using index "tags_pkey";

alter table "public"."technologies" add constraint "technologies_pkey" PRIMARY KEY using index "technologies_pkey";

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

alter table "public"."contract_milestones" add constraint "contract_milestones_contract_id_fkey" FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE not valid;

alter table "public"."contract_milestones" validate constraint "contract_milestones_contract_id_fkey";

alter table "public"."contract_milestones" add constraint "contract_milestones_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'in_progress'::text, 'completed'::text, 'overdue'::text, 'pending_review'::text]))) not valid;

alter table "public"."contract_milestones" validate constraint "contract_milestones_status_check";

alter table "public"."contracts" add constraint "contracts_match_id_fkey" FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE not valid;

alter table "public"."contracts" validate constraint "contracts_match_id_fkey";

alter table "public"."contracts" add constraint "contracts_needer_id_fkey" FOREIGN KEY (needer_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."contracts" validate constraint "contracts_needer_id_fkey";

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

alter table "public"."matches" add constraint "matches_smartject_id_fkey" FOREIGN KEY (smartject_id) REFERENCES smartjects(id) ON DELETE CASCADE not valid;

alter table "public"."matches" validate constraint "matches_smartject_id_fkey";

alter table "public"."matches" add constraint "matches_status_check" CHECK ((status = ANY (ARRAY['new'::text, 'in_negotiation'::text, 'contract_ready'::text, 'contract_signed'::text]))) not valid;

alter table "public"."matches" validate constraint "matches_status_check";

alter table "public"."messages" add constraint "messages_match_id_fkey" FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE not valid;

alter table "public"."messages" validate constraint "messages_match_id_fkey";

alter table "public"."messages" add constraint "messages_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."messages" validate constraint "messages_user_id_fkey";

alter table "public"."milestones" add constraint "milestones_proposal_id_fkey" FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE not valid;

alter table "public"."milestones" validate constraint "milestones_proposal_id_fkey";

alter table "public"."milestones" add constraint "milestones_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'in_progress'::text, 'completed'::text, 'overdue'::text, 'pending_review'::text]))) not valid;

alter table "public"."milestones" validate constraint "milestones_status_check";

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

alter table "public"."users" add constraint "users_email_key" UNIQUE using index "users_email_key";

alter table "public"."votes" add constraint "votes_smartject_id_fkey" FOREIGN KEY (smartject_id) REFERENCES smartjects(id) ON DELETE CASCADE not valid;

alter table "public"."votes" validate constraint "votes_smartject_id_fkey";

alter table "public"."votes" add constraint "votes_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."votes" validate constraint "votes_user_id_fkey";

alter table "public"."votes" add constraint "votes_user_id_smartject_id_vote_type_key" UNIQUE using index "votes_user_id_smartject_id_vote_type_key";

alter table "public"."votes" add constraint "votes_vote_type_check" CHECK ((vote_type = ANY (ARRAY['believe'::text, 'need'::text, 'provide'::text]))) not valid;

alter table "public"."votes" validate constraint "votes_vote_type_check";

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

create policy "Allow logged-in users to read their user row"
on "public"."users"
as permissive
for select
to public
using ((auth.uid() = id));


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



