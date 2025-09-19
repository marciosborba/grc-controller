import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { 
  Plus, Download, Upload, Search, Filter, Edit, Trash2, BookOpen,
  FileDown, FileUp, Settings, Shield, Award, Target, MoreHorizontal,
  CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { supabase } from '@/integrations/supabase/client';

interface FrameworksManagementProps {
  className?: string;
}

export default function FrameworksManagement({ className }: FrameworksManagementProps) {
  const { user, effectiveTenantId } = useAuth();
  
  // Estados básicos
  const [frameworks, setFrameworks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFrameworks, setSelectedFrameworks] = useState([]);
  
  // Estados para modais
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingFramework, setEditingFramework] = useState(null);
  
  // Estados para formulário
  const [formData, setFormData] = useState({
    nome: '',
    tipo_framework: 'CUSTOM',
    versao: '1.0',
    descricao: '',
    is_active: true
  });
  
  // Estados para operações
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  
  // Estados para importação
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [showImportPreview, setShowImportPreview] = useState(false);
  
  // Carregar frameworks
  const loadFrameworks = async () => {
    if (!effectiveTenantId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('assessment_frameworks')
        .select(`
          id, nome, tipo_framework, versao, descricao, 
          is_active, is_standard, created_at,
          domains:assessment_domains(count)
        `)
        .eq('tenant_id', effectiveTenantId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setFrameworks(data || []);
    } catch (error) {
      console.error('Erro ao carregar frameworks:', error);
      toast.error('Erro ao carregar frameworks');
    } finally {
      setLoading(false);
    }
  };
  
  // Criar framework
  const handleCreateFramework = async () => {
    if (!effectiveTenantId || !user) {
      toast.error('Dados de autenticação não disponíveis');
      return;
    }
    
    if (!formData.nome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    
    setIsCreating(true);
    try {
      const frameworkData = {
        tenant_id: effectiveTenantId,
        nome: formData.nome,
        tipo_framework: formData.tipo_framework,
        versao: formData.versao,
        descricao: formData.descricao,
        is_active: formData.is_active,
        is_standard: false,
        created_by: user.id,
        updated_by: user.id
      };
      
      const { error } = await supabase
        .from('assessment_frameworks')
        .insert([frameworkData]);
      
      if (error) throw error;
      
      toast.success('Framework criado com sucesso!');
      setIsCreateModalOpen(false);
      resetForm();
      await loadFrameworks();
      
    } catch (error) {
      console.error('Erro ao criar framework:', error);
      toast.error('Erro ao criar framework: ' + error.message);
    } finally {
      setIsCreating(false);
    }
  };
  
  // Atualizar framework
  const handleUpdateFramework = async () => {
    if (!editingFramework || !effectiveTenantId || !user) return;
    
    setIsCreating(true);
    try {
      const { error } = await supabase
        .from('assessment_frameworks')
        .update({
          nome: formData.nome,
          tipo_framework: formData.tipo_framework,
          versao: formData.versao,
          descricao: formData.descricao,
          is_active: formData.is_active,
          updated_by: user.id
        })
        .eq('id', editingFramework.id)
        .eq('tenant_id', effectiveTenantId);
      
      if (error) throw error;
      
      toast.success('Framework atualizado com sucesso!');
      setEditingFramework(null);
      resetForm();
      await loadFrameworks();
      
    } catch (error) {
      console.error('Erro ao atualizar framework:', error);
      toast.error('Erro ao atualizar framework: ' + error.message);
    } finally {
      setIsCreating(false);
    }
  };
  
  // Excluir framework
  const handleDeleteFramework = async (frameworkId) => {
    if (!effectiveTenantId) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('assessment_frameworks')
        .delete()
        .eq('id', frameworkId)
        .eq('tenant_id', effectiveTenantId);
      
      if (error) throw error;
      
      toast.success('Framework excluído com sucesso!');
      await loadFrameworks();
      
    } catch (error) {
      console.error('Erro ao excluir framework:', error);
      toast.error('Erro ao excluir framework: ' + error.message);
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Exportar frameworks selecionados
  const handleExport = () => {
    const selectedData = frameworks.filter(f => selectedFrameworks.includes(f.id));
    const exportData = {
      frameworks: selectedData,
      exported_at: new Date().toISOString(),
      exported_by: user?.email
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `frameworks_export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success(`${selectedData.length} frameworks exportados!`);
  };

  // Processar arquivo de importação
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      toast.error('Por favor, selecione um arquivo JSON válido');
      return;
    }

    setImportFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        // Validar estrutura do arquivo
        if (!data.frameworks || !Array.isArray(data.frameworks)) {
          toast.error('Formato de arquivo inválido. Esperado: { frameworks: [...] }');
          return;
        }

        // Validar cada framework
        const validFrameworks = data.frameworks.filter((fw: any) => {
          return fw.nome && fw.tipo_framework;
        });

        if (validFrameworks.length === 0) {
          toast.error('Nenhum framework válido encontrado no arquivo');
          return;
        }

        setImportPreview(validFrameworks);
        setShowImportPreview(true);
        toast.success(`${validFrameworks.length} frameworks prontos para importação`);
        
      } catch (error) {
        toast.error('Erro ao ler arquivo JSON: ' + error.message);
      }
    };
    
    reader.readAsText(file);
  };

  // Importar frameworks
  const handleImportFrameworks = async () => {
    if (!effectiveTenantId || !user || importPreview.length === 0) {
      toast.error('Dados necessários não disponíveis');
      return;
    }

    setIsImporting(true);
    let importedCount = 0;
    let errorCount = 0;

    try {
      for (const framework of importPreview) {
        try {
          const frameworkData = {
            tenant_id: effectiveTenantId,
            nome: framework.nome,
            tipo_framework: framework.tipo_framework || 'CUSTOM',
            versao: framework.versao || '1.0',
            descricao: framework.descricao || '',
            is_active: framework.is_active !== undefined ? framework.is_active : true,
            is_standard: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          const { error } = await supabase
            .from('assessment_frameworks')
            .insert([frameworkData]);

          if (error) {
            console.error(`Erro ao importar framework ${framework.nome}:`, error);
            errorCount++;
          } else {
            importedCount++;
          }
        } catch (error) {
          console.error(`Erro ao processar framework ${framework.nome}:`, error);
          errorCount++;
        }
      }

      if (importedCount > 0) {
        toast.success(`${importedCount} frameworks importados com sucesso!`);
        await loadFrameworks(); // Recarregar lista
      }
      
      if (errorCount > 0) {
        toast.warning(`${errorCount} frameworks não puderam ser importados`);
      }

      // Limpar estados de importação
      setImportFile(null);
      setImportPreview([]);
      setShowImportPreview(false);
      setIsImportModalOpen(false);
      
    } catch (error) {
      console.error('Erro geral na importação:', error);
      toast.error('Erro durante a importação de frameworks');
    } finally {
      setIsImporting(false);
    }
  };

  // Resetar importação
  const resetImport = () => {
    setImportFile(null);
    setImportPreview([]);
    setShowImportPreview(false);
  };
  
  // Resetar formulário
  const resetForm = () => {
    setFormData({
      nome: '',
      tipo_framework: 'CUSTOM',
      versao: '1.0',
      descricao: '',
      is_active: true
    });
  };
  
  // Abrir modal de edição
  const openEditModal = (framework) => {
    setEditingFramework(framework);
    setFormData({
      nome: framework.nome,
      tipo_framework: framework.tipo_framework,
      versao: framework.versao,
      descricao: framework.descricao || '',
      is_active: framework.is_active
    });
  };
  
  // Filtrar frameworks
  const filteredFrameworks = frameworks.filter(framework =>
    searchTerm === '' || 
    framework.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    framework.tipo_framework.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Seleção múltipla
  const toggleFrameworkSelection = (frameworkId) => {
    setSelectedFrameworks(prev =>
      prev.includes(frameworkId)
        ? prev.filter(id => id !== frameworkId)
        : [...prev, frameworkId]
    );
  };
  
  const toggleSelectAll = () => {
    setSelectedFrameworks(
      selectedFrameworks.length === filteredFrameworks.length 
        ? [] 
        : filteredFrameworks.map(f => f.id)
    );
  };
  
  // Ícone do tipo de framework
  const getFrameworkIcon = (type) => {
    const icons = {
      'ISO27001': Shield,
      'SOX': Award, 
      'NIST': Target,
      'COBIT': Settings,
      'LGPD': Shield,
      'GDPR': Shield,
      'CUSTOM': BookOpen
    };
    return icons[type] || BookOpen;
  };
  
  // UseEffect para carregar dados
  useEffect(() => {
    if (effectiveTenantId) {
      loadFrameworks();
    }
  }, [effectiveTenantId]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header simplificado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Frameworks</h1>
          <p className="text-muted-foreground">
            {frameworks.length} frameworks • {frameworks.filter(f => f.is_active).length} ativos
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExport}
            disabled={selectedFrameworks.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar ({selectedFrameworks.length})
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Framework
          </Button>
        </div>
      </div>
      
      {/* Barra de busca */}
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
      
      {/* Tabela de frameworks */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Lista de Frameworks</CardTitle>
            {selectedFrameworks.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {selectedFrameworks.length} selecionados
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (window.confirm(`Excluir ${selectedFrameworks.length} frameworks selecionados?`)) {
                      selectedFrameworks.forEach(id => handleDeleteFramework(id));
                      setSelectedFrameworks([]);
                    }
                  }}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir Selecionados
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredFrameworks.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {frameworks.length === 0 ? 'Nenhum framework encontrado' : 'Nenhum resultado'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {frameworks.length === 0 
                  ? 'Comece criando seu primeiro framework'
                  : 'Tente ajustar os filtros de busca'
                }
              </p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Framework
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedFrameworks.length === filteredFrameworks.length && filteredFrameworks.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Versão</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Domínios</TableHead>
                  <TableHead className="w-24">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFrameworks.map((framework) => {
                  const IconComponent = getFrameworkIcon(framework.tipo_framework);
                  
                  return (
                    <TableRow key={framework.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedFrameworks.includes(framework.id)}
                          onCheckedChange={() => toggleFrameworkSelection(framework.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <IconComponent className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{framework.nome}</div>
                            {framework.descricao && (
                              <div className="text-sm text-muted-foreground line-clamp-1">
                                {framework.descricao}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {framework.tipo_framework}
                        </Badge>
                      </TableCell>
                      <TableCell>{framework.versao}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {framework.is_active ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span className={framework.is_active ? 'text-green-600' : 'text-red-600'}>
                            {framework.is_active ? 'Ativo' : 'Inativo'}
                          </span>
                          {framework.is_standard && (
                            <Badge variant="secondary" className="text-xs">Padrão</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {framework.domains?.[0]?.count || 0}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(framework)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir o framework "{framework.nome}"?
                                  Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteFramework(framework.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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
      
      {/* Modal de Criar/Editar Framework */}
      <Dialog 
        open={isCreateModalOpen || !!editingFramework} 
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateModalOpen(false);
            setEditingFramework(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingFramework ? 'Editar Framework' : 'Novo Framework'}
            </DialogTitle>
            <DialogDescription>
              {editingFramework 
                ? 'Atualize as informações do framework' 
                : 'Crie um novo framework de assessment'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Nome do framework"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo</Label>
                <Select 
                  value={formData.tipo_framework}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_framework: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ISO27001">ISO 27001</SelectItem>
                    <SelectItem value="SOX">SOX</SelectItem>
                    <SelectItem value="NIST">NIST</SelectItem>
                    <SelectItem value="COBIT">COBIT</SelectItem>
                    <SelectItem value="LGPD">LGPD</SelectItem>
                    <SelectItem value="GDPR">GDPR</SelectItem>
                    <SelectItem value="CUSTOM">Customizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="versao">Versão</Label>
                <Input
                  id="versao"
                  value={formData.versao}
                  onChange={(e) => setFormData(prev => ({ ...prev, versao: e.target.value }))}
                  placeholder="1.0"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Descrição opcional do framework"
                rows={3}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="is_active">Framework ativo</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsCreateModalOpen(false);
                setEditingFramework(null);
                resetForm();
              }}
              disabled={isCreating}
            >
              Cancelar
            </Button>
            <Button 
              onClick={editingFramework ? handleUpdateFramework : handleCreateFramework}
              disabled={isCreating}
            >
              {isCreating ? 'Salvando...' : editingFramework ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal de Importar Frameworks */}
      <Dialog open={isImportModalOpen} onOpenChange={(open) => {
        setIsImportModalOpen(open);
        if (!open) {
          resetImport();
        }
      }}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Importar Frameworks
            </DialogTitle>
            <DialogDescription>
              Selecione um arquivo JSON para importar frameworks. O arquivo deve seguir o formato de exportação do sistema.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Seleção de arquivo */}
            <div className="space-y-2">
              <Label>Arquivo JSON</Label>
              <Input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                disabled={isImporting}
                className="cursor-pointer"
              />
              <p className="text-sm text-muted-foreground">
                Formato esperado: arquivo JSON com estrutura {`{ "frameworks": [...] }`}
              </p>
            </div>

            {/* Preview dos frameworks */}
            {showImportPreview && importPreview.length > 0 && (
              <div className="space-y-2">
                <Label>Preview - {importPreview.length} frameworks encontrados:</Label>
                <div className="max-h-60 overflow-y-auto border rounded-md p-3 space-y-2 bg-muted/30">
                  {importPreview.map((fw, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-background rounded border">
                      <div className="flex-1">
                        <p className="font-medium">{fw.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          {fw.tipo_framework} • v{fw.versao || '1.0'}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {fw.is_active !== false ? 'Ativo' : 'Inativo'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Informações do arquivo selecionado */}
            {importFile && (
              <div className="text-sm text-muted-foreground p-3 bg-muted/30 rounded">
                <p><strong>Arquivo:</strong> {importFile.name}</p>
                <p><strong>Tamanho:</strong> {(importFile.size / 1024).toFixed(2)} KB</p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsImportModalOpen(false)}
              disabled={isImporting}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleImportFrameworks}
              disabled={!showImportPreview || importPreview.length === 0 || isImporting}
              className="min-w-24"
            >
              {isImporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Importar {importPreview.length > 0 ? `(${importPreview.length})` : ''}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}