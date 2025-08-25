import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Shield,
  Target,
  Award,
  Settings,
  FileText,
  Search,
  Filter,
  Download,
  Upload,
  Calendar as CalendarIcon,
  Clock
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

// Tipos para o sistema de assessment
export type AssessmentType = 'nist_csf' | 'iso_27001_27701' | 'proprietary';
export type QuestionType = 'multiple_choice' | 'yes_no' | 'scale' | 'text';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface AssessmentQuestion {
  id: string;
  category: string;
  subcategory?: string;
  question: string;
  description?: string;
  type: QuestionType;
  required: boolean;
  weight: number;
  options?: string[];
  scale_min?: number;
  scale_max?: number;
  scale_labels?: string[];
  compliance_mapping?: string;
  risk_impact?: RiskLevel;
  order: number;
}

export interface AssessmentResponse {
  question_id: string;
  answer: string | number;
  justification?: string;
  responded_by?: string;
  responded_at?: string;
}

export interface AssessmentTemplate {
  id: string;
  name: string;
  type: AssessmentType;
  description: string;
  version: string;
  framework_reference?: string;
  questions: AssessmentQuestion[];
  scoring_method: 'weighted' | 'simple';
  pass_threshold?: number;
  is_default: boolean;
}

interface RiskAssessmentManagerProps {
  vendorId?: string;
  onAssessmentComplete: (completed: boolean, score?: number, assessmentData?: any) => void;
  onResponsesChange?: (responses: Record<string, unknown>) => void;
  onTemplateSelected?: (templateId: string, templateName: string) => void;
}

