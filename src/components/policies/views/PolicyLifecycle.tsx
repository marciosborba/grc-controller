import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Calendar,
  AlertTriangle,
  Clock,
  RefreshCw,
  Archive,
  CheckCircle,
  XCircle,
  Bell,
  FileText,
  Download,
  Eye,
  Edit
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PolicyLifecycleProps {
  policies: any[];
  onPolicyUpdate: () => void;
  alexConfig?: any;
}

const PolicyLifecycle: React.FC<PolicyLifecycleProps> = ({
  policies,
  onPolicyUpdate,
  alexConfig
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPolicy, setSelectedPolicy] = useState<any>(null);
  const [newReviewDate, setNewReviewDate] = useState('');
  const [newExpiryDate, setNewExpiryDate] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Calcular políticas por status de ciclo de vida
  const today = new Date();
  const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  const expiringSoon = policies.filter(p => {
    if (!p.expiration_date) return false;
    const expiryDate = new Date(p.expiration_date);
    return expiryDate <= thirtyDaysFromNow && expiryDate >= today;
  });

  const needingReview = policies.filter(p => {
    if (!p.review_date) return false;
    const reviewDate = new Date(p.review_date);
    return reviewDate <= thirtyDaysFromNow && reviewDate >= today;
  });

  const expired = policies.filter(p => {
    if (!p.expiration_date) return false;
    const expiryDate = new Date(p.expiration_date);
    return expiryDate < today;
  });

  const active = policies.filter(p => p.status === 'published' && !expired.includes(p));

  const handleUpdateDates = async (policyId: string) => {
    if (!newReviewDate && !newExpiryDate) {
      toast({
        title: "Nenhuma alteração",
        description: "Por favor, defina pelo menos uma nova data",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
        updated_by: user?.id
      };

      if (newReviewDate) {
        updateData.next_review_date = newReviewDate;
      }
      if (newExpiryDate) {
        updateData.expiry_date = newExpiryDate;
      }

      const { error } = await supabase
        .from('policies')
        .update(updateData)
        .eq('id', policyId);

      if (error) throw error;

      toast({
        title: "Datas atualizadas",
        description: "As datas da política foram atualizadas com sucesso",
      });

      setNewReviewDate('');
      setNewExpiryDate('');
      setSelectedPolicy(null);
      onPolicyUpdate();
    } catch (error) {
      console.error('Erro ao atualizar datas:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar datas da política",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleArchivePolicy = async (policyId: string) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('policies')
        .update({
          status: 'archived',
          is_active: false,
          updated_at: new Date().toISOString(),
          updated_by: user?.id
        })
        .eq('id', policyId);

      if (error) throw error;

      toast({
        title: "Política arquivada",
        description: "A política foi arquivada com sucesso",
      });

      setSelectedPolicy(null);
      onPolicyUpdate();
    } catch (error) {
      console.error('Erro ao arquivar política:', error);
      toast({
        title: "Erro",
        description: "Erro ao arquivar política",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Content Management State
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [policyContent, setPolicyContent] = useState('');

  const generateDefaultContent = (policy: any) => {
    const effectiveDate = policy.effective_date ? new Date(policy.effective_date).toLocaleDateString('pt-BR') : 'A definir';
    const title = policy.title || 'Política Corporativa';
    const companyName = 'GRC Controller Corp'; // Placeholder

    const commonHeader = `
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2E74B5; font-size: 24px; margin-bottom: 10px;">${title}</h1>
        <p style="color: #666; font-size: 14px;"><strong>Classificação:</strong> Uso Interno | <strong>Versão:</strong> 1.0</p>
        <p style="color: #666; font-size: 14px;"><strong>Vigência:</strong> ${effectiveDate}</p>
      </div>
      <hr style="border: 1px solid #ddd; margin: 20px 0;" />
    `;

    const commonFooter = `
      <div style="margin-top: 40px; border-top: 1px solid #ddd; padding-top: 10px;">
        <p style="font-style: italic; font-size: 11px; color: #888; text-align: center;">
          Este documento é de propriedade da ${companyName}. A reprodução não autorizada é proibida.<br/>
          Gerado automaticamente pelo Sistema GRC.
        </p>
      </div>
    `;

    // Template Selector
    let specificContent = '';

    if (title.includes('Segurança da Informação')) {
      specificContent = `
        <h2 style="color: #2E74B5; margin-top: 20px;">1. Objetivo</h2>
        <p>A Política Geral de Segurança da Informação (PSI) tem como objetivo estabelecer as diretrizes e normas corporativas para garantir a <strong>Confidencialidade, Integridade e Disponibilidade</strong> dos ativos de informação da ${companyName}. Esta política serve como alicerce para o Sistema de Gestão de Segurança da Informação (SGSI), alinhado às melhores práticas de mercado (ISO/IEC 27001) e regulamentações vigentes.</p>

        <h2 style="color: #2E74B5; margin-top: 20px;">2. Escopo</h2>
        <p>Esta política aplica-se a todos os colaboradores (CLT, PJ, estagiários), prestadores de serviços, fornecedores e parceiros de negócios que utilizam, acessam ou gerenciam ativos de informação da ${companyName}, independentemente de sua localização física.</p>

        <h2 style="color: #2E74B5; margin-top: 20px;">3. Governança e Responsabilidades</h2>
        <ul>
            <li><strong>Comitê de Segurança:</strong> Responsável por aprovar políticas e supervisionar o SGSI.</li>
            <li><strong>CISO / Responsável por SI:</strong> Responsável por manter esta política atualizada e monitorar sua conformidade.</li>
            <li><strong>Gestores:</strong> Garantir que suas equipes cumpram as diretrizes aqui estabelecidas.</li>
            <li><strong>Colaboradores:</strong> Responsáveis por proteger suas credenciais e utilizar os recursos da empresa de forma ética e segura.</li>
        </ul>

        <h2 style="color: #2E74B5; margin-top: 20px;">4. Gestão de Ativos</h2>
        <h3>4.1. Uso Aceitável</h3>
        <p>Os recursos tecnológicos (computadores, e-mail, internet) são ferramentas de trabalho. O uso pessoal é permitido de forma restrita e não monitorada, desde que não infrinja leis ou esta política.</p>
        <h3>4.2. Classificação da Informação</h3>
        <p>Todas as informações devem ser classificadas (ex: Pública, Interna, Confidencial) e rotuladas adequadamente, recebendo controles de proteção proporcionais ao seu nível de sensibilidade.</p>

        <h2 style="color: #2E74B5; margin-top: 20px;">5. Segurança em Recursos Humanos</h2>
        <p>Verificações de antecedentes devem ser realizadas antes da contratação para cargos críticos. No desligamento, todos os acessos devem ser revogados imediatamente e os equipamentos devolvidos.</p>

        <h2 style="color: #2E74B5; margin-top: 20px;">6. Segurança Física e do Ambiente</h2>
        <p>Áreas seguras devem ser protegidas por controles de entrada físicos. Aplica-se a política de "Mesa Limpa e Tela Bloqueada" para evitar acesso não autorizado a informações sensíveis em ambientes de trabalho.</p>

        <h2 style="color: #2E74B5; margin-top: 20px;">7. Controle de Acesso</h2>
        <ul>
            <li><strong>Princípio do Menor Privilégio:</strong> Usuários devem ter apenas os acessos estritamente necessários para suas funções.</li>
            <li><strong>Autenticação:</strong> O uso de senhas fortes e Múltiplo Fator de Autenticação (MFA) é obrigatório para sistemas críticos.</li>
            <li><strong>Revisão:</strong> Os direitos de acesso devem ser revisados periodicamente (no mínimo semestralmente).</li>
        </ul>

        <h2 style="color: #2E74B5; margin-top: 20px;">8. Segurança nas Operações</h2>
        <p>Devem ser implementados controles contra softwares maliciosos (antivírus), realização de backups periódicos com testes de restauração e gestão de vulnerabilidades técnicas.</p>
        
        <h2 style="color: #2E74B5; margin-top: 20px;">9. Segurança nas Comunicações</h2>
        <p>Toda transferência de informação confidencial através de redes públicas deve ser protegida (ex: criptografia/VPN). O tráfego de rede deve ser monitorado para identificar anomalias.</p>

        <h2 style="color: #2E74B5; margin-top: 20px;">10. Gestão de Incidentes</h2>
        <p>Qualquer suspeita de violação de segurança, perda de equipamento ou comportamento anômalo deve ser reportada imediatamente ao Canal de Segurança.</p>

        <h2 style="color: #2E74B5; margin-top: 20px;">11. Conformidade e Sanções</h2>
        <p>O não cumprimento desta política será tratado como falta grave, sujeito a medidas disciplinares que podem incluir advertência, suspensão ou demissão por justa causa, sem prejuízo das ações legais cabíveis.</p>
      `;
    } else if (title.includes('Ética')) {
      specificContent = `
        <h2 style="color: #2E74B5; margin-top: 20px;">1. Introdução</h2>
        <p>O Código de Ética Empresarial da ${companyName} reflete nosso compromisso com a integridade, transparência e respeito em todas as nossas relações comerciais e profissionais.</p>

        <h2 style="color: #2E74B5; margin-top: 20px;">2. Valores Fundamentais</h2>
        <ul>
          <li><strong>Integridade:</strong> Agir com honestidade e verdade em todas as situações.</li>
          <li><strong>Respeito:</strong> Tratar todas as pessoas com dignidade, sem discriminação de qualquer natureza.</li>
          <li><strong>Responsabilidade:</strong> Assumir as consequências de nossas ações e decisões.</li>
        </ul>

        <h2 style="color: #2E74B5; margin-top: 20px;">3. Conduta no Ambiente de Trabalho</h2>
        <h3>3.1. Direitos Humanos e Diversidade</h3>
        <p>Promovemos um ambiente inclusivo e livre de assédio. Não toleramos discriminação baseada em raça, gênero, religião, orientação sexual ou qualquer outra característica.</p>

        <h3>3.2. Conflito de Interesses</h3>
        <p>Os colaboradores devem evitar situações onde seus interesses pessoais possam conflitar, ou parecer conflitar, com os interesses da empresa.</p>

        <h2 style="color: #2E74B5; margin-top: 20px;">4. Relações com Terceiros</h2>
        <h3>4.1. Clientes e Fornecedores</h3>
        <p>As relações devem ser baseadas na confiança e no benefício mútuo. Presentes e entretenimento devem ser modestos e transparentes, em conformidade com a política de anticorrupção.</p>

        <h2 style="color: #2E74B5; margin-top: 20px;">5. Canal de Denúncias</h2>
        <p>Encorajamos o reporte de qualquer conduta que viole este código. O canal de ética garante confidencialidade e não retaliação aos denunciantes de boa-fé.</p>
      `;
    } else if (title.includes('Incidentes')) {
      specificContent = `
        <h2 style="color: #2E74B5; margin-top: 20px;">1. Objetivo</h2>
        <p>Definir o processo para detecção, registro, análise, contenção e recuperação de incidentes de segurança da informação, visando minimizar impactos nas operações da ${companyName}.</p>

        <h2 style="color: #2E74B5; margin-top: 20px;">2. Definições</h2>
        <p><strong>Incidente de Segurança:</strong> Qualquer evento adverso que comprometa a confidencialidade, integridade ou disponibilidade de um ativo de informação.</p>

        <h2 style="color: #2E74B5; margin-top: 20px;">3. Classificação de Incidentes</h2>
        <ul>
          <li><strong>Baixo:</strong> Impacto local, sem vazamento de dados sensíveis.</li>
          <li><strong>Médio:</strong> Interrupção parcial de serviços ou risco moderado à informação.</li>
          <li><strong>Crítico:</strong> Vazamento de dados, paralisação de serviços críticos ou danos reputacionais severos.</li>
        </ul>

        <h2 style="color: #2E74B5; margin-top: 20px;">4. Fluxo de Resposta</h2>
        <ol>
          <li><strong>Detecção e Reporte:</strong> Identificação do evento e notificação via Service Desk.</li>
          <li><strong>Triagem:</strong> Avaliação inicial e classificação de severidade.</li>
          <li><strong>Contenção:</strong> Medidas imediatas para limitar o dano.</li>
          <li><strong>Erradicação e Recuperação:</strong> Remoção da causa raiz e restauração dos serviços.</li>
          <li><strong>Lições Aprendidas:</strong> Análise pós-incidente para prevenir recorrência.</li>
        </ol>

        <h2 style="color: #2E74B5; margin-top: 20px;">5. Comunicação</h2>
        <p>A comunicação externa sobre incidentes graves deve ser conduzida exclusivamente pela assessoria de imprensa e diretoria jurídica.</p>
      `;
    } else if (title.includes('Backup') || title.includes('Recuperação')) {
      specificContent = `
        <h2 style="color: #2E74B5; margin-top: 20px;">1. Objetivo</h2>
        <p>Garantir a recuperabilidade dos dados e sistemas críticos da ${companyName} em caso de falhas, desastres ou perda acidental de informações.</p>

        <h2 style="color: #2E74B5; margin-top: 20px;">2. Tipos de Backup</h2>
        <ul>
          <li><strong>Completo (Full):</strong> Cópia de todos os dados selecionados. Execução semanal.</li>
          <li><strong>Incremental:</strong> Cópia apenas dos dados alterados desde o último backup. Execução diária.</li>
        </ul>

        <h2 style="color: #2E74B5; margin-top: 20px;">3. Retenção e Armazenamento</h2>
        <p>Os backups devem ser armazenados em local físico ou nuvem distinto do ambiente de produção (estratégia 3-2-1). A retenção deve seguir a tabela de temporalidade definida pelo Jurídico.</p>

        <h2 style="color: #2E74B5; margin-top: 20px;">4. Testes de Restauração</h2>
        <p>Testes de restauração devem ser realizados trimestralmente para validar a integridade dos dados e a eficácia dos procedimentos de recuperação.</p>
      `;
    } else if (title.includes('Recursos Humanos')) {
      specificContent = `
        <h2 style="color: #2E74B5; margin-top: 20px;">1. Objetivo</h2>
        <p>Estabelecer diretrizes para a gestão de pessoas na ${companyName}, promovendo o desenvolvimento, bem-estar e alinhamento com a cultura organizacional.</p>

        <h2 style="color: #2E74B5; margin-top: 20px;">2. Recrutamento e Seleção</h2>
        <p>O processo seletivo deve pautar-se pela competência técnica e comportamental, garantindo igualdade de oportunidades a todos os candidatos.</p>

        <h2 style="color: #2E74B5; margin-top: 20px;">3. Treinamento e Desenvolvimento</h2>
        <p>A empresa incentiva o aprendizado contínuo. Planos de desenvolvimento individual (PDI) devem ser elaborados anualmente entre gestor e colaborador.</p>

        <h2 style="color: #2E74B5; margin-top: 20px;">4. Avaliação de Desempenho</h2>
        <p>O desempenho será avaliado periodicamente com base em metas claras e feedback construtivo, visando o crescimento profissional.</p>
      `;
    } else {
      // Generic Template
      specificContent = `
        <h2 style="color: #2E74B5; margin-top: 20px;">1. Objetivo</h2>
        <p>O objetivo desta política é estabelecer as diretrizes fundamentais para ${title}, garantindo a conformidade com as normas internas e regulamentos aplicáveis.</p>
        
        <h2 style="color: #2E74B5; margin-top: 20px;">2. Escopo</h2>
        <p>Esta política aplica-se a todos os colaboradores, contratados e parceiros de negócios que tenham acesso aos ativos de informação da organização.</p>
        
        <h2 style="color: #2E74B5; margin-top: 20px;">3. Diretrizes Gerais</h2>
        <p>3.1. Todos os envolvidos devem zelar pela confidencialidade, integridade e disponibilidade das informações.</p>
        <p>3.2. Os processos descritos neste documento são mandatórios e auditáveis.</p>
        
        <h2 style="color: #2E74B5; margin-top: 20px;">4. Responsabilidades</h2>
        <p><strong>Colaboradores:</strong> Cumprir integralmente as diretrizes aqui estabelecidas.</p>
        <p><strong>Gestores:</strong> Garantir a disseminação e o entendimento desta política por suas equipes.</p>
        
        <h2 style="color: #2E74B5; margin-top: 20px;">5. Disposições Finais</h2>
        <p>Esta política entra em vigor na data de sua publicação e deve ser revisada anualmente ou quando houver mudanças significativas no processo.</p>
      `;
    }

    return commonHeader + specificContent + commonFooter;
  };

  const handleDownloadWord = (policy: any) => {
    const content = policy.content || generateDefaultContent(policy);
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>" + policy.title + "</title></head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + content + footer;

    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `${policy.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
    toast({ title: "Download iniciado", description: "O documento Word está sendo baixado." });
  };

  const openViewDialog = (policy: any) => {
    setPolicyContent(policy.content || generateDefaultContent(policy));
    setViewDialogOpen(true);
  };

  const openEditDialog = (policy: any) => {
    setPolicyContent(policy.content || generateDefaultContent(policy));
    setEditDialogOpen(true);
  };

  const handleSaveContent = async () => {
    if (!selectedPolicy) return;
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('policies')
        .update({
          content: policyContent,
          updated_at: new Date().toISOString(),
          updated_by: user?.id
        })
        .eq('id', selectedPolicy.id);

      if (error) throw error;

      toast({ title: "Conteúdo salvo", description: "O documento foi atualizado com sucesso." });
      setEditDialogOpen(false);
      onPolicyUpdate();
      // Update local state if needed
      if (selectedPolicy) selectedPolicy.content = policyContent;
    } catch (error) {
      console.error('Erro ao salvar conteúdo:', error);
      toast({ title: "Erro", description: "Falha ao salvar conteúdo.", variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  const getLifecycleStatus = (policy: any) => {
    const today = new Date();
    const thirtyDays = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    if (policy.expiry_date) {
      const expiryDate = new Date(policy.expiry_date);
      if (expiryDate < today) {
        return { status: 'expired', label: 'Expirada', color: 'destructive', icon: XCircle };
      }
      if (expiryDate <= thirtyDays) {
        return { status: 'expiring', label: 'Expirando', color: 'destructive', icon: AlertTriangle };
      }
    }

    if (policy.next_review_date) {
      const reviewDate = new Date(policy.next_review_date);
      if (reviewDate <= thirtyDays) {
        return { status: 'review_due', label: 'Revisão Pendente', color: 'default', icon: Clock };
      }
    }

    if (policy.status === 'published') {
      return { status: 'active', label: 'Ativa', color: 'default', icon: CheckCircle };
    }

    return { status: 'draft', label: 'Rascunho', color: 'secondary', icon: Clock };
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Não definida';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getDaysUntil = (dateString: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Ciclo de Vida das Políticas</h2>
          <p className="text-muted-foreground">
            Gerencie validade, revisões e arquivamento de políticas
          </p>
        </div>
      </div>

      {/* Estatísticas do ciclo de vida */}


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista de políticas */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Políticas por Status</h3>

          {/* Políticas expiradas */}
          {expired.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-red-600 dark:text-red-400 mb-2">Expiradas ({expired.length})</h4>
              <div className="space-y-2">
                {expired.map((policy) => {
                  const lifecycleStatus = getLifecycleStatus(policy);
                  const Icon = lifecycleStatus.icon;
                  return (
                    <Card
                      key={policy.id}
                      className={`cursor-pointer transition-all hover:shadow-md border-red-200 ${selectedPolicy?.id === policy.id ? 'ring-2 ring-primary' : ''
                        }`}
                      onClick={() => setSelectedPolicy(policy)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{policy.title}</div>
                            <div className="text-xs text-muted-foreground">
                              Expirou em: {formatDate(policy.expiry_date)}
                            </div>
                          </div>
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <Icon className="h-3 w-3" />
                            {lifecycleStatus.label}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Políticas expirando */}
          {expiringSoon.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-orange-600 dark:text-orange-400 mb-2">Expirando em Breve ({expiringSoon.length})</h4>
              <div className="space-y-2">
                {expiringSoon.map((policy) => {
                  const daysUntil = getDaysUntil(policy.expiry_date);
                  const lifecycleStatus = getLifecycleStatus(policy);
                  const Icon = lifecycleStatus.icon;
                  return (
                    <Card
                      key={policy.id}
                      className={`cursor-pointer transition-all hover:shadow-md border-orange-200 ${selectedPolicy?.id === policy.id ? 'ring-2 ring-primary' : ''
                        }`}
                      onClick={() => setSelectedPolicy(policy)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{policy.title}</div>
                            <div className="text-xs text-muted-foreground">
                              Expira em {daysUntil} dia(s) - {formatDate(policy.expiry_date)}
                            </div>
                          </div>
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <Icon className="h-3 w-3" />
                            {daysUntil}d
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Políticas precisando revisão */}
          {needingReview.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-yellow-600 dark:text-yellow-400 mb-2">Precisam Revisão ({needingReview.length})</h4>
              <div className="space-y-2">
                {needingReview.map((policy) => {
                  const daysUntil = getDaysUntil(policy.next_review_date);
                  const lifecycleStatus = getLifecycleStatus(policy);
                  const Icon = lifecycleStatus.icon;
                  return (
                    <Card
                      key={policy.id}
                      className={`cursor-pointer transition-all hover:shadow-md border-yellow-200 ${selectedPolicy?.id === policy.id ? 'ring-2 ring-primary' : ''
                        }`}
                      onClick={() => setSelectedPolicy(policy)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{policy.title}</div>
                            <div className="text-xs text-muted-foreground">
                              Revisão em {daysUntil} dia(s) - {formatDate(policy.next_review_date)}
                            </div>
                          </div>
                          <Badge variant="default" className="flex items-center gap-1">
                            <Icon className="h-3 w-3" />
                            {daysUntil}d
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Políticas ativas */}
          {active.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-green-600 dark:text-green-400 mb-2">Ativas ({active.length})</h4>
              <div className="space-y-2">
                {active.slice(0, 5).map((policy) => {
                  const lifecycleStatus = getLifecycleStatus(policy);
                  const Icon = lifecycleStatus.icon;
                  return (
                    <Card
                      key={policy.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${selectedPolicy?.id === policy.id ? 'ring-2 ring-primary' : ''
                        }`}
                      onClick={() => setSelectedPolicy(policy)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{policy.title}</div>
                            <div className="text-xs text-muted-foreground">
                              Categoria: {policy.category}
                            </div>
                          </div>
                          <Badge variant="default" className="flex items-center gap-1">
                            <Icon className="h-3 w-3" />
                            {lifecycleStatus.label}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Painel de gestão */}
        <div className="space-y-4">
          {selectedPolicy ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Gestão: {selectedPolicy.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Status atual */}
                  <div>
                    <label className="text-sm font-medium">Status Atual</label>
                    <div className="mt-1">
                      {(() => {
                        const lifecycleStatus = getLifecycleStatus(selectedPolicy);
                        const Icon = lifecycleStatus.icon;
                        return (
                          <Badge variant={lifecycleStatus.color as any} className="flex items-center gap-1 w-fit">
                            <Icon className="h-3 w-3" />
                            {lifecycleStatus.label}
                          </Badge>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Datas atuais */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Data de Vigência</label>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(selectedPolicy.effective_date)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Data de Expiração</label>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(selectedPolicy.expiry_date)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Próxima Revisão</label>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(selectedPolicy.next_review_date)}
                    </p>
                  </div>

                  {/* Atualizar datas */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Nova Data de Revisão</label>
                      <Input
                        type="date"
                        value={newReviewDate}
                        onChange={(e) => setNewReviewDate(e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Nova Data de Expiração</label>
                      <Input
                        type="date"
                        value={newExpiryDate}
                        onChange={(e) => setNewExpiryDate(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="space-y-2">
                    <Button
                      onClick={() => handleUpdateDates(selectedPolicy.id)}
                      disabled={isUpdating || (!newReviewDate && !newExpiryDate)}
                      className="w-full"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Atualizar Datas
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => handleArchivePolicy(selectedPolicy.id)}
                      disabled={isUpdating}
                      className="w-full"
                    >
                      <Archive className="h-4 w-4 mr-2" />
                      Arquivar Política
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Ações de Documento */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Documento da Política
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" size="sm" onClick={() => openViewDialog(selectedPolicy)} title="Ler Online">
                      <Eye className="h-4 w-4 mr-1" /> Ler
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(selectedPolicy)} title="Editar Conteúdo">
                      <Edit className="h-4 w-4 mr-1" /> Editar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDownloadWord(selectedPolicy)} title="Baixar Word">
                      <Download className="h-4 w-4 mr-1" /> Word
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* View Dialog */}
              <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{selectedPolicy?.title}</DialogTitle>
                  </DialogHeader>
                  <div className="prose dark:prose-invert max-w-none p-4 bg-muted/30 rounded-lg min-h-[300px]" dangerouslySetInnerHTML={{ __html: policyContent }} />
                  <DialogFooter>
                    <Button onClick={() => handleDownloadWord(selectedPolicy)}>
                      <Download className="h-4 w-4 mr-2" /> Baixar Word
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Edit Dialog */}
              <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                  <DialogHeader>
                    <DialogTitle>Editar Documento: {selectedPolicy?.title}</DialogTitle>
                    <DialogDescription>Edite o conteúdo da política (formato HTML suportado).</DialogDescription>
                  </DialogHeader>
                  <div className="flex-1 p-1">
                    <Textarea
                      value={policyContent}
                      onChange={(e) => setPolicyContent(e.target.value)}
                      className="h-full font-mono text-sm resize-none"
                      placeholder="<html>...</html>"
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handleSaveContent} disabled={isUpdating}>
                      <RefreshCw className={`h-4 w-4 mr-2 ${isUpdating ? 'animate-spin' : ''}`} />
                      Salvar Alterações
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Alertas e notificações */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Alertas Configurados
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Alerta 30 dias antes da expiração</span>
                      <Badge variant="outline">Ativo</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Alerta 15 dias antes da revisão</span>
                      <Badge variant="outline">Ativo</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Notificação de expiração</span>
                      <Badge variant="outline">Ativo</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Selecione uma Política</h3>
                <p className="text-muted-foreground">
                  Clique em uma política na lista para gerenciar seu ciclo de vida
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PolicyLifecycle;