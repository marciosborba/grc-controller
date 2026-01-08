import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Plus, Download, Upload, Search, Edit, Trash2, BookOpen,
  Settings, Shield, Award, Target, FileText, CheckCircle, XCircle, Copy, HelpCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { FrameworkRequirements } from './FrameworkRequirements';

interface Framework {
  id: string;
  nome: string;
  tipo: string;
  versao: string;
  descricao: string;
  status: string;
  is_active?: boolean;
  created_at: string;
  requirements_count?: number;
  is_standard?: boolean;
}

export default function FrameworksManagement() {
  const { user } = useAuth();
  const selectedTenantId = useCurrentTenantId();
  const effectiveTenantId = user?.isPlatformAdmin ? selectedTenantId : user?.tenantId;

  // Tabs State
  const [activeTab, setActiveTab] = useState<'standard' | 'custom'>('custom');

  // Basic State
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>([]);

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingFramework, setEditingFramework] = useState<Framework | null>(null);

  // Requirements Modal State
  const [requirementsDialogOpen, setRequirementsDialogOpen] = useState(false);
  const [selectedFrameworkForRequirements, setSelectedFrameworkForRequirements] = useState<Framework | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'CUSTOM', // Mapped to 'tipo'
    versao: '1.0',
    descricao: '',
    is_active: true // Mapped to 'status'
  });

  // Operation State
  const [isProcess, setIsProcess] = useState(false); // General loading for Create/Delete/Clone
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [showImportPreview, setShowImportPreview] = useState(false);

  useEffect(() => {
    if (effectiveTenantId) {
      loadFrameworks();
    }
  }, [effectiveTenantId, activeTab]);

  const loadFrameworks = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('frameworks_compliance')
        .select(`
          *,
          requisitos_compliance(count)
        `)
        .order('created_at', { ascending: false });

      if (activeTab === 'standard') {
        query = query.eq('is_standard', true);
      } else {
        query = query.eq('tenant_id', effectiveTenantId);
        // We could filter eq('is_standard', false) specifically, but tenant_id is enough due to constraint
      }

      const { data, error } = await query;

      if (error) throw error;

      const processed = data?.map(f => ({
        ...f,
        is_active: f.status === 'ativo',
        requirements_count: f.requisitos_compliance?.[0]?.count || 0
      })) || [];

      setFrameworks(processed);
    } catch (error) {
      console.error('Erro ao carregar frameworks:', error);
      toast.error('Erro ao carregar frameworks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFramework = async () => {
    if (!effectiveTenantId || !user) return;
    if (!formData.nome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    setIsProcess(true);
    try {
      const payload = {
        tenant_id: effectiveTenantId,
        nome: formData.nome,
        tipo: formData.tipo,
        versao: formData.versao,
        descricao: formData.descricao,
        status: formData.is_active ? 'ativo' : 'inativo',
        created_by: user.id,
        updated_by: user.id,
        codigo: `FRM-${Date.now()}`,
        is_standard: false
      };

      const { error } = await supabase
        .from('frameworks_compliance')
        .insert([payload]);

      if (error) throw error;

      toast.success('Framework criado com sucesso!');
      setIsCreateModalOpen(false);
      resetForm();
      loadFrameworks();
    } catch (error) {
      console.error('Erro ao criar framework:', error);
      toast.error('Erro ao criar framework');
    } finally {
      setIsProcess(false);
    }
  };

  const handleUpdateFramework = async () => {
    if (!editingFramework || !effectiveTenantId || !user) return;

    setIsProcess(true);
    try {
      const { error } = await supabase
        .from('frameworks_compliance')
        .update({
          nome: formData.nome,
          tipo: formData.tipo,
          versao: formData.versao,
          descricao: formData.descricao,
          status: formData.is_active ? 'ativo' : 'inativo',
          updated_by: user.id
        })
        .eq('id', editingFramework.id);

      if (error) throw error;

      toast.success('Framework atualizado com sucesso!');
      setEditingFramework(null);
      resetForm();
      loadFrameworks();
    } catch (error) {
      console.error('Erro ao atualizar framework:', error);
      toast.error('Erro ao atualizar framework');
    } finally {
      setIsProcess(false);
    }
  };

  const handleDeleteFramework = async (frameworkId: string) => {
    if (!effectiveTenantId) return;

    setIsProcess(true);
    try {
      const { error } = await supabase
        .from('frameworks_compliance')
        .delete()
        .eq('id', frameworkId);

      if (error) throw error;

      toast.success('Framework excluído com sucesso!');
      loadFrameworks();
    } catch (error) {
      console.error('Erro ao excluir framework:', error);
      toast.error('Erro ao excluir framework');
    } finally {
      setIsProcess(false);
    }
  };

  const handleCloneFramework = async (framework: Framework) => {
    if (!effectiveTenantId || !user) return;
    if (!confirm(`Deseja clonar o framework "${framework.nome}" para a sua biblioteca?`)) return;

    setIsProcess(true);
    try {
      const { error } = await supabase.rpc('clone_framework', {
        p_framework_id: framework.id,
        p_target_tenant_id: effectiveTenantId,
        p_user_id: user.id
      });

      if (error) throw error;

      toast.success('Framework clonado com sucesso! Verifique na aba "Meus Frameworks".');
      // Optionally switch tab
      setActiveTab('custom');
    } catch (error: any) {
      console.error('Erro ao clonar framework:', error);
      toast.error('Erro ao clonar: ' + error.message);
    } finally {
      setIsProcess(false);
    }
  };

  const handleExport = () => {
    const selectedData = frameworks.filter(f => selectedFrameworks.includes(f.id));
    const exportData = {
      frameworks: selectedData,
      exported_at: new Date().toISOString(),
      exported_by: user?.email,
      module: 'compliance'
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance_frameworks_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success(`${selectedData.length} frameworks exportados!`);
  };

  // ... Import functions kept same but simplified for brevity in this replacement ...
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.json')) { toast.error('Arquivo inválido'); return; }
    setImportFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        if (!data.frameworks) { toast.error('Formato inválido'); return; }
        setImportPreview(data.frameworks);
        setShowImportPreview(true);
      } catch (error: any) { toast.error('Erro ao ler JSON: ' + error.message); }
    };
    reader.readAsText(file);
  };

  const handleImportFrameworks = async () => {
    if (!effectiveTenantId || !user || !importPreview.length) return;
    setIsProcess(true);
    let count = 0;
    try {
      for (const fw of importPreview) {
        const payload = {
          tenant_id: effectiveTenantId,
          nome: fw.nome,
          tipo: fw.tipo || 'CUSTOM',
          versao: fw.versao || '1.0',
          descricao: fw.descricao || '',
          status: 'ativo',
          created_by: user.id,
          codigo: fw.codigo || `FRM-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          is_standard: false
        };
        const { error } = await supabase.from('frameworks_compliance').insert([payload]);
        if (!error) count++;
      }
      toast.success(`${count} frameworks importados!`);
      setIsImportModalOpen(false);
      loadFrameworks();
    } catch (e) { toast.error('Erro na importação'); }
    finally { setIsProcess(false); }
  };

  const resetForm = () => {
    setFormData({ nome: '', tipo: 'CUSTOM', versao: '1.0', descricao: '', is_active: true });
  };

  const openEditModal = (framework: Framework) => {
    setEditingFramework(framework);
    setFormData({
      nome: framework.nome,
      tipo: framework.tipo,
      versao: framework.versao,
      descricao: framework.descricao || '',
      is_active: framework.status === 'ativo'
    });
  };

  const filteredFrameworks = frameworks.filter(f =>
    searchTerm === '' ||
    f.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelectAll = () => {
    setSelectedFrameworks(selectedFrameworks.length === filteredFrameworks.length ? [] : filteredFrameworks.map(f => f.id));
  };
  const toggleFrameworkSelection = (id: string) => setSelectedFrameworks(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const getFrameworkIcon = (type: string) => {
    const icons: any = { 'ISO27001': Shield, 'SOX': Award, 'NIST': Target, 'COBIT': Settings, 'LGPD': Shield, 'GDPR': Shield, 'CUSTOM': BookOpen };
    return icons[type] || BookOpen;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            Gestão de Frameworks
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary">
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Para que servem os Frameworks/Normas?</DialogTitle>
                  <DialogDescription className="space-y-4 pt-4 text-left">
                    <p>
                      <strong>Objetivo:</strong> É a "Lei". É o conjunto de regras que a empresa decidiu (ou foi obrigada) a seguir.
                    </p>

                    <div className="bg-muted p-4 rounded-lg">
                      <p className="font-semibold mb-2">Exemplo Prático:</p>
                      <ul className="list-disc pl-5 space-y-2 text-sm">
                        <li>
                          <strong>Externo (Leis):</strong> LGPD (Brasil), GDPR (Europa), SOX (EUA).
                        </li>
                        <li>
                          <strong>Interno (Padrões):</strong> "Política de Segurança da Informação 2024".
                        </li>
                        <li>
                          <strong>Como funciona:</strong> Todo o resto do sistema (Monitoramento, Avaliações) existe para provar que você está obedecendo este Framework.
                        </li>
                      </ul>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      <strong>Dica:</strong> Se você é novo, comece clonando a "ISO 27001" da biblioteca para ver os controles padrão.
                    </p>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </h1>
          <p className="text-muted-foreground">
            Gerencie biblioteca padrão e conformidades da sua organização.
          </p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'custom' && (
            <>
              <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
                <Upload className="h-4 w-4 mr-2" /> Importar
              </Button>
              <Button variant="outline" onClick={handleExport} disabled={selectedFrameworks.length === 0}>
                <Download className="h-4 w-4 mr-2" /> Exportar
              </Button>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> Novo Framework
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="custom">Meus Frameworks</TabsTrigger>
          <TabsTrigger value="standard">Biblioteca de Frameworks</TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar frameworks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  {filteredFrameworks.length} de {frameworks.length} frameworks
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {activeTab === 'standard' ? 'Frameworks Globais' : 'Seus Frameworks'}
                </CardTitle>
                {activeTab === 'custom' && selectedFrameworks.length > 0 && (
                  <Button variant="destructive" size="sm" onClick={() => {
                    if (window.confirm('Excluir selecionados?')) selectedFrameworks.forEach(id => handleDeleteFramework(id));
                  }}>
                    <Trash2 className="h-4 w-4 mr-2" /> Excluir Selecionados
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
              ) : filteredFrameworks.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum framework encontrado nesta seção.</p>
                  {activeTab === 'standard' && <p className="text-sm mt-1">A biblioteca padrão é gerenciada pelos administradores da plataforma.</p>}
                  {activeTab === 'custom' && <Button variant="link" onClick={() => setIsCreateModalOpen(true)}>Criar meu primeiro framework</Button>}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      {activeTab === 'custom' && (
                        <TableHead className="w-12">
                          <Checkbox checked={selectedFrameworks.length === filteredFrameworks.length} onCheckedChange={toggleSelectAll} />
                        </TableHead>
                      )}
                      <TableHead>Nome</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Versão</TableHead>
                      {activeTab === 'custom' && <TableHead>Status</TableHead>}
                      <TableHead>Requisitos</TableHead>
                      <TableHead className="w-32">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFrameworks.map((framework) => {
                      const Icon = getFrameworkIcon(framework.tipo);
                      return (
                        <TableRow key={framework.id}>
                          {activeTab === 'custom' && (
                            <TableCell>
                              <Checkbox checked={selectedFrameworks.includes(framework.id)} onCheckedChange={() => toggleFrameworkSelection(framework.id)} />
                            </TableCell>
                          )}
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Icon className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium">{framework.nome}</div>
                                {framework.descricao && <div className="text-sm text-muted-foreground line-clamp-1">{framework.descricao}</div>}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell><Badge variant="outline">{framework.tipo}</Badge></TableCell>
                          <TableCell>{framework.versao}</TableCell>
                          {activeTab === 'custom' && (
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {framework.is_active ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
                                <span className={framework.is_active ? 'text-green-600' : 'text-red-600'}>{framework.is_active ? 'Ativo' : 'Inativo'}</span>
                              </div>
                            </TableCell>
                          )}
                          <TableCell><Badge variant="secondary">{framework.requirements_count || 0}</Badge></TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {activeTab === 'standard' ? (
                                <div className="flex items-center gap-1">
                                  <Button variant="ghost" size="sm" title="Clonar para Meus Frameworks" onClick={() => handleCloneFramework(framework)} disabled={isProcess}>
                                    <Copy className="h-4 w-4 mr-2" /> Clonar
                                  </Button>
                                  {user?.isPlatformAdmin && (
                                    <>
                                      <div className="w-px h-4 bg-border mx-1" />
                                      <Button variant="ghost" size="icon" title="Gerenciar Requisitos (Admin)" onClick={() => { setSelectedFrameworkForRequirements(framework); setRequirementsDialogOpen(true); }}>
                                        <FileText className="h-4 w-4" />
                                      </Button>
                                      <Button variant="ghost" size="icon" title="Editar Metadados (Admin)" onClick={() => openEditModal(framework)}>
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              ) : (
                                <>
                                  <Button variant="ghost" size="icon" title="Gerenciar Requisitos" onClick={() => { setSelectedFrameworkForRequirements(framework); setRequirementsDialogOpen(true); }}>
                                    <FileText className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => openEditModal(framework)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Excluir Framework?</AlertDialogTitle>
                                        <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteFramework(framework.id)} className="bg-destructive hover:bg-destructive/90">Excluir</AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </Tabs>

      {/* Create/Edit/Import Modals kept identical but using isProcess for disable */}
      <Dialog open={isCreateModalOpen || !!editingFramework} onOpenChange={(open) => !open && setIsCreateModalOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingFramework ? 'Editar Framework' : 'Novo Framework'}</DialogTitle>
            <DialogDescription>Preencha os dados do framework.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Nome</Label><Input value={formData.nome} onChange={e => setFormData({ ...formData, nome: e.target.value })} placeholder="Ex: ISO 27001" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Tipo</Label><Select value={formData.tipo} onValueChange={v => setFormData({ ...formData, tipo: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ISO27001">ISO 27001</SelectItem><SelectItem value="SOX">SOX</SelectItem><SelectItem value="LGPD">LGPD</SelectItem><SelectItem value="GDPR">GDPR</SelectItem><SelectItem value="CUSTOM">Customizado</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label>Versão</Label><Input value={formData.versao} onChange={e => setFormData({ ...formData, versao: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Descrição</Label><Textarea value={formData.descricao} onChange={e => setFormData({ ...formData, descricao: e.target.value })} /></div>
            <div className="flex items-center space-x-2"><Checkbox id="active" checked={formData.is_active} onCheckedChange={c => setFormData({ ...formData, is_active: !!c })} /><Label htmlFor="active">Ativo</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsCreateModalOpen(false); setEditingFramework(null); }}>Cancelar</Button>
            <Button onClick={editingFramework ? handleUpdateFramework : handleCreateFramework} disabled={isProcess}>{editingFramework ? 'Atualizar' : 'Criar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Importar</DialogTitle><DialogDescription>Selecione um arquivo JSON.</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <Input type="file" accept=".json" onChange={handleFileChange} />
            {showImportPreview && <div className="max-h-40 overflow-auto border rounded p-2">{importPreview.map((fw, i) => <div key={i} className="text-sm border-b py-1">{fw.nome}</div>)}</div>}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsImportModalOpen(false)}>Cancelar</Button><Button onClick={handleImportFrameworks} disabled={!importPreview.length || isProcess}>Importar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <FrameworkRequirements
        open={requirementsDialogOpen}
        onClose={() => setRequirementsDialogOpen(false)}
        frameworkId={selectedFrameworkForRequirements?.id || null}
        frameworkName={selectedFrameworkForRequirements?.nome || ''}
        isStandard={selectedFrameworkForRequirements?.is_standard}
      />
    </div>
  );
}