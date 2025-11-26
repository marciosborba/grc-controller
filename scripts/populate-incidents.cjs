const DatabaseManager = require('../database-manager.cjs');

const db = new DatabaseManager();

const INCIDENT_TYPES = [
    'security_breach', 'malware', 'phishing', 'data_breach',
    'unauthorized_access', 'ddos_attack', 'social_engineering',
    'system_failure', 'network_incident', 'compliance_violation'
];

const CATEGORIES = [
    'Segurança da Informação', 'Infraestrutura', 'Aplicações',
    'Dados e Privacidade', 'Compliance', 'Segurança Física'
];

const PRIORITIES = ['low', 'medium', 'high', 'critical'];
const STATUSES = ['open', 'investigating', 'contained', 'resolved', 'closed'];

const TITLES = [
    'Tentativa de acesso não autorizado no servidor de email',
    'Detecção de malware em estação de trabalho',
    'Phishing reportado por usuário do financeiro',
    'Lentidão anormal na rede interna',
    'Falha no backup noturno',
    'Violação de política de senha detectada',
    'Acesso físico não autorizado na sala de servidores',
    'Vazamento de dados de clientes suspeito',
    'Ataque DDoS no portal do cliente',
    'Erro crítico na aplicação de vendas'
];

function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
}

async function main() {
    try {
        console.log('🚀 Iniciando população de incidentes...');

        await db.connect();

        // Limpar incidentes existentes
        await db.executeSQL("DELETE FROM incidents", "Limpando tabela de incidentes");

        await db.executeSQL(`
            INSERT INTO public.profiles (id, email, full_name)
            SELECT id, email, COALESCE(raw_user_meta_data->>'full_name', email)
            FROM auth.users
            ON CONFLICT (id) DO NOTHING;
        `, "Sincronizando profiles com auth.users");

        const incidentsToCreate = 20;

        for (let i = 0; i < incidentsToCreate; i++) {
            const title = getRandomElement(TITLES);
            const description = `Descrição detalhada do incidente: ${title}. Ocorrido em sistema crítico.`;
            const category = getRandomElement(CATEGORIES);
            const priority = getRandomElement(PRIORITIES);
            const status = getRandomElement(STATUSES);
            const createdAt = getRandomDate(new Date(2024, 0, 1), new Date());

            const sql = `
        INSERT INTO incidents (
          title, 
          description, 
          category, 
          priority, 
          status, 
          created_at, 
          updated_at,
          reporter_id,
          assignee_id,
          tenant_id
        ) VALUES (
          '${title}',
          '${description}',
          '${category}',
          '${priority}',
          '${status}',
          '${createdAt}',
          '${createdAt}',
          (SELECT id FROM auth.users ORDER BY RANDOM() LIMIT 1),
          (SELECT id FROM auth.users ORDER BY RANDOM() LIMIT 1),
          (SELECT p.tenant_id FROM profiles p JOIN tenants t ON p.tenant_id = t.id ORDER BY RANDOM() LIMIT 1)
        );
      `;

            await db.executeSQL(sql, `Criando incidente ${i + 1}/${incidentsToCreate}: ${title}`);
        }

        console.log('✅ População concluída com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao popular incidentes:', error);
    } finally {
        // db.disconnect(); // DatabaseManager doesn't seem to have disconnect exposed or needed for single script run if it uses pool? 
        // Checking DatabaseManager code, it uses a pool but doesn't export disconnect explicitly in the snippet I saw.
        // Assuming process exit will handle it or I should check if I need to close pool.
        process.exit(0);
    }
}

main();
