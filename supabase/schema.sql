create table if not exists public.user_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('admin', 'reporter'))
);

create or replace function public.has_role(required_role text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = auth.uid() and role = required_role
  );
$$;

revoke all on function public.has_role(text) from public;
grant execute on function public.has_role(text) to authenticated;

create table if not exists public.projects (
  id integer primary key check (id = 1),
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.project_updates (
  id text primary key,
  date date not null,
  time text not null,
  title text not null,
  note text not null default '',
  image text not null,
  progress numeric not null check (progress between 0 and 100),
  created_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_name text not null default '',
  contact text not null default '',
  category text not null,
  location text not null,
  description text not null,
  related_progress_id text not null default '',
  status text not null default 'pending'
    check (status in ('pending', 'reviewing', 'resolved')),
  created_at timestamptz not null default now()
);

create table if not exists public.progress_delete_requests (
  id uuid primary key default gen_random_uuid(),
  progress_id text not null,
  progress_title text not null,
  progress_date date not null,
  reporter_id uuid not null references auth.users (id) on delete cascade,
  reporter_name text not null,
  reason text not null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

alter table public.user_roles enable row level security;
alter table public.projects enable row level security;
alter table public.project_updates enable row level security;
alter table public.reports enable row level security;
alter table public.progress_delete_requests enable row level security;

grant select on public.user_roles to authenticated;
create policy "Users can read their own role"
  on public.user_roles for select to authenticated
  using (user_id = auth.uid());

grant select on public.projects to anon, authenticated;
grant insert, update on public.projects to authenticated;
create policy "Project data is public"
  on public.projects for select to anon, authenticated using (true);
create policy "Admins can create project data"
  on public.projects for insert to authenticated
  with check (public.has_role('admin'));
create policy "Admins can update project data"
  on public.projects for update to authenticated
  using (public.has_role('admin'))
  with check (public.has_role('admin'));

grant select on public.project_updates to anon, authenticated;
grant insert, update, delete on public.project_updates to authenticated;
create policy "Project updates are public"
  on public.project_updates for select to anon, authenticated using (true);
create policy "Reporters and admins can add project updates"
  on public.project_updates for insert to authenticated
  with check (
    public.has_role('admin') or public.has_role('reporter')
  );
create policy "Admins can update project updates"
  on public.project_updates for update to authenticated
  using (public.has_role('admin'))
  with check (public.has_role('admin'));
create policy "Admins can delete project updates"
  on public.project_updates for delete to authenticated
  using (public.has_role('admin'));

grant select (id, category, location, description, related_progress_id, status, created_at)
  on public.reports to anon;
grant select (id, status, created_at)
  on public.reports to anon;
grant select, update, delete on public.reports to authenticated;
grant insert (reporter_name, contact, category, location, description, related_progress_id)
  on public.reports to anon, authenticated;
create policy "Public can read public report fields"
  on public.reports for select to anon using (true);
create policy "Admins can read all reports"
  on public.reports for select to authenticated
  using (public.has_role('admin'));
create policy "Anyone can submit a pending report"
  on public.reports for insert to anon, authenticated
  with check (status = 'pending');
create policy "Admins can update reports"
  on public.reports for update to authenticated
  using (public.has_role('admin'))
  with check (public.has_role('admin'));
create policy "Admins can delete reports"
  on public.reports for delete to authenticated
  using (public.has_role('admin'));

grant select, update on public.progress_delete_requests to authenticated;
grant insert (
  progress_id, progress_title, progress_date, reporter_id, reporter_name, reason
) on public.progress_delete_requests to authenticated;
create policy "Admins can read progress delete requests"
  on public.progress_delete_requests for select to authenticated
  using (public.has_role('admin'));
create policy "Reporters can read their own progress delete requests"
  on public.progress_delete_requests for select to authenticated
  using (reporter_id = auth.uid() and public.has_role('reporter'));
create policy "Reporters can submit progress delete requests"
  on public.progress_delete_requests for insert to authenticated
  with check (
    reporter_id = auth.uid()
    and public.has_role('reporter')
    and status = 'pending'
  );
create policy "Admins can update progress delete requests"
  on public.progress_delete_requests for update to authenticated
  using (public.has_role('admin'))
  with check (public.has_role('admin'));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-media',
  'project-media',
  true,
  15728640,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Project media is publicly readable"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'project-media');
create policy "Admins and reporters can upload project media"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'project-media'
    and (public.has_role('admin') or public.has_role('reporter'))
  );
create policy "Admins can update project media"
  on storage.objects for update to authenticated
  using (bucket_id = 'project-media' and public.has_role('admin'))
  with check (bucket_id = 'project-media' and public.has_role('admin'));
create policy "Admins can delete project media"
  on storage.objects for delete to authenticated
  using (bucket_id = 'project-media' and public.has_role('admin'));

do $$
begin
  alter publication supabase_realtime add table public.projects;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.project_updates;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.reports;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.progress_delete_requests;
exception when duplicate_object then null;
end $$;