import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Plus, Search, Edit, Trash2, Eye, Download, Upload, Settings, Target, FileText, BarChart3, Users, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { supabase } from '@/integrations/supabase/client';
import { AssessmentFramework, AssessmentDomain, AssessmentControl, FrameworkFormData } from '@/types/assessment';
import { sanitizeInput, sanitizeObject, auditLog } from '@/utils/securityLogger';
import { useCRUDRateLimit } from '@/hooks/useRateLimit';

export default function FrameworksAssessment() {
  const { user, effectiveTenantId } = useAuth();
  const rateLimitCRUD = useCRUDRateLimit(user?.id || 'anonymous');

  const [frameworks, setFrameworks] = useState<AssessmentFramework[]>([]);
  const [domains, setDomains] = useState<AssessmentDomain[]>([]);
  const [controls, setControls] = useState<AssessmentControl[]>([]);
  const [selectedFramework, setSelectedFramework] = useState<AssessmentFramework | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<AssessmentDomain | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [isCreateFrameworkOpen, setIsCreateFrameworkOpen] = useState(false);
  const [isCreateDomainOpen, setIsCreateDomainOpen] = useState(false);
  const [isCreateControlOpen, setIsCreateControlOpen] = useState(false);
  const [isEditFrameworkOpen, setIsEditFrameworkOpen] = useState(false);
  const [editingFramework, setEditingFramework] = useState<AssessmentFramework | null>(null);

  const [frameworkForm, setFrameworkForm] = useState<FrameworkFormData>({
    codigo: '',
    nome: '',
    descricao: '',
    versao: '',
    tipo_framework: '',
    categoria: '',
    padrao_origem: '',
    industria_aplicavel: [],
    publico: false
  });

  const [domainForm, setDomainForm] = useState({
    framework_id: '',
    codigo: '',
    nome: '',
    descricao: '',
    ordem: 1,
    peso: 100
  });

  const [controlForm, setControlForm] = useState({
    framework_id: '',
    domain_id: '',
    codigo: '',
    titulo: '',
    descricao: '',
    objetivo: '',
    ordem: 1,
    tipo_controle: '',
    categoria: '',
    subcategoria: '',
    criticidade: '',
    impacto_potencial: '',
    guia_implementacao: '',
    evidencias_necessarias: [],
    referencias_normativas: [],
    peso: 100,
    pontuacao_maxima: 5,
    obrigatorio: false
  });

  const tiposFramework = [
    { value: 'compliance', label: 'Compliance' },
    { value: 'security', label: 'Segurança' },
    { value: 'privacy', label: 'Privacidade' },
    { value: 'operational', label: 'Operacional' },
    { value: 'financial', label: 'Financeiro' },
    { value: 'governance', label: 'Governança' },
    { value: 'risk_management', label: 'Gestão de Riscos' },
    { value: 'quality', label: 'Qualidade' },
    { value: 'environmental', label: 'Ambiental' },
    { value: 'custom', label: 'Personalizado' }
  ];

  const tiposControle = [
    { value: 'preventivo', label: 'Preventivo' },
    { value: 'detectivo', label: 'Detectivo' },
    { value: 'corretivo', label: 'Corretivo' },
    { value: 'compensatorio', label: 'Compensatório' },
    { value: 'diretivo', label: 'Diretivo' }
  ];

  const niveisMaturity = [
    { value: 1, name: 'Inicial', description: 'Processos ad-hoc e desorganizados' },
    { value: 2, name: 'Gerenciado', description: 'Processos documentados e repetíveis' },
    { value: 3, name: 'Definido', description: 'Processos padronizados e integrados' },
    { value: 4, name: 'Quantitativamente Gerenciado', description: 'Processos medidos e controlados' },
    { value: 5, name: 'Otimizado', description: 'Melhoria contínua dos processos' }
  ];

  useEffect(() => {
    loadFrameworks();
  }, [effectiveTenantId]);

  useEffect(() => {
    if (selectedFramework) {
      loadDomains(selectedFramework.id);
    }
  }, [selectedFramework]);

  useEffect(() => {
    if (selectedDomain) {
      loadControls(selectedDomain.id);
    }
  }, [selectedDomain]);

  const loadFrameworks = async () => {
    try {
      if (!rateLimitCRUD.checkRateLimit('read')) {
        toast.error('Limite de operações excedido. Tente novamente em alguns segundos.');
        return;
      }

      const { data, error } = await supabase
        .from('assessment_frameworks')
        .select('*')
        .eq('tenant_id', effectiveTenantId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setFrameworks(data || []);
    } catch (error) {
      console.error('Erro ao carregar frameworks:', error);
      toast.error('Erro ao carregar frameworks de assessment');
    } finally {
      setLoading(false);
    }
  };

  const loadDomains = async (frameworkId: string) => {
    try {
      const { data, error } = await supabase
        .from('assessment_domains')
        .select('*')
        .eq('framework_id', frameworkId)
        .eq('tenant_id', effectiveTenantId)
        .order('ordem', { ascending: true });

      if (error) throw error;

      setDomains(data || []);
    } catch (error) {
      console.error('Erro ao carregar domínios:', error);
      toast.error('Erro ao carregar domínios do framework');
    }
  };

  const loadControls = async (domainId: string) => {
    try {
      const { data, error } = await supabase
        .from('assessment_controls')
        .select('*')
        .eq('domain_id', domainId)
        .eq('tenant_id', effectiveTenantId)
        .order('ordem', { ascending: true });

      if (error) throw error;

      setControls(data || []);
    } catch (error) {
      console.error('Erro ao carregar controles:', error);
      toast.error('Erro ao carregar controles do domínio');
    }
  };

  const handleCreateFramework = async () => {
    try {
      if (!rateLimitCRUD.checkRateLimit('create')) {
        toast.error('Limite de operações excedido. Tente novamente em alguns segundos.');
        return;
      }

      const sanitizedFormData = sanitizeObject({
        ...frameworkForm,
        codigo: sanitizeInput(frameworkForm.codigo),
        nome: sanitizeInput(frameworkForm.nome),
        descricao: sanitizeInput(frameworkForm.descricao),
        versao: sanitizeInput(frameworkForm.versao)
      });

      const frameworkData = {
        ...sanitizedFormData,
        tenant_id: effectiveTenantId,
        escala_maturidade: {
          levels: niveisMaturity
        },
        peso_total: 100,
        status: 'ativo' as const,
        created_by: user?.id
      };

      const { error } = await supabase
        .from('assessment_frameworks')
        .insert(frameworkData);

      if (error) throw error;

      await auditLog('CREATE', 'assessment_frameworks', {
        codigo: sanitizedFormData.codigo,
        nome: sanitizedFormData.nome,
        tenant_id: effectiveTenantId
      });

      toast.success('Framework criado com sucesso!');
      setIsCreateFrameworkOpen(false);
      setFrameworkForm({
        codigo: '',
        nome: '',
        descricao: '',
        versao: '',
        tipo_framework: '',
        categoria: '',
        padrao_origem: '',
        industria_aplicavel: [],
        publico: false
      });
      loadFrameworks();
    } catch (error) {
      console.error('Erro ao criar framework:', error);
      toast.error('Erro ao criar framework');
    }
  };

  const handleCreateDomain = async () => {
    try {
      if (!rateLimitCRUD.checkRateLimit('create')) {
        toast.error('Limite de operações excedido. Tente novamente em alguns segundos.');
        return;
      }

      if (!selectedFramework) {
        toast.error('Selecione um framework primeiro');
        return;
      }

      const sanitizedFormData = sanitizeObject({
        ...domainForm,
        codigo: sanitizeInput(domainForm.codigo),
        nome: sanitizeInput(domainForm.nome),
        descricao: sanitizeInput(domainForm.descricao)
      });

      const domainData = {
        ...sanitizedFormData,
        framework_id: selectedFramework.id,
        tenant_id: effectiveTenantId,
        ativo: true,
        created_by: user?.id
      };

      const { error } = await supabase
        .from('assessment_domains')
        .insert(domainData);

      if (error) throw error;

      await auditLog('CREATE', 'assessment_domains', {
        codigo: sanitizedFormData.codigo,
        nome: sanitizedFormData.nome,
        framework_id: selectedFramework.id,
        tenant_id: effectiveTenantId
      });

      toast.success('Domínio criado com sucesso!');
      setIsCreateDomainOpen(false);
      setDomainForm({
        framework_id: '',
        codigo: '',
        nome: '',
        descricao: '',
        ordem: 1,
        peso: 100
      });
      loadDomains(selectedFramework.id);
    } catch (error) {
      console.error('Erro ao criar domínio:', error);
      toast.error('Erro ao criar domínio');
    }
  };

  const handleCreateControl = async () => {
    try {
      if (!rateLimitCRUD.checkRateLimit('create')) {
        toast.error('Limite de operações excedido. Tente novamente em alguns segundos.');
        return;
      }

      if (!selectedFramework || !selectedDomain) {
        toast.error('Selecione um framework e domínio primeiro');
        return;
      }

      const sanitizedFormData = sanitizeObject({
        ...controlForm,
        codigo: sanitizeInput(controlForm.codigo),
        titulo: sanitizeInput(controlForm.titulo),
        descricao: sanitizeInput(controlForm.descricao),
        objetivo: sanitizeInput(controlForm.objetivo)
      });

      const controlData = {
        ...sanitizedFormData,
        framework_id: selectedFramework.id,
        domain_id: selectedDomain.id,
        tenant_id: effectiveTenantId,
        ativo: true,
        created_by: user?.id
      };

      const { error } = await supabase
        .from('assessment_controls')
        .insert(controlData);

      if (error) throw error;

      await auditLog('CREATE', 'assessment_controls', {
        codigo: sanitizedFormData.codigo,
        titulo: sanitizedFormData.titulo,
        framework_id: selectedFramework.id,
        domain_id: selectedDomain.id,
        tenant_id: effectiveTenantId
      });

      toast.success('Controle criado com sucesso!');
      setIsCreateControlOpen(false);
      setControlForm({
        framework_id: '',
        domain_id: '',
        codigo: '',
        titulo: '',
        descricao: '',
        objetivo: '',
        ordem: 1,
        tipo_controle: '',
        categoria: '',
        subcategoria: '',
        criticidade: '',
        impacto_potencial: '',
        guia_implementacao: '',
        evidencias_necessarias: [],
        referencias_normativas: [],
        peso: 100,
        pontuacao_maxima: 5,
        obrigatorio: false
      });
      loadControls(selectedDomain.id);
    } catch (error) {
      console.error('Erro ao criar controle:', error);
      toast.error('Erro ao criar controle');
    }
  };

  const filteredFrameworks = frameworks.filter(framework => {
    const matchesSearch = framework.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         framework.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'todos' || framework.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const colors = {
      ativo: 'bg-green-100 text-green-800',
      inativo: 'bg-red-100 text-red-800',
      em_revisao: 'bg-yellow-100 text-yellow-800',
      arquivado: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getCriticidadeBadge = (criticidade: string) => {
    const colors = {
      baixa: 'bg-blue-100 text-blue-800',
      media: 'bg-yellow-100 text-yellow-800',
      alta: 'bg-orange-100 text-orange-800',
      critica: 'bg-red-100 text-red-800'
    };
    return colors[criticidade as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Frameworks de Assessment</h2>
          <p className="text-muted-foreground">
            Gerencie frameworks, domínios e controles para avaliações de maturidade
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Dialog open={isCreateFrameworkOpen} onOpenChange={setIsCreateFrameworkOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Framework
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Novo Framework</DialogTitle>
                <DialogDescription>
                  Crie um novo framework de assessment para avaliações de maturidade
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="codigo">Código</Label>
                    <Input
                      id="codigo"
                      value={frameworkForm.codigo}
                      onChange={(e) => setFrameworkForm(prev => ({ ...prev, codigo: e.target.value }))}
                      placeholder="Ex: ISO27001-2022"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="versao">Versão</Label>
                    <Input
                      id="versao"
                      value={frameworkForm.versao}
                      onChange={(e) => setFrameworkForm(prev => ({ ...prev, versao: e.target.value }))}
                      placeholder="Ex: 1.0"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    value={frameworkForm.nome}
                    onChange={(e) => setFrameworkForm(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Ex: ISO 27001:2022 - Sistema de Gestão de Segurança da Informação"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={frameworkForm.descricao}
                    onChange={(e) => setFrameworkForm(prev => ({ ...prev, descricao: e.target.value }))}
                    placeholder="Descrição detalhada do framework"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipo_framework">Tipo de Framework</Label>
                    <Select value={frameworkForm.tipo_framework} onValueChange={(value) => setFrameworkForm(prev => ({ ...prev, tipo_framework: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposFramework.map((tipo) => (
                          <SelectItem key={tipo.value} value={tipo.value}>
                            {tipo.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoria</Label>
                    <Input
                      id="categoria"
                      value={frameworkForm.categoria}
                      onChange={(e) => setFrameworkForm(prev => ({ ...prev, categoria: e.target.value }))}
                      placeholder="Ex: Segurança da Informação"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="padrao_origem">Padrão de Origem</Label>
                  <Input
                    id="padrao_origem"
                    value={frameworkForm.padrao_origem}
                    onChange={(e) => setFrameworkForm(prev => ({ ...prev, padrao_origem: e.target.value }))}
                    placeholder="Ex: ISO/IEC 27001:2022"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="publico"
                    checked={frameworkForm.publico}
                    onCheckedChange={(checked) => setFrameworkForm(prev => ({ ...prev, publico: !!checked }))}
                  />
                  <Label htmlFor="publico">Framework público (disponível para outros tenants)</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateFrameworkOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateFramework}>
                  Criar Framework
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar frameworks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="inativo">Inativo</SelectItem>
            <SelectItem value="em_revisao">Em Revisão</SelectItem>
            <SelectItem value="arquivado">Arquivado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="frameworks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
          <TabsTrigger value="dominios" disabled={!selectedFramework}>
            Domínios {selectedFramework && `(${selectedFramework.nome})`}
          </TabsTrigger>
          <TabsTrigger value="controles" disabled={!selectedDomain}>
            Controles {selectedDomain && `(${selectedDomain.nome})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="frameworks" className="space-y-4">
          <div className="grid gap-4">
            {loading ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-sm text-muted-foreground mt-2">Carregando frameworks...</p>
                  </div>
                </CardContent>
              </Card>
            ) : filteredFrameworks.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">Nenhum framework encontrado</h3>
                    <p className="text-sm text-muted-foreground">
                      {searchTerm ? 'Tente ajustar os filtros de pesquisa' : 'Comece criando seu primeiro framework de assessment'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredFrameworks.map((framework) => (
                <Card 
                  key={framework.id} 
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedFramework?.id === framework.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedFramework(framework)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{framework.nome}</CardTitle>
                        <CardDescription>
                          {framework.codigo} • v{framework.versao} • {framework.tipo_framework}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusBadge(framework.status)}>
                          {framework.status}
                        </Badge>
                        {framework.publico && (
                          <Badge variant="outline">Público</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {framework.descricao}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {framework.categoria && (
                        <span className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          {framework.categoria}
                        </span>
                      )}
                      {framework.padrao_origem && (
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {framework.padrao_origem}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <BarChart3 className="h-3 w-3" />
                        Peso Total: {framework.peso_total}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="dominios" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">
              Domínios do Framework: {selectedFramework?.nome}
            </h3>
            <Dialog open={isCreateDomainOpen} onOpenChange={setIsCreateDomainOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Domínio
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Domínio</DialogTitle>
                  <DialogDescription>
                    Adicione um novo domínio ao framework {selectedFramework?.nome}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="domain-codigo">Código</Label>
                      <Input
                        id="domain-codigo"
                        value={domainForm.codigo}
                        onChange={(e) => setDomainForm(prev => ({ ...prev, codigo: e.target.value }))}
                        placeholder="Ex: A.5"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="domain-ordem">Ordem</Label>
                      <Input
                        id="domain-ordem"
                        type="number"
                        value={domainForm.ordem}
                        onChange={(e) => setDomainForm(prev => ({ ...prev, ordem: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="domain-nome">Nome</Label>
                    <Input
                      id="domain-nome"
                      value={domainForm.nome}
                      onChange={(e) => setDomainForm(prev => ({ ...prev, nome: e.target.value }))}
                      placeholder="Ex: Políticas de Segurança da Informação"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="domain-descricao">Descrição</Label>
                    <Textarea
                      id="domain-descricao"
                      value={domainForm.descricao}
                      onChange={(e) => setDomainForm(prev => ({ ...prev, descricao: e.target.value }))}
                      placeholder="Descrição do domínio"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="domain-peso">Peso (%)</Label>
                    <Input
                      id="domain-peso"
                      type="number"
                      value={domainForm.peso}
                      onChange={(e) => setDomainForm(prev => ({ ...prev, peso: parseFloat(e.target.value) }))}
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDomainOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateDomain}>
                    Criar Domínio
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {domains.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">Nenhum domínio cadastrado</h3>
                    <p className="text-sm text-muted-foreground">
                      Comece adicionando domínios ao framework
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              domains.map((domain) => (
                <Card 
                  key={domain.id}
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedDomain?.id === domain.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedDomain(domain)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{domain.nome}</CardTitle>
                        <CardDescription>
                          {domain.codigo} • Ordem: {domain.ordem} • Peso: {domain.peso}%
                        </CardDescription>
                      </div>
                      <Badge variant={domain.ativo ? 'default' : 'secondary'}>
                        {domain.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {domain.descricao}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="controles" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">
              Controles do Domínio: {selectedDomain?.nome}
            </h3>
            <Dialog open={isCreateControlOpen} onOpenChange={setIsCreateControlOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Controle
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Criar Novo Controle</DialogTitle>
                  <DialogDescription>
                    Adicione um novo controle ao domínio {selectedDomain?.nome}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="control-codigo">Código</Label>
                      <Input
                        id="control-codigo"
                        value={controlForm.codigo}
                        onChange={(e) => setControlForm(prev => ({ ...prev, codigo: e.target.value }))}
                        placeholder="Ex: A.5.1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="control-ordem">Ordem</Label>
                      <Input
                        id="control-ordem"
                        type="number"
                        value={controlForm.ordem}
                        onChange={(e) => setControlForm(prev => ({ ...prev, ordem: parseInt(e.target.value) }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="control-peso">Peso</Label>
                      <Input
                        id="control-peso"
                        type="number"
                        value={controlForm.peso}
                        onChange={(e) => setControlForm(prev => ({ ...prev, peso: parseFloat(e.target.value) }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="control-titulo">Título</Label>
                    <Input
                      id="control-titulo"
                      value={controlForm.titulo}
                      onChange={(e) => setControlForm(prev => ({ ...prev, titulo: e.target.value }))}
                      placeholder="Ex: Políticas para segurança da informação"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="control-descricao">Descrição</Label>
                    <Textarea
                      id="control-descricao"
                      value={controlForm.descricao}
                      onChange={(e) => setControlForm(prev => ({ ...prev, descricao: e.target.value }))}
                      placeholder="Descrição detalhada do controle"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="control-objetivo">Objetivo</Label>
                    <Textarea
                      id="control-objetivo"
                      value={controlForm.objetivo}
                      onChange={(e) => setControlForm(prev => ({ ...prev, objetivo: e.target.value }))}
                      placeholder="Objetivo do controle"
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="control-tipo">Tipo de Controle</Label>
                      <Select value={controlForm.tipo_controle} onValueChange={(value) => setControlForm(prev => ({ ...prev, tipo_controle: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {tiposControle.map((tipo) => (
                            <SelectItem key={tipo.value} value={tipo.value}>
                              {tipo.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="control-criticidade">Criticidade</Label>
                      <Select value={controlForm.criticidade} onValueChange={(value) => setControlForm(prev => ({ ...prev, criticidade: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a criticidade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="baixa">Baixa</SelectItem>
                          <SelectItem value="media">Média</SelectItem>
                          <SelectItem value="alta">Alta</SelectItem>
                          <SelectItem value="critica">Crítica</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="control-categoria">Categoria</Label>
                      <Input
                        id="control-categoria"
                        value={controlForm.categoria}
                        onChange={(e) => setControlForm(prev => ({ ...prev, categoria: e.target.value }))}
                        placeholder="Ex: Controles Organizacionais"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="control-subcategoria">Subcategoria</Label>
                      <Input
                        id="control-subcategoria"
                        value={controlForm.subcategoria}
                        onChange={(e) => setControlForm(prev => ({ ...prev, subcategoria: e.target.value }))}
                        placeholder="Ex: Políticas"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="control-pontuacao">Pontuação Máxima</Label>
                      <Input
                        id="control-pontuacao"
                        type="number"
                        value={controlForm.pontuacao_maxima}
                        onChange={(e) => setControlForm(prev => ({ ...prev, pontuacao_maxima: parseInt(e.target.value) }))}
                        min="1"
                        max="5"
                      />
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                      <Checkbox
                        id="control-obrigatorio"
                        checked={controlForm.obrigatorio}
                        onCheckedChange={(checked) => setControlForm(prev => ({ ...prev, obrigatorio: !!checked }))}
                      />
                      <Label htmlFor="control-obrigatorio">Controle obrigatório</Label>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateControlOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateControl}>
                    Criar Controle
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {controls.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">Nenhum controle cadastrado</h3>
                    <p className="text-sm text-muted-foreground">
                      Comece adicionando controles ao domínio
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              controls.map((control) => (
                <Card key={control.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{control.titulo}</CardTitle>
                        <CardDescription>
                          {control.codigo} • {control.tipo_controle} • Peso: {control.peso}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getCriticidadeBadge(control.criticidade)}>
                          {control.criticidade}
                        </Badge>
                        {control.obrigatorio && (
                          <Badge variant="outline">Obrigatório</Badge>
                        )}
                        <Badge variant={control.ativo ? 'default' : 'secondary'}>
                          {control.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">
                      {control.descricao}
                    </p>
                    {control.objetivo && (
                      <p className="text-sm text-muted-foreground">
                        <strong>Objetivo:</strong> {control.objetivo}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-3 text-xs text-muted-foreground">
                      {control.categoria && (
                        <span className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          {control.categoria}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <BarChart3 className="h-3 w-3" />
                        Max: {control.pontuacao_maxima} pontos
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}