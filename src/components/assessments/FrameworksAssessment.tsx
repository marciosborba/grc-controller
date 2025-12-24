import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Plus, Search, Edit, Trash2, Eye, Download, Upload, Settings, Target, FileText, BarChart3, Users, Calendar, BookOpen, Copy, ChevronRight, LayoutList } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { supabase } from '@/integrations/supabase/client';
import { AssessmentFramework } from '@/types/assessment';
import { useCRUDRateLimit } from '@/hooks/useRateLimit';
import { seedISO27001, seedLGPD, seedNIST, seedCOBIT, seedITIL, seedPCI, seedGDPR, seedSOX } from '@/utils/marketSeeder';
import FrameworkEditorModal from './FrameworkEditorModal'; // [NEW] Import Editor Modal

export default function FrameworkCenter() {
  const { user } = useAuth();
  const effectiveTenantId = useCurrentTenantId();
  const rateLimitCRUD = useCRUDRateLimit();

  // Top Level State
  const [activeTab, setActiveTab] = useState('meus_frameworks');

  // Data States
  const [frameworks, setFrameworks] = useState<AssessmentFramework[]>([]);
  const hasCheckedLibrary = useRef(false);
  const [libraryFrameworks, setLibraryFrameworks] = useState<AssessmentFramework[]>([]);

  // Selection States
  const [selectedFramework, setSelectedFramework] = useState<AssessmentFramework | null>(null);

  // UI States
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false); // [NEW] Modal State

  // Modals (Basic CRUD)
  const [isCreateFrameworkOpen, setIsCreateFrameworkOpen] = useState(false);
  const [frameworkForm, setFrameworkForm] = useState<Partial<AssessmentFramework>>({
    codigo: '', nome: '', descricao: '', versao: '1.0', tipo_framework: 'CUSTOM' as any, status: 'ativo', publico: false, peso_total: 100
  });
  const [editingFrameworkId, setEditingFrameworkId] = useState<string | null>(null);

  // Loaders
  const loadFrameworks = useCallback(async () => {
    if (!effectiveTenantId) return;
    try {
      const { data, error } = await supabase
        .from('assessment_frameworks')
        .select('*')
        .eq('tenant_id', effectiveTenantId)
        .eq('is_standard', false) // Only custom here
        .order('created_at', { ascending: false });
      if (error) throw error;
      setFrameworks(data || []);
    } catch (err: any) {
      console.error(err);
      toast.error('Erro ao carregar frameworks: ' + (err.message || err.details || JSON.stringify(err)));
    }
    setLoading(false);
  }, [effectiveTenantId]);

  const loadLibrary = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('assessment_frameworks')
        .select('*')
        .eq('is_standard', true)
        .order('nome');
      if (error) throw error;
      setLibraryFrameworks(data || []);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => { loadFrameworks(); loadLibrary(); }, [loadFrameworks, loadLibrary]);

  // Auto-Seeder Logic
  useEffect(() => {
    if (!effectiveTenantId || hasCheckedLibrary.current) return;

    const timer = setTimeout(async () => {
      const required = [
        { code: 'ISO-27001', seeder: seedISO27001, name: 'ISO 27001' },
        { code: 'LGPD-BR', seeder: seedLGPD, name: 'LGPD' },
        { code: 'NIST-CSF-2.0', seeder: seedNIST, name: 'NIST CSF' },
        { code: 'COBIT-2019', seeder: seedCOBIT, name: 'COBIT 2019' },
        { code: 'ITIL-4', seeder: seedITIL, name: 'ITIL 4' },
        { code: 'PCI-DSS-4.0', seeder: seedPCI, name: 'PCI DSS' },
        { code: 'GDPR-EU', seeder: seedGDPR, name: 'GDPR' },
        { code: 'SOX-ITGC', seeder: seedSOX, name: 'SOX' }
      ];

      const missing = required.filter(r => !libraryFrameworks.some(lib => lib.codigo === r.code));

      if (missing.length > 0) {
        console.log(`[AutoSeeder] Missing ${missing.length} frameworks. Seeding...`);

        let seededCount = 0;
        for (const m of missing) {
          try {
            // @ts-ignore
            const result = await m.seeder(effectiveTenantId);
            if (result && typeof result === 'object' && result.action === 'seeded') {
              seededCount++;
            }
          } catch (e) { console.error(`Failed to seed ${m.name}`, e); }
        }

        if (seededCount > 0) {
          toast.success('Biblioteca atualizada automaticamente.');
          loadLibrary();
        }
      }
      hasCheckedLibrary.current = true;
    }, 2000);

    return () => clearTimeout(timer);
  }, [effectiveTenantId, libraryFrameworks, loadLibrary]);

  // Handlers
  const handleOpenEditor = (fw: AssessmentFramework) => {
    setSelectedFramework(fw);
    setIsEditorOpen(true);
  };

  const handleCreateFramework = async () => {
    if (!frameworkForm.nome || !frameworkForm.codigo) return toast.error('Campos obrigatórios faltando');
    try {
      const { error } = await supabase.from('assessment_frameworks').insert({
        ...frameworkForm,
        tenant_id: effectiveTenantId,
        is_standard: false
      });
      if (error) throw error;
      toast.success('Framework criado');
      setIsCreateFrameworkOpen(false);
      loadFrameworks();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleUpdateFramework = async () => {
    if (!editingFrameworkId) return;
    try {
      const { error } = await supabase.from('assessment_frameworks').update({
        ...frameworkForm,
        updated_at: new Date().toISOString()
      }).eq('id', editingFrameworkId);
      if (error) throw error;
      toast.success('Framework atualizado');
      setIsCreateFrameworkOpen(false);
      setEditingFrameworkId(null);
      loadFrameworks();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleCreateOrUpdateFramework = () => {
    if (editingFrameworkId) handleUpdateFramework();
    else handleCreateFramework();
  };

  const handleClone = async (fw: AssessmentFramework) => {
    if (!confirm(`Clonar ${fw.nome}?`)) return;
    const toastId = toast.loading('Clonando framework...');
    try {
      // 1. Clone Framework
      const { data: newFw, error: fwErr } = await supabase.from('assessment_frameworks').insert({
        ...fw,
        id: undefined,
        created_at: undefined,
        tenant_id: effectiveTenantId,
        nome: `${fw.nome} (Cópia)`,
        codigo: `${fw.codigo}_COPY_${new Date().getTime().toString().slice(-4)}`, // Ensure unique code
        is_standard: false
      }).select().single();
      if (fwErr) throw fwErr;

      // 2. Clone Structure (Domains -> Controls -> Questions)
      const { data: domains } = await supabase.from('assessment_domains').select('*').eq('framework_id', fw.id);
      if (domains) {
        for (const d of domains) {
          const { data: newDom } = await supabase.from('assessment_domains').insert({ ...d, id: undefined, framework_id: newFw.id, tenant_id: effectiveTenantId }).select().single();

          if (newDom) {
            const { data: controls } = await supabase.from('assessment_controls').select('*').eq('domain_id', d.id);
            if (controls) {
              for (const c of controls) {
                const { data: newCtrl } = await supabase.from('assessment_controls').insert({ ...c, id: undefined, domain_id: newDom.id, tenant_id: effectiveTenantId }).select().single();

                if (newCtrl) {
                  const { data: questions } = await supabase.from('assessment_questions').select('*').eq('control_id', c.id);
                  if (questions) {
                    const newQs = questions.map(q => ({ ...q, id: undefined, control_id: newCtrl.id, tenant_id: effectiveTenantId }));
                    await supabase.from('assessment_questions').insert(newQs);
                  }
                }
              }
            }
          }
        }
      }

      toast.dismiss(toastId);
      toast.success('Framework clonado com sucesso!');
      loadFrameworks();
    } catch (e: any) {
      toast.dismiss(toastId);
      console.error(e);
      toast.error('Erro ao clonar: ' + e.message);
    }
  };

  const handleDeleteFramework = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este framework?')) return;

    // Check for Assessments dependency
    const { count, error: countErr } = await supabase
      .from('assessments')
      .select('id', { count: 'exact', head: true })
      .eq('framework_id', id);

    if (countErr) {
      toast.error('Erro ao verificar dependências.');
      return;
    }

    if (count && count > 0) {
      toast.error(`Não é possível excluir: Existem ${count} assessments vinculados a este framework.`);
      return;
    }

    const toastId = toast.loading('Excluindo framework e estrutura...');
    try {
      // 1. Get Domains to delete sub-resources
      const { data: domains } = await supabase.from('assessment_domains').select('id').eq('framework_id', id);
      const domainIds = domains?.map(d => d.id) || [];

      if (domainIds.length > 0) {
        // 2. Get Controls
        const { data: controls } = await supabase.from('assessment_controls').select('id').in('domain_id', domainIds);
        const controlIds = controls?.map(c => c.id) || [];

        // 3. Delete Questions
        if (controlIds.length > 0) {
          await supabase.from('assessment_questions').delete().in('control_id', controlIds);
          // 4. Delete Controls
          await supabase.from('assessment_controls').delete().in('domain_id', domainIds);
        }
        // 5. Delete Domains
        await supabase.from('assessment_domains').delete().eq('framework_id', id);
      }

      // 6. Delete Framework
      const { error } = await supabase.from('assessment_frameworks').delete().eq('id', id);
      if (error) throw error;

      toast.dismiss(toastId);
      toast.success('Framework excluído com sucesso');
      loadFrameworks();
    } catch (e: any) {
      toast.dismiss(toastId);
      toast.error('Erro ao excluir: ' + e.message);
    }
  };



  return (
    <div className="space-y-6 p-1">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Framework Center</h2>
          <p className="text-muted-foreground">Gerencie seus frameworks e modelos de mercado.</p>
        </div>
        <Dialog open={isCreateFrameworkOpen} onOpenChange={setIsCreateFrameworkOpen}>
          <DialogTrigger asChild><Button onClick={() => {
            setFrameworkForm({ codigo: '', nome: '', descricao: '', versao: '1.0', tipo_framework: 'CUSTOM' as any, status: 'ativo', publico: false, peso_total: 100 });
            setEditingFrameworkId(null);
            setIsCreateFrameworkOpen(true);
          }}><Plus className="mr-2 h-4 w-4" /> Novo Framework</Button></DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            {/* ... (Reuse existing Form JSX for Basic Info) ... */}
            <DialogHeader><DialogTitle>{editingFrameworkId ? 'Editar Detalhes' : 'Novo Framework'}</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Nome" value={frameworkForm.nome} onChange={e => setFrameworkForm({ ...frameworkForm, nome: e.target.value })} />
                <Input placeholder="Código (Ex: ISO-27001)" value={frameworkForm.codigo} onChange={e => setFrameworkForm({ ...frameworkForm, codigo: e.target.value })} />
              </div>
              <Textarea placeholder="Descrição do Framework" value={frameworkForm.descricao} onChange={e => setFrameworkForm({ ...frameworkForm, descricao: e.target.value })} />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Versão</Label>
                  <Input placeholder="1.0" value={frameworkForm.versao} onChange={e => setFrameworkForm({ ...frameworkForm, versao: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={frameworkForm.status} onValueChange={(v) => setFrameworkForm({ ...frameworkForm, status: v })}>
                    <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                      <SelectItem value="rascunho">Rascunho</SelectItem>
                      <SelectItem value="descontinuado">Descontinuado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={frameworkForm.tipo_framework} onValueChange={(v: any) => setFrameworkForm({ ...frameworkForm, tipo_framework: v })}>
                    <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CUSTOM">Customizado</SelectItem>
                      <SelectItem value="ISO27001">ISO 27001</SelectItem>
                      <SelectItem value="NIST">NIST</SelectItem>
                      <SelectItem value="LGPD">LGPD</SelectItem>
                      <SelectItem value="GDPR">GDPR</SelectItem>
                      <SelectItem value="PCI_DSS">PCI DSS</SelectItem>
                      <SelectItem value="SOX">SOX</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Input placeholder="Ex: Segurança, Privacidade" value={frameworkForm.categoria || ''} onChange={e => setFrameworkForm({ ...frameworkForm, categoria: e.target.value })} />
                </div>
              </div>
            </div>
            <DialogFooter><Button onClick={handleCreateOrUpdateFramework}>Salvar</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <FrameworkEditorModal
        framework={selectedFramework}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onUpdate={loadFrameworks}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent space-x-6">
          <TabsTrigger value="meus_frameworks" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-2">Meus Frameworks</TabsTrigger>
          <TabsTrigger value="biblioteca" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-2">Biblioteca (Mercado)</TabsTrigger>
        </TabsList>

        <TabsContent value="meus_frameworks" className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {frameworks.map(fw => (
              <Card key={fw.id} className="group cursor-pointer hover:border-primary/50 transition-colors" onClick={() => handleOpenEditor(fw)}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <Badge variant="outline">{fw.codigo}</Badge>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <Button size="icon" variant="ghost" className="h-6 w-6" title="Editor de Estrutura" onClick={(e) => { e.stopPropagation(); handleOpenEditor(fw); }}><Edit className="h-3 w-3" /></Button>
                      <Button size="icon" variant="ghost" className="h-6 w-6" title="Propriedades" onClick={(e) => { e.stopPropagation(); setEditingFrameworkId(fw.id); setFrameworkForm(fw); setIsCreateFrameworkOpen(true); }}><Settings className="h-3 w-3" /></Button>
                      <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" title="Excluir" onClick={(e) => { e.stopPropagation(); handleDeleteFramework(fw.id); }}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </div>
                  <CardTitle className="mt-2 line-clamp-1">{fw.nome}</CardTitle>
                  <CardDescription className="line-clamp-2 h-10">{fw.descricao}</CardDescription>
                </CardHeader>

                <CardContent className="pb-4 space-y-4">
                  <div className="flex items-center text-sm text-muted-foreground gap-4">
                    <div className="flex items-center gap-1"><Target className="h-3 w-3" /> <span>v{fw.versao}</span></div>
                    <div className="flex items-center gap-1"><Calendar className="h-3 w-3" /> <span>{new Date(fw.created_at || '').toLocaleDateString()}</span></div>
                  </div>
                  <Button className="w-full" onClick={() => handleOpenEditor(fw)}>
                    <LayoutList className="mr-2 h-4 w-4" /> Gerenciar Estrutura & Questões
                  </Button>
                </CardContent>
              </Card>
            ))}
            {frameworks.length === 0 && <div className="col-span-full text-center py-12 text-muted-foreground">Nenhum framework customizado. Crie um ou clone da biblioteca.</div>}
          </div>
        </TabsContent>

        <TabsContent value="biblioteca" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {libraryFrameworks.map(fw => (
              <Card key={fw.id} className="border-dashed bg-muted/30 hover:bg-muted/50 transition-colors">
                <CardHeader>
                  <div className="flex justify-between">
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300">Mercado</Badge>
                    <Badge variant="outline">{fw.tipo_framework}</Badge>
                  </div>
                  <CardTitle className="mt-2 text-lg">{fw.nome}</CardTitle>
                  <CardDescription className="line-clamp-2">{fw.descricao}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="secondary" onClick={() => handleClone(fw)}>
                    <Copy className="mr-2 h-4 w-4" /> Clonar para Uso
                  </Button>
                </CardContent>
              </Card>
            ))}
            {libraryFrameworks.length === 0 && (
              <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium text-foreground">Biblioteca Vazia</h3>
                <p>Nenhum framework de mercado disponível no momento.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div >
  );
}