INSERT INTO public.sistemas (nome, tipo, status, fornecedor, documentacao_link, criticidade, tenant_id)
VALUES
('Portal Web Principal', 'SaaS', 'Ativo', 'React/Node.js', 'https://portal.empresa.com', 'Alta', '00000000-0000-0000-0000-000000000000'),
('API Gateway', 'PaaS', 'Ativo', 'Spring Boot', 'https://api.empresa.com', 'Média', '00000000-0000-0000-0000-000000000000'),
('App Mobile iOS', 'Outro', 'Ativo', 'Swift', 'App Store', 'Baixa', '00000000-0000-0000-0000-000000000000'),
('Admin Dashboard', 'SaaS', 'Em Implementação', 'Vue.js', 'https://admin.empresa.com', 'Alta', '00000000-0000-0000-0000-000000000000'),
('Database Principal', 'IaaS', 'Ativo', 'PostgreSQL', 'db.empresa.com:5432', 'Baixa', '00000000-0000-0000-0000-000000000000');