// Template NIST CSF 2.0 completo (90+ questões)
export const NIST_CSF_TEMPLATE: Omit<AssessmentTemplate, 'id'> = {
  name: 'NIST Cybersecurity Framework 2.0',
  type: 'nist_csf',
  description: 'Assessment baseado no NIST CSF 2.0 com todas as funções e categorias',
  version: '2.0',
  framework_reference: 'NIST CSF 2.0',
  scoring_method: 'weighted',
  pass_threshold: 70,
  is_default: true,
  questions: [
    // GOVERN (GV) - Nova função no CSF 2.0
    {
      id: 'gv_oc_1',
      category: 'Govern',
      subcategory: 'Organizational Context',
      question: 'A organização estabeleceu e comunica sua missão, objetivos e atividades de cybersecurity?',
      description: 'Definição clara do contexto organizacional para cybersecurity',
      type: 'multiple_choice',
      required: true,
      weight: 9,
      options: ['Totalmente estabelecido e comunicado', 'Parcialmente estabelecido', 'Em desenvolvimento', 'Não estabelecido'],
      compliance_mapping: 'GV.OC-01',
      risk_impact: 'critical',
      order: 1
    },
    {
      id: 'gv_oc_2',
      category: 'Govern',
      subcategory: 'Organizational Context',
      question: 'Os requisitos legais, regulamentares e contratuais relacionados à cybersecurity são compreendidos e gerenciados?',
      description: 'Gestão de compliance e requisitos externos',
      type: 'scale',
      required: true,
      weight: 8,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Não compreendidos', 'Parcialmente compreendidos', 'Adequadamente compreendidos', 'Bem gerenciados', 'Totalmente gerenciados'],
      compliance_mapping: 'GV.OC-02',
      risk_impact: 'high',
      order: 2
    },
    {
      id: 'gv_oc_3',
      category: 'Govern',
      subcategory: 'Organizational Context',
      question: 'As prioridades organizacionais, restrições, tolerância a riscos e premissas são estabelecidas e comunicadas?',
      description: 'Definição do apetite e tolerância a riscos organizacionais',
      type: 'multiple_choice',
      required: true,
      weight: 8,
      options: ['Claramente estabelecidas e comunicadas', 'Estabelecidas mas não comunicadas', 'Parcialmente estabelecidas', 'Não estabelecidas'],
      compliance_mapping: 'GV.OC-03',
      risk_impact: 'high',
      order: 3
    },
    {
      id: 'gv_oc_4',
      category: 'Govern',
      subcategory: 'Organizational Context',
      question: 'A criticidade dos ativos, sistemas e dados é estabelecida e comunicada?',
      description: 'Classificação e priorização de ativos críticos',
      type: 'scale',
      required: true,
      weight: 9,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Não estabelecida', 'Básica', 'Adequada', 'Abrangente', 'Totalmente madura'],
      compliance_mapping: 'GV.OC-04',
      risk_impact: 'critical',
      order: 4
    },
    {
      id: 'gv_oc_5',
      category: 'Govern',
      subcategory: 'Organizational Context',
      question: 'Os resultados organizacionais são estabelecidos e comunicados?',
      description: 'Definição de objetivos e métricas de cybersecurity',
      type: 'multiple_choice',
      required: true,
      weight: 7,
      options: ['Claramente estabelecidos', 'Parcialmente estabelecidos', 'Em desenvolvimento', 'Não estabelecidos'],
      compliance_mapping: 'GV.OC-05',
      risk_impact: 'medium',
      order: 5
    },
    {
      id: 'gv_rm_1',
      category: 'Govern',
      subcategory: 'Risk Management Strategy',
      question: 'Uma estratégia de gestão de riscos de cybersecurity é estabelecida, comunicada e mantida?',
      description: 'Estratégia formal para gestão de riscos cibernéticos',
      type: 'multiple_choice',
      required: true,
      weight: 10,
      options: ['Estratégia madura e atualizada', 'Estratégia estabelecida', 'Estratégia básica', 'Sem estratégia formal'],
      compliance_mapping: 'GV.RM-01',
      risk_impact: 'critical',
      order: 6
    },
    {
      id: 'gv_rm_2',
      category: 'Govern',
      subcategory: 'Risk Management Strategy',
      question: 'Os processos de gestão de riscos são estabelecidos, gerenciados e acordados pelos stakeholders organizacionais?',
      description: 'Processos formais de gestão de riscos com governança adequada',
      type: 'scale',
      required: true,
      weight: 9,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Sem processos', 'Processos básicos', 'Processos adequados', 'Processos maduros', 'Processos otimizados'],
      compliance_mapping: 'GV.RM-02',
      risk_impact: 'critical',
      order: 7
    },
    {
      id: 'gv_rm_3',
      category: 'Govern',
      subcategory: 'Risk Management Strategy',
      question: 'A determinação da tolerância a riscos é informada pelo papel da organização na infraestrutura crítica e sua análise de riscos específica?',
      description: 'Tolerância a riscos baseada em contexto e criticidade',
      type: 'multiple_choice',
      required: true,
      weight: 8,
      options: ['Totalmente informada e contextualizada', 'Parcialmente informada', 'Básica', 'Não informada'],
      compliance_mapping: 'GV.RM-03',
      risk_impact: 'high',
      order: 8
    },
    {
      id: 'gv_rm_4',
      category: 'Govern',
      subcategory: 'Risk Management Strategy',
      question: 'Os riscos de cybersecurity e as respostas aos riscos são escalados e comunicados?',
      description: 'Processo de escalação e comunicação de riscos',
      type: 'scale',
      required: true,
      weight: 8,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Sem escalação', 'Escalação ad-hoc', 'Processo básico', 'Processo estruturado', 'Processo otimizado'],
      compliance_mapping: 'GV.RM-04',
      risk_impact: 'high',
      order: 9
    },
    {
      id: 'gv_rm_5',
      category: 'Govern',
      subcategory: 'Risk Management Strategy',
      question: 'Os critérios para decisões de gestão de riscos são estabelecidos e comunicados?',
      description: 'Critérios claros para tomada de decisões sobre riscos',
      type: 'multiple_choice',
      required: true,
      weight: 7,
      options: ['Critérios claros e comunicados', 'Critérios estabelecidos', 'Critérios básicos', 'Sem critérios formais'],
      compliance_mapping: 'GV.RM-05',
      risk_impact: 'medium',
      order: 10
    },
    {
      id: 'gv_rm_6',
      category: 'Govern',
      subcategory: 'Risk Management Strategy',
      question: 'A determinação e comunicação da tolerância a riscos são informadas pelo impacto nos stakeholders organizacionais?',
      description: 'Consideração do impacto nos stakeholders na tolerância a riscos',
      type: 'scale',
      required: true,
      weight: 7,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Não considerado', 'Consideração básica', 'Consideração adequada', 'Bem considerado', 'Totalmente integrado'],
      compliance_mapping: 'GV.RM-06',
      risk_impact: 'medium',
      order: 11
    },
    {
      id: 'gv_rm_7',
      category: 'Govern',
      subcategory: 'Risk Management Strategy',
      question: 'As ameaças estratégicas à organização são estabelecidas e priorizadas?',
      description: 'Identificação e priorização de ameaças estratégicas',
      type: 'multiple_choice',
      required: true,
      weight: 8,
      options: ['Estabelecidas e priorizadas', 'Parcialmente estabelecidas', 'Identificação básica', 'Não estabelecidas'],
      compliance_mapping: 'GV.RM-07',
      risk_impact: 'high',
      order: 12
    },
    {
      id: 'gv_rr_1',
      category: 'Govern',
      subcategory: 'Roles, Responsibilities, and Authorities',
      question: 'Os papéis, responsabilidades e autoridades relacionados à cybersecurity são estabelecidos, comunicados, compreendidos e aplicados?',
      description: 'Definição clara de papéis e responsabilidades em cybersecurity',
      type: 'scale',
      required: true,
      weight: 9,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Não estabelecidos', 'Básicos', 'Adequados', 'Bem definidos', 'Totalmente maduros'],
      compliance_mapping: 'GV.RR-01',
      risk_impact: 'critical',
      order: 13
    },
    {
      id: 'gv_rr_2',
      category: 'Govern',
      subcategory: 'Roles, Responsibilities, and Authorities',
      question: 'Os papéis, responsabilidades e autoridades para liderar um esforço de resposta a incidentes de cybersecurity são estabelecidos?',
      description: 'Liderança clara para resposta a incidentes',
      type: 'multiple_choice',
      required: true,
      weight: 9,
      options: ['Claramente estabelecidos', 'Parcialmente estabelecidos', 'Em desenvolvimento', 'Não estabelecidos'],
      compliance_mapping: 'GV.RR-02',
      risk_impact: 'critical',
      order: 14
    },
    {
      id: 'gv_rr_3',
      category: 'Govern',
      subcategory: 'Roles, Responsibilities, and Authorities',
      question: 'Os papéis e responsabilidades para atividades de cybersecurity e sua performance são estabelecidos para terceiros?',
      description: 'Gestão de responsabilidades de cybersecurity para terceiros',
      type: 'scale',
      required: true,
      weight: 8,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Não estabelecidos', 'Básicos', 'Adequados', 'Bem definidos', 'Totalmente gerenciados'],
      compliance_mapping: 'GV.RR-03',
      risk_impact: 'high',
      order: 15
    },
    {
      id: 'gv_rr_4',
      category: 'Govern',
      subcategory: 'Roles, Responsibilities, and Authorities',
      question: 'Os recursos adequados são alocados de forma consistente com a estratégia de gestão de riscos de cybersecurity?',
      description: 'Alocação adequada de recursos para cybersecurity',
      type: 'multiple_choice',
      required: true,
      weight: 8,
      options: ['Recursos adequados e alinhados', 'Recursos parcialmente adequados', 'Recursos limitados', 'Recursos inadequados'],
      compliance_mapping: 'GV.RR-04',
      risk_impact: 'high',
      order: 16
    },
    {
      id: 'gv_po_1',
      category: 'Govern',
      subcategory: 'Policy',
      question: 'Uma política organizacional de cybersecurity é estabelecida e comunicada?',
      description: 'Política formal de cybersecurity organizacional',
      type: 'multiple_choice',
      required: true,
      weight: 9,
      options: ['Política abrangente e comunicada', 'Política estabelecida', 'Política básica', 'Sem política formal'],
      compliance_mapping: 'GV.PO-01',
      risk_impact: 'critical',
      order: 17
    },
    {
      id: 'gv_po_2',
      category: 'Govern',
      subcategory: 'Policy',
      question: 'A política de cybersecurity é revisada, atualizada e aprovada regularmente?',
      description: 'Processo de revisão e atualização da política',
      type: 'scale',
      required: true,
      weight: 8,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Nunca revisada', 'Revisão irregular', 'Revisão anual', 'Revisão regular', 'Revisão contínua'],
      compliance_mapping: 'GV.PO-02',
      risk_impact: 'high',
      order: 18
    },
    {
      id: 'gv_ov_1',
      category: 'Govern',
      subcategory: 'Oversight',
      question: 'A estratégia de cybersecurity é revisada e ajustada para dar conta de mudanças no ambiente de risco e nos resultados organizacionais?',
      description: 'Revisão e ajuste contínuo da estratégia de cybersecurity',
      type: 'scale',
      required: true,
      weight: 8,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Nunca revisada', 'Revisão irregular', 'Revisão periódica', 'Revisão regular', 'Revisão contínua'],
      compliance_mapping: 'GV.OV-01',
      risk_impact: 'high',
      order: 19
    },
    {
      id: 'gv_ov_2',
      category: 'Govern',
      subcategory: 'Oversight',
      question: 'A estratégia de cybersecurity é implementada com supervisão adequada pela liderança organizacional?',
      description: 'Supervisão executiva da implementação da estratégia',
      type: 'multiple_choice',
      required: true,
      weight: 9,
      options: ['Supervisão ativa e adequada', 'Supervisão parcial', 'Supervisão limitada', 'Sem supervisão adequada'],
      compliance_mapping: 'GV.OV-02',
      risk_impact: 'critical',
      order: 20
    },
    {
      id: 'gv_ov_3',
      category: 'Govern',
      subcategory: 'Oversight',
      question: 'Os resultados da estratégia de cybersecurity são revisados para informar e ajustar a estratégia e direção?',
      description: 'Feedback loop para melhoria contínua da estratégia',
      type: 'scale',
      required: true,
      weight: 7,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Sem revisão', 'Revisão básica', 'Revisão adequada', 'Revisão abrangente', 'Melhoria contínua'],
      compliance_mapping: 'GV.OV-03',
      risk_impact: 'medium',
      order: 21
    },
    {
      id: 'gv_sc_1',
      category: 'Govern',
      subcategory: 'Cybersecurity Supply Chain Risk Management',
      question: 'Uma estratégia de gestão de riscos da cadeia de suprimentos de cybersecurity é estabelecida, implementada, monitorada e revisada?',
      description: 'Estratégia formal para riscos de cybersecurity na cadeia de suprimentos',
      type: 'multiple_choice',
      required: true,
      weight: 9,
      options: ['Estratégia madura e implementada', 'Estratégia estabelecida', 'Estratégia básica', 'Sem estratégia formal'],
      compliance_mapping: 'GV.SC-01',
      risk_impact: 'critical',
      order: 22
    },

    // IDENTIFY (ID)
    {
      id: 'id_am_1',
      category: 'Identify',
      subcategory: 'Asset Management',
      question: 'Os ativos físicos dentro da organização são inventariados e gerenciados?',
      description: 'Inventário completo de todos os ativos físicos',
      type: 'multiple_choice',
      required: true,
      weight: 8,
      options: ['Inventário completo e atualizado', 'Inventário parcial', 'Inventário básico', 'Sem inventário formal'],
      compliance_mapping: 'ID.AM-01',
      risk_impact: 'high',
      order: 23
    },
    {
      id: 'id_am_2',
      category: 'Identify',
      subcategory: 'Asset Management',
      question: 'Os ativos de software e suas versões são inventariados e gerenciados?',
      description: 'Inventário de software incluindo versões e licenças',
      type: 'scale',
      required: true,
      weight: 8,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Sem inventário', 'Inventário básico', 'Inventário adequado', 'Inventário abrangente', 'Gestão automatizada'],
      compliance_mapping: 'ID.AM-02',
      risk_impact: 'high',
      order: 24
    },
    {
      id: 'id_am_3',
      category: 'Identify',
      subcategory: 'Asset Management',
      question: 'Os fluxos de comunicação e dados são mapeados?',
      description: 'Mapeamento de fluxos de dados e comunicações',
      type: 'multiple_choice',
      required: true,
      weight: 9,
      options: ['Totalmente mapeados', 'Parcialmente mapeados', 'Mapeamento básico', 'Não mapeados'],
      compliance_mapping: 'ID.AM-03',
      risk_impact: 'critical',
      order: 25
    },
    {
      id: 'id_am_4',
      category: 'Identify',
      subcategory: 'Asset Management',
      question: 'Os recursos externos (sistemas, serviços, pessoal) são catalogados?',
      description: 'Catálogo de recursos e serviços externos',
      type: 'scale',
      required: true,
      weight: 8,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Não catalogados', 'Catálogo básico', 'Catálogo adequado', 'Catálogo abrangente', 'Gestão integrada'],
      compliance_mapping: 'ID.AM-04',
      risk_impact: 'high',
      order: 26
    },
    {
      id: 'id_am_5',
      category: 'Identify',
      subcategory: 'Asset Management',
      question: 'Os recursos são priorizados baseados em sua classificação, criticidade e valor de negócio?',
      description: 'Priorização de ativos baseada em criticidade',
      type: 'multiple_choice',
      required: true,
      weight: 9,
      options: ['Priorização clara e documentada', 'Priorização parcial', 'Priorização básica', 'Sem priorização formal'],
      compliance_mapping: 'ID.AM-05',
      risk_impact: 'critical',
      order: 27
    },
    {
      id: 'id_am_6',
      category: 'Identify',
      subcategory: 'Asset Management',
      question: 'Os papéis e responsabilidades de cybersecurity para todo o ciclo de vida dos ativos são estabelecidos?',
      description: 'Responsabilidades de cybersecurity no ciclo de vida dos ativos',
      type: 'scale',
      required: true,
      weight: 8,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Não estabelecidos', 'Básicos', 'Adequados', 'Bem definidos', 'Totalmente integrados'],
      compliance_mapping: 'ID.AM-06',
      risk_impact: 'high',
      order: 28
    },

    // PROTECT (PR) - Continuando com mais questões...
    {
      id: 'pr_ac_1',
      category: 'Protect',
      subcategory: 'Identity Management, Authentication and Access Control',
      question: 'As identidades e credenciais são emitidas, gerenciadas, verificadas, revogadas e auditadas?',
      description: 'Gestão completa do ciclo de vida de identidades',
      type: 'scale',
      required: true,
      weight: 9,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Sem gestão formal', 'Gestão básica', 'Gestão adequada', 'Gestão abrangente', 'Gestão automatizada'],
      compliance_mapping: 'PR.AC-01',
      risk_impact: 'critical',
      order: 29
    },
    {
      id: 'pr_ac_2',
      category: 'Protect',
      subcategory: 'Identity Management, Authentication and Access Control',
      question: 'As identidades físicas e lógicas são gerenciadas pelo ciclo de vida da identidade?',
      description: 'Gestão integrada de identidades físicas e lógicas',
      type: 'multiple_choice',
      required: true,
      weight: 8,
      options: ['Gestão integrada e automatizada', 'Gestão parcialmente integrada', 'Gestão separada', 'Gestão inadequada'],
      compliance_mapping: 'PR.AC-02',
      risk_impact: 'high',
      order: 30
    },
    {
      id: 'pr_ac_3',
      category: 'Protect',
      subcategory: 'Identity Management, Authentication and Access Control',
      question: 'O acesso remoto é gerenciado?',
      description: 'Controles específicos para acesso remoto',
      type: 'scale',
      required: true,
      weight: 9,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Sem controles', 'Controles básicos', 'Controles adequados', 'Controles robustos', 'Controles avançados'],
      compliance_mapping: 'PR.AC-03',
      risk_impact: 'critical',
      order: 31
    },
    {
      id: 'pr_ac_4',
      category: 'Protect',
      subcategory: 'Identity Management, Authentication and Access Control',
      question: 'Os privilégios de acesso e autorizações são gerenciados, incorporando os princípios de menor privilégio e separação de funções?',
      description: 'Gestão de privilégios com menor privilégio e separação de funções',
      type: 'multiple_choice',
      required: true,
      weight: 10,
      options: ['Totalmente implementado', 'Parcialmente implementado', 'Implementação básica', 'Não implementado'],
      compliance_mapping: 'PR.AC-04',
      risk_impact: 'critical',
      order: 32
    },
    {
      id: 'pr_ac_5',
      category: 'Protect',
      subcategory: 'Identity Management, Authentication and Access Control',
      question: 'A integridade da rede é protegida (por exemplo, segregação de rede, segmentação de rede)?',
      description: 'Proteção da integridade através de segmentação de rede',
      type: 'scale',
      required: true,
      weight: 9,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Sem proteção', 'Proteção básica', 'Proteção adequada', 'Proteção robusta', 'Proteção avançada'],
      compliance_mapping: 'PR.AC-05',
      risk_impact: 'critical',
      order: 33
    },
    {
      id: 'pr_ac_6',
      category: 'Protect',
      subcategory: 'Identity Management, Authentication and Access Control',
      question: 'As identidades são provadas e correlacionadas antes do acesso a ativos?',
      description: 'Verificação e correlação de identidades antes do acesso',
      type: 'multiple_choice',
      required: true,
      weight: 9,
      options: ['Sempre verificadas e correlacionadas', 'Geralmente verificadas', 'Verificação básica', 'Verificação inadequada'],
      compliance_mapping: 'PR.AC-06',
      risk_impact: 'critical',
      order: 34
    },
    {
      id: 'pr_ac_7',
      category: 'Protect',
      subcategory: 'Identity Management, Authentication and Access Control',
      question: 'Os usuários, dispositivos e outros ativos são autenticados (por exemplo, fator único, multifator) proporcionalmente ao risco da transação?',
      description: 'Autenticação proporcional ao risco',
      type: 'scale',
      required: true,
      weight: 9,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Sem autenticação adequada', 'Autenticação básica', 'Autenticação adequada', 'Autenticação robusta', 'Autenticação adaptativa'],
      compliance_mapping: 'PR.AC-07',
      risk_impact: 'critical',
      order: 35
    },

    // DETECT (DE)
    {
      id: 'de_ae_1',
      category: 'Detect',
      subcategory: 'Anomalies and Events',
      question: 'Uma baseline de operações de rede e fluxos de dados esperados é estabelecida e gerenciada?',
      description: 'Baseline para detecção de anomalias',
      type: 'multiple_choice',
      required: true,
      weight: 8,
      options: ['Baseline abrangente e atualizada', 'Baseline parcial', 'Baseline básica', 'Sem baseline formal'],
      compliance_mapping: 'DE.AE-01',
      risk_impact: 'high',
      order: 36
    },
    {
      id: 'de_ae_2',
      category: 'Detect',
      subcategory: 'Anomalies and Events',
      question: 'Eventos detectados são analisados para compreender alvos de ataque e métodos?',
      description: 'Análise de eventos para compreensão de ataques',
      type: 'scale',
      required: true,
      weight: 8,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Sem análise', 'Análise básica', 'Análise adequada', 'Análise abrangente', 'Análise avançada'],
      compliance_mapping: 'DE.AE-02',
      risk_impact: 'high',
      order: 37
    },
    {
      id: 'de_ae_3',
      category: 'Detect',
      subcategory: 'Anomalies and Events',
      question: 'Os dados de eventos são coletados e correlacionados de múltiplas fontes e sensores?',
      description: 'Coleta e correlação de eventos de múltiplas fontes',
      type: 'multiple_choice',
      required: true,
      weight: 9,
      options: ['Coleta e correlação abrangente', 'Coleta parcial', 'Coleta básica', 'Coleta inadequada'],
      compliance_mapping: 'DE.AE-03',
      risk_impact: 'critical',
      order: 38
    },
    {
      id: 'de_ae_4',
      category: 'Detect',
      subcategory: 'Anomalies and Events',
      question: 'O impacto de eventos é determinado?',
      description: 'Avaliação do impacto de eventos de segurança',
      type: 'scale',
      required: true,
      weight: 8,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Sem avaliação', 'Avaliação básica', 'Avaliação adequada', 'Avaliação abrangente', 'Avaliação automatizada'],
      compliance_mapping: 'DE.AE-04',
      risk_impact: 'high',
      order: 39
    },
    {
      id: 'de_ae_5',
      category: 'Detect',
      subcategory: 'Anomalies and Events',
      question: 'Limites de alerta de incidentes são estabelecidos?',
      description: 'Definição de limites para escalação de incidentes',
      type: 'multiple_choice',
      required: true,
      weight: 8,
      options: ['Limites claros e documentados', 'Limites parcialmente definidos', 'Limites básicos', 'Sem limites formais'],
      compliance_mapping: 'DE.AE-05',
      risk_impact: 'high',
      order: 40
    },

    // RESPOND (RS)
    {
      id: 'rs_rp_1',
      category: 'Respond',
      subcategory: 'Response Planning',
      question: 'O plano de resposta a incidentes é executado durante ou após um incidente?',
      description: 'Execução efetiva do plano de resposta',
      type: 'scale',
      required: true,
      weight: 9,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Nunca executado', 'Execução irregular', 'Execução adequada', 'Execução consistente', 'Execução otimizada'],
      compliance_mapping: 'RS.RP-01',
      risk_impact: 'critical',
      order: 41
    },
    {
      id: 'rs_co_1',
      category: 'Respond',
      subcategory: 'Communications',
      question: 'O pessoal conhece seus papéis e ordem de operações quando uma resposta é necessária?',
      description: 'Conhecimento de papéis na resposta a incidentes',
      type: 'multiple_choice',
      required: true,
      weight: 8,
      options: ['Todos conhecem claramente', 'Maioria conhece', 'Conhecimento parcial', 'Conhecimento inadequado'],
      compliance_mapping: 'RS.CO-01',
      risk_impact: 'high',
      order: 42
    },
    {
      id: 'rs_co_2',
      category: 'Respond',
      subcategory: 'Communications',
      question: 'Os eventos são reportados consistentemente com os critérios estabelecidos?',
      description: 'Reporte consistente de eventos de segurança',
      type: 'scale',
      required: true,
      weight: 8,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Sem reporte', 'Reporte irregular', 'Reporte adequado', 'Reporte consistente', 'Reporte automatizado'],
      compliance_mapping: 'RS.CO-02',
      risk_impact: 'high',
      order: 43
    },
    {
      id: 'rs_co_3',
      category: 'Respond',
      subcategory: 'Communications',
      question: 'As informações são compartilhadas consistentemente com os planos de resposta?',
      description: 'Compartilhamento de informações durante resposta',
      type: 'multiple_choice',
      required: true,
      weight: 7,
      options: ['Compartilhamento efetivo', 'Compartilhamento adequado', 'Compartilhamento básico', 'Compartilhamento inadequado'],
      compliance_mapping: 'RS.CO-03',
      risk_impact: 'medium',
      order: 44
    },
    {
      id: 'rs_co_4',
      category: 'Respond',
      subcategory: 'Communications',
      question: 'A coordenação com stakeholders ocorre consistentemente com os planos de resposta?',
      description: 'Coordenação com stakeholders durante incidentes',
      type: 'scale',
      required: true,
      weight: 7,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Sem coordenação', 'Coordenação básica', 'Coordenação adequada', 'Coordenação efetiva', 'Coordenação otimizada'],
      compliance_mapping: 'RS.CO-04',
      risk_impact: 'medium',
      order: 45
    },
    {
      id: 'rs_co_5',
      category: 'Respond',
      subcategory: 'Communications',
      question: 'O compartilhamento voluntário de informações ocorre com parceiros externos para alcançar objetivos de segurança mais amplos?',
      description: 'Compartilhamento de threat intelligence',
      type: 'multiple_choice',
      required: false,
      weight: 6,
      options: ['Compartilhamento ativo', 'Compartilhamento ocasional', 'Compartilhamento limitado', 'Sem compartilhamento'],
      compliance_mapping: 'RS.CO-05',
      risk_impact: 'low',
      order: 46
    },

    // RECOVER (RC)
    {
      id: 'rc_rp_1',
      category: 'Recover',
      subcategory: 'Recovery Planning',
      question: 'O plano de recuperação é executado durante ou após um evento de cybersecurity?',
      description: 'Execução do plano de recuperação',
      type: 'scale',
      required: true,
      weight: 9,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Nunca executado', 'Execução irregular', 'Execução adequada', 'Execução consistente', 'Execução otimizada'],
      compliance_mapping: 'RC.RP-01',
      risk_impact: 'critical',
      order: 47
    },
    {
      id: 'rc_im_1',
      category: 'Recover',
      subcategory: 'Improvements',
      question: 'As lições aprendidas são incorporadas nos planos de resposta e recuperação?',
      description: 'Incorporação de lições aprendidas',
      type: 'multiple_choice',
      required: true,
      weight: 7,
      options: ['Sempre incorporadas', 'Geralmente incorporadas', 'Ocasionalmente incorporadas', 'Raramente incorporadas'],
      compliance_mapping: 'RC.IM-01',
      risk_impact: 'medium',
      order: 48
    },
    {
      id: 'rc_im_2',
      category: 'Recover',
      subcategory: 'Improvements',
      question: 'As estratégias de recuperação são atualizadas?',
      description: 'Atualização contínua das estratégias de recuperação',
      type: 'scale',
      required: true,
      weight: 7,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Nunca atualizadas', 'Atualização irregular', 'Atualização anual', 'Atualização regular', 'Atualização contínua'],
      compliance_mapping: 'RC.IM-02',
      risk_impact: 'medium',
      order: 49
    },
    {
      id: 'rc_co_1',
      category: 'Recover',
      subcategory: 'Communications',
      question: 'As relações públicas são gerenciadas?',
      description: 'Gestão de comunicação pública durante recuperação',
      type: 'multiple_choice',
      required: true,
      weight: 6,
      options: ['Gestão profissional', 'Gestão adequada', 'Gestão básica', 'Sem gestão formal'],
      compliance_mapping: 'RC.CO-01',
      risk_impact: 'low',
      order: 50
    },
    {
      id: 'rc_co_2',
      category: 'Recover',
      subcategory: 'Communications',
      question: 'A reputação é reparada após um incidente?',
      description: 'Processo de reparação de reputação',
      type: 'scale',
      required: false,
      weight: 5,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Sem processo', 'Processo básico', 'Processo adequado', 'Processo efetivo', 'Processo otimizado'],
      compliance_mapping: 'RC.CO-02',
      risk_impact: 'low',
      order: 51
    },
    {
      id: 'rc_co_3',
      category: 'Recover',
      subcategory: 'Communications',
      question: 'As atividades de recuperação são comunicadas aos stakeholders internos e externos, bem como à liderança executiva e de gestão?',
      description: 'Comunicação das atividades de recuperação',
      type: 'multiple_choice',
      required: true,
      weight: 7,
      options: ['Comunicação abrangente', 'Comunicação adequada', 'Comunicação básica', 'Comunicação inadequada'],
      compliance_mapping: 'RC.CO-03',
      risk_impact: 'medium',
      order: 52
    },

    // Continuando com mais questões NIST CSF 2.0...
    
    // Mais questões IDENTIFY
    {
      id: 'id_be_1',
      category: 'Identify',
      subcategory: 'Business Environment',
      question: 'O papel da organização na cadeia de suprimentos é identificado e comunicado?',
      description: 'Compreensão do papel organizacional na cadeia de valor',
      type: 'multiple_choice',
      required: true,
      weight: 8,
      options: ['Claramente identificado e comunicado', 'Identificado mas não comunicado', 'Parcialmente identificado', 'Não identificado'],
      compliance_mapping: 'ID.BE-01',
      risk_impact: 'high',
      order: 53
    },
    {
      id: 'id_be_2',
      category: 'Identify',
      subcategory: 'Business Environment',
      question: 'O lugar da organização em infraestruturas críticas e seu setor industrial é identificado e comunicado?',
      description: 'Identificação do papel em infraestruturas críticas',
      type: 'scale',
      required: true,
      weight: 8,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Não identificado', 'Identificação básica', 'Identificação adequada', 'Bem identificado', 'Totalmente mapeado'],
      compliance_mapping: 'ID.BE-02',
      risk_impact: 'high',
      order: 54
    },
    {
      id: 'id_be_3',
      category: 'Identify',
      subcategory: 'Business Environment',
      question: 'As prioridades para missão, objetivos e atividades organizacionais são estabelecidas e comunicadas?',
      description: 'Prioridades organizacionais claras e comunicadas',
      type: 'multiple_choice',
      required: true,
      weight: 7,
      options: ['Prioridades claras e comunicadas', 'Prioridades estabelecidas', 'Prioridades básicas', 'Prioridades não definidas'],
      compliance_mapping: 'ID.BE-03',
      risk_impact: 'medium',
      order: 55
    },
    {
      id: 'id_be_4',
      category: 'Identify',
      subcategory: 'Business Environment',
      question: 'As dependências e seções críticas do negócio são estabelecidas e comunicadas?',
      description: 'Mapeamento de dependências críticas de negócio',
      type: 'scale',
      required: true,
      weight: 9,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Não mapeadas', 'Mapeamento básico', 'Mapeamento adequado', 'Mapeamento abrangente', 'Gestão integrada'],
      compliance_mapping: 'ID.BE-04',
      risk_impact: 'critical',
      order: 56
    },
    {
      id: 'id_be_5',
      category: 'Identify',
      subcategory: 'Business Environment',
      question: 'A resiliência organizacional é estabelecida e comunicada?',
      description: 'Capacidade de resiliência organizacional definida',
      type: 'multiple_choice',
      required: true,
      weight: 8,
      options: ['Resiliência bem estabelecida', 'Resiliência adequada', 'Resiliência básica', 'Resiliência não definida'],
      compliance_mapping: 'ID.BE-05',
      risk_impact: 'high',
      order: 57
    },
    
    // Mais questões PROTECT
    {
      id: 'pr_ds_1',
      category: 'Protect',
      subcategory: 'Data Security',
      question: 'Os dados em repouso são protegidos?',
      description: 'Proteção de dados armazenados através de criptografia',
      type: 'multiple_choice',
      required: true,
      weight: 9,
      options: ['Totalmente protegidos com criptografia forte', 'Adequadamente protegidos', 'Proteção básica', 'Sem proteção adequada'],
      compliance_mapping: 'PR.DS-01',
      risk_impact: 'critical',
      order: 58
    },
    {
      id: 'pr_ds_2',
      category: 'Protect',
      subcategory: 'Data Security',
      question: 'Os dados em trânsito são protegidos?',
      description: 'Proteção de dados durante transmissão',
      type: 'scale',
      required: true,
      weight: 9,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Sem proteção', 'Proteção básica', 'Proteção adequada', 'Proteção robusta', 'Proteção avançada'],
      compliance_mapping: 'PR.DS-02',
      risk_impact: 'critical',
      order: 59
    },
    {
      id: 'pr_ds_3',
      category: 'Protect',
      subcategory: 'Data Security',
      question: 'Os sistemas/ativos são formalmente gerenciados durante remoção, transferências e disposição?',
      description: 'Gestão segura do ciclo de vida de ativos',
      type: 'multiple_choice',
      required: true,
      weight: 8,
      options: ['Gestão formal e abrangente', 'Gestão adequada', 'Gestão básica', 'Sem gestão formal'],
      compliance_mapping: 'PR.DS-03',
      risk_impact: 'high',
      order: 60
    },
    {
      id: 'pr_ds_4',
      category: 'Protect',
      subcategory: 'Data Security',
      question: 'A capacidade adequada para garantir disponibilidade é mantida?',
      description: 'Gestão de capacidade para disponibilidade',
      type: 'scale',
      required: true,
      weight: 8,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Capacidade inadequada', 'Capacidade básica', 'Capacidade adequada', 'Capacidade robusta', 'Capacidade otimizada'],
      compliance_mapping: 'PR.DS-04',
      risk_impact: 'high',
      order: 61
    },
    {
      id: 'pr_ds_5',
      category: 'Protect',
      subcategory: 'Data Security',
      question: 'Proteções contra vazamento de dados são implementadas?',
      description: 'Controles para prevenção de vazamento de dados',
      type: 'multiple_choice',
      required: true,
      weight: 9,
      options: ['Proteções abrangentes implementadas', 'Proteções adequadas', 'Proteções básicas', 'Sem proteções específicas'],
      compliance_mapping: 'PR.DS-05',
      risk_impact: 'critical',
      order: 62
    },
    {
      id: 'pr_ds_6',
      category: 'Protect',
      subcategory: 'Data Security',
      question: 'Mecanismos de verificação de integridade são usados para verificar integridade de software, firmware e informação?',
      description: 'Verificação de integridade de software e dados',
      type: 'scale',
      required: true,
      weight: 8,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Sem verificação', 'Verificação básica', 'Verificação adequada', 'Verificação abrangente', 'Verificação automatizada'],
      compliance_mapping: 'PR.DS-06',
      risk_impact: 'high',
      order: 63
    },
    {
      id: 'pr_ds_7',
      category: 'Protect',
      subcategory: 'Data Security',
      question: 'Os ambientes de desenvolvimento e teste são separados do ambiente de produção?',
      description: 'Segregação de ambientes de desenvolvimento e produção',
      type: 'multiple_choice',
      required: true,
      weight: 8,
      options: ['Separação completa e segura', 'Separação adequada', 'Separação básica', 'Sem separação adequada'],
      compliance_mapping: 'PR.DS-07',
      risk_impact: 'high',
      order: 64
    },
    {
      id: 'pr_ds_8',
      category: 'Protect',
      subcategory: 'Data Security',
      question: 'Mecanismos de verificação de integridade são usados para verificar integridade de hardware?',
      description: 'Verificação de integridade de hardware',
      type: 'scale',
      required: true,
      weight: 7,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Sem verificação', 'Verificação básica', 'Verificação adequada', 'Verificação robusta', 'Verificação avançada'],
      compliance_mapping: 'PR.DS-08',
      risk_impact: 'medium',
      order: 65
    },
    
    // Mais questões DETECT
    {
      id: 'de_cm_1',
      category: 'Detect',
      subcategory: 'Security Continuous Monitoring',
      question: 'A rede é monitorada para detectar potenciais eventos de cybersecurity?',
      description: 'Monitoramento contínuo de rede',
      type: 'multiple_choice',
      required: true,
      weight: 9,
      options: ['Monitoramento abrangente 24/7', 'Monitoramento adequado', 'Monitoramento básico', 'Monitoramento inadequado'],
      compliance_mapping: 'DE.CM-01',
      risk_impact: 'critical',
      order: 66
    },
    {
      id: 'de_cm_2',
      category: 'Detect',
      subcategory: 'Security Continuous Monitoring',
      question: 'O ambiente físico é monitorado para detectar potenciais eventos de cybersecurity?',
      description: 'Monitoramento do ambiente físico',
      type: 'scale',
      required: true,
      weight: 7,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Sem monitoramento', 'Monitoramento básico', 'Monitoramento adequado', 'Monitoramento abrangente', 'Monitoramento integrado'],
      compliance_mapping: 'DE.CM-02',
      risk_impact: 'medium',
      order: 67
    },
    {
      id: 'de_cm_3',
      category: 'Detect',
      subcategory: 'Security Continuous Monitoring',
      question: 'A atividade de pessoal é monitorada para detectar potenciais eventos de cybersecurity?',
      description: 'Monitoramento de atividades de usuários',
      type: 'multiple_choice',
      required: true,
      weight: 8,
      options: ['Monitoramento abrangente e ético', 'Monitoramento adequado', 'Monitoramento básico', 'Sem monitoramento'],
      compliance_mapping: 'DE.CM-03',
      risk_impact: 'high',
      order: 68
    },
    {
      id: 'de_cm_4',
      category: 'Detect',
      subcategory: 'Security Continuous Monitoring',
      question: 'Atividade maliciosa é detectada e a magnitude do impacto é determinada?',
      description: 'Detecção de atividades maliciosas',
      type: 'scale',
      required: true,
      weight: 9,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Sem detecção', 'Detecção básica', 'Detecção adequada', 'Detecção avançada', 'Detecção automatizada'],
      compliance_mapping: 'DE.CM-04',
      risk_impact: 'critical',
      order: 69
    },
    {
      id: 'de_cm_5',
      category: 'Detect',
      subcategory: 'Security Continuous Monitoring',
      question: 'Acesso não autorizado à rede é detectado?',
      description: 'Detecção de acessos não autorizados',
      type: 'multiple_choice',
      required: true,
      weight: 9,
      options: ['Detecção efetiva e rápida', 'Detecção adequada', 'Detecção básica', 'Detecção inadequada'],
      compliance_mapping: 'DE.CM-05',
      risk_impact: 'critical',
      order: 70
    },
    {
      id: 'de_cm_6',
      category: 'Detect',
      subcategory: 'Security Continuous Monitoring',
      question: 'Acesso não autorizado a ativos físicos é detectado?',
      description: 'Detecção de acessos físicos não autorizados',
      type: 'scale',
      required: true,
      weight: 7,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Sem detecção', 'Detecção básica', 'Detecção adequada', 'Detecção robusta', 'Detecção integrada'],
      compliance_mapping: 'DE.CM-06',
      risk_impact: 'medium',
      order: 71
    },
    {
      id: 'de_cm_7',
      category: 'Detect',
      subcategory: 'Security Continuous Monitoring',
      question: 'Acesso não autorizado a pessoal é detectado?',
      description: 'Detecção de tentativas de acesso não autorizado a pessoal',
      type: 'multiple_choice',
      required: true,
      weight: 6,
      options: ['Detecção efetiva', 'Detecção adequada', 'Detecção básica', 'Sem detecção'],
      compliance_mapping: 'DE.CM-07',
      risk_impact: 'low',
      order: 72
    },
    {
      id: 'de_cm_8',
      category: 'Detect',
      subcategory: 'Security Continuous Monitoring',
      question: 'Varreduras de detecção de vulnerabilidades são realizadas?',
      description: 'Varreduras regulares de vulnerabilidades',
      type: 'scale',
      required: true,
      weight: 8,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Nunca realizadas', 'Varreduras irregulares', 'Varreduras regulares', 'Varreduras frequentes', 'Varreduras contínuas'],
      compliance_mapping: 'DE.CM-08',
      risk_impact: 'high',
      order: 73
    },
    
    // Mais questões RESPOND
    {
      id: 'rs_an_1',
      category: 'Respond',
      subcategory: 'Analysis',
      question: 'Notificações de sistemas de detecção são investigadas?',
      description: 'Investigação de alertas de sistemas de detecção',
      type: 'multiple_choice',
      required: true,
      weight: 9,
      options: ['Todas as notificações investigadas', 'Maioria das notificações investigadas', 'Investigação seletiva', 'Investigação inadequada'],
      compliance_mapping: 'RS.AN-01',
      risk_impact: 'critical',
      order: 74
    },
    {
      id: 'rs_an_2',
      category: 'Respond',
      subcategory: 'Analysis',
      question: 'O impacto do incidente é compreendido?',
      description: 'Análise e compreensão do impacto de incidentes',
      type: 'scale',
      required: true,
      weight: 8,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Impacto não compreendido', 'Compreensão básica', 'Compreensão adequada', 'Compreensão abrangente', 'Análise avançada'],
      compliance_mapping: 'RS.AN-02',
      risk_impact: 'high',
      order: 75
    },
    {
      id: 'rs_an_3',
      category: 'Respond',
      subcategory: 'Analysis',
      question: 'A análise forense é realizada?',
      description: 'Capacidade de análise forense digital',
      type: 'multiple_choice',
      required: true,
      weight: 7,
      options: ['Capacidade forense avançada', 'Capacidade forense adequada', 'Capacidade forense básica', 'Sem capacidade forense'],
      compliance_mapping: 'RS.AN-03',
      risk_impact: 'medium',
      order: 76
    },
    {
      id: 'rs_an_4',
      category: 'Respond',
      subcategory: 'Analysis',
      question: 'Incidentes são categorizados consistentemente com planos de resposta?',
      description: 'Categorização consistente de incidentes',
      type: 'scale',
      required: true,
      weight: 8,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Sem categorização', 'Categorização básica', 'Categorização adequada', 'Categorização consistente', 'Categorização automatizada'],
      compliance_mapping: 'RS.AN-04',
      risk_impact: 'high',
      order: 77
    },
    {
      id: 'rs_an_5',
      category: 'Respond',
      subcategory: 'Analysis',
      question: 'Processos são estabelecidos para receber, analisar e responder a vulnerabilidades divulgadas ao público?',
      description: 'Processo para vulnerabilidades divulgadas publicamente',
      type: 'multiple_choice',
      required: true,
      weight: 8,
      options: ['Processo formal e efetivo', 'Processo adequado', 'Processo básico', 'Sem processo formal'],
      compliance_mapping: 'RS.AN-05',
      risk_impact: 'high',
      order: 78
    },
    
    // Mais questões RECOVER
    {
      id: 'rc_co_4',
      category: 'Recover',
      subcategory: 'Communications',
      question: 'A coordenação com stakeholders internos e externos ocorre consistentemente com planos de recuperação?',
      description: 'Coordenação durante recuperação',
      type: 'scale',
      required: true,
      weight: 7,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Sem coordenação', 'Coordenação básica', 'Coordenação adequada', 'Coordenação efetiva', 'Coordenação otimizada'],
      compliance_mapping: 'RC.CO-04',
      risk_impact: 'medium',
      order: 79
    },
    {
      id: 'rc_co_5',
      category: 'Recover',
      subcategory: 'Communications',
      question: 'O compartilhamento voluntário de informações sobre lições aprendidas ocorre com parceiros externos?',
      description: 'Compartilhamento de lições aprendidas',
      type: 'multiple_choice',
      required: false,
      weight: 5,
      options: ['Compartilhamento ativo', 'Compartilhamento ocasional', 'Compartilhamento limitado', 'Sem compartilhamento'],
      compliance_mapping: 'RC.CO-05',
      risk_impact: 'low',
      order: 80
    },
    
    // Questões adicionais para completar 90+
    {
      id: 'pr_ip_1',
      category: 'Protect',
      subcategory: 'Information Protection Processes and Procedures',
      question: 'Uma baseline de configuração de tecnologia da informação/sistemas de controle industrial é criada e mantida?',
      description: 'Baseline de configuração segura',
      type: 'multiple_choice',
      required: true,
      weight: 8,
      options: ['Baseline abrangente e atualizada', 'Baseline adequada', 'Baseline básica', 'Sem baseline formal'],
      compliance_mapping: 'PR.IP-01',
      risk_impact: 'high',
      order: 81
    },
    {
      id: 'pr_ip_2',
      category: 'Protect',
      subcategory: 'Information Protection Processes and Procedures',
      question: 'Um ciclo de vida de desenvolvimento de sistemas de segurança é implementado para gerenciar sistemas, informações e dados?',
      description: 'SDLC seguro implementado',
      type: 'scale',
      required: true,
      weight: 9,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Sem SDLC seguro', 'SDLC básico', 'SDLC adequado', 'SDLC robusto', 'SDLC maduro'],
      compliance_mapping: 'PR.IP-02',
      risk_impact: 'critical',
      order: 82
    },
    {
      id: 'pr_ip_3',
      category: 'Protect',
      subcategory: 'Information Protection Processes and Procedures',
      question: 'Procedimentos de gerenciamento de configuração são implementados?',
      description: 'Gestão de configuração implementada',
      type: 'multiple_choice',
      required: true,
      weight: 8,
      options: ['Procedimentos abrangentes', 'Procedimentos adequados', 'Procedimentos básicos', 'Sem procedimentos formais'],
      compliance_mapping: 'PR.IP-03',
      risk_impact: 'high',
      order: 83
    },
    {
      id: 'pr_ip_4',
      category: 'Protect',
      subcategory: 'Information Protection Processes and Procedures',
      question: 'Backups de informações são conduzidos, mantidos e testados?',
      description: 'Processo de backup e teste de restauração',
      type: 'scale',
      required: true,
      weight: 9,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Sem backups', 'Backups básicos', 'Backups regulares', 'Backups testados', 'Backups otimizados'],
      compliance_mapping: 'PR.IP-04',
      risk_impact: 'critical',
      order: 84
    },
    {
      id: 'pr_ip_5',
      category: 'Protect',
      subcategory: 'Information Protection Processes and Procedures',
      question: 'Configurações de política para sistemas de segurança são gerenciadas e aplicadas?',
      description: 'Gestão de políticas de segurança de sistemas',
      type: 'multiple_choice',
      required: true,
      weight: 8,
      options: ['Gestão automatizada e centralizada', 'Gestão adequada', 'Gestão básica', 'Gestão inadequada'],
      compliance_mapping: 'PR.IP-05',
      risk_impact: 'high',
      order: 85
    },
    {
      id: 'pr_ip_6',
      category: 'Protect',
      subcategory: 'Information Protection Processes and Procedures',
      question: 'Os dados são destruídos de acordo com política?',
      description: 'Destruição segura de dados conforme política',
      type: 'scale',
      required: true,
      weight: 8,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Sem processo', 'Processo básico', 'Processo adequado', 'Processo robusto', 'Processo certificado'],
      compliance_mapping: 'PR.IP-06',
      risk_impact: 'high',
      order: 86
    },
    {
      id: 'pr_ip_7',
      category: 'Protect',
      subcategory: 'Information Protection Processes and Procedures',
      question: 'Processos de melhoria de proteção são conduzidos?',
      description: 'Melhoria contínua dos processos de proteção',
      type: 'multiple_choice',
      required: true,
      weight: 7,
      options: ['Melhoria contínua implementada', 'Melhoria regular', 'Melhoria ocasional', 'Sem processo de melhoria'],
      compliance_mapping: 'PR.IP-07',
      risk_impact: 'medium',
      order: 87
    },
    {
      id: 'pr_ip_8',
      category: 'Protect',
      subcategory: 'Information Protection Processes and Procedures',
      question: 'A efetividade das tecnologias de proteção é compartilhada?',
      description: 'Compartilhamento de efetividade de tecnologias',
      type: 'scale',
      required: false,
      weight: 6,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Nunca compartilhado', 'Compartilhamento raro', 'Compartilhamento ocasional', 'Compartilhamento regular', 'Compartilhamento ativo'],
      compliance_mapping: 'PR.IP-08',
      risk_impact: 'low',
      order: 88
    },
    {
      id: 'pr_ip_9',
      category: 'Protect',
      subcategory: 'Information Protection Processes and Procedures',
      question: 'Planos de resposta e recuperação são testados?',
      description: 'Teste regular de planos de resposta e recuperação',
      type: 'multiple_choice',
      required: true,
      weight: 9,
      options: ['Testes regulares e abrangentes', 'Testes adequados', 'Testes básicos', 'Sem testes regulares'],
      compliance_mapping: 'PR.IP-09',
      risk_impact: 'critical',
      order: 89
    },
    {
      id: 'pr_ip_10',
      category: 'Protect',
      subcategory: 'Information Protection Processes and Procedures',
      question: 'Planos de resposta e recuperação são incluídos em procedimentos de gerenciamento de mudanças?',
      description: 'Integração de planos na gestão de mudanças',
      type: 'scale',
      required: true,
      weight: 8,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Não incluídos', 'Inclusão básica', 'Inclusão adequada', 'Inclusão abrangente', 'Integração completa'],
      compliance_mapping: 'PR.IP-10',
      risk_impact: 'high',
      order: 90
    },
    {
      id: 'pr_ip_11',
      category: 'Protect',
      subcategory: 'Information Protection Processes and Procedures',
      question: 'Recursos humanos de cybersecurity são qualificados para realizar suas responsabilidades atribuídas?',
      description: 'Qualificação adequada da equipe de cybersecurity',
      type: 'multiple_choice',
      required: true,
      weight: 8,
      options: ['Equipe altamente qualificada', 'Equipe adequadamente qualificada', 'Qualificação básica', 'Qualificação inadequada'],
      compliance_mapping: 'PR.IP-11',
      risk_impact: 'high',
      order: 91
    },
    {
      id: 'pr_ip_12',
      category: 'Protect',
      subcategory: 'Information Protection Processes and Procedures',
      question: 'Um plano de gestão de vulnerabilidades é desenvolvido e implementado?',
      description: 'Plano formal de gestão de vulnerabilidades',
      type: 'scale',
      required: true,
      weight: 9,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Sem plano', 'Plano básico', 'Plano adequado', 'Plano abrangente', 'Plano maduro'],
      compliance_mapping: 'PR.IP-12',
      risk_impact: 'critical',
      order: 92
    }
  ]
};

