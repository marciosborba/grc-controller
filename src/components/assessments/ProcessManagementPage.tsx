import React, { useState, useEffect, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Plus, Edit, Trash2, Search, Filter, Eye, Copy,
  FileText, Workflow, BarChart3, Settings, 
  Calendar, User, RefreshCw, AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { useProcessManagement, ProcessTemplate } from '@/hooks/useProcessManagement';

const AlexProcessDesignerEnhancedModal = React.lazy(() => import('./alex/AlexProcessDesignerEnhancedModal'));

const ProcessManagementPage: React.FC = () => {
  const { listProcesses, deleteProcess, loading } = useProcessManagement();
  const [processes, setProcesses] = useState<ProcessTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedProcess, setSelectedProcess] = useState<ProcessTemplate | null>(null);

  // Load processes on component mount
  useEffect(() => {
    loadProcessesList();
  }, []);

  const loadProcessesList = async () => {
    const processData = await listProcesses();
    setProcesses(processData);
  };

  // Filter processes based on search and category
  const filteredProcesses = processes.filter(process => {
    const matchesSearch = process.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (process.description && process.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || process.framework === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateProcess = () => {
    setSelectedProcess(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleEditProcess = (process: ProcessTemplate) => {
    setSelectedProcess(process);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleDeleteProcess = async (process: ProcessTemplate) => {
    if (window.confirm(`Tem certeza que deseja deletar o processo "${process.name}"?`)) {
      const success = await deleteProcess(process.id);
      if (success) {
        loadProcessesList(); // Reload the list
      }
    }
  };

  const handleDuplicateProcess = (process: ProcessTemplate) => {
    // Create a copy for editing
    const duplicatedProcess = {
      ...process,
      name: `${process.name} (Cópia)`,
      id: undefined // Remove ID so it creates a new one
    };
    setSelectedProcess(duplicatedProcess as any);
    setModalMode('create');
    setShowModal(true);
  };

  const handleModalSave = (data: any) => {
    toast.success('Processo salvo com sucesso!');
    setShowModal(false);
    loadProcessesList(); // Reload the list
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'compliance': return <FileText className="h-4 w-4" />;
      case 'audit': return <Eye className="h-4 w-4" />;
      case 'risk': return <AlertTriangle className="h-4 w-4" />;
      case 'policy': return <Settings className="h-4 w-4" />;
      default: return <Workflow className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'compliance': return 'bg-blue-100 text-blue-800';
      case 'audit': return 'bg-green-100 text-green-800';
      case 'risk': return 'bg-red-100 text-red-800';
      case 'policy': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const categories = ['all', ...Array.from(new Set(processes.map(p => p.framework)))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Processos</h1>
          <p className="text-gray-600">Gerencie seus processos de compliance, auditoria e riscos</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={loadProcessesList} variant="outline" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button onClick={handleCreateProcess} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Novo Processo
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar processos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">Todas as Categorias</option>
                {categories.filter(cat => cat !== 'all').map(category => (
                  <option key={category} value={category}>
                    {category.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Process Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Carregando processos...</p>
          </div>
        </div>
      ) : filteredProcesses.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <Workflow className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Nenhum processo encontrado' 
                  : 'Nenhum processo criado ainda'
                }
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedCategory !== 'all'
                  ? 'Tente ajustar os filtros de busca'
                  : 'Comece criando seu primeiro processo de compliance ou auditoria'
                }
              </p>
              <Button onClick={handleCreateProcess} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Processo
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProcesses.map((process) => (
            <Card key={process.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(process.category || 'custom')}
                    <CardTitle className="text-lg line-clamp-2">{process.name}</CardTitle>
                  </div>
                  <Badge className={getCategoryColor(process.category || 'custom')}>
                    {process.framework}
                  </Badge>
                </div>
                {process.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{process.description}</p>
                )}
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Process Stats */}
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="font-semibold text-blue-600">
                        {process.field_definitions?.fields?.length || 0}
                      </div>
                      <div className="text-gray-500">Campos</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-green-600">
                        {process.workflow_definition?.nodes?.length || 0}
                      </div>
                      <div className="text-gray-500">Etapas</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-purple-600">
                        {process.usage_count}
                      </div>
                      <div className="text-gray-500">Usos</div>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(process.created_at).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      v{process.version}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditProcess(process)}
                      className="flex-1"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDuplicateProcess(process)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteProcess(process)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Process Designer Modal */}
      {showModal && (
        <Suspense fallback={<div>Carregando designer...</div>}>
          <AlexProcessDesignerEnhancedModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            mode={modalMode}
            initialData={selectedProcess}
            onSave={handleModalSave}
          />
        </Suspense>
      )}
    </div>
  );
};

export default ProcessManagementPage;