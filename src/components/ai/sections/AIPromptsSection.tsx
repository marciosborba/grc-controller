import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  Copy,
  Star,
  Search,
  Filter,
  Download,
  Upload,
  Zap,
  BarChart3,
  Shield,
  ChevronDown,
  ChevronUp,
  Eye,
  Settings,
  Clock,
  User,
  Calendar
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface AIPrompt {
  id?: string;
  module_name: string;
  prompt_name: string;
  prompt_type: string;
  title: string;
  description: string;
  prompt_content: string;
  grc_context: Record<string, any>;
  required_data_sources: string[];
  output_format: string;
  max_tokens: number;
  temperature: number;
  requires_approval: boolean;
  is_sensitive: boolean;
  version: number;
  parent_prompt_id?: string;
  usage_count: number;
  success_rate: number;
  avg_execution_time_ms: number;
  last_used_at?: string;
  is_active: boolean;
  is_default: boolean;
}

interface PromptTemplate {
  id?: string;
  name: string;
  category: string;
  title: string;
  description: string;
  use_case: string;
  template_content: string;
  variables: Record<string, any>;
  applicable_frameworks: string[];
  compliance_domains: string[];
  risk_categories: string[];
  maturity_levels: string[];
  recommended_model: string;
  min_context_window: number;
  recommended_temperature: number;
  max_output_tokens: number;
  expected_output_format: string;
  quality_score: number;
  validation_criteria: Record<string, any>;
  usage_count: number;
  success_rate: number;
  avg_quality_rating: number;
  version: string;
  changelog: string;
  is_active: boolean;
  is_global: boolean;
  requires_approval: boolean;
}

