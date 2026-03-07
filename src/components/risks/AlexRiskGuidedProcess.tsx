import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  FileText, BarChart3, History, Shield, ClipboardList, Users, Eye,
  RefreshCw, CheckCircle, ChevronLeft, ChevronRight, Plus, Trash2, Library,
  MessageCircle, CheckSquare
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { RiskRegistrationData } from './wizard/RiskRegistrationWizard';
import { RiskLibraryFixed } from './shared/RiskLibraryFixed';
import type { RiskTemplate as DBRiskTemplate } from '@/types/riskTemplate';

export interface AlexRiskGuidedProcessProps {
  onComplete: (data: Partial<RiskRegistrationData> & Record<string, any>) => void;
  onCancel: () => void;
}

export const AlexRiskGuidedProcess: React.FC<AlexRiskGuidedProcessProps> = ({
  onComplete,
  onCancel,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [registrationData, setRegistrationData] = useState<Partial<RiskRegistrationData> & Record<string, any>>({});
  const [showRiskLibrary, setShowRiskLibrary] = useState(false);

  // States from previous version
  const [actionPlanItems, setActionPlanItems] = useState<any[]>([]);
  const [stakeholders, setStakeholders] = useState<any[]>([]);

  const [matrixConfig, setMatrixConfig] = useState({
    type: '5x5',
    impactLabels: ['Muito Baixo', 'Baixo', 'Moderado', 'Alto', 'Extremo'],
    probabilityLabels: ['Muito Raro', 'Raro', 'Possível', 'Provável', 'Quase Certo'],
    riskLevels: {}
  });

  const steps = [
    { id: 1, title: 'Identificação', icon: FileText },
    { id: 2, title: 'Análise', icon: BarChart3 },
    { id: 3, title: 'Avaliação', icon: CheckSquare },
    { id: 4, title: 'Contexto', icon: History },
    { id: 5, title: 'Controles', icon: Shield },
    { id: 6, title: 'Planos de Ação', icon: ClipboardList },
    { id: 7, title: 'Comunicação', icon: Users },
    { id: 8, title: 'Monitoramento', icon: Eye }
  ];

  useEffect(() => {
    const loadMatrixConfiguration = async () => {
      if (!user?.tenantId) return;

      try {
        const { data, error } = await supabase
          .from('tenants')
          .select('settings')
          .eq('id', user.tenantId)
          .single();

        if (error) throw error;

        const riskMatrixConfig = data?.settings?.risk_matrix;
        if (riskMatrixConfig) {
          setMatrixConfig({
            type: riskMatrixConfig.type || '5x5',
            impactLabels: riskMatrixConfig.impact_labels || matrixConfig.impactLabels,
            probabilityLabels: riskMatrixConfig.probability_labels || matrixConfig.probabilityLabels,
            riskLevels: riskMatrixConfig.risk_levels || {}
          });
        }
      } catch (error) {
        console.error('Erro ao carregar matriz:', error);
      }
    };
    loadMatrixConfiguration();
  }, [user?.tenantId]);

  const handleSelectTemplate = async (template: DBRiskTemplate) => {
    const templateData: Partial<RiskRegistrationData> = {
      risk_title: template.name,
      risk_description: template.description,
      risk_category: template.category,
      risk_subcategory: template.industry,
      kpi_definition: template.kris?.map(k => k.kriDescription).join('\n') || '',
      metadata: {
        control_measures: template.controls?.map(c => c.controlDescription).join('\n') || ''
      }
    };
    setRegistrationData(prev => ({ ...prev, ...templateData }));
    setShowRiskLibrary(false);
  };

  const updateRegistrationData = useCallback((newData: Partial<RiskRegistrationData> & Record<string, any>) => {
    setRegistrationData(prev => ({ ...prev, ...newData }));
  }, []);

  const handleNext = async () => {
    // Basic validations
    if (currentStep === 1 && (!registrationData.risk_title || !registrationData.risk_category)) {
      toast({
        title: 'Campos Obrigatórios',
        description: 'Preencha o título e a categoria do risco.',
        variant: 'destructive'
      });
      return;
    }

    if (currentStep === 2 && !registrationData.methodology_id) {
      toast({
        title: 'Campos Obrigatórios',
        description: 'Selecione uma metodologia de análise.',
        variant: 'destructive'
      });
      return;
    }

    setCurrentStep(prev => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      const finalData = { ...registrationData };

      onComplete({
        ...finalData,
        action_plans: actionPlanItems,
        stakeholders: stakeholders
      });
    } catch (error) {
      console.error('Erro ao finalizar:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível finalizar o registro.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepForm = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Identificação do Risco</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Título do Risco *</label>
                <Input
                  value={registrationData.risk_title || ''}
                  onChange={(e) => updateRegistrationData({ risk_title: e.target.value })}
                  placeholder="Ex: Falha no sistema de backup principal"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Categoria *</label>
                <Select
                  value={registrationData.risk_category || ''}
                  onValueChange={(value) => updateRegistrationData({ risk_category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operational">Operacional</SelectItem>
                    <SelectItem value="financial">Financeiro</SelectItem>
                    <SelectItem value="strategic">Estratégico</SelectItem>
                    <SelectItem value="compliance">Conformidade</SelectItem>
                    <SelectItem value="technology">Tecnologia</SelectItem>
                    <SelectItem value="reputation">Reputação</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-medium">Descrição Detalhada *</label>
                  <Button variant="outline" size="sm" onClick={() => setShowRiskLibrary(true)}>
                    <Library className="h-4 w-4 mr-2" />
                    Biblioteca de Riscos
                  </Button>
                </div>
                <Textarea
                  value={registrationData.risk_description || ''}
                  onChange={(e) => updateRegistrationData({ risk_description: e.target.value })}
                  placeholder="Descreva o risco em detalhes..."
                  rows={4}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Metodologia e Análise</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                { id: 'qualitative', title: 'Qualitativo', desc: 'Matriz PxI' },
                { id: 'quantitative', title: 'Quantitativo', desc: 'Financeiro' },
                { id: 'simplificado', title: 'Simplificado', desc: 'Avaliação Rápida' },
                { id: 'iso31000', title: 'ISO 31000', desc: 'Prática Global' },
                { id: 'cis', title: 'CIS Controls', desc: 'Controles Críticos' },
                { id: 'nist', title: 'NIST', desc: 'Cyber Framework' },
                { id: 'fair', title: 'FAIR', desc: 'Quantificação TI' },
                { id: 'coso', title: 'COSO ERM', desc: 'Gestão Corp' }
              ].map(m => (
                <Card
                  key={m.id}
                  className={`cursor-pointer transition-all ${registrationData.methodology_id === m.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
                  onClick={() => updateRegistrationData({ methodology_id: m.id })}
                >
                  <CardContent className="p-3 text-center">
                    <p className="font-semibold text-sm">{m.title}</p>
                    <p className="text-xs text-muted-foreground">{m.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-medium mb-4 flex items-center">
                <BarChart3 className="h-4 w-4 mr-2" />
                Variáveis da Metodologia
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(!registrationData.methodology_id || registrationData.methodology_id === 'qualitative' || registrationData.methodology_id === 'iso31000') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">Impacto / Consequência</label>
                      <Select
                        value={registrationData.impact?.toString() || ''}
                        onValueChange={(value) => updateRegistrationData({ impact: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o impacto" />
                        </SelectTrigger>
                        <SelectContent>
                          {matrixConfig.impactLabels.map((lbl, i) => (
                            <SelectItem key={i} value={(i + 1).toString()}>{i + 1} - {lbl}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Probabilidade / Verossimilhança</label>
                      <Select
                        value={registrationData.probability?.toString() || ''}
                        onValueChange={(value) => updateRegistrationData({ probability: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a probabilidade" />
                        </SelectTrigger>
                        <SelectContent>
                          {matrixConfig.probabilityLabels.map((lbl, i) => (
                            <SelectItem key={i} value={(i + 1).toString()}>{i + 1} - {lbl}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {registrationData.methodology_id === 'quantitative' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">Impacto Financeiro (R$)</label>
                      <Input
                        type="number"
                        placeholder="Ex: 50000"
                        value={registrationData.impact_financial || ''}
                        onChange={(e) => updateRegistrationData({ impact_financial: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Probabilidade (%)</label>
                      <Input
                        type="number"
                        placeholder="Ex: 15"
                        max="100"
                        value={registrationData.probability_percentage || ''}
                        onChange={(e) => updateRegistrationData({ probability_percentage: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {registrationData.methodology_id === 'simplificado' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">Impacto</label>
                      <Select
                        value={registrationData.simplified_impact || ''}
                        onValueChange={(val) => updateRegistrationData({ simplified_impact: val })}
                      >
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Baixo">Baixo</SelectItem>
                          <SelectItem value="Médio">Médio</SelectItem>
                          <SelectItem value="Alto">Alto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Probabilidade</label>
                      <Select
                        value={registrationData.simplified_probability || ''}
                        onValueChange={(val) => updateRegistrationData({ simplified_probability: val })}
                      >
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Baixa">Baixa</SelectItem>
                          <SelectItem value="Média">Média</SelectItem>
                          <SelectItem value="Alta">Alta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {registrationData.methodology_id === 'cis' && (
                  <>
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-sm font-medium mb-1">Grupo de Implementação (IG)</label>
                      <Select
                        value={registrationData.cis_ig || ''}
                        onValueChange={(val) => updateRegistrationData({ cis_ig: val })}
                      >
                        <SelectTrigger><SelectValue placeholder="Selecione o IG" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="IG1">IG1 - Higiene Cibernética Básica</SelectItem>
                          <SelectItem value="IG2">IG2 - Complexidade Moderada</SelectItem>
                          <SelectItem value="IG3">IG3 - Complexidade Alta / Maturidade</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Deficiência do Controle</label>
                      <Select
                        value={registrationData.cis_control_deficiency || ''}
                        onValueChange={(val) => updateRegistrationData({ cis_control_deficiency: val })}
                      >
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Alto">Alto</SelectItem>
                          <SelectItem value="Médio">Médio</SelectItem>
                          <SelectItem value="Baixo">Baixo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Impacto da Ameaça</label>
                      <Select
                        value={registrationData.cis_threat_impact || ''}
                        onValueChange={(val) => updateRegistrationData({ cis_threat_impact: val })}
                      >
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Crítico">Crítico</SelectItem>
                          <SelectItem value="Significativo">Significativo</SelectItem>
                          <SelectItem value="Moderado">Moderado</SelectItem>
                          <SelectItem value="Menor">Menor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {registrationData.methodology_id === 'nist' && (
                  <>
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-sm font-medium mb-1">Função Afetada (NIST Core)</label>
                      <Select
                        value={registrationData.nist_function || ''}
                        onValueChange={(val) => updateRegistrationData({ nist_function: val })}
                      >
                        <SelectTrigger><SelectValue placeholder="Selecione a Função" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Identify">Identify (Identificar)</SelectItem>
                          <SelectItem value="Protect">Protect (Proteger)</SelectItem>
                          <SelectItem value="Detect">Detect (Detectar)</SelectItem>
                          <SelectItem value="Respond">Respond (Responder)</SelectItem>
                          <SelectItem value="Recover">Recover (Recuperar)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Nível de Impacto Cibernético</label>
                      <Select
                        value={registrationData.nist_impact || ''}
                        onValueChange={(val) => updateRegistrationData({ nist_impact: val })}
                      >
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Alto">Alto</SelectItem>
                          <SelectItem value="Moderado">Moderado</SelectItem>
                          <SelectItem value="Baixo">Baixo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Probabilidade da Ameaça</label>
                      <Select
                        value={registrationData.nist_probability || ''}
                        onValueChange={(val) => updateRegistrationData({ nist_probability: val })}
                      >
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Alta">Alta</SelectItem>
                          <SelectItem value="Moderada">Moderada</SelectItem>
                          <SelectItem value="Baixa">Baixa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {registrationData.methodology_id === 'fair' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">Loss Event Frequency (LEF)</label>
                      <Input
                        placeholder="Ex: 2 vezes ao ano (0.5 a 2.0)"
                        value={registrationData.fair_lef || ''}
                        onChange={(e) => updateRegistrationData({ fair_lef: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Probable Loss Magnitude (PLM)</label>
                      <Input
                        placeholder="Ex: R$ 50.000 a R$ 100.000"
                        value={registrationData.fair_plm || ''}
                        onChange={(e) => updateRegistrationData({ fair_plm: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {registrationData.methodology_id === 'coso' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">Impacto Estratégico</label>
                      <Select
                        value={registrationData.coso_strategic_impact || ''}
                        onValueChange={(val) => updateRegistrationData({ coso_strategic_impact: val })}
                      >
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Crítico">Crítico</SelectItem>
                          <SelectItem value="Alto">Alto</SelectItem>
                          <SelectItem value="Médio">Médio</SelectItem>
                          <SelectItem value="Baixo">Baixo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Probabilidade Operacional</label>
                      <Select
                        value={registrationData.coso_operational_probability || ''}
                        onValueChange={(val) => updateRegistrationData({ coso_operational_probability: val })}
                      >
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Frequente">Frequente</SelectItem>
                          <SelectItem value="Provável">Provável</SelectItem>
                          <SelectItem value="Possível">Possível</SelectItem>
                          <SelectItem value="Improvável">Improvável</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-sm font-medium mb-1">Risk Velocity (Velocidade do Risco)</label>
                      <Select
                        value={registrationData.coso_risk_velocity || ''}
                        onValueChange={(val) => updateRegistrationData({ coso_risk_velocity: val })}
                      >
                        <SelectTrigger><SelectValue placeholder="Qual a rapidez com que o risco pode se materializar?" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Muito Rápido">Muito Rápido (Imediato a dias)</SelectItem>
                          <SelectItem value="Rápido">Rápido (Semanas a um mês)</SelectItem>
                          <SelectItem value="Moderado">Moderado (Meses)</SelectItem>
                          <SelectItem value="Lento">Lento (Anos)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Avaliação (Matriz GUT)</h3>
            <p className="text-sm text-muted-foreground mb-4">Selecione as variáveis para calcular a prioridade do risco com base na metodologia de Gravidade, Urgência e Tendência.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Gravidade (G)</label>
                <Select
                  value={registrationData.gut_gravity?.toString() || ''}
                  onValueChange={(val) => updateRegistrationData({ gut_gravity: parseInt(val) })}
                >
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 - Extremamente Grave</SelectItem>
                    <SelectItem value="4">4 - Muito Grave</SelectItem>
                    <SelectItem value="3">3 - Grave</SelectItem>
                    <SelectItem value="2">2 - Pouco Grave</SelectItem>
                    <SelectItem value="1">1 - Sem Gravidade</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Urgência (U)</label>
                <Select
                  value={registrationData.gut_urgency?.toString() || ''}
                  onValueChange={(val) => updateRegistrationData({ gut_urgency: parseInt(val) })}
                >
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 - Ação Imediata</SelectItem>
                    <SelectItem value="4">4 - Com Alguma Urgência</SelectItem>
                    <SelectItem value="3">3 - Normal</SelectItem>
                    <SelectItem value="2">2 - Pode Esperar</SelectItem>
                    <SelectItem value="1">1 - Não Tem Pressa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tendência (T)</label>
                <Select
                  value={registrationData.gut_tendency?.toString() || ''}
                  onValueChange={(val) => updateRegistrationData({ gut_tendency: parseInt(val) })}
                >
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 - Piorar Rapidamente</SelectItem>
                    <SelectItem value="4">4 - Piorar a Médio Prazo</SelectItem>
                    <SelectItem value="3">3 - Piorar a Longo Prazo</SelectItem>
                    <SelectItem value="2">2 - Permanecer Estável</SelectItem>
                    <SelectItem value="1">1 - Melhorar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Histórico e Contexto</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Eventos Anteriores</label>
                <Textarea
                  value={registrationData.historical_events || ''}
                  onChange={(e) => updateRegistrationData({ historical_events: e.target.value })}
                  placeholder="Houve incidentes anteriores relacionados a este risco?"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Causas Raiz (Root Cause)</label>
                <Textarea
                  value={registrationData.root_causes || ''}
                  onChange={(e) => updateRegistrationData({ root_causes: e.target.value })}
                  placeholder="Quais as origens deste risco?"
                  rows={3}
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Avaliação de Controles Existentes</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Efetividade Geral dos Controles Mapeados</label>
                <Select
                  value={registrationData.controls_effectiveness || ''}
                  onValueChange={(value) => updateRegistrationData({ controls_effectiveness: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a efetividade atual..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ineffective">Inefetivo (Ausente ou falho)</SelectItem>
                    <SelectItem value="partially_effective">Parcialmente Efetivo</SelectItem>
                    <SelectItem value="effective">Efetivo</SelectItem>
                    <SelectItem value="highly_effective">Altamente Efetivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descrição dos Controles Atuais</label>
                <Textarea
                  value={registrationData.existing_controls || ''}
                  onChange={(e) => updateRegistrationData({ existing_controls: e.target.value })}
                  placeholder="Descreva as defesas atuais para este risco..."
                  rows={4}
                />
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Planos de Ação e Sub-atividades</h3>
              <Button
                size="sm"
                onClick={() => {
                  setActionPlanItems([...actionPlanItems, { id: Date.now(), title: '', responsible: '', deadline: '', priority: 'medium', status: 'pending', subActivities: [] }]);
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                Novo Plano
              </Button>
            </div>

            {actionPlanItems.length === 0 ? (
              <div className="text-center py-8 bg-muted/50 rounded-lg border border-dashed">
                <ClipboardList className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm font-medium text-muted-foreground">Nenhum plano de ação adicionado</p>
              </div>
            ) : (
              <div className="space-y-4">
                {actionPlanItems.map((plan, pIdx) => (
                  <Card key={plan.id} className="overflow-hidden">
                    <CardHeader className="p-3 bg-muted/40 border-b flex flex-row items-center justify-between space-y-0">
                      <div className="font-medium text-sm">Plano de Ação {pIdx + 1}</div>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => {
                        setActionPlanItems(actionPlanItems.filter(p => p.id !== plan.id));
                      }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                        <div className="md:col-span-12">
                          <label className="block text-xs font-semibold mb-1">Descrição do Plano</label>
                          <Input
                            className="h-8 text-sm"
                            value={plan.title}
                            onChange={(e) => {
                              const newPlans = [...actionPlanItems];
                              newPlans[pIdx].title = e.target.value;
                              setActionPlanItems(newPlans);
                            }}
                          />
                        </div>
                        <div className="md:col-span-3">
                          <label className="block text-xs font-semibold mb-1">Responsável Geral</label>
                          <Input
                            className="h-8 text-sm"
                            placeholder="Usuário ou E-mail"
                            value={plan.responsible || ''}
                            onChange={(e) => {
                              const newPlans = [...actionPlanItems];
                              newPlans[pIdx].responsible = e.target.value;
                              setActionPlanItems(newPlans);
                            }}
                          />
                        </div>
                        <div className="md:col-span-3">
                          <label className="block text-xs font-semibold mb-1">Prazo (Data limite)</label>
                          <Input
                            type="date"
                            className="h-8 text-sm"
                            value={plan.deadline || ''}
                            onChange={(e) => {
                              const newPlans = [...actionPlanItems];
                              newPlans[pIdx].deadline = e.target.value;
                              setActionPlanItems(newPlans);
                            }}
                          />
                        </div>
                        <div className="md:col-span-3">
                          <label className="block text-xs font-semibold mb-1">Prioridade</label>
                          <Select
                            value={plan.priority}
                            onValueChange={(val) => {
                              const newPlans = [...actionPlanItems];
                              newPlans[pIdx].priority = val;
                              setActionPlanItems(newPlans);
                            }}
                          >
                            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Baixa</SelectItem>
                              <SelectItem value="medium">Média</SelectItem>
                              <SelectItem value="high">Alta</SelectItem>
                              <SelectItem value="critical">Crítica</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="md:col-span-3">
                          <label className="block text-xs font-semibold mb-1">Status Base</label>
                          <Select
                            value={plan.status}
                            onValueChange={(val) => {
                              const newPlans = [...actionPlanItems];
                              newPlans[pIdx].status = val;
                              setActionPlanItems(newPlans);
                            }}
                          >
                            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pendente</SelectItem>
                              <SelectItem value="in_progress">Andamento</SelectItem>
                              <SelectItem value="completed">Concluído</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="pl-4 border-l-2 border-primary/20 space-y-3 mt-4">
                        <div className="flex justify-between items-center py-1">
                          <span className="text-xs font-semibold text-muted-foreground uppercase">Tarefas do Plano</span>
                          <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => {
                            const newPlans = [...actionPlanItems];
                            newPlans[pIdx].subActivities.push({ id: Date.now(), title: '', responsible: '', deadline: '', status: 'pending', priority: 'medium' });
                            setActionPlanItems(newPlans);
                          }}>
                            <Plus className="h-3 w-3 mr-1" />
                            Adicionar Tarefa
                          </Button>
                        </div>
                        {plan.subActivities.map((sub: any, sIdx: number) => (
                          <div key={sub.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 bg-muted/20 p-2 rounded items-end">
                            <div className="md:col-span-3">
                              <label className="block text-[10px] uppercase text-muted-foreground mb-1">Atividade</label>
                              <Input
                                className="h-7 text-xs"
                                value={sub.title}
                                onChange={(e) => {
                                  const newPlans = [...actionPlanItems];
                                  newPlans[pIdx].subActivities[sIdx].title = e.target.value;
                                  setActionPlanItems(newPlans);
                                }}
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-[10px] uppercase text-muted-foreground mb-1">Responsável</label>
                              <Input
                                className="h-7 text-xs"
                                placeholder="E-mail/Nome"
                                value={sub.responsible}
                                onChange={(e) => {
                                  const newPlans = [...actionPlanItems];
                                  newPlans[pIdx].subActivities[sIdx].responsible = e.target.value;
                                  setActionPlanItems(newPlans);
                                }}
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-[10px] uppercase text-muted-foreground mb-1">Prazo</label>
                              <Input
                                type="date"
                                className="h-7 text-xs"
                                value={sub.deadline || ''}
                                onChange={(e) => {
                                  const newPlans = [...actionPlanItems];
                                  newPlans[pIdx].subActivities[sIdx].deadline = e.target.value;
                                  setActionPlanItems(newPlans);
                                }}
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-[10px] uppercase text-muted-foreground mb-1">Prioridade</label>
                              <Select
                                value={sub.priority}
                                onValueChange={(val) => {
                                  const newPlans = [...actionPlanItems];
                                  newPlans[pIdx].subActivities[sIdx].priority = val;
                                  setActionPlanItems(newPlans);
                                }}
                              >
                                <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="low">Baixa</SelectItem>
                                  <SelectItem value="medium">Média</SelectItem>
                                  <SelectItem value="high">Alta</SelectItem>
                                  <SelectItem value="critical">Crítica</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-[10px] uppercase text-muted-foreground mb-1">Status</label>
                              <Select
                                value={sub.status}
                                onValueChange={(val) => {
                                  const newPlans = [...actionPlanItems];
                                  newPlans[pIdx].subActivities[sIdx].status = val;
                                  setActionPlanItems(newPlans);
                                }}
                              >
                                <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pendente</SelectItem>
                                  <SelectItem value="in_progress">Andamento</SelectItem>
                                  <SelectItem value="completed">Concluído</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="md:col-span-1 flex justify-end">
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => {
                                const newPlans = [...actionPlanItems];
                                newPlans[pIdx].subActivities = newPlans[pIdx].subActivities.filter((_: any, i: number) => i !== sIdx);
                                setActionPlanItems(newPlans);
                              }}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 7:
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Comunicação e Stakeholders</h3>
              <Button
                size="sm"
                onClick={() => {
                  setStakeholders([...stakeholders, { id: Date.now(), name: '', role: '', email: '', notifyEmail: true, notifyPlatform: true }]);
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                Adicionar Stakeholder
              </Button>
            </div>

            {stakeholders.length === 0 ? (
              <div className="text-center py-8 bg-muted/50 rounded-lg border border-dashed">
                <Users className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm font-medium text-muted-foreground">Nenhum stakeholder cadastrado</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stakeholders.map((stakeholder: any, index: number) => (
                  <div key={stakeholder.id || index} className="p-3 bg-muted/40 border rounded-lg relative overflow-hidden flex flex-col md:flex-row items-center gap-3">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary/60"></div>
                    <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-2 pl-2">
                      <div>
                        <Input
                          placeholder="Nome..."
                          value={stakeholder.name || ''}
                          onChange={(e) => {
                            const updated = [...stakeholders];
                            updated[index].name = e.target.value;
                            setStakeholders(updated);
                          }}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Input
                          placeholder="Cargo/Área..."
                          value={stakeholder.role || ''}
                          onChange={(e) => {
                            const updated = [...stakeholders];
                            updated[index].role = e.target.value;
                            setStakeholders(updated);
                          }}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Input
                          type="email"
                          placeholder="E-mail"
                          value={stakeholder.email || ''}
                          onChange={(e) => {
                            const updated = [...stakeholders];
                            updated[index].email = e.target.value;
                            setStakeholders(updated);
                          }}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                    <div className="w-full md:w-auto flex items-center justify-between gap-2 pl-2 md:pl-0 border-t md:border-t-0 pt-2 md:pt-0">
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant={stakeholder.notifyEmail ? 'default' : 'outline'}
                          className="cursor-pointer text-xs px-2 shadow-sm"
                          onClick={() => {
                            const updated = [...stakeholders];
                            updated[index].notifyEmail = !updated[index].notifyEmail;
                            setStakeholders(updated);
                          }}
                        >
                          <MessageCircle className="h-3 w-3 mr-1" /> Email
                        </Badge>
                        <Badge
                          variant={stakeholder.notifyPlatform ? 'default' : 'outline'}
                          className="cursor-pointer text-xs px-2 shadow-sm"
                          onClick={() => {
                            const updated = [...stakeholders];
                            updated[index].notifyPlatform = !updated[index].notifyPlatform;
                            setStakeholders(updated);
                          }}
                        >
                          <CheckSquare className="h-3 w-3 mr-1" /> Plataforma
                        </Badge>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive shrink-0" onClick={() => setStakeholders(stakeholders.filter((_, i) => i !== index))}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 8:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Encerramento e Monitoramento</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Responsável pelo Encerramento/Monitoramento</label>
                <Input
                  value={registrationData.monitoring_responsible || ''}
                  onChange={(e) => updateRegistrationData({ monitoring_responsible: e.target.value })}
                  placeholder="Nome do responsável..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Critérios de Encerramento</label>
              <Textarea
                value={registrationData.closure_criteria || ''}
                onChange={(e) => updateRegistrationData({ closure_criteria: e.target.value })}
                placeholder="Defina quando este risco pode ser considerado mitigado ou encerrado..."
                rows={3}
              />
            </div>

            <Card className="bg-muted/30 border shadow-sm">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm font-medium">Risco Residual Esperado (Após Planos de Ação)</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Impacto Residual</label>
                    <Select
                      value={registrationData.residual_impact?.toString() || ''}
                      onValueChange={(val) => updateRegistrationData({ residual_impact: parseInt(val) })}
                    >
                      <SelectTrigger><SelectValue placeholder="Impacto..." /></SelectTrigger>
                      <SelectContent>
                        {matrixConfig.impactLabels.map((lbl, i) => (
                          <SelectItem key={i} value={(i + 1).toString()}>{i + 1} - {lbl}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Probabilidade Residual</label>
                    <Select
                      value={registrationData.residual_probability?.toString() || ''}
                      onValueChange={(val) => updateRegistrationData({ residual_probability: parseInt(val) })}
                    >
                      <SelectTrigger><SelectValue placeholder="Probabilidade..." /></SelectTrigger>
                      <SelectContent>
                        {matrixConfig.probabilityLabels.map((lbl, i) => (
                          <SelectItem key={i} value={(i + 1).toString()}>{i + 1} - {lbl}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return <div>Etapa não suportada.</div>;
    }
  };

  return (
    <div className="w-full flex flex-col md:flex-row gap-6 p-2 md:p-6 pb-24">
      {/* Sidebar Wizard Steps */}
      <div className="w-full md:w-64 shrink-0 space-y-2">
        <h2 className="text-xl font-bold mb-4 px-2 hidden md:block">Processo de Registro</h2>
        <div className="flex overflow-x-auto md:flex-col md:overflow-visible gap-2 pb-2 scrollbar-hide">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            return (
              <div
                key={step.id}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer shrink-0 md:shrink border
                  ${isActive ? 'bg-primary/10 border-primary text-primary shadow-sm font-medium' :
                    isCompleted ? 'bg-muted/50 border-transparent text-muted-foreground' :
                      'border-transparent text-muted-foreground/60 hover:bg-muted/30'}
                `}
                onClick={() => setCurrentStep(step.id)}
              >
                <div className={`p-1.5 rounded-md ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground/60'}`}>
                  {isCompleted && !isActive ? <CheckCircle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <span className="text-sm whitespace-nowrap">{step.title}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Form Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex-1 bg-card border rounded-xl shadow-sm p-4 md:p-6">
          {renderStepForm()}
        </div>

        {/* Footer Navigation Sticky */}
        <div className="sticky bottom-0 md:static md:mt-6 mt-4 bg-background/95 backdrop-blur-sm border-t md:border-none p-4 md:p-0 z-40 flex flex-wrap md:flex-nowrap items-center justify-between gap-3 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] md:shadow-none">
          <Button
            variant="outline"
            className="flex-1 md:flex-none"
            onClick={onCancel}
          >
            <span className="hidden sm:inline">Cancelar</span>
            <span className="sm:hidden">Sair</span>
          </Button>

          <div className="flex flex-1 md:flex-none gap-2">
            <Button
              variant="outline"
              onClick={handleComplete}
              disabled={isLoading}
            >
              <CheckSquare className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Salvar e Continuar Depois</span>
              <span className="sm:hidden">Rascunho</span>
            </Button>

            {currentStep === steps.length ? (
              <Button
                onClick={handleComplete}
                disabled={isLoading}
                className="flex-1 md:flex-none bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md"
              >
                {isLoading ? <RefreshCw className="h-4 w-4 sm:mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 sm:mr-2" />}
                <span className="hidden sm:inline">Concluir Registro</span>
                <span className="sm:hidden">Concluir</span>
              </Button>
            ) : (
              <Button onClick={handleNext} className="shadow-sm flex-1 md:flex-none">
                Próximo <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <Dialog open={showRiskLibrary} onOpenChange={setShowRiskLibrary}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Library className="h-6 w-6 text-primary" />
              <span>Biblioteca de Riscos</span>
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <RiskLibraryFixed onSelectTemplate={handleSelectTemplate} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};