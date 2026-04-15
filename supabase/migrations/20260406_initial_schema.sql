create extension if not exists pgcrypto;

create or replace function public.current_user_role()
returns text
language sql
stable
as $$
  select coalesce((select role from public.user_profiles where id = auth.uid() limit 1), 'student');
$$;

create table if not exists public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  role text not null check (role in ('admin', 'faculty', 'student')),
  name text not null,
  section text,
  department text,
  email text not null unique,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.timetables (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  semester text not null,
  section text not null,
  department text not null,
  file_url text,
  file_type text,
  uploaded_by uuid not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.timetable_entries (
  id uuid primary key default gen_random_uuid(),
  timetable_id uuid not null references public.timetables(id) on delete cascade,
  subject text not null,
  subject_code text,
  faculty_name text,
  room text,
  day_of_week int not null check (day_of_week between 0 and 6),
  period_number int not null check (period_number > 0),
  start_time time not null,
  end_time time not null,
  color_hex text not null default '#2563eb'
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  message text not null,
  type text not null check (type in ('info', 'warning', 'success', 'reminder')),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  performed_by uuid not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  timetable_entry_id uuid not null references public.timetable_entries(id) on delete cascade,
  remind_before_minutes int not null default 30,
  is_active boolean not null default true
);

create table if not exists public.faculty_availability (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  day_of_week int not null check (day_of_week between 0 and 6),
  period_number int not null check (period_number > 0),
  is_available boolean not null default true,
  created_at timestamptz not null default now()
);

insert into storage.buckets (id, name, public)
values ('timetable-files', 'timetable-files', false)
on conflict (id) do nothing;

create index if not exists idx_timetables_section on public.timetables(section);
create index if not exists idx_timetable_entries_timetable on public.timetable_entries(timetable_id);
create index if not exists idx_notifications_user on public.notifications(user_id, created_at desc);
create index if not exists idx_reminders_user on public.reminders(user_id);
create index if not exists idx_faculty_availability_user on public.faculty_availability(user_id);

alter table public.user_profiles enable row level security;
alter table public.timetables enable row level security;
alter table public.timetable_entries enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;
alter table public.reminders enable row level security;
alter table public.faculty_availability enable row level security;
alter table storage.objects enable row level security;

create policy "Users can read their own profile"
on public.user_profiles for select
using (auth.uid() = id or current_user_role() = 'admin');

create policy "Users can update their own profile"
on public.user_profiles for update
using (auth.uid() = id or current_user_role() = 'admin')
with check (auth.uid() = id or current_user_role() = 'admin');

create policy "Admin can manage profiles"
on public.user_profiles for all
using (current_user_role() = 'admin')
with check (current_user_role() = 'admin');

create policy "Authenticated users can read timetables"
on public.timetables for select
using (auth.role() = 'authenticated' or current_user_role() = 'admin');

create policy "Admin can manage timetables"
on public.timetables for all
using (current_user_role() = 'admin')
with check (current_user_role() = 'admin');

create policy "Authenticated users can read timetable entries"
on public.timetable_entries for select
using (auth.role() = 'authenticated' or current_user_role() = 'admin');

create policy "Admin can manage timetable entries"
on public.timetable_entries for all
using (current_user_role() = 'admin')
with check (current_user_role() = 'admin');

create policy "Users can read own notifications"
on public.notifications for select
using (auth.uid() = user_id or current_user_role() = 'admin');

create policy "Users can mark own notifications read"
on public.notifications for update
using (auth.uid() = user_id or current_user_role() = 'admin')
with check (auth.uid() = user_id or current_user_role() = 'admin');

create policy "Admin can manage notifications"
on public.notifications for all
using (current_user_role() = 'admin')
with check (current_user_role() = 'admin');

create policy "Admin can read audit logs"
on public.audit_logs for select
using (current_user_role() = 'admin');

create policy "Admin or service can insert audit logs"
on public.audit_logs for insert
with check (current_user_role() = 'admin' or auth.role() = 'service_role');

create policy "Users can read own reminders"
on public.reminders for select
using (auth.uid() = user_id or current_user_role() = 'admin');

create policy "Users can manage own reminders"
on public.reminders for all
using (auth.uid() = user_id or current_user_role() = 'admin')
with check (auth.uid() = user_id or current_user_role() = 'admin');

create policy "Faculty can read own availability"
on public.faculty_availability for select
using (auth.uid() = user_id or current_user_role() = 'admin');

create policy "Faculty can manage own availability"
on public.faculty_availability for all
using (auth.uid() = user_id or current_user_role() = 'admin')
with check (auth.uid() = user_id or current_user_role() = 'admin');

create policy "Admins can upload timetable files"
on storage.objects for insert
with check (bucket_id = 'timetable-files' and current_user_role() = 'admin');

create policy "Admins can read timetable files"
on storage.objects for select
using (bucket_id = 'timetable-files' and current_user_role() = 'admin');

create policy "Admins can delete timetable files"
on storage.objects for delete
using (bucket_id = 'timetable-files' and current_user_role() = 'admin');

create or replace function public.write_timetable_audit_log()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.audit_logs (action, performed_by, metadata)
  values (
    tg_op || ' timetable',
    coalesce(auth.uid(), gen_random_uuid()),
    jsonb_build_object('table', tg_table_name, 'timetable_id', coalesce(new.id, old.id), 'label', coalesce(new.label, old.label))
  );

  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_timetable_audit on public.timetables;
create trigger trg_timetable_audit
after insert or update or delete on public.timetables
for each row execute function public.write_timetable_audit_log();

insert into public.user_profiles (id, role, name, section, department, email, avatar_url)
values
  ('11111111-1111-1111-1111-111111111111', 'admin', 'Dr. Maya Rao', 'CSE-A', 'Computer Science', 'maya.rao@college.edu', null),
  ('22222222-2222-2222-2222-222222222222', 'faculty', 'Prof. Arun Nair', 'CSE-A', 'Computer Science', 'arun.nair@college.edu', null),
  ('33333333-3333-3333-3333-333333333333', 'student', 'Aarav Menon', 'CSE-A', 'Computer Science', 'aarav.menon@college.edu', null)
on conflict (id) do nothing;

insert into public.timetables (id, label, semester, section, department, file_url, file_type, uploaded_by, is_active)
values
  ('44444444-4444-4444-4444-444444444444', 'Odd Semester 2026', 'S5', 'CSE-A', 'Computer Science', null, 'image/png', '11111111-1111-1111-1111-111111111111', true)
on conflict (id) do nothing;

insert into public.timetable_entries (timetable_id, subject, subject_code, faculty_name, room, day_of_week, period_number, start_time, end_time, color_hex)
values
  ('44444444-4444-4444-4444-444444444444', 'Data Structures', 'CSE201', 'Dr. Maya Rao', 'B-204', 1, 1, '09:00', '09:50', '#2563eb'),
  ('44444444-4444-4444-4444-444444444444', 'Database Systems', 'CSE202', 'Prof. Arun Nair', 'Lab-1', 1, 3, '11:00', '11:50', '#14b8a6'),
  ('44444444-4444-4444-4444-444444444444', 'Software Engineering', 'CSE203', 'Dr. Leena Joseph', 'A-101', 2, 2, '10:00', '10:50', '#f97316')
on conflict do nothing;

insert into public.notifications (user_id, title, message, type, is_read)
values
  ('11111111-1111-1111-1111-111111111111', 'Timetable updated', 'CSE-A timetable has been updated.', 'success', false),
  ('11111111-1111-1111-1111-111111111111', 'Reminder enabled', 'You will receive reminders 30 minutes before class.', 'reminder', true)
on conflict do nothing;

insert into public.reminders (user_id, timetable_entry_id, remind_before_minutes, is_active)
select '11111111-1111-1111-1111-111111111111', id, 30, true from public.timetable_entries
on conflict do nothing;
