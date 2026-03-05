-- Criação do bucket para os anexos e arquivos de campos customizados
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'custom_fields_attachments', 
  'custom_fields_attachments', 
  true,
  10485760, -- 10MB limit
  null -- all types allowed
) on conflict (id) do nothing;

-- Políticas de acesso (RLS)
create policy "Arquivos de campos customizados são públicos para visualização"
  on storage.objects for select
  using ( bucket_id = 'custom_fields_attachments' );

create policy "Apenas usuários autenticados podem fazer upload de anexos"
  on storage.objects for insert
  with check ( bucket_id = 'custom_fields_attachments' and auth.role() = 'authenticated' );

create policy "Usuários podem atualizar seus próprios arquivos"
  on storage.objects for update
  using ( bucket_id = 'custom_fields_attachments' and auth.uid() = owner )
  with check ( bucket_id = 'custom_fields_attachments' and auth.uid() = owner );

create policy "Usuários podem deletar seus próprios arquivos"
  on storage.objects for delete
  using ( bucket_id = 'custom_fields_attachments' and auth.uid() = owner );
