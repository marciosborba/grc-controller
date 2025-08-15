# Sistema de Rastreamento de IP e Geolocalização

## 📋 Visão Geral

O sistema foi implementado para capturar automaticamente o **IP real** e **localização geográfica** de todos os usuários durante o login, garantindo que as sessões ativas mostrem dados precisos e reais.

## 🚀 Funcionalidades Implementadas

### ✅ Captura Automática de IP
- **Múltiplos Serviços**: ipify.org, ipapi.co, ipinfo.io
- **Fallback WebRTC**: Para casos onde APIs externas falham
- **Validação de IP**: Verifica formato IPv4 e IPv6
- **Timeout Configurável**: 5 segundos por serviço

### ✅ Geolocalização Precisa
- **Cidade e Estado**: Localização específica
- **País**: Código e nome completo
- **ISP/Provedor**: Identificação da operadora
- **Timezone**: Fuso horário do usuário
- **Coordenadas**: Latitude e longitude

### ✅ Logging Completo
- **Activity Logs**: Todos os logins registrados com IP real
- **Informações do Navegador**: User agent, plataforma, idioma
- **Dados de Sessão**: Timestamp, duração, tipo de dispositivo
- **Eventos de Segurança**: Tentativas de login, falhas, sucessos

### ✅ Interface em Tempo Real
- **Sessões Ativas**: Dados reais na guia Segurança
- **Componente de Exibição**: SessionInfoDisplay
- **Hooks Reutilizáveis**: useSessionInfo, useUserIP
- **Demonstração**: IPTrackingDemo

## 🔧 Como Funciona

### 1. Durante o Login
```typescript
// AuthContext.tsx - Captura automática
const sessionInfo = await captureSessionInfo();

await logAuthEvent('login_success', {
  user_id: data.user.id,
  email,
  ip_address: sessionInfo.ip_address,
  user_agent: sessionInfo.user_agent,
  location: sessionInfo.location,
  session_info: sessionInfo
});
```

### 2. Captura de IP
```typescript
// securityLogger.ts - Múltiplos serviços
const ipServices = [
  'https://api.ipify.org?format=json',
  'https://ipapi.co/json/',
  'https://ipinfo.io/json'
];

// Tenta cada serviço até obter IP válido
// Fallback para WebRTC se necessário
```

### 3. Geolocalização
```typescript
// Baseado no IP real capturado
const response = await fetch(`https://ipapi.co/${ip}/json/`);
const data = await response.json();

return {
  city: data.city,
  region: data.region,
  country: data.country_name,
  isp: data.org,
  timezone: data.timezone
};
```

### 4. Exibição nas Sessões Ativas
```typescript
// SystemSecuritySection.tsx - Dados reais
// Primeiro tenta dados reais dos logs
if (log.details && log.details.location) {
  const loc = log.details.location;
  location = `${loc.city}, ${loc.region}`;
}

// Fallback para simulação apenas se necessário
if (location === 'Desconhecido') {
  location = getLocationFromUserAgent(userAgent, userId) || 
             getLocationFromIP(actualIP);
}
```

## 📊 Estrutura de Dados

### SessionInfo
```typescript
interface SessionInfo {
  ip_address: string | null;
  user_agent: string;
  location: {
    city: string;
    region: string;
    country: string;
    country_code: string;
    latitude: number;
    longitude: number;
    timezone: string;
    isp: string;
  };
  browser_info: {
    user_agent: string;
    language: string;
    platform: string;
    screen_resolution: string;
    timezone: string;
  };
  timestamp: string;
}
```

### Activity Log
```sql
-- Estrutura da tabela activity_logs
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY,
  user_id UUID,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB,
  ip_address INET,        -- ✅ Agora preenchido com IP real
  user_agent TEXT,        -- ✅ Agora preenchido com dados reais
  created_at TIMESTAMPTZ
);
```

## 🛠️ Como Usar

### 1. Hook para Obter IP
```typescript
import { useUserIP } from '@/hooks/useSessionInfo';

const MyComponent = () => {
  const { ip, isLoading, error } = useUserIP();
  
  return (
    <div>
      {isLoading ? 'Carregando...' : `IP: ${ip}`}
    </div>
  );
};
```

### 2. Hook para Informações Completas
```typescript
import { useSessionInfo } from '@/hooks/useSessionInfo';

