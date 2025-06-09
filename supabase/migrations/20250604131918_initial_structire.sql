alter table "public"."matches" drop constraint "matches_status_check";

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

create table "public"."proposal_comments" (
    "id" uuid not null default gen_random_uuid(),
    "proposal_id" uuid,
    "user_id" uuid,
    "content" text not null,
    "created_at" timestamp with time zone default now()
);


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


alter table "public"."contracts" add column "needer_signed" boolean default false;

alter table "public"."contracts" add column "proposal_id" uuid;

alter table "public"."contracts" add column "provider_signed" boolean default false;

alter table "public"."matches" add column "needer_id" uuid;

alter table "public"."matches" add column "provider_id" uuid;

alter table "public"."matches" add column "updated_at" timestamp with time zone default now();

CREATE INDEX idx_matches_needer_id ON public.matches USING btree (needer_id);

CREATE INDEX idx_matches_provider_id ON public.matches USING btree (provider_id);

CREATE INDEX idx_matches_smartject_provider_needer ON public.matches USING btree (smartject_id, provider_id, needer_id);

CREATE INDEX idx_negotiation_messages_created_at ON public.negotiation_messages USING btree (created_at);

CREATE INDEX idx_negotiation_messages_proposal_id ON public.negotiation_messages USING btree (proposal_id);

CREATE INDEX idx_negotiation_messages_sender_id ON public.negotiation_messages USING btree (sender_id);

CREATE UNIQUE INDEX matches_smartject_provider_needer_unique ON public.matches USING btree (smartject_id, provider_id, needer_id);

CREATE UNIQUE INDEX negotiation_messages_pkey ON public.negotiation_messages USING btree (id);

CREATE UNIQUE INDEX proposal_comments_pkey ON public.proposal_comments USING btree (id);

CREATE UNIQUE INDEX proposal_deliverables_pkey ON public.proposal_deliverables USING btree (id);

CREATE UNIQUE INDEX proposal_files_pkey ON public.proposal_files USING btree (id);

CREATE UNIQUE INDEX proposal_milestones_pkey ON public.proposal_milestones USING btree (id);

alter table "public"."negotiation_messages" add constraint "negotiation_messages_pkey" PRIMARY KEY using index "negotiation_messages_pkey";

alter table "public"."proposal_comments" add constraint "proposal_comments_pkey" PRIMARY KEY using index "proposal_comments_pkey";

alter table "public"."proposal_deliverables" add constraint "proposal_deliverables_pkey" PRIMARY KEY using index "proposal_deliverables_pkey";

alter table "public"."proposal_files" add constraint "proposal_files_pkey" PRIMARY KEY using index "proposal_files_pkey";

alter table "public"."proposal_milestones" add constraint "proposal_milestones_pkey" PRIMARY KEY using index "proposal_milestones_pkey";

alter table "public"."contracts" add constraint "contracts_proposal_id_fkey" FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE SET NULL not valid;

alter table "public"."contracts" validate constraint "contracts_proposal_id_fkey";

alter table "public"."matches" add constraint "matches_needer_id_fkey" FOREIGN KEY (needer_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."matches" validate constraint "matches_needer_id_fkey";

alter table "public"."matches" add constraint "matches_provider_id_fkey" FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."matches" validate constraint "matches_provider_id_fkey";

alter table "public"."matches" add constraint "matches_smartject_provider_needer_unique" UNIQUE using index "matches_smartject_provider_needer_unique";

alter table "public"."negotiation_messages" add constraint "negotiation_messages_proposal_id_fkey" FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE not valid;

alter table "public"."negotiation_messages" validate constraint "negotiation_messages_proposal_id_fkey";

alter table "public"."negotiation_messages" add constraint "negotiation_messages_sender_id_fkey" FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."negotiation_messages" validate constraint "negotiation_messages_sender_id_fkey";

alter table "public"."proposal_comments" add constraint "proposal_comments_proposal_id_fkey" FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE not valid;

alter table "public"."proposal_comments" validate constraint "proposal_comments_proposal_id_fkey";

alter table "public"."proposal_comments" add constraint "proposal_comments_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) not valid;

alter table "public"."proposal_comments" validate constraint "proposal_comments_user_id_fkey";

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

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$function$
;

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

grant delete on table "public"."proposal_comments" to "anon";

grant insert on table "public"."proposal_comments" to "anon";

grant references on table "public"."proposal_comments" to "anon";

grant select on table "public"."proposal_comments" to "anon";

grant trigger on table "public"."proposal_comments" to "anon";

grant truncate on table "public"."proposal_comments" to "anon";

grant update on table "public"."proposal_comments" to "anon";

grant delete on table "public"."proposal_comments" to "authenticated";

grant insert on table "public"."proposal_comments" to "authenticated";

grant references on table "public"."proposal_comments" to "authenticated";

grant select on table "public"."proposal_comments" to "authenticated";

grant trigger on table "public"."proposal_comments" to "authenticated";

grant truncate on table "public"."proposal_comments" to "authenticated";

grant update on table "public"."proposal_comments" to "authenticated";

grant delete on table "public"."proposal_comments" to "service_role";

grant insert on table "public"."proposal_comments" to "service_role";

grant references on table "public"."proposal_comments" to "service_role";

grant select on table "public"."proposal_comments" to "service_role";

grant trigger on table "public"."proposal_comments" to "service_role";

grant truncate on table "public"."proposal_comments" to "service_role";

grant update on table "public"."proposal_comments" to "service_role";

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


create policy "Public can see basic user info"
on "public"."users"
as permissive
for select
to public
using (true);


CREATE TRIGGER update_negotiation_messages_updated_at BEFORE UPDATE ON public.negotiation_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


