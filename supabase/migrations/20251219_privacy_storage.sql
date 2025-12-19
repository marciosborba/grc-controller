-- Create privacy-evidence bucket for DSAR and Incidents
insert into storage.buckets (id, name, public)
values ('privacy-evidence', 'privacy-evidence', false)
on conflict (id) do nothing;

-- Allow authenticated users to view evidence (Staff, DPO)
create policy "Authenticated users can view privacy evidence 1"
on storage.objects for select
to authenticated
using (bucket_id = 'privacy-evidence');

-- Allow authenticated users to upload evidence (Staff, DPO when verifying)
create policy "Authenticated users can upload privacy evidence 1"
on storage.objects for insert
to authenticated
with check (bucket_id = 'privacy-evidence');

-- Allow authenticated users to update/delete their own uploads? 
-- For now, let's keep it append-only for audit trail, or allow deletion by DPO only?
-- Simpler policy:
create policy "Authenticated users can update privacy evidence 1"
on storage.objects for update
to authenticated
using (bucket_id = 'privacy-evidence');