// Template ISO 27001/27701 completo (90+ questões)
export const ISO_27001_27701_TEMPLATE: Omit<AssessmentTemplate, 'id'> = {
  name: 'ISO 27001:2022 & ISO 27701:2019 Assessment',
  type: 'iso_27001_27701',
  description: 'Assessment completo baseado nas normas ISO 27001:2022 e ISO 27701:2019',
  version: '2022/2019',
  framework_reference: 'ISO/IEC 27001:2022 e ISO/IEC 27701:2019',
  scoring_method: 'weighted',
  pass_threshold: 75,
  is_default: true,
  questions: [
    // A.5 - Políticas de Segurança da Informação
    {
      id: 'iso_a5_1',
      category: 'Políticas de Segurança',
      subcategory: 'A.5.1',
      question: 'Um conjunto de políticas de segurança da informação é definido, aprovado pela direção, publicado e comunicado?',
      description: 'Políticas formais aprovadas pela alta direção',
      type: 'multiple_choice',
      required: true,
      weight: 10,
      options: ['Políticas completas, aprovadas e comunicadas', 'Políticas aprovadas mas não comunicadas', 'Políticas em desenvolvimento', 'Sem políticas formais'],
      compliance_mapping: 'ISO 27001:2022 A.5.1',
      risk_impact: 'critical',
      order: 1
    },
    {
      id: 'iso_a5_2',
      category: 'Políticas de Segurança',
      subcategory: 'A.5.2',
      question: 'As políticas de segurança da informação são revisadas em intervalos planejados ou quando mudanças significativas ocorrem?',
      description: 'Processo de revisão e atualização das políticas',
      type: 'scale',
      required: true,
      weight: 8,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Nunca revisadas', 'Revisão irregular', 'Revisão anual', 'Revisão regular', 'Revisão contínua'],
      compliance_mapping: 'ISO 27001:2022 A.5.2',
      risk_impact: 'high',
      order: 2
    },
    {
      id: 'iso_a5_3',
      category: 'Políticas de Segurança',
      subcategory: 'A.5.3',
      question: 'As políticas de segurança da informação são categorizadas por tópicos relevantes?',
      description: 'Categorização adequada das políticas por domínios',
      type: 'multiple_choice',
      required: true,
      weight: 7,
      options: ['Categorização abrangente', 'Categorização adequada', 'Categorização básica', 'Sem categorização'],
      compliance_mapping: 'ISO 27001:2022 A.5.3',
      risk_impact: 'medium',
      order: 3
    },

    // A.6 - Organização da Segurança da Informação
    {
      id: 'iso_a6_1',
      category: 'Organização da Segurança',
      subcategory: 'A.6.1',
      question: 'As responsabilidades e papéis de segurança da informação são definidos e alocados?',
      description: 'Definição clara de papéis e responsabilidades',
      type: 'scale',
      required: true,
      weight: 9,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Não definidos', 'Definição básica', 'Definição adequada', 'Definição clara', 'Definição abrangente'],
      compliance_mapping: 'ISO 27001:2022 A.6.1',
      risk_impact: 'critical',
      order: 4
    },
    {
      id: 'iso_a6_2',
      category: 'Organização da Segurança',
      subcategory: 'A.6.2',
      question: 'Funções conflitantes e áreas de responsabilidade são segregadas?',
      description: 'Segregação de funções para evitar conflitos de interesse',
      type: 'multiple_choice',
      required: true,
      weight: 8,
      options: ['Segregação completa implementada', 'Segregação parcial', 'Segregação básica', 'Sem segregação formal'],
      compliance_mapping: 'ISO 27001:2022 A.6.2',
      risk_impact: 'high',
      order: 5
    },
    {
      id: 'iso_a6_3',
      category: 'Organização da Segurança',
      subcategory: 'A.6.3',
      question: 'O contato com autoridades é mantido?',
      description: 'Relacionamento com autoridades reguladoras e de aplicação da lei',
      type: 'scale',
      required: true,
      weight: 7,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Sem contato', 'Contato básico', 'Contato adequado', 'Contato regular', 'Relacionamento ativo'],
      compliance_mapping: 'ISO 27001:2022 A.6.3',
      risk_impact: 'medium',
      order: 6
    },
    {
      id: 'iso_a6_4',
      category: 'Organização da Segurança',
      subcategory: 'A.6.4',
      question: 'O contato com grupos de interesse especial é mantido?',
      description: 'Participação em grupos de segurança e comunidades',
      type: 'multiple_choice',
      required: false,
      weight: 6,
      options: ['Participação ativa', 'Participação ocasional', 'Contato limitado', 'Sem participação'],
      compliance_mapping: 'ISO 27001:2022 A.6.4',
      risk_impact: 'low',
      order: 7
    },
    {
      id: 'iso_a6_5',
      category: 'Organização da Segurança',
      subcategory: 'A.6.5',
      question: 'A segurança da informação em projetos é abordada?',
      description: 'Integração de segurança no ciclo de vida de projetos',
      type: 'scale',
      required: true,
      weight: 8,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Não abordada', 'Abordagem básica', 'Abordagem adequada', 'Abordagem sistemática', 'Integração completa'],
      compliance_mapping: 'ISO 27001:2022 A.6.5',
      risk_impact: 'high',
      order: 8
    },
    {
      id: 'iso_a6_6',
      category: 'Organização da Segurança',
      subcategory: 'A.6.6',
      question: 'Acordos de confidencialidade ou não divulgação são identificados, documentados regularmente revisados e aplicados?',
      description: 'Gestão de acordos de confidencialidade',
      type: 'multiple_choice',
      required: true,
      weight: 8,
      options: ['Acordos abrangentes e atualizados', 'Acordos adequados', 'Acordos básicos', 'Sem acordos formais'],
      compliance_mapping: 'ISO 27001:2022 A.6.6',
      risk_impact: 'high',
      order: 9
    },
    {
      id: 'iso_a6_7',
      category: 'Organização da Segurança',
      subcategory: 'A.6.7',
      question: 'O trabalho remoto é abordado?',
      description: 'Políticas e controles para trabalho remoto',
      type: 'scale',
      required: true,
      weight: 8,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Não abordado', 'Abordagem básica', 'Políticas adequadas', 'Controles robustos', 'Gestão avançada'],
      compliance_mapping: 'ISO 27001:2022 A.6.7',
      risk_impact: 'high',
      order: 10
    },
    {
      id: 'iso_a6_8',
      category: 'Organização da Segurança',
      subcategory: 'A.6.8',
      question: 'O relatório de eventos de segurança da informação é abordado?',
      description: 'Processo formal de reporte de incidentes',
      type: 'multiple_choice',
      required: true,
      weight: 9,
      options: ['Processo formal e efetivo', 'Processo adequado', 'Processo básico', 'Sem processo formal'],
      compliance_mapping: 'ISO 27001:2022 A.6.8',
      risk_impact: 'critical',
      order: 11
    },

    // A.7 - Segurança de Recursos Humanos
    {
      id: 'iso_a7_1',
      category: 'Segurança de RH',
      subcategory: 'A.7.1',
      question: 'A verificação de antecedentes é realizada?',
      description: 'Verificação de antecedentes para posições sensíveis',
      type: 'multiple_choice',
      required: true,
      weight: 7,
      options: ['Verificação abrangente', 'Verificação adequada', 'Verificação básica', 'Sem verificação'],
      compliance_mapping: 'ISO 27001:2022 A.7.1',
      risk_impact: 'medium',
      order: 12
    },
    {
      id: 'iso_a7_2',
      category: 'Segurança de RH',
      subcategory: 'A.7.2',
      question: 'Os termos e condições de emprego são abordados?',
      description: 'Inclusão de responsabilidades de segurança nos contratos',
      type: 'scale',
      required: true,
      weight: 8,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Não abordados', 'Abordagem básica', 'Abordagem adequada', 'Abordagem abrangente', 'Integração completa'],
      compliance_mapping: 'ISO 27001:2022 A.7.2',
      risk_impact: 'high',
      order: 13
    },
    {
      id: 'iso_a7_3',
      category: 'Segurança de RH',
      subcategory: 'A.7.3',
      question: 'A conscientização, educação e treinamento em segurança da informação são abordados?',
      description: 'Programa de conscientização e treinamento',
      type: 'multiple_choice',
      required: true,
      weight: 8,
      options: ['Programa abrangente e regular', 'Programa adequado', 'Treinamento básico', 'Sem programa formal'],
      compliance_mapping: 'ISO 27001:2022 A.7.3',
      risk_impact: 'high',
      order: 14
    },
    {
      id: 'iso_a7_4',
      category: 'Segurança de RH',
      subcategory: 'A.7.4',
      question: 'Os processos disciplinares são abordados?',
      description: 'Processo disciplinar para violações de segurança',
      type: 'scale',
      required: true,
      weight: 7,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Sem processo', 'Processo básico', 'Processo adequado', 'Processo formal', 'Processo abrangente'],
      compliance_mapping: 'ISO 27001:2022 A.7.4',
      risk_impact: 'medium',
      order: 15
    },
    {
      id: 'iso_a7_5',
      category: 'Segurança de RH',
      subcategory: 'A.7.5',
      question: 'As responsabilidades de segurança da informação após término ou mudança de emprego são abordadas?',
      description: 'Processo de desligamento e transferência',
      type: 'multiple_choice',
      required: true,
      weight: 8,
      options: ['Processo formal e abrangente', 'Processo adequado', 'Processo básico', 'Sem processo formal'],
      compliance_mapping: 'ISO 27001:2022 A.7.5',
      risk_impact: 'high',
      order: 16
    },
    {
      id: 'iso_a7_6',
      category: 'Segurança de RH',
      subcategory: 'A.7.6',
      question: 'Acordos de confidencialidade ou não divulgação são abordados?',
      description: 'NDAs específicos para funcionários',
      type: 'scale',
      required: true,
      weight: 8,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Sem acordos', 'Acordos básicos', 'Acordos adequados', 'Acordos abrangentes', 'Gestão completa'],
      compliance_mapping: 'ISO 27001:2022 A.7.6',
      risk_impact: 'high',
      order: 17
    },
    {
      id: 'iso_a7_7',
      category: 'Segurança de RH',
      subcategory: 'A.7.7',
      question: 'O trabalho remoto é abordado?',
      description: 'Controles específicos para trabalho remoto',
      type: 'multiple_choice',
      required: true,
      weight: 8,
      options: ['Controles abrangentes', 'Controles adequados', 'Controles básicos', 'Sem controles específicos'],
      compliance_mapping: 'ISO 27001:2022 A.7.7',
      risk_impact: 'high',
      order: 18
    },

    // A.8 - Gestão de Ativos
    {
      id: 'iso_a8_1',
      category: 'Gestão de Ativos',
      subcategory: 'A.8.1',
      question: 'O inventário de ativos é mantido?',
      description: 'Inventário completo e atualizado de todos os ativos',
      type: 'scale',
      required: true,
      weight: 9,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Sem inventário', 'Inventário básico', 'Inventário adequado', 'Inventário abrangente', 'Gestão automatizada'],
      compliance_mapping: 'ISO 27001:2022 A.8.1',
      risk_impact: 'critical',
      order: 19
    },
    {
      id: 'iso_a8_2',
      category: 'Gestão de Ativos',
      subcategory: 'A.8.2',
      question: 'A propriedade dos ativos é abordada?',
      description: 'Definição clara de proprietários de ativos',
      type: 'multiple_choice',
      required: true,
      weight: 8,
      options: ['Propriedade claramente definida', 'Propriedade adequadamente definida', 'Propriedade parcialmente definida', 'Propriedade não definida'],
      compliance_mapping: 'ISO 27001:2022 A.8.2',
      risk_impact: 'high',
      order: 20
    },
    {
      id: 'iso_a8_3',
      category: 'Gestão de Ativos',
      subcategory: 'A.8.3',
      question: 'O uso aceitável dos ativos é abordado?',
      description: 'Políticas de uso aceitável de ativos',
      type: 'scale',
      required: true,
      weight: 8,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Sem políticas', 'Políticas básicas', 'Políticas adequadas', 'Políticas abrangentes', 'Gestão completa'],
      compliance_mapping: 'ISO 27001:2022 A.8.3',
      risk_impact: 'high',
      order: 21
    },
    {
      id: 'iso_a8_4',
      category: 'Gestão de Ativos',
      subcategory: 'A.8.4',
      question: 'A devolução de ativos é abordada?',
      description: 'Processo de devolução de ativos no desligamento',
      type: 'multiple_choice',
      required: true,
      weight: 7,
      options: ['Processo formal e efetivo', 'Processo adequado', 'Processo básico', 'Sem processo formal'],
      compliance_mapping: 'ISO 27001:2022 A.8.4',
      risk_impact: 'medium',
      order: 22
    },
    {
      id: 'iso_a8_5',
      category: 'Gestão de Ativos',
      subcategory: 'A.8.5',
      question: 'A classificação da informação é abordada?',
      description: 'Sistema de classificação de informações',
      type: 'scale',
      required: true,
      weight: 9,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Sem classificação', 'Classificação básica', 'Classificação adequada', 'Classificação abrangente', 'Sistema maduro'],
      compliance_mapping: 'ISO 27001:2022 A.8.5',
      risk_impact: 'critical',
      order: 23
    },
    {
      id: 'iso_a8_6',
      category: 'Gestão de Ativos',
      subcategory: 'A.8.6',
      question: 'A rotulagem da informação é abordada?',
      description: 'Sistema de rotulagem baseado na classificação',
      type: 'multiple_choice',
      required: true,
      weight: 8,
      options: ['Sistema abrangente de rotulagem', 'Sistema adequado', 'Sistema básico', 'Sem sistema de rotulagem'],
      compliance_mapping: 'ISO 27001:2022 A.8.6',
      risk_impact: 'high',
      order: 24
    },

    // Continuando com mais controles ISO 27001:2022...
    
    // A.9 - Controle de Acesso (continuação)
    {
      id: 'iso_a9_1',
      category: 'Controle de Acesso',
      subcategory: 'A.9.1',
      question: 'Uma política de controle de acesso é estabelecida, documentada e revisada?',
      description: 'Política formal de controle de acesso',
      type: 'multiple_choice',
      required: true,
      weight: 10,
      options: ['Política abrangente e atualizada', 'Política adequada', 'Política básica', 'Sem política formal'],
      compliance_mapping: 'ISO 27001:2022 A.9.1.1',
      risk_impact: 'critical',
      order: 25
    },
    {
      id: 'iso_a9_2',
      category: 'Controle de Acesso',
      subcategory: 'A.9.2',
      question: 'O acesso a redes e serviços de rede é controlado?',
      description: 'Controles de acesso para redes e serviços',
      type: 'scale',
      required: true,
      weight: 9,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Sem controles', 'Controles básicos', 'Controles adequados', 'Controles robustos', 'Controles avançados'],
      compliance_mapping: 'ISO 27001:2022 A.9.2.1',
      risk_impact: 'critical',
      order: 26
    },
    {
      id: 'iso_a9_3',
      category: 'Controle de Acesso',
      subcategory: 'A.9.3',
      question: 'O gerenciamento de acesso de usuário é implementado?',
      description: 'Processo formal de gestão de acesso de usuários',
      type: 'multiple_choice',
      required: true,
      weight: 9,
      options: ['Gestão abrangente e automatizada', 'Gestão adequada', 'Gestão básica', 'Gestão inadequada'],
      compliance_mapping: 'ISO 27001:2022 A.9.3.1',
      risk_impact: 'critical',
      order: 27
    },
    {
      id: 'iso_a9_4',
      category: 'Controle de Acesso',
      subcategory: 'A.9.4',
      question: 'O gerenciamento de informação de autenticação secreta de usuários é implementado?',
      description: 'Gestão de senhas e informações de autenticação',
      type: 'scale',
      required: true,
      weight: 9,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Sem gestão', 'Gestão básica', 'Gestão adequada', 'Gestão robusta', 'Gestão avançada'],
      compliance_mapping: 'ISO 27001:2022 A.9.4.1',
      risk_impact: 'critical',
      order: 28
    },
    
    // A.10 - Criptografia
    {
      id: 'iso_a10_1',
      category: 'Criptografia',
      subcategory: 'A.10.1',
      question: 'Uma política sobre o uso de controles criptográficos é desenvolvida e implementada?',
      description: 'Política abrangente de uso de criptografia',
      type: 'multiple_choice',
      required: true,
      weight: 9,
      options: ['Política abrangente implementada', 'Política adequada', 'Política básica', 'Sem política formal'],
      compliance_mapping: 'ISO 27001:2022 A.10.1.1',
      risk_impact: 'critical',
      order: 29
    },
    {
      id: 'iso_a10_2',
      category: 'Criptografia',
      subcategory: 'A.10.2',
      question: 'O gerenciamento de chaves é implementado?',
      description: 'Gestão segura do ciclo de vida de chaves criptográficas',
      type: 'scale',
      required: true,
      weight: 9,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Sem gestão', 'Gestão básica', 'Gestão adequada', 'Gestão robusta', 'Gestão certificada'],
      compliance_mapping: 'ISO 27001:2022 A.10.1.2',
      risk_impact: 'critical',
      order: 30
    },
    
    // A.11 - Segurança Física e do Ambiente
    {
      id: 'iso_a11_1',
      category: 'Segurança Física',
      subcategory: 'A.11.1',
      question: 'Perímetros de segurança física são definidos?',
      description: 'Definição e implementação de perímetros físicos',
      type: 'multiple_choice',
      required: true,
      weight: 8,
      options: ['Perímetros bem definidos e seguros', 'Perímetros adequados', 'Perímetros básicos', 'Perímetros inadequados'],
      compliance_mapping: 'ISO 27001:2022 A.11.1.1',
      risk_impact: 'high',
      order: 31
    },
    {
      id: 'iso_a11_2',
      category: 'Segurança Física',
      subcategory: 'A.11.2',
      question: 'Controles de entrada física são implementados?',
      description: 'Controles de acesso físico a áreas seguras',
      type: 'scale',
      required: true,
      weight: 8,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Sem controles', 'Controles básicos', 'Controles adequados', 'Controles robustos', 'Controles avançados'],
      compliance_mapping: 'ISO 27001:2022 A.11.1.2',
      risk_impact: 'high',
      order: 32
    },
    {
      id: 'iso_a11_3',
      category: 'Segurança Física',
      subcategory: 'A.11.3',
      question: 'Proteção contra ameaças ambientais é implementada?',
      description: 'Proteção contra incêndio, inundação, etc.',
      type: 'multiple_choice',
      required: true,
      weight: 7,
      options: ['Proteção abrangente', 'Proteção adequada', 'Proteção básica', 'Proteção inadequada'],
      compliance_mapping: 'ISO 27001:2022 A.11.1.3',
      risk_impact: 'medium',
      order: 33
    },
    {
      id: 'iso_a11_4',
      category: 'Segurança Física',
      subcategory: 'A.11.4',
      question: 'Trabalho em áreas seguras é protegido?',
      description: 'Controles para trabalho em áreas de alta segurança',
      type: 'scale',
      required: true,
      weight: 7,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Sem proteção', 'Proteção básica', 'Proteção adequada', 'Proteção robusta', 'Proteção avançada'],
      compliance_mapping: 'ISO 27001:2022 A.11.1.4',
      risk_impact: 'medium',
      order: 34
    },
    {
      id: 'iso_a11_5',
      category: 'Segurança Física',
      subcategory: 'A.11.5',
      question: 'Áreas de acesso público, entrega e carregamento são controladas?',
      description: 'Controles para áreas de acesso público',
      type: 'multiple_choice',
      required: true,
      weight: 6,
      options: ['Controles abrangentes', 'Controles adequados', 'Controles básicos', 'Sem controles específicos'],
      compliance_mapping: 'ISO 27001:2022 A.11.1.5',
      risk_impact: 'low',
      order: 35
    },
    
    // A.12 - Segurança das Operações
    {
      id: 'iso_a12_1',
      category: 'Segurança das Operações',
      subcategory: 'A.12.1',
      question: 'Procedimentos operacionais são documentados?',
      description: 'Documentação de procedimentos operacionais',
      type: 'scale',
      required: true,
      weight: 8,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Sem documentação', 'Documentação básica', 'Documentação adequada', 'Documentação abrangente', 'Documentação otimizada'],
      compliance_mapping: 'ISO 27001:2022 A.12.1.1',
      risk_impact: 'high',
      order: 36
    },
    {
      id: 'iso_a12_2',
      category: 'Segurança das Operações',
      subcategory: 'A.12.2',
      question: 'Gerenciamento de mudanças é implementado?',
      description: 'Processo formal de gestão de mudanças',
      type: 'multiple_choice',
      required: true,
      weight: 9,
      options: ['Processo maduro e automatizado', 'Processo adequado', 'Processo básico', 'Sem processo formal'],
      compliance_mapping: 'ISO 27001:2022 A.12.1.2',
      risk_impact: 'critical',
      order: 37
    },
    {
      id: 'iso_a12_3',
      category: 'Segurança das Operações',
      subcategory: 'A.12.3',
      question: 'Gerenciamento de capacidade é implementado?',
      description: 'Monitoramento e gestão de capacidade de recursos',
      type: 'scale',
      required: true,
      weight: 7,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Sem gestão', 'Gestão básica', 'Gestão adequada', 'Gestão proativa', 'Gestão otimizada'],
      compliance_mapping: 'ISO 27001:2022 A.12.1.3',
      risk_impact: 'medium',
      order: 38
    },
    {
      id: 'iso_a12_4',
      category: 'Segurança das Operações',
      subcategory: 'A.12.4',
      question: 'Separação de ambientes de desenvolvimento, teste e produção é implementada?',
      description: 'Segregação adequada de ambientes',
      type: 'multiple_choice',
      required: true,
      weight: 8,
      options: ['Separação completa e segura', 'Separação adequada', 'Separação básica', 'Separação inadequada'],
      compliance_mapping: 'ISO 27001:2022 A.12.1.4',
      risk_impact: 'high',
      order: 39
    },
    
    // A.13 - Segurança das Comunicações
    {
      id: 'iso_a13_1',
      category: 'Segurança das Comunicações',
      subcategory: 'A.13.1',
      question: 'Controles de rede são implementados?',
      description: 'Controles de segurança para redes',
      type: 'scale',
      required: true,
      weight: 9,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Sem controles', 'Controles básicos', 'Controles adequados', 'Controles robustos', 'Controles avançados'],
      compliance_mapping: 'ISO 27001:2022 A.13.1.1',
      risk_impact: 'critical',
      order: 40
    },
    {
      id: 'iso_a13_2',
      category: 'Segurança das Comunicações',
      subcategory: 'A.13.2',
      question: 'Transferência de informações é segura?',
      description: 'Segurança na transferência de informações',
      type: 'multiple_choice',
      required: true,
      weight: 9,
      options: ['Transferências sempre seguras', 'Transferências geralmente seguras', 'Segurança básica', 'Transferências inseguras'],
      compliance_mapping: 'ISO 27001:2022 A.13.2.1',
      risk_impact: 'critical',
      order: 41
    },
    
    // A.14 - Aquisição, Desenvolvimento e Manutenção de Sistemas
    {
      id: 'iso_a14_1',
      category: 'Desenvolvimento de Sistemas',
      subcategory: 'A.14.1',
      question: 'Requisitos de segurança da informação são incluídos nos requisitos para novos sistemas?',
      description: 'Integração de segurança no desenvolvimento',
      type: 'scale',
      required: true,
      weight: 9,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Nunca incluídos', 'Raramente incluídos', 'Às vezes incluídos', 'Geralmente incluídos', 'Sempre incluídos'],
      compliance_mapping: 'ISO 27001:2022 A.14.1.1',
      risk_impact: 'critical',
      order: 42
    },
    {
      id: 'iso_a14_2',
      category: 'Desenvolvimento de Sistemas',
      subcategory: 'A.14.2',
      question: 'Segurança em processos de desenvolvimento e suporte é implementada?',
      description: 'Segurança integrada no SDLC',
      type: 'multiple_choice',
      required: true,
      weight: 9,
      options: ['Segurança totalmente integrada', 'Segurança adequadamente integrada', 'Integração básica', 'Segurança não integrada'],
      compliance_mapping: 'ISO 27001:2022 A.14.2.1',
      risk_impact: 'critical',
      order: 43
    },
    {
      id: 'iso_a14_3',
      category: 'Desenvolvimento de Sistemas',
      subcategory: 'A.14.3',
      question: 'Dados de teste são protegidos?',
      description: 'Proteção de dados utilizados em testes',
      type: 'scale',
      required: true,
      weight: 8,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Sem proteção', 'Proteção básica', 'Proteção adequada', 'Proteção robusta', 'Proteção avançada'],
      compliance_mapping: 'ISO 27001:2022 A.14.3.1',
      risk_impact: 'high',
      order: 44
    },
    
    // A.15 - Relacionamentos com Fornecedores
    {
      id: 'iso_a15_1',
      category: 'Relacionamentos com Fornecedores',
      subcategory: 'A.15.1',
      question: 'Política de segurança da informação para relacionamentos com fornecedores é estabelecida?',
      description: 'Política específica para fornecedores',
      type: 'multiple_choice',
      required: true,
      weight: 9,
      options: ['Política abrangente implementada', 'Política adequada', 'Política básica', 'Sem política específica'],
      compliance_mapping: 'ISO 27001:2022 A.15.1.1',
      risk_impact: 'critical',
      order: 45
    },
    {
      id: 'iso_a15_2',
      category: 'Relacionamentos com Fornecedores',
      subcategory: 'A.15.2',
      question: 'Segurança é abordada em acordos com fornecedores?',
      description: 'Requisitos de segurança em contratos',
      type: 'scale',
      required: true,
      weight: 9,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Nunca abordada', 'Raramente abordada', 'Às vezes abordada', 'Geralmente abordada', 'Sempre abordada'],
      compliance_mapping: 'ISO 27001:2022 A.15.2.1',
      risk_impact: 'critical',
      order: 46
    },
    {
      id: 'iso_a15_3',
      category: 'Relacionamentos com Fornecedores',
      subcategory: 'A.15.3',
      question: 'Cadeia de suprimentos de tecnologia da informação e comunicação é gerenciada?',
      description: 'Gestão de riscos na cadeia de suprimentos de TIC',
      type: 'multiple_choice',
      required: true,
      weight: 8,
      options: ['Gestão abrangente implementada', 'Gestão adequada', 'Gestão básica', 'Sem gestão específica'],
      compliance_mapping: 'ISO 27001:2022 A.15.1.3',
      risk_impact: 'high',
      order: 47
    },
    
    // A.16 - Gestão de Incidentes de Segurança da Informação
    {
      id: 'iso_a16_1',
      category: 'Gestão de Incidentes',
      subcategory: 'A.16.1',
      question: 'Responsabilidades e procedimentos de gestão são estabelecidos?',
      description: 'Estrutura formal de gestão de incidentes',
      type: 'scale',
      required: true,
      weight: 9,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Sem estrutura', 'Estrutura básica', 'Estrutura adequada', 'Estrutura robusta', 'Estrutura madura'],
      compliance_mapping: 'ISO 27001:2022 A.16.1.1',
      risk_impact: 'critical',
      order: 48
    },
    {
      id: 'iso_a16_2',
      category: 'Gestão de Incidentes',
      subcategory: 'A.16.2',
      question: 'Incidentes de segurança da informação são reportados?',
      description: 'Processo de reporte de incidentes',
      type: 'multiple_choice',
      required: true,
      weight: 9,
      options: ['Processo efetivo de reporte', 'Processo adequado', 'Processo básico', 'Processo inadequado'],
      compliance_mapping: 'ISO 27001:2022 A.16.1.2',
      risk_impact: 'critical',
      order: 49
    },
    {
      id: 'iso_a16_3',
      category: 'Gestão de Incidentes',
      subcategory: 'A.16.3',
      question: 'Resposta a incidentes de segurança da informação é implementada?',
      description: 'Capacidade de resposta a incidentes',
      type: 'scale',
      required: true,
      weight: 9,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Sem capacidade', 'Capacidade básica', 'Capacidade adequada', 'Capacidade robusta', 'Capacidade avançada'],
      compliance_mapping: 'ISO 27001:2022 A.16.1.3',
      risk_impact: 'critical',
      order: 50
    },
    {
      id: 'iso_a16_4',
      category: 'Gestão de Incidentes',
      subcategory: 'A.16.4',
      question: 'Aprendizado com incidentes de segurança da informação é implementado?',
      description: 'Processo de lições aprendidas',
      type: 'multiple_choice',
      required: true,
      weight: 7,
      options: ['Processo formal de aprendizado', 'Processo adequado', 'Processo básico', 'Sem processo formal'],
      compliance_mapping: 'ISO 27001:2022 A.16.1.4',
      risk_impact: 'medium',
      order: 51
    },
    {
      id: 'iso_a16_5',
      category: 'Gestão de Incidentes',
      subcategory: 'A.16.5',
      question: 'Coleta de evidências é implementada?',
      description: 'Processo de coleta e preservação de evidências',
      type: 'scale',
      required: true,
      weight: 8,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Sem processo', 'Processo básico', 'Processo adequado', 'Processo robusto', 'Processo forense'],
      compliance_mapping: 'ISO 27001:2022 A.16.1.5',
      risk_impact: 'high',
      order: 52
    },
    
    // A.17 - Aspectos de Segurança da Informação da Gestão da Continuidade do Negócio
    {
      id: 'iso_a17_1',
      category: 'Continuidade do Negócio',
      subcategory: 'A.17.1',
      question: 'Planejamento da continuidade da segurança da informação é implementado?',
      description: 'Planos de continuidade incluindo segurança da informação',
      type: 'multiple_choice',
      required: true,
      weight: 9,
      options: ['Planejamento abrangente implementado', 'Planejamento adequado', 'Planejamento básico', 'Sem planejamento específico'],
      compliance_mapping: 'ISO 27001:2022 A.17.1.1',
      risk_impact: 'critical',
      order: 53
    },
    {
      id: 'iso_a17_2',
      category: 'Continuidade do Negócio',
      subcategory: 'A.17.2',
      question: 'Implementação da continuidade da segurança da informação é realizada?',
      description: 'Implementação efetiva dos planos de continuidade',
      type: 'scale',
      required: true,
      weight: 9,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Não implementada', 'Implementação básica', 'Implementação adequada', 'Implementação robusta', 'Implementação madura'],
      compliance_mapping: 'ISO 27001:2022 A.17.1.2',
      risk_impact: 'critical',
      order: 54
    },
    {
      id: 'iso_a17_3',
      category: 'Continuidade do Negócio',
      subcategory: 'A.17.3',
      question: 'Verificação, revisão e avaliação da continuidade da segurança da informação são realizadas?',
      description: 'Teste e validação dos planos de continuidade',
      type: 'multiple_choice',
      required: true,
      weight: 8,
      options: ['Testes regulares e abrangentes', 'Testes adequados', 'Testes básicos', 'Sem testes regulares'],
      compliance_mapping: 'ISO 27001:2022 A.17.1.3',
      risk_impact: 'high',
      order: 55
    },
    
    // A.18 - Conformidade
    {
      id: 'iso_a18_1',
      category: 'Conformidade',
      subcategory: 'A.18.1',
      question: 'Identificação da legislação aplicável e requisitos contratuais é implementada?',
      description: 'Identificação e gestão de requisitos legais',
      type: 'scale',
      required: true,
      weight: 9,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Não identificados', 'Identificação básica', 'Identificação adequada', 'Identificação abrangente', 'Gestão proativa'],
      compliance_mapping: 'ISO 27001:2022 A.18.1.1',
      risk_impact: 'critical',
      order: 56
    },
    {
      id: 'iso_a18_2',
      category: 'Conformidade',
      subcategory: 'A.18.2',
      question: 'Direitos de propriedade intelectual são protegidos?',
      description: 'Proteção de propriedade intelectual',
      type: 'multiple_choice',
      required: true,
      weight: 8,
      options: ['Proteção abrangente implementada', 'Proteção adequada', 'Proteção básica', 'Proteção inadequada'],
      compliance_mapping: 'ISO 27001:2022 A.18.1.2',
      risk_impact: 'high',
      order: 57
    },
    {
      id: 'iso_a18_3',
      category: 'Conformidade',
      subcategory: 'A.18.3',
      question: 'Proteção de registros é implementada?',
      description: 'Proteção e retenção de registros importantes',
      type: 'scale',
      required: true,
      weight: 8,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Sem proteção', 'Proteção básica', 'Proteção adequada', 'Proteção robusta', 'Proteção avançada'],
      compliance_mapping: 'ISO 27001:2022 A.18.1.3',
      risk_impact: 'high',
      order: 58
    },
    {
      id: 'iso_a18_4',
      category: 'Conformidade',
      subcategory: 'A.18.4',
      question: 'Privacidade e proteção de informações pessoais identificáveis são implementadas?',
      description: 'Proteção de dados pessoais conforme LGPD/GDPR',
      type: 'multiple_choice',
      required: true,
      weight: 10,
      options: ['Proteção totalmente conforme', 'Proteção adequadamente conforme', 'Conformidade básica', 'Não conforme'],
      compliance_mapping: 'ISO 27001:2022 A.18.1.4',
      risk_impact: 'critical',
      order: 59
    },
    {
      id: 'iso_a18_5',
      category: 'Conformidade',
      subcategory: 'A.18.5',
      question: 'Regulamentação de controles criptográficos é atendida?',
      description: 'Conformidade com regulamentações de criptografia',
      type: 'scale',
      required: true,
      weight: 8,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Não conforme', 'Conformidade básica', 'Conformidade adequada', 'Conformidade robusta', 'Conformidade total'],
      compliance_mapping: 'ISO 27001:2022 A.18.1.5',
      risk_impact: 'high',
      order: 60
    },
    
    // Controles adicionais ISO 27001:2022
    {
      id: 'iso_a5_4',
      category: 'Políticas de Segurança',
      subcategory: 'A.5.4',
      question: 'Regras de segurança da informação para o uso de serviços em nuvem são estabelecidas?',
      description: 'Políticas específicas para uso de cloud computing',
      type: 'multiple_choice',
      required: true,
      weight: 9,
      options: ['Regras abrangentes estabelecidas', 'Regras adequadas', 'Regras básicas', 'Sem regras específicas'],
      compliance_mapping: 'ISO 27001:2022 A.5.4',
      risk_impact: 'critical',
      order: 61
    },
    {
      id: 'iso_a5_5',
      category: 'Políticas de Segurança',
      subcategory: 'A.5.5',
      question: 'Contato com grupos de interesse especial é mantido?',
      description: 'Relacionamento com comunidades de segurança',
      type: 'scale',
      required: false,
      weight: 6,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Sem contato', 'Contato limitado', 'Contato ocasional', 'Contato regular', 'Participação ativa'],
      compliance_mapping: 'ISO 27001:2022 A.5.5',
      risk_impact: 'low',
      order: 62
    },
    {
      id: 'iso_a5_6',
      category: 'Políticas de Segurança',
      subcategory: 'A.5.6',
      question: 'Contato com autoridades é mantido?',
      description: 'Relacionamento com autoridades reguladoras',
      type: 'multiple_choice',
      required: true,
      weight: 7,
      options: ['Relacionamento ativo e efetivo', 'Relacionamento adequado', 'Contato básico', 'Sem relacionamento formal'],
      compliance_mapping: 'ISO 27001:2022 A.5.6',
      risk_impact: 'medium',
      order: 63
    },
    {
      id: 'iso_a5_7',
      category: 'Políticas de Segurança',
      subcategory: 'A.5.7',
      question: 'Inteligência de ameaças é implementada?',
      description: 'Coleta e análise de inteligência de ameaças',
      type: 'scale',
      required: true,
      weight: 8,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Sem inteligência', 'Inteligência básica', 'Inteligência adequada', 'Inteligência robusta', 'Inteligência avançada'],
      compliance_mapping: 'ISO 27001:2022 A.5.7',
      risk_impact: 'high',
      order: 64
    },
    
    // Continuando até completar 90+ questões...

    // ISO 27701 - Controles de Privacidade
    {
      id: 'iso_27701_5_1',
      category: 'Privacidade - Controlador',
      subcategory: 'ISO 27701 5.2.1',
      question: 'Políticas para o processamento de dados pessoais são estabelecidas?',
      description: 'Políticas específicas para processamento de dados pessoais',
      type: 'multiple_choice',
      required: true,
      weight: 10,
      options: ['Políticas abrangentes e atualizadas', 'Políticas adequadas', 'Políticas básicas', 'Sem políticas específicas'],
      compliance_mapping: 'ISO 27701:2019 5.2.1',
      risk_impact: 'critical',
      order: 85
    },
    {
      id: 'iso_27701_5_2',
      category: 'Privacidade - Controlador',
      subcategory: 'ISO 27701 5.2.2',
      question: 'Os direitos dos titulares de dados são abordados?',
      description: 'Processo para atender direitos dos titulares (LGPD/GDPR)',
      type: 'scale',
      required: true,
      weight: 10,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Não abordados', 'Abordagem básica', 'Abordagem adequada', 'Processo robusto', 'Processo otimizado'],
      compliance_mapping: 'ISO 27701:2019 5.2.2',
      risk_impact: 'critical',
      order: 86
    },
    {
      id: 'iso_27701_6_1',
      category: 'Privacidade - Processador',
      subcategory: 'ISO 27701 6.2.1',
      question: 'As obrigações do processador são abordadas?',
      description: 'Cumprimento das obrigações como processador de dados',
      type: 'multiple_choice',
      required: true,
      weight: 9,
      options: ['Obrigações totalmente implementadas', 'Obrigações adequadamente implementadas', 'Implementação parcial', 'Obrigações não implementadas'],
      compliance_mapping: 'ISO 27701:2019 6.2.1',
      risk_impact: 'critical',
      order: 87
    },
    {
      id: 'iso_27701_7_1',
      category: 'Privacidade - Avaliação',
      subcategory: 'ISO 27701 7.2.1',
      question: 'Avaliações de impacto à proteção de dados são realizadas?',
      description: 'DPIA/RIPD para processamentos de alto risco',
      type: 'scale',
      required: true,
      weight: 9,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Nunca realizadas', 'Realizadas ocasionalmente', 'Realizadas quando necessário', 'Processo estruturado', 'Processo maduro'],
      compliance_mapping: 'ISO 27701:2019 7.2.1',
      risk_impact: 'critical',
      order: 88
    },
    {
      id: 'iso_27701_8_1',
      category: 'Privacidade - Transferência',
      subcategory: 'ISO 27701 8.2.1',
      question: 'As transferências internacionais de dados pessoais são abordadas?',
      description: 'Controles para transferências internacionais de dados',
      type: 'multiple_choice',
      required: true,
      weight: 9,
      options: ['Controles abrangentes implementados', 'Controles adequados', 'Controles básicos', 'Sem controles específicos'],
      compliance_mapping: 'ISO 27701:2019 8.2.1',
      risk_impact: 'critical',
      order: 89
    },
    {
      id: 'iso_27701_9_1',
      category: 'Privacidade - Monitoramento',
      subcategory: 'ISO 27701 9.2.1',
      question: 'O monitoramento, medição, análise e avaliação do processamento de dados pessoais são abordados?',
      description: 'Monitoramento contínuo do processamento de dados pessoais',
      type: 'scale',
      required: true,
      weight: 8,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Sem monitoramento', 'Monitoramento básico', 'Monitoramento adequado', 'Monitoramento abrangente', 'Monitoramento otimizado'],
      compliance_mapping: 'ISO 27701:2019 9.2.1',
      risk_impact: 'high',
      order: 90
    }
  ]
};