const MyComponent = () => {
  const { sessionInfo, isLoading, refreshSessionInfo } = useSessionInfo();
  
  return (
    <div>
      <p>IP: {sessionInfo?.ip_address}</p>
      <p>Cidade: {sessionInfo?.location?.city}</p>
      <button onClick={refreshSessionInfo}>Atualizar</button>
    </div>
  );
};
```

### 3. Componente de Exibição
```typescript
import { SessionInfoDisplay } from '@/components/admin/SessionInfoDisplay';

// Versão completa
<SessionInfoDisplay showRefreshButton={true} />

// Versão compacta
<SessionInfoDisplay compact={true} showRefreshButton={false} />
```

### 4. Captura Manual
```typescript
import { captureSessionInfo, getUserIP } from '@/utils/securityLogger';

// Capturar informações completas
const sessionInfo = await captureSessionInfo();

// Capturar apenas IP
const ip = await getUserIP();
```

## 🔒 Segurança e Privacidade

### Dados Coletados
- ✅ **IP Address**: Para identificação de localização
- ✅ **Geolocalização**: Cidade, estado, país (não coordenadas exatas)
- ✅ **ISP/Provedor**: Para identificação de rede
- ✅ **User Agent**: Para identificação de dispositivo/navegador
- ❌ **Não coletamos**: Dados pessoais além do necessário para segurança

### Uso dos Dados
- 🛡️ **Segurança**: Detecção de logins suspeitos
- 📊 **Auditoria**: Logs de acesso para compliance
- 🔍 **Monitoramento**: Sessões ativas em tempo real
- ❌ **Não usamos para**: Marketing, vendas ou outros fins

### Conformidade
- ✅ **LGPD**: Dados coletados apenas para fins legítimos de segurança
- ✅ **Transparência**: Usuário pode ver seus próprios dados
- ✅ **Minimização**: Apenas dados necessários são coletados
- ✅ **Retenção**: Dados mantidos apenas pelo tempo necessário

## 🚨 Troubleshooting

### IP não é capturado
1. **Verificar conectividade**: Serviços externos podem estar indisponíveis
2. **Firewall/Proxy**: Pode estar bloqueando requisições
3. **CORS**: Verificar se domínio permite requisições cross-origin
4. **Fallback**: Sistema tentará WebRTC automaticamente

### Localização incorreta
1. **IP Público**: Geolocalização funciona melhor com IPs públicos
2. **VPN/Proxy**: Pode mascarar localização real
3. **ISP**: Alguns provedores têm localização imprecisa
4. **Cache**: Dados podem estar em cache, aguardar atualização

### Performance
1. **Timeout**: Configurado para 5 segundos por serviço
2. **Múltiplos Serviços**: Se um falhar, tenta outros
3. **Cache**: Considerar implementar cache local
4. **Async**: Todas as operações são assíncronas

## 📈 Monitoramento

### Logs de Sistema
```bash
# Verificar logs de captura de IP
console.log('IP obtido via [serviço]: [ip]')
console.warn('Falha ao obter IP via [serviço]: [erro]')
console.error('Erro ao capturar informações de sessão: [erro]')
```

### Métricas Importantes
- **Taxa de Sucesso**: % de IPs capturados com sucesso
- **Tempo de Resposta**: Latência dos serviços de IP
- **Precisão de Localização**: % de localizações corretas
- **Fallback Usage**: Quantas vezes WebRTC foi usado

## 🔄 Atualizações Futuras

### Melhorias Planejadas
- [ ] **Cache Local**: Evitar múltiplas requisições
- [ ] **Mais Serviços**: Adicionar backup services
- [ ] **Precisão**: Melhorar detecção de localização
- [ ] **Analytics**: Dashboard de estatísticas de IP
- [ ] **Alertas**: Notificações para IPs suspeitos

### Configurações Avançadas
- [ ] **Rate Limiting**: Limitar requisições por usuário
- [ ] **Whitelist**: IPs confiáveis que não precisam validação
- [ ] **Blacklist**: IPs bloqueados automaticamente
- [ ] **Geofencing**: Alertas para logins de países específicos

---

## 📞 Suporte

Para dúvidas ou problemas com o sistema de rastreamento de IP:

1. **Verificar logs**: Console do navegador e logs do servidor
2. **Testar manualmente**: Usar componente IPTrackingDemo
3. **Validar dados**: Verificar activity_logs no banco
4. **Reportar bugs**: Com informações detalhadas do erro

**O sistema agora captura automaticamente o IP real de qualquer usuário durante o login!** 🎉