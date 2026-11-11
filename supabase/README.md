# Supabase setup

## Configure the app

1. Create a Supabase project and copy its Project URL and publishable key.
2. Copy `.env.example` to `.env.local`, then fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. Restart Vite after changing environment variables. The client also accepts the legacy `VITE_SUPABASE_ANON_KEY` variable if you already configured it.
3. For a new database, run [`schema.sql`](schema.sql) in the Supabase SQL Editor. If the schema was already applied, no database change is needed for the app update.
4. In Supabase Authentication, create the admin and reporter accounts. Keep public sign-up disabled unless the application later adds a reviewed account-registration flow.
5. Assign each created account a role from the SQL Editor, replacing the email values:

```sql
insert into public.user_roles (user_id, role)
select id, 'admin' from auth.users where email = 'admin@example.com'
on conflict (user_id) do update set role = excluded.role;

insert into public.user_roles (user_id, role)
select id, 'reporter' from auth.users where email = 'reporter@example.com'
on conflict (user_id) do update set role = excluded.role;
```

6. Run the application with `npm run dev` and sign in as the admin. Save the project information once to initialize a new project record.

## Reset the backend

[`reset.sql`](reset.sql) is destructive. Running it drops the app tables, their table policies, the `has_role` function, and the app's Storage policies. It does not remove Supabase Auth users or Storage files/bucket. Delete those separately from **Authentication → Users** and **Storage → project-media** if a complete cleanup is intended. After reset, rerun `schema.sql`, recreate or reassign an admin role, and initialize the project again before using the app.

## Data and access

- Project settings are stored as JSON in `public.projects.data`; daily progress entries are stored separately in `public.project_updates`.
- Public reports can be submitted without signing in. The public listing only selects category, location, description, status, date, and progress reference. Reporter name and contact are available only to admins.
- Progress deletion requests require a reporter account. Only admins can review or update their status.
- Photos and PDFs use the public `project-media` Storage bucket. The bucket is publicly readable; authenticated reporters/admins can upload, while only admins can update or delete files.
- RLS is enabled for all app tables. The frontend key is expected to be public; never put the `service_role` key in a `VITE_` variable or browser code.

## Browser storage

On startup, the app removes legacy project, report, and progress-request data from `localStorage`. Current project and report data are read from Supabase. Theme preference remains local because it is a device-specific display setting.

## Deployment

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` as build-time environment variables in the hosting provider, then rebuild the Vite app. Apply `schema.sql` to the production Supabase project and create/assign production users separately.