// Template Proprietário expandido
const PROPRIETARY_TEMPLATE: Omit<AssessmentTemplate, 'id'> = {
  name: 'Assessment Proprietário Customizável',
  type: 'proprietary',
  description: 'Template base para assessments customizados com questões de exemplo abrangentes',
  version: '1.0',
  framework_reference: 'Customizado',
  scoring_method: 'weighted',
  pass_threshold: 70,
  is_default: true,
  questions: [
    {
      id: 'prop_1',
      category: 'Governança',
      question: 'A organização possui políticas de segurança documentadas e aprovadas?',
      description: 'Questão de exemplo - pode ser editada ou removida',
      type: 'yes_no',
      required: true,
      weight: 5,
      compliance_mapping: 'Customizado',
      risk_impact: 'medium',
      order: 1
    },
    {
      id: 'prop_2',
      category: 'Controles Técnicos',
      question: 'Qual o nível de maturidade dos controles técnicos implementados?',
      description: 'Avalie considerando automação e efetividade',
      type: 'scale',
      required: false,
      weight: 7,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Inicial', 'Básico', 'Intermediário', 'Avançado', 'Otimizado'],
      compliance_mapping: 'Customizado',
      risk_impact: 'medium',
      order: 2
    },
    // Questões de exemplo adicionais para template proprietário
    {
      id: 'prop_3',
      category: 'Gestão de Riscos',
      question: 'A organização possui um processo formal de gestão de riscos?',
      description: 'Processo estruturado para identificação, análise e tratamento de riscos',
      type: 'multiple_choice',
      required: true,
      weight: 8,
      options: ['Processo maduro e integrado', 'Processo adequado', 'Processo básico', 'Sem processo formal'],
      compliance_mapping: 'Customizado',
      risk_impact: 'high',
      order: 3
    },
    {
      id: 'prop_4',
      category: 'Monitoramento',
      question: 'Existem métricas e indicadores de segurança definidos?',
      description: 'KPIs e métricas para monitoramento da efetividade dos controles',
      type: 'scale',
      required: true,
      weight: 7,
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Sem métricas', 'Métricas básicas', 'Métricas adequadas', 'Métricas abrangentes', 'Dashboard integrado'],
      compliance_mapping: 'Customizado',
      risk_impact: 'medium',
      order: 4
    },
    {
      id: 'prop_5',
      category: 'Treinamento',
      question: 'A organização possui programa de conscientização em segurança?',
      description: 'Programa estruturado de treinamento e conscientização',
      type: 'yes_no',
      required: true,
      weight: 6,
      compliance_mapping: 'Customizado',
      risk_impact: 'medium',
      order: 5
    }
  ]
};

