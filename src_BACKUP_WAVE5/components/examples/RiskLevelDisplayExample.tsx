import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { RiskLevelDisplay } from '@/components/ui/risk-level-display';

const RiskLevelDisplayExample = () => {
  // Dados de exemplo para demonstrar o componente
  const sampleRisks = [
    { id: 1, risk_level: 'Muito Alto' },
    { id: 2, risk_level: 'Alto' },
    { id: 3, risk_level: 'Alto' },
    { id: 4, risk_level: 'Médio' },
    { id: 5, risk_level: 'Médio' },
    { id: 6, risk_level: 'Médio' },
    { id: 7, risk_level: 'Baixo' },
    { id: 8, risk_level: 'Baixo' },
    { id: 9, risk_level: 'Muito Baixo' }
  ];

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Exemplos do Componente RiskLevelDisplay</h1>
      
      {/* Exemplo 1: Exibição com contagem de riscos */}
      <Card>
        <CardHeader>
          <CardTitle>Contagem de Riscos por Nível</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Este exemplo mostra a contagem de riscos por nível, usando as cores e níveis configurados na tenant.
          </p>
          <RiskLevelDisplay 
            risks={sampleRisks}
            size="md"
            responsive={true}
          />
        </CardContent>
      </Card>

      {/* Exemplo 2: Apenas níveis (sem contagem) */}
      <Card>
        <CardHeader>
          <CardTitle>Apenas Níveis de Risco</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Este exemplo mostra apenas os níveis de risco configurados, sem contagem.
          </p>
          <RiskLevelDisplay 
            showOnlyLevels={true}
            size="md"
            responsive={true}
          />
        </CardContent>
      </Card>

      {/* Exemplo 3: Tamanho pequeno */}
      <Card>
        <CardHeader>
          <CardTitle>Tamanho Pequeno</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Versão compacta para uso em dashboards ou espaços limitados.
          </p>
          <RiskLevelDisplay 
            risks={sampleRisks}
            size="sm"
            responsive={true}
          />
        </CardContent>
      </Card>

      {/* Exemplo 4: Tamanho grande */}
      <Card>
        <CardHeader>
          <CardTitle>Tamanho Grande</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Versão ampliada para destaque em relatórios ou apresentações.
          </p>
          <RiskLevelDisplay 
            risks={sampleRisks}
            size="lg"
            responsive={true}
          />
        </CardContent>
      </Card>

      {/* Exemplo 5: Layout fixo (não responsivo) */}
      <Card>
        <CardHeader>
          <CardTitle>Layout Fixo (Adapta-se ao Número de Níveis)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Layout fixo que automaticamente usa o número correto de colunas baseado na configuração da matriz da tenant.
          </p>
          <RiskLevelDisplay 
            risks={sampleRisks}
            size="md"
            responsive={false}
          />
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Adaptação automática:</strong><br/>
              • Matriz 3x3: 3 colunas<br/>
              • Matriz 4x4: 4 colunas<br/>
              • Matriz 5x5: 5 colunas
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Informações sobre configuração */}
      <Card>
        <CardHeader>
          <CardTitle>Como Funciona</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold">Configuração Automática</h4>
              <p className="text-muted-foreground">
                O componente automaticamente se adapta à configuração da matriz de risco da tenant:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                <li><strong>Matriz 3x3:</strong> Exibe 3 níveis (Baixo, Médio, Alto) em 3 colunas</li>
                <li><strong>Matriz 4x4:</strong> Exibe 4 níveis (Baixo, Médio, Alto, Crítico) em 4 colunas</li>
                <li><strong>Matriz 5x5:</strong> Exibe 5 níveis (Muito Baixo, Baixo, Médio, Alto, Muito Alto) em 5 colunas</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold">Grid Dinâmico</h4>
              <p className="text-muted-foreground">
                O layout do grid se adapta automaticamente ao número de níveis configurados, 
                evitando espaços vazios e garantindo uma apresentação visual otimizada.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold">Cores Personalizadas</h4>
              <p className="text-muted-foreground">
                Se a tenant tiver cores personalizadas configuradas na matriz de risco, 
                o componente usará essas cores automaticamente.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold">Propriedades</h4>
              <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                <li><strong>risks:</strong> Array de riscos para contagem por nível</li>
                <li><strong>showOnlyLevels:</strong> Mostra apenas os níveis sem contagem</li>
                <li><strong>size:</strong> Tamanho dos cards (sm, md, lg)</li>
                <li><strong>responsive:</strong> Layout responsivo (adapta-se à tela) ou fixo (adapta-se ao número de níveis)</li>
                <li><strong>className:</strong> Classes CSS adicionais</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold">Mapeamento de Dados</h4>
              <p className="text-muted-foreground">
                Para dashboards que usam níveis numéricos (1-5), é necessário mapear para os nomes 
                corretos baseados na configuração da tenant. Veja o exemplo no AuditoriasDashboard.tsx.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RiskLevelDisplayExample;