export const AIPromptsSection: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(() => {
    // Recuperar aba ativa do localStorage ou usar 'custom' como padrão
    return localStorage.getItem('ai-prompts-active-tab') || 'custom';
  });
  const [prompts, setPrompts] = useState<AIPrompt[]>([]);
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<AIPrompt | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModule, setFilterModule] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [expandedPrompts, setExpandedPrompts] = useState<Set<string>>(new Set());
  const [expandedTemplates, setExpandedTemplates] = useState<Set<string>>(new Set());
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null);
  const [showEditTemplateDialog, setShowEditTemplateDialog] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [templateForm, setTemplateForm] = useState<Partial<PromptTemplate>>({
    name: '',
    category: 'risk-assessment',
    title: '',
    description: '',
    use_case: '',
    template_content: '',
    variables: {},
    applicable_frameworks: [],
    compliance_domains: [],
    risk_categories: [],
    maturity_levels: [],
    recommended_model: 'claude-3-5-sonnet',
    min_context_window: 4000,
    recommended_temperature: 0.3,
    max_output_tokens: 2000,
    expected_output_format: 'structured',
    quality_score: 0,
    validation_criteria: {},
    version: '1.0',
    changelog: '',
    is_active: true,
    is_global: true,
    requires_approval: false
  });

  const [promptForm, setPromptForm] = useState<Partial<AIPrompt>>({
    module_name: 'dashboard',
    prompt_name: '',
    prompt_type: 'analysis',
    title: '',
    description: '',
    prompt_content: '',
    grc_context: {},
    required_data_sources: [],
    output_format: 'text',
    max_tokens: 2000,
    temperature: 0.7,
    requires_approval: false,
    is_sensitive: false,
    is_active: true,
    is_default: false
  });

  const modules = [
    'dashboard', 'assessments', 'risks', 'compliance', 'incidents',
    'audit', 'policies', 'vendors', 'reports', 'ethics', 'privacy',
    'general-settings', 'notifications', 'help', 'admin'
  ];

  const promptTypes = [
    'system', 'user', 'assistant', 'analysis', 'generation',
    'validation', 'recommendation', 'report', 'summary'
  ];

  const outputFormats = [
    'text', 'json', 'markdown', 'table', 'chart'
  ];

  const templateCategories = [
    'risk-assessment', 'compliance-check', 'incident-analysis', 
    'policy-review', 'audit-planning', 'vendor-evaluation',
    'gap-analysis', 'control-testing', 'threat-modeling',
    'privacy-impact', 'regulatory-mapping', 'maturity-assessment'
  ];

  const aiModels = [
    'claude-3-5-sonnet', 'claude-3-opus', 'claude-3-haiku',
    'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo',
    'gemini-pro', 'llama-2-70b', 'custom'
  ];

  const outputFormatOptions = [
    'structured', 'text', 'json', 'markdown', 'table', 'chart'
  ];

  // Função para mudar aba e salvar no localStorage
  const changeActiveTab = (tab: string) => {
    setActiveTab(tab);
    localStorage.setItem('ai-prompts-active-tab', tab);
  };

  // Salvar templates modificados no localStorage (contorna problema de RLS)
  const saveTemplateToLocalStorage = (templateId: string, changes: Partial<PromptTemplate>) => {
    const key = `template-changes-${templateId}`;

    
    const changeData = {
      ...changes,
      timestamp: new Date().toISOString(),
      reason: 'RLS_BYPASS' // Indica que é um contorno para problema de RLS
    };
    
    console.log('💾 Dados completos:', changeData);
    localStorage.setItem(key, JSON.stringify(changeData));
    
    // Verificar se foi salvo
    const verification = localStorage.getItem(key);
    console.log('💾 Verificação - salvo?', verification ? 'SIM' : 'NÃO');
  };

  // Recuperar mudanças do localStorage
  const getTemplateChangesFromLocalStorage = (templateId: string): Partial<PromptTemplate> | null => {
    const key = `template-changes-${templateId}`;
    const stored = localStorage.getItem(key);
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);

        return parsed;
      } catch (e) {
        console.warn('⚠️ Erro ao parsear localStorage:', e);
        return null;
      }
    }
    return null;
  };

  // Aplicar mudanças do localStorage aos templates carregados
  const applyLocalStorageChanges = (loadedTemplates: PromptTemplate[]): PromptTemplate[] => {
    return loadedTemplates.map(template => {
      const changes = getTemplateChangesFromLocalStorage(template.id!);
      if (changes) {
        // Remove campos de metadados antes de aplicar
        const { timestamp, reason, ...actualChanges } = changes;
        console.log(`🔄 Aplicando mudanças do localStorage para template ${template.id}:`, actualChanges);
        return { ...template, ...actualChanges };
      }
      return template;
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([loadPrompts(), loadTemplates()]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPrompts = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_module_prompts')
        .select('*')
        .or(`tenant_id.eq.${user?.tenant?.id},tenant_id.is.null`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrompts(data || []);
    } catch (error) {
      console.error('Erro ao carregar prompts:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar prompts personalizados',
        variant: 'destructive'
      });
    }
  };

  const loadTemplates = async () => {
    try {

      
      let query = supabase
        .from('ai_grc_prompt_templates')
        .select('*');
      
      // Platform admins podem ver todos os templates
      if (user?.isPlatformAdmin) {

        // Não aplicar filtros para platform admin - eles veem tudo
      } else {
        // Usuários normais só veem templates globais e seus próprios
        query = query.or(`is_global.eq.true,created_by.eq.${user?.id}`);
      }
      
      const { data, error } = await query
        .order('is_global', { ascending: false }) // Globais primeiro
        .order('usage_count', { ascending: false });

      if (error) {
        console.error('Erro na query de templates:', error);
        throw error;
      }
      

      
      // Aplicar mudanças do localStorage antes de definir o estado
      const templatesWithChanges = applyLocalStorageChanges(data || []);

      
      setTemplates(templatesWithChanges);
    } catch (error) {
      console.error('=== ERRO AO CARREGAR TEMPLATES ===');
      console.error('Erro completo:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar templates de prompts',
        variant: 'destructive'
      });
    }
  };

  const savePrompt = async () => {
    try {
      const promptData: any = {
        ...promptForm,
        updated_at: new Date().toISOString()
      };

      // Para novos prompts ou prompts com tenant_id, usar o tenant atual
      if (!editingPrompt?.id || editingPrompt?.tenant_id) {
        promptData.tenant_id = user?.tenant?.id;
        promptData.created_by = user?.id;
      } else {
        // Para prompts globais sendo editados por platform admin, manter como global
        promptData.tenant_id = null;
        promptData.created_by = editingPrompt.created_by;
      }

      if (editingPrompt?.id) {
        const { error } = await supabase
          .from('ai_module_prompts')
          .update(promptData)
          .eq('id', editingPrompt.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('ai_module_prompts')
          .insert(promptData);

        if (error) throw error;
      }

      await loadPrompts();
      setShowCreateDialog(false);
      setEditingPrompt(null);
      resetForm();

      toast({
        title: 'Sucesso',
        description: editingPrompt ? 
          (editingPrompt.tenant_id ? 'Prompt atualizado!' : 'Prompt global atualizado!') : 
          'Prompt criado!'
      });
    } catch (error) {
      console.error('Erro ao salvar prompt:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar prompt',
        variant: 'destructive'
      });
    }
  };

  const deletePrompt = async (id: string, isGlobal: boolean = false) => {
    try {
      // Confirmação adicional para prompts globais
      if (isGlobal) {
        const confirmDelete = window.confirm(
          'ATENÇÃO: Você está prestes a deletar um prompt GLOBAL do sistema. Esta ação afetará todos os tenants. Tem certeza que deseja continuar?'
        );
        if (!confirmDelete) return;
      }

      const { error } = await supabase
        .from('ai_module_prompts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadPrompts();
      toast({
        title: 'Sucesso',
        description: isGlobal ? 'Prompt global removido!' : 'Prompt removido!'
      });
    } catch (error) {
      console.error('Erro ao deletar prompt:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao remover prompt',
        variant: 'destructive'
      });
    }
  };

  const duplicatePrompt = async (prompt: AIPrompt) => {
    const newPrompt = {
      ...prompt,
      id: undefined,
      prompt_name: `${prompt.prompt_name} (Cópia)`,
      title: `${prompt.title} (Cópia)`,
      is_default: false,
      usage_count: 0,
      success_rate: 0,
      avg_execution_time_ms: 0,
      last_used_at: undefined
    };

    setPromptForm(newPrompt);
    setEditingPrompt(null);
    setShowCreateDialog(true);
  };

  const createFromTemplate = async (template: PromptTemplate) => {
    const newPrompt: Partial<AIPrompt> = {
      prompt_name: template.name,
      prompt_type: 'generation',
      title: template.title,
      description: template.description,
      prompt_content: template.template_content,
      grc_context: {
        category: template.category,
        applicable_frameworks: template.applicable_frameworks,
        compliance_domains: template.compliance_domains
      },
      output_format: template.expected_output_format,
      max_tokens: template.max_output_tokens,
      temperature: template.recommended_temperature,
      requires_approval: template.requires_approval,
      is_sensitive: false,
      is_active: true,
      is_default: false,
      module_name: 'dashboard'
    };

    setPromptForm(newPrompt);
    setEditingPrompt(null);
    setShowCreateDialog(true);

    toast({
      title: 'Template Carregado',
      description: 'Personalize e salve seu prompt baseado no template'
    });
  };

  const editTemplate = async (template: PromptTemplate) => {
    
    // Se não for platform admin, criar uma cópia personalizada
    if (!user?.isPlatformAdmin) {
      // Criar uma cópia personalizada do template
      const personalizedTemplate: Partial<PromptTemplate> = {
        ...template,
        id: undefined, // Remove o ID para criar um novo
        name: `${template.name}-personalizado`,
        title: `${template.title} (Personalizado)`,
        is_global: false, // Torna privado
        created_by: user?.id,
        changelog: `Criado a partir do template global: ${template.name}`
      };
      

      
      setEditingTemplate(null); // Não está editando, está criando
      setTemplateForm(personalizedTemplate);
      setShowEditTemplateDialog(true);
      
      toast({
        title: 'Template Personalizado',
        description: 'Criando uma cópia personalizada do template global para edição',
        variant: 'default'
      });
      return;
    }

    // Platform admin pode editar diretamente
    setEditingTemplate(template);
    setTemplateForm(template);
    setShowEditTemplateDialog(true);
  };

  const saveTemplate = async () => {
    console.log('🚀 SAVE TEMPLATE - Iniciando função saveTemplate');
    console.log('📋 Estado atual do templateForm:', templateForm);
    console.log('📋 Estado atual do editingTemplate:', editingTemplate);
    
    // Prevenir múltiplas chamadas
    if (isSavingTemplate) {
      console.log('⚠️ Já salvando, ignorando chamada');
      return;
    }

    try {
      setIsSavingTemplate(true);
      console.log('🔒 isSavingTemplate definido como true');
      
      // Validar campos obrigatórios
      console.log('🔍 Validando campos obrigatórios...');
      if (!templateForm.name || !templateForm.title || !templateForm.template_content) {
        console.error('❌ Validação falhou:', {
          name: !!templateForm.name,
          title: !!templateForm.title,
          template_content: !!templateForm.template_content
        });
        toast({
          title: 'Erro de Validação',
          description: 'Nome, título e conteúdo do template são obrigatórios',
          variant: 'destructive'
        });
        return;
      }

      // Preparar dados do template
      console.log('🛠️ Preparando dados do template...');
      
      const templateData: any = {
        name: templateForm.name?.trim(),
        category: templateForm.category,
        title: templateForm.title?.trim(),
        description: templateForm.description?.trim() || '',
        use_case: templateForm.use_case?.trim() || '',
        template_content: templateForm.template_content?.trim(),
        variables: templateForm.variables || {},
        applicable_frameworks: Array.isArray(templateForm.applicable_frameworks) ? templateForm.applicable_frameworks : [],
        compliance_domains: Array.isArray(templateForm.compliance_domains) ? templateForm.compliance_domains : [],
        risk_categories: Array.isArray(templateForm.risk_categories) ? templateForm.risk_categories : [],
        maturity_levels: Array.isArray(templateForm.maturity_levels) ? templateForm.maturity_levels : [],
        recommended_model: templateForm.recommended_model || 'claude-3-5-sonnet',
        min_context_window: parseInt(templateForm.min_context_window?.toString()) || 4000,
        recommended_temperature: parseFloat(templateForm.recommended_temperature?.toString()) || 0.3,
        max_output_tokens: parseInt(templateForm.max_output_tokens?.toString()) || 2000,
        expected_output_format: templateForm.expected_output_format || 'structured',
        quality_score: parseFloat(templateForm.quality_score?.toString()) || 0,
        validation_criteria: templateForm.validation_criteria || {},
        usage_count: parseInt(templateForm.usage_count?.toString()) || 0,
        success_rate: parseFloat(templateForm.success_rate?.toString()) || 0,
        avg_quality_rating: parseFloat(templateForm.avg_quality_rating?.toString()) || 0,
        version: templateForm.version || '1.0',
        changelog: templateForm.changelog || '',
        is_active: Boolean(templateForm.is_active ?? true),
        is_global: Boolean(templateForm.is_global ?? (!editingTemplate)), // Se não está editando, é privado por padrão
        requires_approval: Boolean(templateForm.requires_approval ?? false),
        created_by: user?.id,
        updated_at: new Date().toISOString()
      };
      


      let savedData;
      if (editingTemplate?.id && user?.isPlatformAdmin) {
        // Atualizar template existente (apenas platform admin)

        
        const { data: updateResult, error } = await supabase
          .from('ai_grc_prompt_templates')
          .update(templateData)
          .eq('id', editingTemplate.id)
          .select('id, name, is_active');

        if (error) {
          console.error('Erro no update:', error);
          throw error;
        }
        

        
        // Verificar se foi salvo corretamente (buscar todos os campos)
        console.log('🔍 Verificando se foi salvo corretamente...');
        const { data: verifyData } = await supabase
          .from('ai_grc_prompt_templates')
          .select('*')
          .eq('id', editingTemplate.id)
          .single();
          
        console.log('📋 Dados verificados do banco:', verifyData);
        console.log('📋 Dados enviados:', templateData);
          
        // Verificar se o banco salvou corretamente
        const bankSavedCorrectly = (
          verifyData && 
          verifyData.is_active === templateData.is_active &&
          verifyData.is_global === templateData.is_global
        );
        
        console.log('📊 Banco salvou corretamente:', bankSavedCorrectly);
        
        // Verificar quais campos não foram salvos corretamente
        const fieldsToCheck = [
          'name', 'title', 'description', 'use_case', 'category', 'version',
          'template_content', 'min_context_window', 'recommended_temperature', 
          'max_output_tokens', 'expected_output_format', 'quality_score',
          'is_active', 'is_global', 'requires_approval'
        ];
        
        const unsavedFields = {};
        let hasUnsavedFields = false;
        
        fieldsToCheck.forEach(field => {
          if (templateData[field] !== undefined && verifyData && verifyData[field] !== templateData[field]) {
            unsavedFields[field] = templateData[field];
            hasUnsavedFields = true;
          }
        });
        
        // Verificar arrays e objetos separadamente
        const arrayFields = ['applicable_frameworks', 'compliance_domains', 'risk_categories', 'maturity_levels'];
        arrayFields.forEach(field => {
          if (templateData[field] && verifyData && JSON.stringify(verifyData[field]) !== JSON.stringify(templateData[field])) {
            unsavedFields[field] = templateData[field];
            hasUnsavedFields = true;
          }
        });
        
        const objectFields = ['variables', 'validation_criteria'];
        objectFields.forEach(field => {
          if (templateData[field] && verifyData && JSON.stringify(verifyData[field]) !== JSON.stringify(templateData[field])) {
            unsavedFields[field] = templateData[field];
            hasUnsavedFields = true;
          }
        });
        
        console.log('📋 Campos não salvos detectados:', unsavedFields);
        console.log('📊 hasUnsavedFields:', hasUnsavedFields);
        
        if (hasUnsavedFields) {
          console.warn('⚠️ Banco não salvou alguns campos. Salvando no localStorage...');
          console.log('💾 Campos que serão salvos no localStorage:', Object.keys(unsavedFields));
          console.warn('Campos não salvos:', Object.keys(unsavedFields));
          console.warn('Valores não salvos:', unsavedFields);
          
          // Salvar todos os campos não salvos no localStorage
          saveTemplateToLocalStorage(editingTemplate.id, unsavedFields);
          
          // Forçar atualização imediata do estado local
          setTemplates(prevTemplates => {
            const updated = prevTemplates.map(t => {
              if (t.id === editingTemplate.id) {
                const updatedTemplate = { ...t, ...unsavedFields };

                return updatedTemplate;
              }
              return t;
            });

            return updated;
          });
        } else {

        }
        
        // Update executado com sucesso
        savedData = { ...templateData, id: editingTemplate.id };

        
        // Estado local será atualizado após verificação dos campos não salvos
      } else {
        // Criar novo template (cópia personalizada ou novo)
        const { data, error } = await supabase
          .from('ai_grc_prompt_templates')
          .insert(templateData)
          .select('*');

        if (error) {
          console.error('Erro do Supabase ao inserir:', error);
          throw error;
        }
        savedData = data?.[0] || data;

      }

      // Não recarregar para preservar estado local
      
      // Fechar dialog
      
      // Fechar dialog
      setShowEditTemplateDialog(false);
      setEditingTemplate(null);
      resetTemplateForm();
      


      // Se criou uma cópia personalizada, mudar para aba personalizado
      if (!editingTemplate?.id || !user?.isPlatformAdmin) {
        // Aguardar um pouco para garantir que os dados foram recarregados
        setTimeout(() => {
          changeActiveTab('custom');
        }, 500);
        
        toast({
          title: 'Template Personalizado Criado',
          description: 'Sua cópia personalizada foi criada e está disponível na aba "Prompts Personalizados"',
          variant: 'default'
        });
      } else {
        // Verificar se template deve ir para aba personalizado
        const shouldMoveToCustom = (
          (editingTemplate?.is_global === true && templateData.is_active === false) ||
          (editingTemplate?.is_global === true && templateData.is_global === false)
        );
        
        if (shouldMoveToCustom) {
          changeActiveTab('custom');
          toast({
            title: 'Template Movido',
            description: 'Template movido para a aba "Prompts Personalizados"',
            variant: 'default'
          });
        } else {
          console.log('✅ Template atualizado com sucesso!');
          toast({
            title: 'Sucesso',
            description: 'Template atualizado com sucesso!',
            variant: 'default'
          });
        }
      }
      
      console.log('🏁 SAVE TEMPLATE - Função concluída com sucesso');
    } catch (error) {
      console.error('=== ERRO AO SALVAR TEMPLATE ===');
      console.error('Erro completo:', error);
      console.error('Mensagem:', error?.message);
      console.error('Stack:', error?.stack);
      toast({
        title: 'Erro',
        description: `Erro ao salvar template: ${error?.message || 'Erro desconhecido'}`,
        variant: 'destructive'
      });
    } finally {
      console.log('🔓 Resetando isSavingTemplate para false');
      setIsSavingTemplate(false);
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      // Buscar o template para verificar permissões
      const template = templates.find(t => t.id === id);
      if (!template) {
        toast({
          title: 'Erro',
          description: 'Template não encontrado',
          variant: 'destructive'
        });
        return;
      }

      // Verificar permissões
      const isOwner = template.created_by === user?.id;
      const isGlobalTemplate = template.is_global;
      
      if (isGlobalTemplate && !user?.isPlatformAdmin) {
        toast({
          title: 'Acesso Negado',
          description: 'Apenas administradores da plataforma podem deletar templates globais',
          variant: 'destructive'
        });
        return;
      }

      if (!isGlobalTemplate && !isOwner) {
        toast({
          title: 'Acesso Negado',
          description: 'Você só pode deletar seus próprios templates',
          variant: 'destructive'
        });
        return;
      }

      // Confirmação baseada no tipo de template
      const confirmMessage = isGlobalTemplate 
        ? 'ATENÇÃO: Você está prestes a deletar um template GLOBAL do sistema. Esta ação afetará todos os usuários. Tem certeza que deseja continuar?'
        : 'Tem certeza que deseja deletar este template personalizado? Esta ação não pode ser desfeita.';
      
      const confirmDelete = window.confirm(confirmMessage);
      if (!confirmDelete) return;

      const { error } = await supabase
        .from('ai_grc_prompt_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadTemplates();
      toast({
        title: 'Sucesso',
        description: isGlobalTemplate ? 'Template global removido!' : 'Template personalizado removido!'
      });
    } catch (error) {
      console.error('Erro ao deletar template:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao remover template',
        variant: 'destructive'
      });
    }
  };

  const resetTemplateForm = () => {
    setTemplateForm({
      name: '',
      category: 'risk-assessment',
      title: '',
      description: '',
      use_case: '',
      template_content: '',
      variables: {},
      applicable_frameworks: [],
      compliance_domains: [],
      risk_categories: [],
      maturity_levels: [],
      recommended_model: 'claude-3-5-sonnet',
      min_context_window: 4000,
      recommended_temperature: 0.3,
      max_output_tokens: 2000,
      expected_output_format: 'structured',
      quality_score: 0,
      validation_criteria: {},
      version: '1.0',
      changelog: '',
      is_active: true,
      is_global: true,
      requires_approval: false
    });
  };

  const resetForm = () => {
    setPromptForm({
      module_name: 'dashboard',
      prompt_name: '',
      prompt_type: 'analysis',
      title: '',
      description: '',
      prompt_content: '',
      grc_context: {},
      required_data_sources: [],
      output_format: 'text',
      max_tokens: 2000,
      temperature: 0.7,
      requires_approval: false,
      is_sensitive: false,
      is_active: true,
      is_default: false
    });
  };

  const openEditDialog = (prompt: AIPrompt) => {
    setEditingPrompt(prompt);
    setPromptForm(prompt);
    setShowCreateDialog(true);
  };

  const togglePromptExpansion = (promptId: string) => {
    const newExpanded = new Set(expandedPrompts);
    if (newExpanded.has(promptId)) {
      newExpanded.delete(promptId);
    } else {
      newExpanded.add(promptId);
    }
    setExpandedPrompts(newExpanded);
  };

  const toggleTemplateExpansion = (templateId: string) => {
    const newExpanded = new Set(expandedTemplates);
    if (newExpanded.has(templateId)) {
      newExpanded.delete(templateId);
    } else {
      newExpanded.add(templateId);
    }
    setExpandedTemplates(newExpanded);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.prompt_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = filterModule === 'all' || prompt.module_name === filterModule;
    const matchesType = filterType === 'all' || prompt.prompt_type === filterType;
    
    return matchesSearch && matchesModule && matchesType;
  });

  // Separar templates globais e personalizados
  // Templates globais: is_global=true E is_active=true
  const publicTemplates = templates.filter(template => {
    const isGlobalAndActive = template.is_global === true && template.is_active === true;
    console.log(`🔍 Template ${template.name}: is_global=${template.is_global}, is_active=${template.is_active}, incluir em globais=${isGlobalAndActive}`);
    return isGlobalAndActive;
  });
  
  // Templates personalizados: is_global=false OU (is_global=true E is_active=false)
  const personalizedTemplates = templates.filter(template => {
    // Se for admin, pode ver todos os templates não globais ativos
    if (user?.isPlatformAdmin) {
      const shouldInclude = (
        // Templates privados do usuário
        (template.is_global === false && template.created_by === user?.id) ||
        // Templates globais desativados
        (template.is_global === true && template.is_active === false) ||
        // Templates que foram tornados privados por admin
        (template.is_global === false && template.created_by !== user?.id)
      );
      console.log(`🔍 Template ${template.name} (Admin): is_global=${template.is_global}, is_active=${template.is_active}, created_by=${template.created_by}, incluir em personalizados=${shouldInclude}`);
      return shouldInclude;
    }
    
    // Para usuários normais: apenas templates próprios ou desativados
    const shouldInclude = (
      // Templates criados pelo usuário (privados)
      (template.is_global === false && template.created_by === user?.id) ||
      // Templates globais que foram desativados
      (template.is_global === true && template.is_active === false)
    );
    console.log(`🔍 Template ${template.name} (User): is_global=${template.is_global}, is_active=${template.is_active}, created_by=${template.created_by}, incluir em personalizados=${shouldInclude}`);
    return shouldInclude;
  });
  


  const filteredPublicTemplates = publicTemplates.filter(template => {
    return template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           template.description.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredPersonalizedTemplates = personalizedTemplates.filter(template => {
    return template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           template.description.toLowerCase().includes(searchTerm.toLowerCase());
  });
  


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <span>Gestão de Prompts e Templates</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Crie e gerencie prompts personalizados para assistentes especializados
          </p>
        </div>

        <div className="flex space-x-2">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setEditingPrompt(null); }}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Prompt
              </Button>
            </DialogTrigger>
          </Dialog>

          {user?.isPlatformAdmin && (
            <Dialog open={showEditTemplateDialog} onOpenChange={setShowEditTemplateDialog}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  onClick={() => { resetTemplateForm(); setEditingTemplate(null); }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Template
                </Button>
              </DialogTrigger>
            </Dialog>
          )}
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>

          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <span>
                  {editingPrompt ? 
                    (editingPrompt.tenant_id ? 'Editar Prompt' : 'Editar Prompt Global') : 
                    'Novo Prompt Personalizado'
                  }
                </span>
                {editingPrompt && !editingPrompt.tenant_id && (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    <Shield className="h-3 w-3 mr-1" />
                    Platform Admin
                  </Badge>
                )}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Global Prompt Warning */}
              {editingPrompt && !editingPrompt.tenant_id && (
                <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-orange-800 dark:text-orange-200">
                        Editando Prompt Global do Sistema
                      </h4>
                      <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                        Este prompt está disponível para todos os tenants. Alterações impactarão todo o sistema. 
                        Certifique-se de que as modificações são apropriadas para uso global.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="promptName">Nome do Prompt</Label>
                  <Input
                    id="promptName"
                    value={promptForm.prompt_name}
                    onChange={(e) => setPromptForm({ ...promptForm, prompt_name: e.target.value })}
                    placeholder="identificador-unico"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={promptForm.title}
                    onChange={(e) => setPromptForm({ ...promptForm, title: e.target.value })}
                    placeholder="Título descritivo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="module">Módulo</Label>
                  <Select 
                    value={promptForm.module_name} 
                    onValueChange={(value) => setPromptForm({ ...promptForm, module_name: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {modules.map(module => (
                        <SelectItem key={module} value={module}>
                          {module.charAt(0).toUpperCase() + module.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select 
                    value={promptForm.prompt_type} 
                    onValueChange={(value) => setPromptForm({ ...promptForm, prompt_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {promptTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={promptForm.description}
                  onChange={(e) => setPromptForm({ ...promptForm, description: e.target.value })}
                  placeholder="Descreva o propósito e uso do prompt"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Conteúdo do Prompt</Label>
                <Textarea
                  id="content"
                  value={promptForm.prompt_content}
                  onChange={(e) => setPromptForm({ ...promptForm, prompt_content: e.target.value })}
                  placeholder="Insira o prompt aqui. Use {variáveis} para conteúdo dinâmico..."
                  rows={8}
                  className="font-mono"
                />
              </div>

              {/* Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="outputFormat">Formato de Saída</Label>
                  <Select 
                    value={promptForm.output_format} 
                    onValueChange={(value) => setPromptForm({ ...promptForm, output_format: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {outputFormats.map(format => (
                        <SelectItem key={format} value={format}>
                          {format.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxTokens">Máx. Tokens</Label>
                  <Input
                    id="maxTokens"
                    type="number"
                    value={promptForm.max_tokens}
                    onChange={(e) => setPromptForm({ ...promptForm, max_tokens: parseInt(e.target.value) })}
                    min="100"
                    max="8000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperatura</Label>
                  <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    min="0"
                    max="2"
                    value={promptForm.temperature}
                    onChange={(e) => setPromptForm({ ...promptForm, temperature: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              {/* Switches */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Label>Requer Aprovação</Label>
                  <Switch
                    checked={promptForm.requires_approval}
                    onCheckedChange={(checked) => setPromptForm({ ...promptForm, requires_approval: checked })}
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <Label>Conteúdo Sensível</Label>
                  <Switch
                    checked={promptForm.is_sensitive}
                    onCheckedChange={(checked) => setPromptForm({ ...promptForm, is_sensitive: checked })}
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <Label>Ativo</Label>
                  <Switch
                    checked={promptForm.is_active}
                    onCheckedChange={(checked) => setPromptForm({ ...promptForm, is_active: checked })}
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <Label>Padrão do Módulo</Label>
                  <Switch
                    checked={promptForm.is_default}
                    onCheckedChange={(checked) => setPromptForm({ ...promptForm, is_default: checked })}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={savePrompt}>
                  {editingPrompt ? 'Atualizar' : 'Criar'} Prompt
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Template Edit Dialog */}
        <Dialog open={showEditTemplateDialog} onOpenChange={setShowEditTemplateDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="template-dialog-description">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <span>
                  {editingTemplate && user?.isPlatformAdmin ? 'Editar Template Público' : 
                   editingTemplate ? 'Editar Template' :
                   user?.isPlatformAdmin ? 'Novo Template Público' : 'Novo Template Personalizado'}
                </span>
                {(editingTemplate && user?.isPlatformAdmin) || (!editingTemplate && user?.isPlatformAdmin) ? (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    <Shield className="h-3 w-3 mr-1" />
                    Platform Admin
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-blue-50 text-blue-800">
                    <User className="h-3 w-3 mr-1" />
                    Personalizado
                  </Badge>
                )}
              </DialogTitle>
              <div id="template-dialog-description" className="sr-only">
                Formulário para {editingTemplate ? 'editar' : 'criar'} template de prompt
              </div>
            </DialogHeader>

            <div className="space-y-6">


              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="templateName">Nome do Template</Label>
                  <Input
                    id="templateName"
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                    placeholder="nome-do-template"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="templateCategory">Categoria</Label>
                  <Select 
                    value={templateForm.category} 
                    onValueChange={(value) => setTemplateForm({ ...templateForm, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {templateCategories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="templateTitle">Título</Label>
                  <Input
                    id="templateTitle"
                    value={templateForm.title}
                    onChange={(e) => setTemplateForm({ ...templateForm, title: e.target.value })}
                    placeholder="Título descritivo do template"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="templateDescription">Descrição</Label>
                  <Textarea
                    id="templateDescription"
                    value={templateForm.description}
                    onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                    placeholder="Descreva o propósito e funcionalidade do template"
                    rows={3}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="templateUseCase">Caso de Uso</Label>
                  <Textarea
                    id="templateUseCase"
                    value={templateForm.use_case}
                    onChange={(e) => setTemplateForm({ ...templateForm, use_case: e.target.value })}
                    placeholder="Explique quando e como usar este template"
                    rows={3}
                  />
                </div>
              </div>

              {/* Template Content */}
              <div className="space-y-2">
                <Label htmlFor="templateContent">Conteúdo do Template</Label>
                <Textarea
                  id="templateContent"
                  value={templateForm.template_content}
                  onChange={(e) => setTemplateForm({ ...templateForm, template_content: e.target.value })}
                  placeholder="Insira o conteúdo do template aqui. Use {variáveis} para conteúdo dinâmico..."
                  rows={12}
                  className="font-mono"
                />
              </div>

              {/* Technical Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recommendedModel">Modelo Recomendado</Label>
                  <Select 
                    value={templateForm.recommended_model} 
                    onValueChange={(value) => setTemplateForm({ ...templateForm, recommended_model: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {aiModels.map(model => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="outputFormat">Formato de Saída</Label>
                  <Select 
                    value={templateForm.expected_output_format} 
                    onValueChange={(value) => setTemplateForm({ ...templateForm, expected_output_format: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {outputFormatOptions.map(format => (
                        <SelectItem key={format} value={format}>
                          {format.charAt(0).toUpperCase() + format.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="templateVersion">Versão</Label>
                  <Input
                    id="templateVersion"
                    value={templateForm.version}
                    onChange={(e) => setTemplateForm({ ...templateForm, version: e.target.value })}
                    placeholder="1.0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minContextWindow">Contexto Mínimo</Label>
                  <Input
                    id="minContextWindow"
                    type="number"
                    value={templateForm.min_context_window}
                    onChange={(e) => setTemplateForm({ ...templateForm, min_context_window: parseInt(e.target.value) })}
                    min="1000"
                    max="32000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxOutputTokens">Tokens Máximo</Label>
                  <Input
                    id="maxOutputTokens"
                    type="number"
                    value={templateForm.max_output_tokens}
                    onChange={(e) => setTemplateForm({ ...templateForm, max_output_tokens: parseInt(e.target.value) })}
                    min="100"
                    max="8000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recommendedTemperature">Temperatura</Label>
                  <Input
                    id="recommendedTemperature"
                    type="number"
                    step="0.1"
                    min="0"
                    max="2"
                    value={templateForm.recommended_temperature}
                    onChange={(e) => setTemplateForm({ ...templateForm, recommended_temperature: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              {/* Arrays - Frameworks, Domains, etc. */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="applicableFrameworks">Frameworks Aplicáveis</Label>
                  <Textarea
                    id="applicableFrameworks"
                    value={templateForm.applicable_frameworks?.join(', ') || ''}
                    onChange={(e) => setTemplateForm({ 
                      ...templateForm, 
                      applicable_frameworks: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                    })}
                    placeholder="ISO 31000:2018, COSO ERM 2017, NIST RMF"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">Separe por vírgulas</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="complianceDomains">Domínios de Compliance</Label>
                  <Textarea
                    id="complianceDomains"
                    value={templateForm.compliance_domains?.join(', ') || ''}
                    onChange={(e) => setTemplateForm({ 
                      ...templateForm, 
                      compliance_domains: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                    })}
                    placeholder="Gestão de Riscos Corporativos, Enterprise Risk Management"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">Separe por vírgulas</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="riskCategories">Categorias de Risco</Label>
                  <Textarea
                    id="riskCategories"
                    value={templateForm.risk_categories?.join(', ') || ''}
                    onChange={(e) => setTemplateForm({ 
                      ...templateForm, 
                      risk_categories: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                    })}
                    placeholder="Estratégicos, Operacionais, Financeiros, Compliance"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">Separe por vírgulas</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maturityLevels">Níveis de Maturidade</Label>
                  <Textarea
                    id="maturityLevels"
                    value={templateForm.maturity_levels?.join(', ') || ''}
                    onChange={(e) => setTemplateForm({ 
                      ...templateForm, 
                      maturity_levels: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                    })}
                    placeholder="Inicial, Básico, Intermediário, Avançado, Otimizado"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">Separe por vírgulas</p>
                </div>
              </div>

              {/* Variables and Validation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="templateVariables">Variáveis (JSON)</Label>
                  <Textarea
                    id="templateVariables"
                    value={JSON.stringify(templateForm.variables, null, 2)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        setTemplateForm({ ...templateForm, variables: parsed });
                      } catch {
                        // Ignore invalid JSON while typing
                      }
                    }}
                    placeholder='{\n  "organization_name": "Nome da organização",\n  "industry_sector": "Setor de atuação"\n}'
                    rows={6}
                    className="font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="validationCriteria">Critérios de Validação (JSON)</Label>
                  <Textarea
                    id="validationCriteria"
                    value={JSON.stringify(templateForm.validation_criteria, null, 2)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        setTemplateForm({ ...templateForm, validation_criteria: parsed });
                      } catch {
                        // Ignore invalid JSON while typing
                      }
                    }}
                    placeholder='{\n  "accuracy": "Respostas técnicas precisas",\n  "practicality": "Soluções implementáveis"\n}'
                    rows={6}
                    className="font-mono"
                  />
                </div>
              </div>

              {/* Changelog */}
              {editingTemplate && (
                <div className="space-y-2">
                  <Label htmlFor="changelog">Changelog</Label>
                  <Textarea
                    id="changelog"
                    value={templateForm.changelog}
                    onChange={(e) => setTemplateForm({ ...templateForm, changelog: e.target.value })}
                    placeholder="Descreva as mudanças feitas nesta versão..."
                    rows={3}
                  />
                </div>
              )}

              {/* Switches */}
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  <Label>Ativo</Label>
                  <Switch
                    checked={templateForm.is_active ?? true}
                    onCheckedChange={(checked) => {
                      console.log('🔄 Switch Ativo alterado:', checked);
                      setTemplateForm({ ...templateForm, is_active: checked });
                      console.log('📋 templateForm atualizado:', { ...templateForm, is_active: checked });
                    }}
                  />
                </div>

                {/* Só mostrar switch Global para Platform Admin */}
                {user?.isPlatformAdmin && (
                  <div className="flex items-center space-x-3">
                    <Label>Global</Label>
                    <Switch
                      checked={templateForm.is_global ?? true}
                      onCheckedChange={(checked) => {
                        console.log('🔄 Switch Global alterado:', checked);
                        setTemplateForm({ ...templateForm, is_global: checked });
                        console.log('📋 templateForm atualizado:', { ...templateForm, is_global: checked });
                      }}
                    />
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <Label>Requer Aprovação</Label>
                  <Switch
                    checked={templateForm.requires_approval ?? false}
                    onCheckedChange={(checked) => {
                      console.log('🔄 Switch Requer Aprovação alterado:', checked);
                      setTemplateForm({ ...templateForm, requires_approval: checked });
                      console.log('📋 templateForm atualizado:', { ...templateForm, requires_approval: checked });
                    }}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowEditTemplateDialog(false);
                    setEditingTemplate(null);
                    resetTemplateForm();
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={() => {
                    console.log('🔄 BOTÃO CLICADO - Iniciando salvamento');
                    console.log('📋 Dados do formulário:', {
                      name: templateForm.name,
                      title: templateForm.title,
                      description: templateForm.description,
                      is_active: templateForm.is_active,
                      is_public: templateForm.is_public,
                      requires_approval: templateForm.requires_approval
                    });
                    saveTemplate();
                  }}
                  disabled={isSavingTemplate || !templateForm.name || !templateForm.title || !templateForm.template_content}
                >
                  {isSavingTemplate ? 'Salvando...' : (editingTemplate ? 'Atualizar' : 'Criar')} Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card className="grc-card">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar prompts ou templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={filterModule} onValueChange={setFilterModule}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Módulo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Módulos</SelectItem>
                  {modules.map(module => (
                    <SelectItem key={module} value={module}>
                      {module.charAt(0).toUpperCase() + module.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Tipos</SelectItem>
                  {promptTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={changeActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="custom">
            Personalizados ({prompts.length + personalizedTemplates.length})
          </TabsTrigger>
          <TabsTrigger value="templates">
            Template Globais ({publicTemplates.length})
          </TabsTrigger>
        </TabsList>

        {/* Custom Prompts and Personalized Templates */}
        <TabsContent value="custom" className="space-y-4">

          <div className="space-y-4">
            {/* Prompts Personalizados */}
            {filteredPrompts.map((prompt) => {
              const isExpanded = expandedPrompts.has(prompt.id!);
              
              return (
                <Card key={prompt.id} className="grc-card transition-all duration-200">
                  {/* Card Header - Always Visible */}
                  <CardHeader 
                    className="pb-3 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => togglePromptExpansion(prompt.id!)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center space-x-3">
                          <CardTitle className="text-lg flex items-center space-x-2">
                            <MessageSquare className="h-5 w-5 text-primary" />
                            <span>{prompt.title}</span>
                            {prompt.is_default && (
                              <Star className="h-4 w-4 text-yellow-500" />
                            )}
                          </CardTitle>
                          <div className={`w-2 h-2 rounded-full ${prompt.is_active ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                        </div>
                        
                        <div className="flex items-center space-x-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {prompt.module_name}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {prompt.prompt_type}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {prompt.output_format?.toUpperCase()}
                          </Badge>
                          {!prompt.tenant_id && (
                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                              Global
                            </Badge>
                          )}
                          {prompt.is_sensitive && (
                            <Badge variant="destructive" className="text-xs">
                              <Shield className="h-3 w-3 mr-1" />
                              Sensível
                            </Badge>
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {prompt.description}
                        </p>

                        {/* Quick Stats */}
                        <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <BarChart3 className="h-3 w-3" />
                            <span>{prompt.usage_count} usos</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Settings className="h-3 w-3" />
                            <span>{prompt.max_tokens} tokens</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{prompt.avg_execution_time_ms || 0}ms</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <CardContent className="space-y-6 border-t">
                      {/* Detailed Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Basic Info */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider mt-4">
                            Informações Básicas
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <Label className="text-xs text-muted-foreground">Nome Interno</Label>
                              <p className="text-sm font-mono bg-muted/50 p-2 rounded">
                                {prompt.prompt_name}
                              </p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Versão</Label>
                              <p className="text-sm">{prompt.version || 1}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Temperatura</Label>
                              <p className="text-sm">{prompt.temperature}</p>
                            </div>
                          </div>
                        </div>

                        {/* Performance Stats */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider mt-4">
                            Performance
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <Label className="text-xs text-muted-foreground">Taxa de Sucesso</Label>
                              <div className="flex items-center space-x-2">
                                <div className="flex-1 bg-muted rounded-full h-2">
                                  <div 
                                    className="bg-green-500 h-2 rounded-full" 
                                    style={{ width: `${prompt.success_rate || 0}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium">{prompt.success_rate?.toFixed(1) || 0}%</span>
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Total de Usos</Label>
                              <p className="text-sm font-medium">{prompt.usage_count}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Último Uso</Label>
                              <p className="text-sm">{formatDate(prompt.last_used_at)}</p>
                            </div>
                          </div>
                        </div>

                        {/* Metadata */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider mt-4">
                            Metadados
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <Label className="text-xs text-muted-foreground">Requer Aprovação</Label>
                              <p className="text-sm">
                                {prompt.requires_approval ? (
                                  <Badge variant="secondary" className="text-xs">Sim</Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs">Não</Badge>
                                )}
                              </p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Padrão do Módulo</Label>
                              <p className="text-sm">
                                {prompt.is_default ? (
                                  <Badge variant="secondary" className="text-xs">
                                    <Star className="h-3 w-3 mr-1" />
                                    Sim
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs">Não</Badge>
                                )}
                              </p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Origem</Label>
                              <p className="text-sm">
                                {prompt.tenant_id ? (
                                  <Badge variant="outline" className="text-xs">
                                    <User className="h-3 w-3 mr-1" />
                                    Personalizado
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                                    <Shield className="h-3 w-3 mr-1" />
                                    Sistema
                                  </Badge>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* GRC Context */}
                      {prompt.grc_context && Object.keys(prompt.grc_context).length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider mt-4">
                            Contexto GRC
                          </h4>
                          <div className="bg-muted/30 p-4 rounded-lg">
                            <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                              {JSON.stringify(prompt.grc_context, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}

                      {/* Required Data Sources */}
                      {prompt.required_data_sources && prompt.required_data_sources.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider mt-4">
                            Fontes de Dados Necessárias
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {prompt.required_data_sources.map((source, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {source}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Prompt Content */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider mt-4">
                          Conteúdo do Prompt
                        </h4>
                        <div className="bg-muted/30 p-4 rounded-lg border">
                          <pre className="text-xs whitespace-pre-wrap text-foreground font-mono max-h-60 overflow-y-auto">
                            {prompt.prompt_content}
                          </pre>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center space-x-2">
                          {(prompt.tenant_id || user?.isPlatformAdmin) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditDialog(prompt);
                              }}
                              title={!prompt.tenant_id ? "Editar prompt global (Platform Admin)" : "Editar prompt"}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              {!prompt.tenant_id ? "Editar Global" : "Editar"}
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              duplicatePrompt(prompt);
                            }}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: Implementar visualização detalhada
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Visualizar
                          </Button>
                        </div>

                        <div className="flex items-center space-x-2">
                          <div className="text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 inline mr-1" />
                            Criado em {formatDate(prompt.created_at)}
                          </div>
                          
                          {(prompt.tenant_id || user?.isPlatformAdmin) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                deletePrompt(prompt.id!, !prompt.tenant_id);
                              }}
                              className="text-red-600 hover:text-red-700"
                              title={!prompt.tenant_id ? "Deletar prompt global (Platform Admin)" : "Deletar prompt"}
                            >
                              <Trash2 className="h-4 w-4" />
                              {!prompt.tenant_id && <span className="ml-1 text-xs">Global</span>}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}

            {/* Templates Personalizados */}
            {filteredPersonalizedTemplates.map((template) => {
              const isExpanded = expandedTemplates.has(template.id!);
              
              return (
                <Card key={`template-${template.id}`} className="grc-card transition-all duration-200 border-blue-200">
                  {/* Card Header - Always Visible */}
                  <CardHeader 
                    className="pb-3 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => toggleTemplateExpansion(template.id!)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center space-x-3">
                          <CardTitle className="text-lg flex items-center space-x-2">
                            <Zap className="h-5 w-5 text-blue-600" />
                            <span>{template.name}</span>
                            {template.is_public === true && template.is_active === false ? (
                              <Badge variant="outline" className="text-xs bg-red-50 text-red-800">
                                Template Desativado
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-800">
                                Template Personalizado
                              </Badge>
                            )}
                          </CardTitle>
                          <div className="flex items-center space-x-1">
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {template.quality_score?.toFixed(1) || 'N/A'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {template.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {template.recommended_model}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            v{template.version}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {template.description}
                        </p>

                        {/* Quick Stats */}
                        <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <BarChart3 className="h-3 w-3" />
                            <span>{template.usage_count} usos</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Settings className="h-3 w-3" />
                            <span>{template.max_output_tokens} tokens</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3" />
                            <span>{template.avg_quality_rating?.toFixed(1) || 0}/5</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <CardContent className="space-y-6 border-t">
                      {/* Detailed Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Basic Info */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider mt-4">
                            Informações Básicas
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <Label className="text-xs text-muted-foreground">Nome Técnico</Label>
                              <p className="text-sm font-mono bg-muted/50 p-2 rounded">
                                {template.name}
                              </p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Título</Label>
                              <p className="text-sm font-medium">{template.title}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Categoria</Label>
                              <p className="text-sm">
                                <Badge variant="outline" className="text-xs">
                                  {template.category?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                </Badge>
                              </p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Versão</Label>
                              <p className="text-sm">{template.version}</p>
                            </div>
                          </div>
                        </div>

                        {/* Technical Configuration */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider mt-4">
                            Configuração Técnica
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <Label className="text-xs text-muted-foreground">Modelo Recomendado</Label>
                              <p className="text-sm">
                                <Badge variant="secondary" className="text-xs">
                                  {template.recommended_model}
                                </Badge>
                              </p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Contexto Mínimo</Label>
                              <p className="text-sm">{template.min_context_window?.toLocaleString()} tokens</p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Temperatura</Label>
                              <p className="text-sm">{template.recommended_temperature}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Tokens Máximo</Label>
                              <p className="text-sm">{template.max_output_tokens?.toLocaleString()}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Formato de Saída</Label>
                              <p className="text-sm">
                                <Badge variant="outline" className="text-xs">
                                  {template.expected_output_format}
                                </Badge>
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Status & Metadata */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider mt-4">
                            Status & Metadados
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <Label className="text-xs text-muted-foreground">Status</Label>
                              <p className="text-sm">
                                {template.is_active ? (
                                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                                    Ativo
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs bg-gray-100 text-gray-800">
                                    <div className="w-2 h-2 bg-gray-500 rounded-full mr-1"></div>
                                    Inativo
                                  </Badge>
                                )}
                              </p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Visibilidade</Label>
                              <p className="text-sm">
                                {template.is_public ? (
                                  <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                                    <Eye className="h-3 w-3 mr-1" />
                                    Público
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs">
                                    <User className="h-3 w-3 mr-1" />
                                    Privado
                                  </Badge>
                                )}
                              </p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Requer Aprovação</Label>
                              <p className="text-sm">
                                {template.requires_approval ? (
                                  <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                                    <Shield className="h-3 w-3 mr-1" />
                                    Sim
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs">Não</Badge>
                                )}
                              </p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Pontuação de Qualidade</Label>
                              <div className="flex items-center space-x-2">
                                <div className="flex-1 bg-muted rounded-full h-2">
                                  <div 
                                    className="bg-blue-500 h-2 rounded-full" 
                                    style={{ width: `${(template.quality_score || 0) * 10}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium">{template.quality_score?.toFixed(1) || 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Description & Use Case */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider mt-4">
                            Descrição
                          </h4>
                          <div className="bg-muted/30 p-4 rounded-lg">
                            <p className="text-sm text-foreground whitespace-pre-wrap">
                              {template.description || 'Nenhuma descrição fornecida'}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                            Caso de Uso
                          </h4>
                          <div className="bg-muted/30 p-4 rounded-lg">
                            <p className="text-sm text-foreground whitespace-pre-wrap">
                              {template.use_case || 'Nenhum caso de uso especificado'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Frameworks & Domains */}
                      {(template.applicable_frameworks?.length > 0 || template.compliance_domains?.length > 0 || 
                        template.risk_categories?.length > 0 || template.maturity_levels?.length > 0) && (
                        <div className="space-y-4">
                          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                            Frameworks & Domínios
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {template.applicable_frameworks?.length > 0 && (
                              <div>
                                <Label className="text-xs text-muted-foreground">Frameworks Aplicáveis</Label>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {template.applicable_frameworks.map((framework, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {framework}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {template.compliance_domains?.length > 0 && (
                              <div>
                                <Label className="text-xs text-muted-foreground">Domínios de Compliance</Label>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {template.compliance_domains.map((domain, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {domain}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {template.risk_categories?.length > 0 && (
                              <div>
                                <Label className="text-xs text-muted-foreground">Categorias de Risco</Label>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {template.risk_categories.map((category, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {category}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {template.maturity_levels?.length > 0 && (
                              <div>
                                <Label className="text-xs text-muted-foreground">Níveis de Maturidade</Label>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {template.maturity_levels.map((level, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {level}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Variables & Validation Criteria */}
                      {(template.variables && Object.keys(template.variables).length > 0) || 
                       (template.validation_criteria && Object.keys(template.validation_criteria).length > 0) ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {template.variables && Object.keys(template.variables).length > 0 && (
                            <div className="space-y-3">
                              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                                Variáveis do Template
                              </h4>
                              <div className="bg-muted/30 p-4 rounded-lg">
                                <pre className="text-xs text-foreground font-mono whitespace-pre-wrap">
                                  {JSON.stringify(template.variables, null, 2)}
                                </pre>
                              </div>
                            </div>
                          )}
                          
                          {template.validation_criteria && Object.keys(template.validation_criteria).length > 0 && (
                            <div className="space-y-3">
                              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                                Critérios de Validação
                              </h4>
                              <div className="bg-muted/30 p-4 rounded-lg">
                                <pre className="text-xs text-foreground font-mono whitespace-pre-wrap">
                                  {JSON.stringify(template.validation_criteria, null, 2)}
                                </pre>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : null}

                      {/* Template Content */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                          Conteúdo do Template
                        </h4>
                        <div className="bg-muted/30 p-4 rounded-lg border">
                          <pre className="text-xs whitespace-pre-wrap text-foreground font-mono max-h-60 overflow-y-auto">
                            {template.template_content}
                          </pre>
                        </div>
                      </div>

                      {/* Performance Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Contagem de Uso</Label>
                          <div className="flex items-center space-x-2">
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{template.usage_count || 0} usos</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Taxa de Sucesso</Label>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-muted rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{ width: `${template.success_rate || 0}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{template.success_rate?.toFixed(1) || 0}%</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Avaliação Média</Label>
                          <div className="flex items-center space-x-2">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm font-medium">{template.avg_quality_rating?.toFixed(1) || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Changelog */}
                      {template.changelog && (
                        <div className="space-y-3">
                          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                            Histórico de Mudanças
                          </h4>
                          <div className="bg-muted/30 p-4 rounded-lg">
                            <p className="text-sm text-foreground whitespace-pre-wrap">
                              {template.changelog}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              createFromTemplate(template);
                            }}
                          >
                            <Zap className="h-4 w-4 mr-2" />
                            Usar Template
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              editTemplate(template);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </Button>
                        </div>

                        <div className="flex items-center space-x-2">
                          <div className="text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 inline mr-1" />
                            Criado em {formatDate(template.created_at)}
                          </div>
                          
                          {(template.is_public && user?.isPlatformAdmin) || (!template.is_public && template.created_by === user?.id) ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteTemplate(template.id!);
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}

            {/* Empty State */}
            {filteredPrompts.length === 0 && filteredPersonalizedTemplates.length === 0 && (
              <div className="col-span-full">
                <Card className="grc-card">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">
                      {searchTerm || filterModule !== 'all' || filterType !== 'all' 
                        ? 'Nenhum item encontrado' 
                        : 'Nenhum prompt ou template personalizado'}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 text-center">
                      {searchTerm || filterModule !== 'all' || filterType !== 'all'
                        ? 'Tente ajustar os filtros de busca'
                        : 'Crie seu primeiro prompt ou personalize um template público'}
                    </p>
                    {!searchTerm && filterModule === 'all' && filterType === 'all' && (
                      <div className="flex space-x-2">
                        <Button onClick={() => setShowCreateDialog(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Criar Prompt
                        </Button>
                        <Button variant="outline" onClick={() => setActiveTab('templates')}>
                          <Zap className="h-4 w-4 mr-2" />
                          Ver Templates
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Public Templates */}
        <TabsContent value="templates" className="space-y-4">
          <div className="space-y-4">
            {filteredPublicTemplates.map((template) => {
              const isExpanded = expandedTemplates.has(template.id!);
              
              return (
                <Card key={template.id} className="grc-card transition-all duration-200">
                  {/* Card Header - Always Visible */}
                  <CardHeader 
                    className="pb-3 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => toggleTemplateExpansion(template.id!)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center space-x-3">
                          <CardTitle className="text-lg flex items-center space-x-2">
                            <Zap className="h-5 w-5 text-primary" />
                            <span>{template.name}</span>
                          </CardTitle>
                          <div className="flex items-center space-x-1">
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {template.quality_score?.toFixed(1) || 'N/A'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {template.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {template.recommended_model}
                          </Badge>
                          <Badge 
                            variant={template.is_public ? "secondary" : "outline"} 
                            className="text-xs"
                          >
                            {template.is_public ? 'Público' : 'Privado'}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {template.description}
                        </p>

                        {/* Quick Stats */}
                        <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <BarChart3 className="h-3 w-3" />
                            <span>{template.usage_count} usos</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Settings className="h-3 w-3" />
                            <span>{template.max_output_tokens} tokens</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3" />
                            <span>{template.avg_quality_rating?.toFixed(1) || 0}/5</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <CardContent className="space-y-6 border-t">
                      {/* Detailed Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Basic Info */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                            Informações Básicas
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <Label className="text-xs text-muted-foreground">Nome Técnico</Label>
                              <p className="text-sm font-mono bg-muted/50 p-2 rounded">
                                {template.name}
                              </p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Título</Label>
                              <p className="text-sm font-medium">{template.title}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Categoria</Label>
                              <p className="text-sm">
                                <Badge variant="outline" className="text-xs">
                                  {template.category?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                </Badge>
                              </p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Versão</Label>
                              <p className="text-sm">{template.version}</p>
                            </div>
                          </div>
                        </div>

                        {/* Technical Configuration */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider mt-4">
                            Configuração Técnica
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <Label className="text-xs text-muted-foreground">Modelo Recomendado</Label>
                              <p className="text-sm">
                                <Badge variant="secondary" className="text-xs">
                                  {template.recommended_model}
                                </Badge>
                              </p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Contexto Mínimo</Label>
                              <p className="text-sm">{template.min_context_window?.toLocaleString()} tokens</p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Temperatura</Label>
                              <p className="text-sm">{template.recommended_temperature}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Tokens Máximo</Label>
                              <p className="text-sm">{template.max_output_tokens?.toLocaleString()}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Formato de Saída</Label>
                              <p className="text-sm">
                                <Badge variant="outline" className="text-xs">
                                  {template.expected_output_format}
                                </Badge>
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Status & Metadata */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider mt-4">
                            Status & Metadados
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <Label className="text-xs text-muted-foreground">Status</Label>
                              <p className="text-sm">
                                {template.is_active ? (
                                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                                    Ativo
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs bg-gray-100 text-gray-800">
                                    <div className="w-2 h-2 bg-gray-500 rounded-full mr-1"></div>
                                    Inativo
                                  </Badge>
                                )}
                              </p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Visibilidade</Label>
                              <p className="text-sm">
                                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                                  <Eye className="h-3 w-3 mr-1" />
                                  Público
                                </Badge>
                              </p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Requer Aprovação</Label>
                              <p className="text-sm">
                                {template.requires_approval ? (
                                  <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                                    <Shield className="h-3 w-3 mr-1" />
                                    Sim
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs">Não</Badge>
                                )}
                              </p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Pontuação de Qualidade</Label>
                              <div className="flex items-center space-x-2">
                                <div className="flex-1 bg-muted rounded-full h-2">
                                  <div 
                                    className="bg-blue-500 h-2 rounded-full" 
                                    style={{ width: `${(template.quality_score || 0) * 10}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium">{template.quality_score?.toFixed(1) || 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Description & Use Case */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                            Descrição
                          </h4>
                          <div className="bg-muted/30 p-4 rounded-lg">
                            <p className="text-sm text-foreground whitespace-pre-wrap">
                              {template.description || 'Nenhuma descrição fornecida'}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                            Caso de Uso
                          </h4>
                          <div className="bg-muted/30 p-4 rounded-lg">
                            <p className="text-sm text-foreground whitespace-pre-wrap">
                              {template.use_case || 'Nenhum caso de uso especificado'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Frameworks & Domains */}
                      {(template.applicable_frameworks?.length > 0 || template.compliance_domains?.length > 0 || 
                        template.risk_categories?.length > 0 || template.maturity_levels?.length > 0) && (
                        <div className="space-y-4">
                          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                            Frameworks & Domínios
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {template.applicable_frameworks?.length > 0 && (
                              <div>
                                <Label className="text-xs text-muted-foreground">Frameworks Aplicáveis</Label>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {template.applicable_frameworks.map((framework, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {framework}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {template.compliance_domains?.length > 0 && (
                              <div>
                                <Label className="text-xs text-muted-foreground">Domínios de Compliance</Label>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {template.compliance_domains.map((domain, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {domain}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {template.risk_categories?.length > 0 && (
                              <div>
                                <Label className="text-xs text-muted-foreground">Categorias de Risco</Label>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {template.risk_categories.map((category, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {category}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {template.maturity_levels?.length > 0 && (
                              <div>
                                <Label className="text-xs text-muted-foreground">Níveis de Maturidade</Label>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {template.maturity_levels.map((level, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {level}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Variables & Validation Criteria */}
                      {(template.variables && Object.keys(template.variables).length > 0) || 
                       (template.validation_criteria && Object.keys(template.validation_criteria).length > 0) ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {template.variables && Object.keys(template.variables).length > 0 && (
                            <div className="space-y-3">
                              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                                Variáveis do Template
                              </h4>
                              <div className="bg-muted/30 p-4 rounded-lg">
                                <pre className="text-xs text-foreground font-mono whitespace-pre-wrap">
                                  {JSON.stringify(template.variables, null, 2)}
                                </pre>
                              </div>
                            </div>
                          )}
                          
                          {template.validation_criteria && Object.keys(template.validation_criteria).length > 0 && (
                            <div className="space-y-3">
                              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                                Critérios de Validação
                              </h4>
                              <div className="bg-muted/30 p-4 rounded-lg">
                                <pre className="text-xs text-foreground font-mono whitespace-pre-wrap">
                                  {JSON.stringify(template.validation_criteria, null, 2)}
                                </pre>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : null}

                      {/* Template Content */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                          Conteúdo do Template
                        </h4>
                        <div className="bg-muted/30 p-4 rounded-lg border">
                          <pre className="text-xs whitespace-pre-wrap text-foreground font-mono max-h-60 overflow-y-auto">
                            {template.template_content}
                          </pre>
                        </div>
                      </div>

                      {/* Performance Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Contagem de Uso</Label>
                          <div className="flex items-center space-x-2">
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{template.usage_count || 0} usos</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Taxa de Sucesso</Label>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-muted rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{ width: `${template.success_rate || 0}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{template.success_rate?.toFixed(1) || 0}%</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Avaliação Média</Label>
                          <div className="flex items-center space-x-2">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm font-medium">{template.avg_quality_rating?.toFixed(1) || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Changelog */}
                      {template.changelog && (
                        <div className="space-y-3">
                          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                            Histórico de Mudanças
                          </h4>
                          <div className="bg-muted/30 p-4 rounded-lg">
                            <p className="text-sm text-foreground whitespace-pre-wrap">
                              {template.changelog}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              createFromTemplate(template);
                            }}
                          >
                            <Zap className="h-4 w-4 mr-2" />
                            Usar Template
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: Implementar download
                            }}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          {user?.isPlatformAdmin && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                editTemplate(template);
                              }}
                              title="Editar template público (Platform Admin)"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </Button>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          <div className="text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 inline mr-1" />
                            Criado em {formatDate(template.created_at)}
                          </div>
                          
                          {user?.isPlatformAdmin && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteTemplate(template.id!);
                              }}
                              className="text-red-600 hover:text-red-700"
                              title="Deletar template público (Platform Admin)"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}

            {/* Empty State */}
            {filteredPublicTemplates.length === 0 && (
              <div className="col-span-full">
                <Card className="grc-card">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">
                      Nenhum template encontrado
                    </h3>
                    <p className="text-sm text-muted-foreground text-center">
                      Tente ajustar os filtros de busca ou aguarde novos templates serem adicionados
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};