export const RiskAssessmentManager: React.FC<RiskAssessmentManagerProps> = ({
  vendorId,
  onAssessmentComplete,
  onResponsesChange,
  onTemplateSelected
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  console.log('RiskAssessmentManager renderizado:', { vendorId, user });
  
  const [selectedTemplate, setSelectedTemplate] = useState<AssessmentTemplate | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [availableTemplates, setAvailableTemplates] = useState<AssessmentTemplate[]>([]);
  const [responses, setResponses] = useState<Record<string, AssessmentResponse>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Verificar se há um template selecionado salvo no localStorage
  useEffect(() => {
    if (vendorId && availableTemplates.length > 0) {
      const savedTemplate = localStorage.getItem(`vendor_${vendorId}_selected_template`);
      if (savedTemplate) {
        try {
          const templateInfo = JSON.parse(savedTemplate);
          console.log('Template selecionado recuperado do localStorage:', templateInfo);
          setSelectedTemplateId(templateInfo.templateId);
          
          // Encontrar o template correspondente
          const template = availableTemplates.find(t => t.id === templateInfo.templateId);
          if (template) {
            setSelectedTemplate(template);
          }
        } catch (error) {
          console.error('Erro ao recuperar template selecionado:', error);
        }
      }
    }
  }, [vendorId, availableTemplates]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<AssessmentQuestion | null>(null);
  const [newQuestion, setNewQuestion] = useState<Partial<AssessmentQuestion>>({
    category: '',
    question: '',
    type: 'multiple_choice',
    required: true,
    weight: 5,
    order: 0
  });
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Carregar templates
  useEffect(() => {
    const templates = [
      { ...NIST_CSF_TEMPLATE, id: 'nist_csf_default' },
      { ...ISO_27001_27701_TEMPLATE, id: 'iso_27001_27701_default' },
      { ...PROPRIETARY_TEMPLATE, id: 'proprietary_default' }
    ];
    setAvailableTemplates(templates);
  }, []);

  // Calcular score e completude apenas quando há respostas
  useEffect(() => {
    if (selectedTemplate && Object.keys(responses).length > 0) {
      const { isComplete, score } = calculateAssessmentScore();
      onAssessmentComplete(isComplete, score);
      
      if (onResponsesChange) {
        onResponsesChange(responses);
      }
    }
  }, [selectedTemplate, responses, onAssessmentComplete, onResponsesChange]);

  const calculateAssessmentScore = () => {
    if (!selectedTemplate) return { isComplete: false, score: 0 };
    
    const requiredQuestions = selectedTemplate.questions.filter(q => q.required);
    const answeredRequired = requiredQuestions.filter(q => responses[q.id]?.answer !== undefined);
    
    const isComplete = answeredRequired.length === requiredQuestions.length;
    
    // Calcular score
    let totalScore = 0;
    let maxScore = 0;
    
    selectedTemplate.questions.forEach(question => {
      const response = responses[question.id];
      if (response?.answer !== undefined) {
        const questionScore = calculateQuestionScore(question, response);
        totalScore += questionScore * question.weight;
      }
      maxScore += question.weight;
    });
    
    const score = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    
    return { isComplete, score };
  };

  const calculateQuestionScore = (question: AssessmentQuestion, response: AssessmentResponse): number => {
    switch (question.type) {
      case 'yes_no':
        return response.answer === 'Sim' ? 1 : 0;
      case 'scale':
        const scaleValue = Number(response.answer);
        const maxScale = question.scale_max || 5;
        return scaleValue / maxScale;
      case 'multiple_choice':
        const optionIndex = question.options?.indexOf(response.answer as string) || 0;
        const optionsCount = question.options?.length || 1;
        return (optionsCount - optionIndex) / optionsCount;
      default:
        return response.answer ? 1 : 0;
    }
  };

  // Função para selecionar template (sem abrir modal)
  const selectTemplate = async (template: AssessmentTemplate) => {
    setSelectedTemplate(template);
    setSelectedTemplateId(template.id);
    setResponses({});
    
    // Salvar no banco de dados se vendorId estiver presente
    if (vendorId) {
      try {
        // Aqui você pode adicionar a lógica para salvar no banco
        console.log('Salvando template selecionado para vendor:', vendorId, template.id);
        
        toast({
          title: 'Template Selecionado',
          description: `Framework ${template.name} foi selecionado com sucesso.`,
        });
      } catch (error) {
        console.error('Erro ao salvar template:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao salvar a seleção do template.',
          variant: 'destructive',
        });
      }
    }
    
    // Notificar o componente pai sobre a seleção do template
    if (onTemplateSelected) {
      onTemplateSelected(template.id, template.name);
    }
    
    // Indicar que o template foi configurado (não precisa de respostas ainda)
    onAssessmentComplete(true, 0);
  };
  
  // Função para abrir modal de assessment
  const openAssessmentModal = (template: AssessmentTemplate) => {
    if (!selectedTemplateId || selectedTemplateId !== template.id) {
      toast({
        title: 'Template não selecionado',
        description: 'Por favor, selecione o template primeiro antes de iniciar o assessment.',
        variant: 'destructive',
      });
      return;
    }
    
    setSelectedTemplate(template);
    setIsModalOpen(true);
  };
  
  // Função para abrir modal de edição
  const openEditModal = (template: AssessmentTemplate) => {
    setSelectedTemplate(template);
    setShowEditModal(true);
  };

  const updateResponse = (questionId: string, answer: string | number, justification?: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: {
        question_id: questionId,
        answer,
        justification: justification || prev[questionId]?.justification || '',
        responded_by: user?.id,
        responded_at: new Date().toISOString()
      }
    }));
  };

  const addQuestion = () => {
    if (!selectedTemplate || !newQuestion.question) return;
    
    const maxOrder = Math.max(...selectedTemplate.questions.map(q => q.order), 0);
    const question: AssessmentQuestion = {
      id: `custom_${Date.now()}`,
      category: newQuestion.category || 'Customizado',
      question: newQuestion.question,
      description: newQuestion.description,
      type: newQuestion.type || 'multiple_choice',
      required: newQuestion.required || false,
      weight: newQuestion.weight || 5,
      options: newQuestion.options,
      scale_min: newQuestion.scale_min,
      scale_max: newQuestion.scale_max,
      scale_labels: newQuestion.scale_labels,
      compliance_mapping: newQuestion.compliance_mapping,
      risk_impact: newQuestion.risk_impact || 'medium',
      order: maxOrder + 1
    };
    
    setSelectedTemplate(prev => prev ? {
      ...prev,
      questions: [...prev.questions, question].sort((a, b) => a.order - b.order)
    } : null);
    
    setNewQuestion({
      category: '',
      question: '',
      type: 'multiple_choice',
      required: false,
      weight: 5,
      order: 1
    });
    setIsAddingQuestion(false);
    
    toast({
      title: "Questão Adicionada",
      description: "Nova questão foi adicionada ao assessment"
    });
  };

  const updateQuestion = (question: AssessmentQuestion) => {
    if (!selectedTemplate) return;
    
    setSelectedTemplate(prev => prev ? {
      ...prev,
      questions: prev.questions.map(q => q.id === question.id ? question : q)
    } : null);
    
    setEditingQuestion(null);
    
    toast({
      title: "Questão Atualizada",
      description: "Questão foi atualizada com sucesso"
    });
  };

  const removeQuestion = (questionId: string) => {
    if (!selectedTemplate) return;
    
    setSelectedTemplate(prev => prev ? {
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    } : null);
    
    setResponses(prev => {
      const newResponses = { ...prev };
      delete newResponses[questionId];
      return newResponses;
    });
    
    toast({
      title: "Questão Removida",
      description: "Questão foi removida do assessment"
    });
  };

  const renderQuestionInput = (question: AssessmentQuestion) => {
    const response = responses[question.id];
    
    switch (question.type) {
      case 'yes_no':
        return (
          <Select
            value={response?.answer as string || ''}
            onValueChange={(value) => updateResponse(question.id, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma opção" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Sim">Sim</SelectItem>
              <SelectItem value="Não">Não</SelectItem>
            </SelectContent>
          </Select>
        );
        
      case 'multiple_choice':
        return (
          <Select
            value={response?.answer as string || ''}
            onValueChange={(value) => updateResponse(question.id, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma opção" />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map((option, index) => (
                <SelectItem key={index} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
        
      case 'scale':
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              {Array.from({ length: (question.scale_max || 5) - (question.scale_min || 1) + 1 }, (_, i) => {
                const value = (question.scale_min || 1) + i;
                return (
                  <Button
                    key={value}
                    variant={response?.answer === value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateResponse(question.id, value)}
                    className="w-12 h-12"
                  >
                    {value}
                  </Button>
                );
              })}
            </div>
            {question.scale_labels && (
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{question.scale_labels[0]}</span>
                <span>{question.scale_labels[question.scale_labels.length - 1]}</span>
              </div>
            )}
          </div>
        );
        
      case 'text':
        return (
          <Textarea
            value={response?.answer as string || ''}
            onChange={(e) => updateResponse(question.id, e.target.value)}
            placeholder="Digite sua resposta..."
            rows={3}
          />
        );
        
      default:
        return (
          <Input
            value={response?.answer as string || ''}
            onChange={(e) => updateResponse(question.id, e.target.value)}
            placeholder="Digite sua resposta..."
          />
        );
    }
  };

  const filteredQuestions = selectedTemplate?.questions.filter(question => {
    const matchesSearch = question.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || question.category === filterCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  const categories = Array.from(new Set(selectedTemplate?.questions.map(q => q.category) || []));

  console.log('Estado atual:', { selectedTemplate: selectedTemplate?.name, templates: availableTemplates.length });
  
  if (!selectedTemplate) {
    console.log('Renderizando seleção de templates');
    return (
      <div className="space-y-6">
        <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/50 dark:to-blue-950/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-900 dark:text-purple-100">
              <Shield className="h-5 w-5" />
              Seleção de Assessment de Risco
            </CardTitle>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              Escolha o tipo de assessment mais adequado para avaliar o fornecedor
            </p>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {availableTemplates.map((template) => (
            <Card 
              key={template.id} 
              className={`hover:shadow-lg transition-all duration-200 border-2 bg-white dark:bg-gray-900 flex flex-col ${
                selectedTemplateId === template.id 
                  ? 'border-green-500 dark:border-green-400 shadow-lg' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 mb-2">
                  {template.type === 'nist_csf' && <Target className="h-5 w-5 text-blue-600" />}
                  {template.type === 'iso_27001_27701' && <Award className="h-5 w-5 text-green-600" />}
                  {template.type === 'proprietary' && <Settings className="h-5 w-5 text-purple-600" />}
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                </div>
                <Badge variant="outline" className="w-fit border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                  {template.framework_reference}
                </Badge>
              </CardHeader>
              
              <CardContent className="flex flex-col flex-1">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-4">
                    {template.description}
                  </p>
                </div>
                
                <div className="space-y-2 text-xs mb-4">
                  <div className="flex justify-between">
                    <span>Questões:</span>
                    <span className="font-medium">{template.questions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Limite de Aprovação:</span>
                    <span className="font-medium">{template.pass_threshold}%</span>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-auto">
                  <Button 
                    variant={selectedTemplateId === template.id ? 'default' : 'outline'}
                    className={`flex-1 ${
                      selectedTemplateId === template.id 
                        ? 'bg-green-600 hover:bg-green-700 text-white border-green-600' 
                        : ''
                    }`}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      selectTemplate(template);
                    }}
                  >
                    {selectedTemplateId === template.id ? '✓ Selecionado' : 'Selecionar Assessment'}
                  </Button>
                  
                  {selectedTemplateId === template.id && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="px-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        openAssessmentModal(template);
                      }}
                      title="Iniciar Assessment"
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Iniciar
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="px-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(template);
                    }}
                    title="Editar Framework"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Botão Próximo - aparece quando um template é selecionado */}
        {selectedTemplateId && (
          <Card className="border-green-200 dark:border-green-800 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-900 dark:text-green-100">
                      Template Selecionado
                    </h3>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      {availableTemplates.find(t => t.id === selectedTemplateId)?.name} foi selecionado com sucesso
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const template = availableTemplates.find(t => t.id === selectedTemplateId);
                      if (template) openAssessmentModal(template);
                    }}
                    className="border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Iniciar Assessment
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => {
                      // Notificar que o template foi selecionado e pode prosseguir
                      // O assessment será respondido pelo fornecedor posteriormente
                      onAssessmentComplete(true, 0); // Forçar como completo para permitir prosseguir
                      
                      toast({
                        title: 'Template Configurado',
                        description: 'O assessment foi configurado. O fornecedor receberá o link para responder as questões.',
                      });
                    }}
                  >
                    Próximo
                    <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  const { isComplete, score } = calculateAssessmentScore();
  const requiredQuestions = selectedTemplate.questions.filter(q => q.required);
  const answeredRequired = requiredQuestions.filter(q => responses[q.id]?.answer !== undefined);

  return (
    <div className="space-y-6">
      {/* Header com informações do assessment */}
      <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/50 dark:to-blue-950/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-purple-900 dark:text-purple-100">
                <Shield className="h-5 w-5" />
                {selectedTemplate.name}
              </CardTitle>
              <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                {selectedTemplate.description}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTemplate(null)}
                className="border-purple-300 dark:border-purple-600 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-800"
              >
                Trocar Assessment
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => setIsModalOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <FileText className="h-4 w-4 mr-2" />
                Abrir Assessment
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full ${
                isComplete ? 'bg-green-500' : 'bg-yellow-500'
              }`}></div>
              <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
                {answeredRequired.length}/{requiredQuestions.length} questões obrigatórias
              </span>
            </div>
            
            <div className="flex-1">
              <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isComplete ? 'bg-green-500' : 'bg-yellow-500'
                  }`}
                  style={{ width: `${requiredQuestions.length > 0 ? (answeredRequired.length / requiredQuestions.length) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant={isComplete ? "default" : "secondary"} className={
                isComplete ? "bg-green-600 hover:bg-green-700 text-white" : "bg-yellow-600 text-white"
              }>
                {isComplete ? "Completo" : "Pendente"}
              </Badge>
              
              <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                Score: {score}%
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal do Assessment */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {selectedTemplate.name}
            </DialogTitle>
            <DialogDescription>
              {selectedTemplate.description} - {selectedTemplate.questions.length} questões
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Controles de busca e filtro */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar questões..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                onClick={() => setIsAddingQuestion(true)}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>

            {/* Lista de questões */}
            <ScrollArea className="h-[60vh]">
              <div className="space-y-4 pr-4">
                {/* Formulário para nova questão */}
                {isAddingQuestion && (
                  <Card className="border-dashed border-green-300">
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Categoria *</Label>
                            <Input
                              value={newQuestion.category || ''}
                              onChange={(e) => setNewQuestion(prev => ({ ...prev, category: e.target.value }))}
                              placeholder="Ex: Controles Técnicos"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Tipo de Questão</Label>
                            <Select
                              value={newQuestion.type || 'multiple_choice'}
                              onValueChange={(value: QuestionType) => setNewQuestion(prev => ({ ...prev, type: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="yes_no">Sim/Não</SelectItem>
                                <SelectItem value="multiple_choice">Múltipla Escolha</SelectItem>
                                <SelectItem value="scale">Escala</SelectItem>
                                <SelectItem value="text">Texto Livre</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Questão *</Label>
                          <Textarea
                            value={newQuestion.question || ''}
                            onChange={(e) => setNewQuestion(prev => ({ ...prev, question: e.target.value }))}
                            placeholder="Digite a questão..."
                            rows={2}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Descrição/Orientação</Label>
                          <Textarea
                            value={newQuestion.description || ''}
                            onChange={(e) => setNewQuestion(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Orientações para responder a questão..."
                            rows={2}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={newQuestion.required || false}
                              onCheckedChange={(checked) => setNewQuestion(prev => ({ ...prev, required: !!checked }))}
                            />
                            <Label>Questão obrigatória</Label>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Peso (1-10)</Label>
                            <Input
                              type="number"
                              min="1"
                              max="10"
                              value={newQuestion.weight || 5}
                              onChange={(e) => setNewQuestion(prev => ({ ...prev, weight: parseInt(e.target.value) || 5 }))}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Impacto de Risco</Label>
                            <Select
                              value={newQuestion.risk_impact || 'medium'}
                              onValueChange={(value: RiskLevel) => setNewQuestion(prev => ({ ...prev, risk_impact: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Baixo</SelectItem>
                                <SelectItem value="medium">Médio</SelectItem>
                                <SelectItem value="high">Alto</SelectItem>
                                <SelectItem value="critical">Crítico</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        {newQuestion.type === 'multiple_choice' && (
                          <div className="space-y-2">
                            <Label>Opções (uma por linha)</Label>
                            <Textarea
                              value={newQuestion.options?.join('\n') || ''}
                              onChange={(e) => setNewQuestion(prev => ({ 
                                ...prev, 
                                options: e.target.value.split('\n').filter(opt => opt.trim()) 
                              }))}
                              placeholder="Opção 1\nOpção 2\nOpção 3"
                              rows={4}
                            />
                          </div>
                        )}
                        
                        {newQuestion.type === 'scale' && (
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Valor Mínimo</Label>
                              <Input
                                type="number"
                                value={newQuestion.scale_min || 1}
                                onChange={(e) => setNewQuestion(prev => ({ ...prev, scale_min: parseInt(e.target.value) || 1 }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Valor Máximo</Label>
                              <Input
                                type="number"
                                value={newQuestion.scale_max || 5}
                                onChange={(e) => setNewQuestion(prev => ({ ...prev, scale_max: parseInt(e.target.value) || 5 }))}
                              />
                            </div>
                          </div>
                        )}
                        
                        <div className="flex gap-2">
                          <Button onClick={addQuestion} disabled={!newQuestion.question}>
                            <Save className="h-4 w-4 mr-2" />
                            Salvar Questão
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setIsAddingQuestion(false);
                              setNewQuestion({
                                category: '',
                                question: '',
                                type: 'multiple_choice',
                                required: false,
                                weight: 5,
                                order: 1
                              });
                            }}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Questões filtradas */}
                {filteredQuestions.map((question) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    response={responses[question.id]}
                    onUpdateResponse={updateResponse}
                    onEditQuestion={setEditingQuestion}
                    onRemoveQuestion={removeQuestion}
                    renderInput={renderQuestionInput}
                  />
                ))}
              </div>
            </ScrollArea>

            {/* Footer do modal */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                {answeredRequired.length}/{requiredQuestions.length} questões obrigatórias respondidas
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  Score: {score}%
                </Badge>
                <Button onClick={() => setIsModalOpen(false)}>
                  Fechar Assessment
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Resumo do Assessment */}
      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
        <CardContent className="p-4">
          <h4 className="flex items-center gap-2 text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            <Target className="h-4 w-4" />
            ALEX VENDOR - Análise do Assessment
          </h4>
          <div className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
            {!isComplete && (
              <p>⚠️ Ainda faltam {requiredQuestions.length - answeredRequired.length} questões obrigatórias</p>
            )}
            {isComplete && (
              <p>✅ Todas as questões obrigatórias foram respondidas!</p>
            )}
            
            <p>📊 Score atual: {score}% (Limite: {selectedTemplate.pass_threshold}%)</p>
            <p>📋 Assessment: {selectedTemplate.questions.length} questões ({requiredQuestions.length} obrigatórias)</p>
            
            {score >= (selectedTemplate.pass_threshold || 70) ? (
              <p className="text-green-700 dark:text-green-300">✅ Fornecedor APROVADO no assessment</p>
            ) : (
              <p className="text-red-700 dark:text-red-300">❌ Fornecedor NÃO APROVADO no assessment</p>
            )}
          </div>
        </CardContent>
      </Card>
    
      {/* Modal de Edição de Framework */}
    <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Editar Framework - {selectedTemplate?.name}</DialogTitle>
          <DialogDescription>
            Personalize as questões do framework de acordo com suas necessidades.
          </DialogDescription>
        </DialogHeader>
        
        {selectedTemplate && (
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
            {/* Informações do Template */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Informações do Framework</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Nome:</span> {selectedTemplate.name}
                </div>
                <div>
                  <span className="font-medium">Versão:</span> {selectedTemplate.version}
                </div>
                <div>
                  <span className="font-medium">Tipo:</span> {selectedTemplate.type}
                </div>
                <div>
                  <span className="font-medium">Questões:</span> {selectedTemplate.questions.length}
                </div>
              </div>
            </div>

            {/* Lista de Questões */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Questões do Framework</h3>
                <Button
                  onClick={() => {
                    setIsAddingQuestion(true);
                    setShowAddModal(true);
                  }}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar Questão
                </Button>
              </div>
              
              <ScrollArea className="h-80 w-full rounded-md border p-4">
                <div className="space-y-3">
                {selectedTemplate.questions.map((question, index) => (
                  <div key={question.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">#{index + 1}</span>
                          <Badge variant="outline" className="text-xs">
                            {question.category}
                          </Badge>
                          {question.required && (
                            <Badge variant="destructive" className="text-xs">Obrigatória</Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            Peso: {question.weight}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium mb-1">{question.question}</p>
                        {question.description && (
                          <p className="text-xs text-muted-foreground">{question.description}</p>
                        )}
                      </div>
                      <div className="flex gap-1 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingQuestion(question);
                            setIsAddingQuestion(false);
                            setShowAddModal(true);
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        {question.id.startsWith('custom_') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // Remove questão customizada
                              const updatedQuestions = selectedTemplate.questions.filter(q => q.id !== question.id);
                              setSelectedTemplate({
                                ...selectedTemplate,
                                questions: updatedQuestions
                              });
                            }}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                </div>
              </ScrollArea>
            </div>
            </div>

            {/* Botões de Ação - Fixos na parte inferior */}
            <div className="flex justify-end gap-2 pt-4 border-t bg-background">
              <Button
                variant="outline"
                onClick={() => setShowEditModal(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  // Salvar alterações
                  setShowEditModal(false);
                  toast({
                    title: 'Framework Atualizado',
                    description: 'As alterações foram salvas com sucesso.',
                  });
                }}
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>

    {/* Modal de Adicionar/Editar Questão */}
    <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isAddingQuestion ? 'Adicionar Nova Questão' : 'Editar Questão'}
          </DialogTitle>
          <DialogDescription>
            {isAddingQuestion 
              ? 'Crie uma nova questão personalizada para o framework.'
              : 'Edite os detalhes da questão selecionada.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Input
                id="category"
                value={editingQuestion?.category || newQuestion.category}
                onChange={(e) => {
                  if (editingQuestion) {
                    setEditingQuestion({ ...editingQuestion, category: e.target.value });
                  } else {
                    setNewQuestion({ ...newQuestion, category: e.target.value });
                  }
                }}
                placeholder="Ex: Segurança Física"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subcategory">Subcategoria (opcional)</Label>
              <Input
                id="subcategory"
                value={editingQuestion?.subcategory || newQuestion.subcategory || ''}
                onChange={(e) => {
                  if (editingQuestion) {
                    setEditingQuestion({ ...editingQuestion, subcategory: e.target.value });
                  } else {
                    setNewQuestion({ ...newQuestion, subcategory: e.target.value });
                  }
                }}
                placeholder="Ex: Controle de Acesso"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="question">Questão</Label>
            <Textarea
              id="question"
              value={editingQuestion?.question || newQuestion.question}
              onChange={(e) => {
                if (editingQuestion) {
                  setEditingQuestion({ ...editingQuestion, question: e.target.value });
                } else {
                  setNewQuestion({ ...newQuestion, question: e.target.value });
                }
              }}
              placeholder="Digite a questão..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              value={editingQuestion?.description || newQuestion.description || ''}
              onChange={(e) => {
                if (editingQuestion) {
                  setEditingQuestion({ ...editingQuestion, description: e.target.value });
                } else {
                  setNewQuestion({ ...newQuestion, description: e.target.value });
                }
              }}
              placeholder="Descrição adicional da questão..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Resposta</Label>
              <Select
                value={editingQuestion?.type || newQuestion.type}
                onValueChange={(value: QuestionType) => {
                  if (editingQuestion) {
                    setEditingQuestion({ ...editingQuestion, type: value });
                  } else {
                    setNewQuestion({ ...newQuestion, type: value });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple_choice">Múltipla Escolha</SelectItem>
                  <SelectItem value="yes_no">Sim/Não</SelectItem>
                  <SelectItem value="scale">Escala</SelectItem>
                  <SelectItem value="text">Texto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Peso</Label>
              <Input
                id="weight"
                type="number"
                min="1"
                max="10"
                value={editingQuestion?.weight || newQuestion.weight}
                onChange={(e) => {
                  const weight = parseInt(e.target.value) || 1;
                  if (editingQuestion) {
                    setEditingQuestion({ ...editingQuestion, weight });
                  } else {
                    setNewQuestion({ ...newQuestion, weight });
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Checkbox
                  checked={editingQuestion?.required ?? newQuestion.required}
                  onCheckedChange={(checked) => {
                    if (editingQuestion) {
                      setEditingQuestion({ ...editingQuestion, required: !!checked });
                    } else {
                      setNewQuestion({ ...newQuestion, required: !!checked });
                    }
                  }}
                />
                Obrigatória
              </Label>
            </div>
          </div>

          {/* Opções para múltipla escolha */}
          {(editingQuestion?.type === 'multiple_choice' || newQuestion.type === 'multiple_choice') && (
            <div className="space-y-2">
              <Label>Opções de Resposta</Label>
              <div className="space-y-2">
                {(editingQuestion?.options || newQuestion.options || []).map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...(editingQuestion?.options || newQuestion.options || [])];
                        newOptions[index] = e.target.value;
                        if (editingQuestion) {
                          setEditingQuestion({ ...editingQuestion, options: newOptions });
                        } else {
                          setNewQuestion({ ...newQuestion, options: newOptions });
                        }
                      }}
                      placeholder={`Opção ${index + 1}`}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newOptions = (editingQuestion?.options || newQuestion.options || []).filter((_, i) => i !== index);
                        if (editingQuestion) {
                          setEditingQuestion({ ...editingQuestion, options: newOptions });
                        } else {
                          setNewQuestion({ ...newQuestion, options: newOptions });
                        }
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const currentOptions = editingQuestion?.options || newQuestion.options || [];
                    const newOptions = [...currentOptions, ''];
                    if (editingQuestion) {
                      setEditingQuestion({ ...editingQuestion, options: newOptions });
                    } else {
                      setNewQuestion({ ...newQuestion, options: newOptions });
                    }
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Opção
                </Button>
              </div>
            </div>
          )}

          {/* Configurações de escala */}
          {(editingQuestion?.type === 'scale' || newQuestion.type === 'scale') && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scale_min">Valor Mínimo</Label>
                <Input
                  id="scale_min"
                  type="number"
                  value={editingQuestion?.scale_min || newQuestion.scale_min || 1}
                  onChange={(e) => {
                    const scale_min = parseInt(e.target.value) || 1;
                    if (editingQuestion) {
                      setEditingQuestion({ ...editingQuestion, scale_min });
                    } else {
                      setNewQuestion({ ...newQuestion, scale_min });
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scale_max">Valor Máximo</Label>
                <Input
                  id="scale_max"
                  type="number"
                  value={editingQuestion?.scale_max || newQuestion.scale_max || 5}
                  onChange={(e) => {
                    const scale_max = parseInt(e.target.value) || 5;
                    if (editingQuestion) {
                      setEditingQuestion({ ...editingQuestion, scale_max });
                    } else {
                      setNewQuestion({ ...newQuestion, scale_max });
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => {
              setShowAddModal(false);
              setEditingQuestion(null);
              setIsAddingQuestion(false);
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={() => {
              if (selectedTemplate) {
                const updatedQuestions = [...selectedTemplate.questions];
                
                if (isAddingQuestion) {
                  // Adicionar nova questão
                  const newQuestionWithId = {
                    ...newQuestion,
                    id: `custom_${Date.now()}`,
                    order: selectedTemplate.questions.length + 1
                  };
                  updatedQuestions.push(newQuestionWithId);
                } else if (editingQuestion) {
                  // Editar questão existente
                  const index = updatedQuestions.findIndex(q => q.id === editingQuestion.id);
                  if (index !== -1) {
                    updatedQuestions[index] = editingQuestion;
                  }
                }
                
                setSelectedTemplate({
                  ...selectedTemplate,
                  questions: updatedQuestions
                });
              }
              
              setShowAddModal(false);
              setEditingQuestion(null);
              setIsAddingQuestion(false);
              
              // Reset new question
              setNewQuestion({
                category: '',
                question: '',
                type: 'multiple_choice',
                required: true,
                weight: 5,
                order: 0
              });
              
              toast({
                title: isAddingQuestion ? 'Questão Adicionada' : 'Questão Atualizada',
                description: 'A questão foi salva com sucesso.',
              });
            }}
          >
            {isAddingQuestion ? 'Adicionar' : 'Salvar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </div>
  );
};

// Componente para cada questão
interface QuestionCardProps {
  question: AssessmentQuestion;
  response?: AssessmentResponse;
  onUpdateResponse: (questionId: string, answer: string | number, justification?: string) => void;
  onEditQuestion: (question: AssessmentQuestion) => void;
  onRemoveQuestion: (questionId: string) => void;
  renderInput: (question: AssessmentQuestion) => React.ReactNode;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  response,
  onUpdateResponse,
  onEditQuestion,
  onRemoveQuestion,
  renderInput
}) => {
  const getRiskColor = (risk?: RiskLevel) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950/20 dark:border-green-800';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-950/20 dark:border-yellow-800';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-950/20 dark:border-orange-800';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950/20 dark:border-red-800';
      default: return 'text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-950/20 dark:border-gray-800';
    }
  };

  return (
    <Card className={`transition-all duration-200 ${
      response?.answer !== undefined
        ? 'border-green-300 bg-green-50/30 dark:border-green-800 dark:bg-green-950/20'
        : question.required
        ? 'border-orange-300 bg-orange-50/30 dark:border-orange-800 dark:bg-orange-950/20'
        : 'border-gray-300 dark:border-gray-700'
    }`}>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-medium text-foreground">{question.question}</h4>
                {question.required && (
                  <Badge variant="destructive" className="text-xs">Obrigatória</Badge>
                )}
                {question.risk_impact && (
                  <Badge variant="outline" className={`text-xs ${getRiskColor(question.risk_impact)}`}>
                    {question.risk_impact}
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  Peso: {question.weight}
                </Badge>
              </div>
              
              {question.subcategory && (
                <p className="text-xs text-muted-foreground mb-1">
                  {question.subcategory} • {question.compliance_mapping}
                </p>
              )}
              
              {question.description && (
                <p className="text-sm text-muted-foreground">{question.description}</p>
              )}
            </div>
            
            <div className="flex gap-1 ml-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEditQuestion(question)}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-3 w-3" />
              </Button>
              {question.id.startsWith('custom_') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveQuestion(question.id)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Resposta:</Label>
              {renderInput(question)}
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Justificativa/Evidência (opcional)
              </Label>
              <Textarea
                placeholder="Adicione justificativas, evidências ou observações..."
                value={response?.justification || ''}
                onChange={(e) => onUpdateResponse(question.id, response?.answer || '', e.target.value)}
                className="text-sm min-h-[60px]"
                rows={2}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};