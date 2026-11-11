-- DESTRUCTIVE: removes the app tables, their RLS policies, and app Storage policies.
-- Run only in the intended Supabase project's SQL Editor.
-- This does not remove Auth users or Storage files/bucket; use the Supabase Dashboard for those.

begin;

drop policy if exists "Project media is publicly readable"
  on storage.objects;
drop policy if exists "Admins and reporters can upload project media"
  on storage.objects;
drop policy if exists "Admins can update project media"
  on storage.objects;
drop policy if exists "Admins can delete project media"
  on storage.objects;

drop table if exists
  public.progress_delete_requests,
  public.reports,
  public.project_updates,
  public.projects,
  public.user_roles
cascade;

drop function if exists public.has_role(text);

commit;
