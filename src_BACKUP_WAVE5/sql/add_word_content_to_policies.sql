-- Add content column to policies table for storing the editable document
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'policies' AND column_name = 'content') THEN
        ALTER TABLE policies ADD COLUMN content TEXT;
    END IF;
END $$;

-- Update existing active policies with a default Word-compatible HTML template
UPDATE policies
SET content = '
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
    <meta charset="utf-8">
    <title>' || title || '</title>
    <style>
        body { font-family: "Calibri", sans-serif; font-size: 11pt; }
        h1 { font-size: 16pt; font-weight: bold; color: #2E74B5; }
        h2 { font-size: 14pt; font-weight: bold; color: #2E74B5; margin-top: 15px; }
        p { margin-bottom: 10px; line-height: 1.15; }
    </style>
</head>
<body>
    <h1>' || title || '</h1>
    <p><strong>Versão:</strong> 1.0</p>
    <p><strong>Data de Vigência:</strong> ' || COALESCE(to_char(effective_date, 'DD/MM/YYYY'), 'TBD') || '</p>
    <hr/>
    
    <h2>1. Objetivo</h2>
    <p>O objetivo desta política é estabelecer as diretrizes fundamentais para ' || title || ', garantindo a conformidade com as normas internas e regulamentos aplicáveis.</p>
    
    <h2>2. Escopo</h2>
    <p>Esta política aplica-se a todos os colaboradores, contratados e parceiros de negócios que tenham acesso aos ativos de informação da organização.</p>
    
    <h2>3. Diretrizes Gerais</h2>
    <p>3.1. Todos os envolvidos devem zelar pela confidencialidade, integridade e disponibilidade das informações.</p>
    <p>3.2. Violações a esta política estarão sujeitas a medidas disciplinares.</p>
    
    <h2>4. Responsabilidades</h2>
    <p>Cabe à gestão garantir a disseminação desta política e a todos os colaboradores o seu cumprimento.</p>
    
    <br/>
    <p><em>Documento gerado automaticamente pelo GRC Controller.</em></p>
</body>
</html>'
WHERE (content IS NULL OR content = '') AND status = 'published';
