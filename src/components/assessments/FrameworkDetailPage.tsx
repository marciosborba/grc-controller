import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, Edit3 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAssessments, Framework } from '@/hooks/useAssessments';

interface FrameworkControl {
  id: string;
  control_code: string;
  control_text: string;
  domain: string;
  control_reference?: string;
}

interface EditingControl {
  id: string;
  control_code: string;
  control_text: string;
  domain: string;
  control_reference: string;
}

const FrameworkDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { frameworks, refetchFrameworks } = useAssessments();
  const isMobile = useIsMobile();
  
  const [framework, setFramework] = useState<Framework | null>(null);
  const [controls, setControls] = useState<FrameworkControl[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddControlDialog, setShowAddControlDialog] = useState(false);
  const [editingControl, setEditingControl] = useState<EditingControl | null>(null);
  const [newControl, setNewControl] = useState({
    control_code: '',
    control_text: '',
    domain: '',
    control_reference: ''
  });

  useEffect(() => {
    if (frameworks.length > 0 && id) {
      const foundFramework = frameworks.find(f => f.id === id);
      setFramework(foundFramework || null);
    }
  }, [frameworks, id]);

  useEffect(() => {
    if (id) {
      fetchControls();
    }
  }, [id]);

  const fetchControls = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('framework_controls')
        .select('*')
        .eq('framework_id', id)
        .order('control_code');

      if (error) throw error;
      setControls(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar controles do framework.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateFramework = async (field: string, value: string) => {
    if (!framework || !id) return;

    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('frameworks')
        .update({ [field]: value })
        .eq('id', id);

      if (error) throw error;

      setFramework(prev => prev ? { ...prev, [field]: value } : null);
      await refetchFrameworks();

      toast({
        title: 'Sucesso',
        description: 'Framework atualizado com sucesso.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar framework.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addControl = async () => {
    if (!id || !newControl.control_code || !newControl.control_text || !newControl.domain) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSaving(true);
      const { data, error } = await supabase
        .from('framework_controls')
        .insert({
          framework_id: id,
          control_code: newControl.control_code,
          control_text: newControl.control_text,
          domain: newControl.domain,
          control_reference: newControl.control_reference || null
        })
        .select()
        .single();

      if (error) throw error;

      setControls(prev => [...prev, data]);
      setNewControl({ control_code: '', control_text: '', domain: '', control_reference: '' });
      setShowAddControlDialog(false);

      toast({
        title: 'Sucesso',
        description: 'Controle adicionado com sucesso.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Erro ao adicionar controle.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateControl = async (controlId: string, updatedData: Partial<FrameworkControl>) => {
    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('framework_controls')
        .update(updatedData)
        .eq('id', controlId);

      if (error) throw error;

      setControls(prev => prev.map(c => 
        c.id === controlId ? { ...c, ...updatedData } : c
      ));

      toast({
        title: 'Sucesso',
        description: 'Controle atualizado com sucesso.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar controle.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const startEditing = (control: FrameworkControl) => {
    setEditingControl({
      id: control.id,
      control_code: control.control_code,
      control_text: control.control_text,
      domain: control.domain,
      control_reference: control.control_reference || ''
    });
  };

  const saveEdit = async () => {
    if (!editingControl) return;

    await updateControl(editingControl.id, {
      control_code: editingControl.control_code,
      control_text: editingControl.control_text,
      domain: editingControl.domain,
      control_reference: editingControl.control_reference || null
    });

    setEditingControl(null);
  };

  const cancelEdit = () => {
    setEditingControl(null);
  };

  const deleteControl = async (controlId: string) => {
    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('framework_controls')
        .delete()
        .eq('id', controlId);

      if (error) throw error;

      setControls(prev => prev.filter(c => c.id !== controlId));

      toast({
        title: 'Sucesso',
        description: 'Controle excluído com sucesso.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Erro ao excluir controle.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!framework || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/assessments/frameworks')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Framework: {framework.name}</h1>
          <div className="flex items-center gap-4 mt-2">
            <Badge variant="secondary">{framework.short_name}</Badge>
            <Badge variant="outline">{framework.category}</Badge>
            <Badge>v{framework.version}</Badge>
          </div>
        </div>
      </div>

      {/* Framework Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Framework</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
            <div>
              <label className="text-sm font-medium">Nome</label>
              <Input
                value={framework.name}
                onChange={(e) => updateFramework('name', e.target.value)}
                disabled={isSaving}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Nome Curto</label>
              <Input
                value={framework.short_name}
                onChange={(e) => updateFramework('short_name', e.target.value)}
                disabled={isSaving}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Categoria</label>
              <Input
                value={framework.category}
                onChange={(e) => updateFramework('category', e.target.value)}
                disabled={isSaving}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Versão</label>
              <Input
                value={framework.version}
                onChange={(e) => updateFramework('version', e.target.value)}
                disabled={isSaving}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Descrição</label>
            <Textarea
              value={framework.description || ''}
              onChange={(e) => updateFramework('description', e.target.value)}
              disabled={isSaving}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Controls Section */}
      <Card>
        <CardHeader className={`flex ${isMobile ? 'flex-col space-y-2' : 'flex-row'} items-center justify-between`}>
          <CardTitle>Controles ({controls.length})</CardTitle>
          <Button
            onClick={() => setShowAddControlDialog(true)}
            className="flex items-center gap-2"
            size={isMobile ? "sm" : "default"}
          >
            <Plus className="h-4 w-4" />
            {isMobile ? 'Adicionar' : 'Adicionar Controle'}
          </Button>
        </CardHeader>
        <CardContent className={isMobile ? "p-2" : "p-0"}>
          <div className={isMobile ? "overflow-x-auto" : ""}>
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Controle</TableHead>
                {!isMobile && <TableHead>Domínio</TableHead>}
                {!isMobile && <TableHead>Referência</TableHead>}
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {controls.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Nenhum controle adicionado ainda.
                    <div className="mt-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowAddControlDialog(true)}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Adicionar primeiro controle
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                controls.map((control) => (
                  <TableRow key={control.id}>
                    <TableCell className="font-medium">
                      {editingControl?.id === control.id ? (
                        <Input
                          value={editingControl.control_code}
                          onChange={(e) => setEditingControl(prev => 
                            prev ? { ...prev, control_code: e.target.value } : null
                          )}
                          className="w-24"
                        />
                      ) : (
                        control.control_code
                      )}
                    </TableCell>
                    <TableCell className="max-w-md">
                      {editingControl?.id === control.id ? (
                        <Textarea
                          value={editingControl.control_text}
                          onChange={(e) => setEditingControl(prev => 
                            prev ? { ...prev, control_text: e.target.value } : null
                          )}
                          className="min-h-[60px] text-sm"
                        />
                      ) : (
                        <div className="text-sm">
                          {control.control_text}
                        </div>
                      )}
                      {isMobile && (
                        <div className="mt-1 space-y-1">
                          {editingControl?.id === control.id ? (
                            <Input
                              value={editingControl.domain}
                              onChange={(e) => setEditingControl(prev => 
                                prev ? { ...prev, domain: e.target.value } : null
                              )}
                              placeholder="Domínio"
                              className="text-xs"
                            />
                          ) : (
                            <Badge variant="outline" className="mr-1 text-xs">
                              {control.domain}
                            </Badge>
                          )}
                          {editingControl?.id === control.id ? (
                            <Input
                              value={editingControl.control_reference}
                              onChange={(e) => setEditingControl(prev => 
                                prev ? { ...prev, control_reference: e.target.value } : null
                              )}
                              placeholder="Referência"
                              className="text-xs"
                            />
                          ) : (
                            control.control_reference && (
                              <div className="text-xs text-muted-foreground">
                                Ref: {control.control_reference}
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </TableCell>
                    {!isMobile && (
                      <TableCell>
                        {editingControl?.id === control.id ? (
                          <Input
                            value={editingControl.domain}
                            onChange={(e) => setEditingControl(prev => 
                              prev ? { ...prev, domain: e.target.value } : null
                            )}
                            className="w-32"
                          />
                        ) : (
                          <Badge variant="outline">{control.domain}</Badge>
                        )}
                      </TableCell>
                    )}
                    {!isMobile && (
                      <TableCell>
                        {editingControl?.id === control.id ? (
                          <Input
                            value={editingControl.control_reference}
                            onChange={(e) => setEditingControl(prev => 
                              prev ? { ...prev, control_reference: e.target.value } : null
                            )}
                            className="w-32"
                          />
                        ) : (
                          control.control_reference || '-'
                        )}
                      </TableCell>
                    )}
                    <TableCell>
                      {editingControl?.id === control.id ? (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={saveEdit}
                            disabled={isSaving}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={cancelEdit}
                          >
                            ✕
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditing(control)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteControl(control.id)}
                            disabled={isSaving}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Control Dialog */}
      <Dialog open={showAddControlDialog} onOpenChange={setShowAddControlDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Controle</DialogTitle>
            <DialogDescription>
              Preencha as informações do controle que será adicionado ao framework.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
              <div>
                <label className="text-sm font-medium">Código do Controle *</label>
                <Input
                  value={newControl.control_code}
                  onChange={(e) => setNewControl(prev => ({ ...prev, control_code: e.target.value }))}
                  placeholder="Ex: A.5.1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Domínio *</label>
                <Input
                  value={newControl.domain}
                  onChange={(e) => setNewControl(prev => ({ ...prev, domain: e.target.value }))}
                  placeholder="Ex: Políticas de Segurança"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Texto do Controle *</label>
              <Textarea
                value={newControl.control_text}
                onChange={(e) => setNewControl(prev => ({ ...prev, control_text: e.target.value }))}
                placeholder="Descreva o objetivo e requisitos do controle..."
                rows={4}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Referência</label>
              <Input
                value={newControl.control_reference}
                onChange={(e) => setNewControl(prev => ({ ...prev, control_reference: e.target.value }))}
                placeholder="Ex: ISO 27001:2022"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddControlDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={addControl}
              disabled={isSaving || !newControl.control_code || !newControl.control_text || !newControl.domain}
            >
              {isSaving ? 'Salvando...' : 'Adicionar Controle'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FrameworkDetailPage;