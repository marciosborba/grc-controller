import React, { useState, useEffect, useCallback } from 'react';
import { 
  Upload,
  File,
  Image,
  Video,
  Mic,
  Camera,
  Link,
  Brain,
  Eye,
  Download,
  Share,
  Trash2,
  Tag,
  Search,
  Filter,
  Calendar,
  User,
  FileText,
  Shield,
  Zap,
  Bot,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Info,
  Star,
  Clock,
  Hash,
  Database,
  Scan,
  RotateCcw,
  Edit,
  Copy,
  Archive,
  Lock,
  Unlock
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Evidence {
  id: string;
  title: string;
  description: string;
  evidence_type: 'Document' | 'Interview Notes' | 'Screenshots' | 'System Reports' | 'Photographs' | 'Video Recording' | 'Audio Recording' | 'Database Query' | 'Log Files' | 'Configuration Files' | 'Email Correspondence' | 'Third-party Confirmation';
  file_name?: string;
  file_url?: string;
  file_size?: number;
  file_type?: string;
  file_hash?: string;
  collected_by: string;
  collected_at: string;
  collection_method: string;
  reliability: 'High' | 'Medium' | 'Low';
  relevance: 'High' | 'Medium' | 'Low';
  sufficiency: 'Sufficient' | 'Insufficient';
  evidence_source: string;
  source_contact?: string;
  chain_of_custody: ChainOfCustodyEntry[];
  analysis_performed?: string;
  conclusions?: string;
  retention_required: boolean;
  retention_period?: number;
  destruction_date?: string;
  confidentiality_level: 'Public' | 'Internal' | 'Confidential' | 'Restricted';
  access_restrictions: string[];
  ai_analyzed: boolean;
  ai_extracted_metadata?: any;
  ai_content_summary?: string;
  ai_confidence_score?: number;
  tags: string[];
  procedure_id?: string;
  finding_id?: string;
  working_paper_id?: string;
  status: 'Active' | 'Archived' | 'Under Review' | 'Destroyed';
  audit_id: string;
}

interface ChainOfCustodyEntry {
  person: string;
  date: string;
  action: string;
  notes?: string;
}

interface AIAnalysisResult {
  confidence: number;
  extracted_text?: string;
  detected_entities?: string[];
  sentiment?: string;
  key_topics?: string[];
  compliance_flags?: string[];
  risk_indicators?: string[];
  metadata: Record<string, any>;
  processing_time: number;
}

interface EvidenceFilter {
  search: string;
  type: string;
  reliability: string;
  relevance: string;
  source: string;
  date_from?: string;
  date_to?: string;
  ai_analyzed?: boolean;
  confidentiality: string;
  status: string;
}

const AuditEvidenceManager: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('evidence');
  const [selectedEvidence, setSelectedEvidence] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [aiAutoAnalysis, setAiAutoAnalysis] = useState(true);
  
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [filters, setFilters] = useState<EvidenceFilter>({
    search: '',
    type: 'all',
    reliability: 'all',
    relevance: 'all',
    source: 'all',
    confidentiality: 'all',
    status: 'all'
  });

  // Mock data initialization
  useEffect(() => {
    const mockEvidence: Evidence[] = [
      {
        id: '1',
        title: 'Matriz de Responsabilidades - Contas a Receber',
        description: 'Documento oficial definindo responsabilidades no processo de AR',
        evidence_type: 'Document',
        file_name: 'matriz_responsabilidades_ar.pdf',
        file_url: '/files/evidence/matriz_ar.pdf',
        file_size: 2048000,
        file_type: 'application/pdf',
        file_hash: 'sha256:a1b2c3d4e5f6...',
        collected_by: 'Ana Silva',
        collected_at: '2025-01-19T10:30:00Z',
        collection_method: 'Solicitação formal ao gestor do processo',
        reliability: 'High',
        relevance: 'High',
        sufficiency: 'Sufficient',
        evidence_source: 'Departamento Financeiro',
        source_contact: 'Maria Santos - Gerente Financeiro',
        chain_of_custody: [
          {
            person: 'Ana Silva',
            date: '2025-01-19T10:30:00Z',
            action: 'Coleta inicial',
            notes: 'Documento fornecido em reunião'
          },
          {
            person: 'Ana Silva',
            date: '2025-01-19T10:45:00Z',
            action: 'Upload ao sistema',
            notes: 'Verificação de integridade realizada'
          }
        ],
        analysis_performed: 'Análise de completude e atualização das responsabilidades definidas',
        conclusions: 'Documento atualizado e completo, reflete adequadamente as responsabilidades atuais',
        retention_required: true,
        retention_period: 7,
        confidentiality_level: 'Internal',
        access_restrictions: ['Auditores', 'Gestão Financeira'],
        ai_analyzed: true,
        ai_extracted_metadata: {
          document_type: 'policy',
          last_update: '2024-06-15',
          approval_status: 'approved',
          key_roles: ['AR Analyst', 'AR Supervisor', 'Credit Manager'],
          process_coverage: 95,
          compliance_frameworks: ['SOX', 'COSO']
        },
        ai_content_summary: 'Documento define claramente 12 responsabilidades críticas no processo de AR, com segregação adequada entre criação, aprovação e monitoramento. Identifica 3 pontos de controle principais.',
        ai_confidence_score: 94,
        tags: ['SOX', 'Controles Internos', 'Segregação de Funções', 'AR'],
        procedure_id: 'proc_001',
        audit_id: 'AUD-2025-0001',
        status: 'Active'
      },
      {
        id: '2',
        title: 'Screenshots - Perfis de Usuário SAP',
        description: 'Capturas de tela dos perfis de acesso dos usuários testados',
        evidence_type: 'Screenshots',
        file_name: 'perfis_usuarios_sap.png',
        file_url: '/files/evidence/perfis_sap.png',
        file_size: 1536000,
        file_type: 'image/png',
        file_hash: 'sha256:b2c3d4e5f6a1...',
        collected_by: 'Ana Silva',
        collected_at: '2025-01-19T14:20:00Z',
        collection_method: 'Captura de tela durante teste de sistema',
        reliability: 'High',
        relevance: 'High',
        sufficiency: 'Sufficient',
        evidence_source: 'Sistema SAP ERP',
        chain_of_custody: [
          {
            person: 'Ana Silva',
            date: '2025-01-19T14:20:00Z',
            action: 'Captura de tela',
            notes: 'Screenshots dos perfis JSILVA e MCARLOS'
          }
        ],
        analysis_performed: 'Análise dos perfis de acesso para identificar segregação de funções',
        conclusions: 'Identificadas inconsistências nos perfis - mesmo usuário com autorização de criação e aprovação',
        retention_required: true,
        retention_period: 7,
        confidentiality_level: 'Confidential',
        access_restrictions: ['Auditores'],
        ai_analyzed: true,
        ai_extracted_metadata: {
          users_captured: ['JSILVA', 'MCARLOS'],
          access_levels: ['CREATE', 'APPROVE', 'VIEW'],
          inconsistencies_detected: 2,
          risk_level: 'HIGH',
          affected_transactions: 'Financial Posting'
        },
        ai_content_summary: 'Screenshots mostram 2 usuários com perfis incompatíveis para segregação de funções. Usuário JSILVA possui autorização F-02 e F-03 simultaneamente.',
        ai_confidence_score: 98,
        tags: ['SAP', 'Acesso', 'Segregação', 'Screenshots'],
        procedure_id: 'proc_001',
        finding_id: 'find_001',
        audit_id: 'AUD-2025-0001',
        status: 'Active'
      },
      {
        id: '3',
        title: 'Log de Atividades - Sistema de Backup',
        description: 'Logs de backup dos últimos 3 meses para avaliação de continuidade',
        evidence_type: 'Log Files',
        file_name: 'backup_logs_q4_2024.log',
        file_url: '/files/evidence/backup_logs.log',
        file_size: 5242880,
        file_type: 'text/plain',
        file_hash: 'sha256:c3d4e5f6a1b2...',
        collected_by: 'Carlos Mendes',
        collected_at: '2025-01-20T09:15:00Z',
        collection_method: 'Extração automatizada dos logs de sistema',
        reliability: 'High',
        relevance: 'High',
        sufficiency: 'Sufficient',
        evidence_source: 'Servidor de Backup Veeam',
        source_contact: 'Roberto Silva - Administrador de TI',
        chain_of_custody: [
          {
            person: 'Carlos Mendes',
            date: '2025-01-20T09:15:00Z',
            action: 'Extração de logs',
            notes: 'Logs extraídos via script automatizado'
          }
        ],
        analysis_performed: 'Análise de consistência e frequência dos backups realizados',
        retention_required: true,
        retention_period: 5,
        confidentiality_level: 'Internal',
        access_restrictions: ['Auditores', 'TI'],
        ai_analyzed: true,
        ai_extracted_metadata: {
          total_backup_sessions: 92,
          success_rate: 97.8,
          failed_sessions: 2,
          average_duration: '4.2 hours',
          data_volume: '12.5TB',
          critical_failures: 0,
          trends: 'stable'
        },
        ai_content_summary: 'Logs mostram 97.8% de taxa de sucesso em backups. 2 falhas identificadas por problemas de rede, ambas reprocessadas com sucesso.',
        ai_confidence_score: 91,
        tags: ['Backup', 'Logs', 'Continuidade', 'TI'],
        procedure_id: 'proc_003',
        audit_id: 'AUD-2025-0002',
        status: 'Active'
      },
      {
        id: '4',
        title: 'Entrevista - Gerente de Crédito',
        description: 'Notas da entrevista sobre processo de aprovação de crédito',
        evidence_type: 'Interview Notes',
        collected_by: 'Marina Costa',
        collected_at: '2025-01-18T15:30:00Z',
        collection_method: 'Entrevista presencial estruturada',
        reliability: 'Medium',
        relevance: 'High',
        sufficiency: 'Sufficient',
        evidence_source: 'João Pereira - Gerente de Crédito',
        chain_of_custody: [
          {
            person: 'Marina Costa',
            date: '2025-01-18T15:30:00Z',
            action: 'Entrevista realizada',
            notes: 'Entrevista de 45 minutos com gravação autorizada'
          }
        ],
        analysis_performed: 'Análise das respostas sobre controles de aprovação de crédito',
        conclusions: 'Processo bem definido, mas carece de documentação formal para alguns cenários',
        retention_required: true,
        retention_period: 7,
        confidentiality_level: 'Confidential',
        access_restrictions: ['Auditores'],
        ai_analyzed: false,
        tags: ['Entrevista', 'Crédito', 'Controles'],
        procedure_id: 'proc_002',
        audit_id: 'AUD-2025-0001',
        status: 'Under Review'
      }
    ];

    setEvidence(mockEvidence);
  }, []);

  const performAIAnalysis = async (evidenceId: string) => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const analysisResult: AIAnalysisResult = {
      confidence: Math.floor(Math.random() * 20) + 80, // 80-100%
      extracted_text: 'Texto extraído automaticamente do documento...',
      detected_entities: ['Usuários', 'Perfis SAP', 'Transações Financeiras'],
      sentiment: 'Neutral',
      key_topics: ['Segregação de Funções', 'Controles de Acesso', 'SOX Compliance'],
      compliance_flags: ['SOX 404', 'Segregação Inadequada'],
      risk_indicators: ['Conflito de Funções', 'Acesso Excessivo'],
      metadata: {
        document_pages: 12,
        word_count: 2456,
        last_modified: '2024-06-15',
        author: 'Sistema Automático'
      },
      processing_time: 2.8
    };
    
    setEvidence(prev => prev.map(item => 
      item.id === evidenceId 
        ? { 
            ...item, 
            ai_analyzed: true,
            ai_extracted_metadata: analysisResult.metadata,
            ai_content_summary: 'Análise automatizada concluída. Documento processado com sucesso.',
            ai_confidence_score: analysisResult.confidence
          }
        : item
    ));

    setIsAnalyzing(false);
    
    toast({
      title: 'Análise de IA Concluída',
      description: `Evidência analisada com ${analysisResult.confidence}% de confiança.`,
    });
  };

  const handleFileUpload = useCallback(async (files: FileList | null, evidenceType: Evidence['evidence_type']) => {
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newEvidence: Evidence = {
        id: (evidence.length + i + 1).toString(),
        title: file.name,
        description: `Evidência coletada via upload - ${file.name}`,
        evidence_type: evidenceType,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        file_hash: `sha256:${Math.random().toString(36).substring(2, 15)}...`,
        collected_by: 'Usuário Atual',
        collected_at: new Date().toISOString(),
        collection_method: 'Upload via interface web',
        reliability: 'High',
        relevance: 'High',
        sufficiency: 'Sufficient',
        evidence_source: 'Upload do Usuário',
        chain_of_custody: [{
          person: 'Usuário Atual',
          date: new Date().toISOString(),
          action: 'Upload inicial',
          notes: `Arquivo ${file.name} carregado via interface`
        }],
        retention_required: true,
        retention_period: 7,
        confidentiality_level: 'Internal',
        access_restrictions: ['Auditores'],
        ai_analyzed: false,
        tags: ['Upload', 'Novo'],
        audit_id: 'AUD-2025-0001',
        status: 'Active'
      };
      
      setEvidence(prev => [...prev, newEvidence]);
      
      // Auto AI analysis if enabled
      if (aiAutoAnalysis) {
        setTimeout(() => performAIAnalysis(newEvidence.id), 500);
      }
    }
    
    setIsUploading(false);
    
    toast({
      title: 'Upload Concluído',
      description: `${files.length} arquivo(s) carregado(s) com sucesso.`,
    });
  }, [evidence.length, aiAutoAnalysis]);

  const updateFilter = (field: keyof EvidenceFilter, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      type: 'all',
      reliability: 'all',
      relevance: 'all',
      source: 'all',
      confidentiality: 'all',
      status: 'all'
    });
  };

  const bulkAction = (action: 'analyze' | 'archive' | 'delete' | 'export') => {
    if (selectedItems.length === 0) {
      toast({
        title: 'Nenhum Item Selecionado',
        description: 'Selecione pelo menos um item para executar ação em lote.',
        variant: 'destructive'
      });
      return;
    }

    let actionName = '';
    switch (action) {
      case 'analyze': actionName = 'analisar com IA'; break;
      case 'archive': actionName = 'arquivar'; break;
      case 'delete': actionName = 'excluir'; break;
      case 'export': actionName = 'exportar'; break;
    }

    toast({
      title: 'Ação em Lote',
      description: `${selectedItems.length} itens serão processados para ${actionName}.`,
    });

    // Simulate bulk action
    if (action === 'analyze') {
      selectedItems.forEach(id => {
        setTimeout(() => performAIAnalysis(id), Math.random() * 2000);
      });
    }

    setSelectedItems([]);
    setBulkMode(false);
  };

  const getTypeIcon = (type: Evidence['evidence_type']) => {
    const icons = {
      'Document': FileText,
      'Interview Notes': Mic,
      'Screenshots': Image,
      'System Reports': Database,
      'Photographs': Camera,
      'Video Recording': Video,
      'Audio Recording': Mic,
      'Database Query': Database,
      'Log Files': File,
      'Configuration Files': File,
      'Email Correspondence': File,
      'Third-party Confirmation': File
    };
    return icons[type] || File;
  };

  const getReliabilityColor = (reliability: string) => {
    const colors = {
      'High': 'text-green-600 bg-green-100 border-green-200',
      'Medium': 'text-yellow-600 bg-yellow-100 border-yellow-200',
      'Low': 'text-red-600 bg-red-100 border-red-200'
    };
    return colors[reliability as keyof typeof colors] || 'text-gray-600 bg-gray-100 border-gray-200';
  };

  const getConfidentialityColor = (level: string) => {
    const colors = {
      'Public': 'text-blue-600 bg-blue-100 border-blue-200',
      'Internal': 'text-green-600 bg-green-100 border-green-200',
      'Confidential': 'text-orange-600 bg-orange-100 border-orange-200',
      'Restricted': 'text-red-600 bg-red-100 border-red-200'
    };
    return colors[level as keyof typeof colors] || 'text-gray-600 bg-gray-100 border-gray-200';
  };

  const filteredEvidence = evidence.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                         item.description.toLowerCase().includes(filters.search.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(filters.search.toLowerCase()));
    const matchesType = filters.type === 'all' || item.evidence_type === filters.type;
    const matchesReliability = filters.reliability === 'all' || item.reliability === filters.reliability;
    const matchesRelevance = filters.relevance === 'all' || item.relevance === filters.relevance;
    const matchesConfidentiality = filters.confidentiality === 'all' || item.confidentiality_level === filters.confidentiality;
    const matchesStatus = filters.status === 'all' || item.status === filters.status;
    
    return matchesSearch && matchesType && matchesReliability && matchesRelevance && matchesConfidentiality && matchesStatus;
  });

  const evidenceTypes = Array.from(new Set(evidence.map(e => e.evidence_type)));
  const evidenceSources = Array.from(new Set(evidence.map(e => e.evidence_source)));

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Database className="h-6 w-6 text-blue-600" />
            Gestão de Evidências IA
          </h1>
          <p className="text-gray-600 mt-1">
            Coleta, análise e gestão inteligente de evidências de auditoria
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch
              checked={aiAutoAnalysis}
              onCheckedChange={setAiAutoAnalysis}
            />
            <Label className="text-sm">Auto-análise IA</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={bulkMode}
              onCheckedChange={setBulkMode}
            />
            <Label className="text-sm">Modo Lote</Label>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Upload className="h-4 w-4 mr-2" />
                Adicionar Evidência
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Tipo de Evidência</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  id="upload-documents"
                  onChange={(e) => handleFileUpload(e.target.files, 'Document')}
                />
                <label htmlFor="upload-documents" className="flex items-center cursor-pointer">
                  <FileText className="h-4 w-4 mr-2" />
                  Documentos
                </label>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  id="upload-images"
                  onChange={(e) => handleFileUpload(e.target.files, 'Screenshots')}
                />
                <label htmlFor="upload-images" className="flex items-center cursor-pointer">
                  <Image className="h-4 w-4 mr-2" />
                  Imagens/Screenshots
                </label>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <input
                  type="file"
                  multiple
                  accept="audio/*"
                  className="hidden"
                  id="upload-audio"
                  onChange={(e) => handleFileUpload(e.target.files, 'Audio Recording')}
                />
                <label htmlFor="upload-audio" className="flex items-center cursor-pointer">
                  <Mic className="h-4 w-4 mr-2" />
                  Gravações de Áudio
                </label>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <input
                  type="file"
                  multiple
                  accept="video/*"
                  className="hidden"
                  id="upload-video"
                  onChange={(e) => handleFileUpload(e.target.files, 'Video Recording')}
                />
                <label htmlFor="upload-video" className="flex items-center cursor-pointer">
                  <Video className="h-4 w-4 mr-2" />
                  Vídeos
                </label>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Evidências</p>
                <p className="text-2xl font-bold text-blue-600">{evidence.length}</p>
              </div>
              <Database className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Analisadas por IA</p>
                <p className="text-2xl font-bold text-purple-600">
                  {evidence.filter(e => e.ai_analyzed).length}
                </p>
              </div>
              <Brain className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Alta Confiabilidade</p>
                <p className="text-2xl font-bold text-green-600">
                  {evidence.filter(e => e.reliability === 'High').length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tamanho Total</p>
                <p className="text-2xl font-bold text-orange-600">
                  {(evidence.reduce((sum, e) => sum + (e.file_size || 0), 0) / 1024 / 1024).toFixed(1)}MB
                </p>
              </div>
              <Archive className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Confiança IA Média</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {Math.round(evidence.filter(e => e.ai_confidence_score).reduce((sum, e) => sum + (e.ai_confidence_score || 0), 0) / evidence.filter(e => e.ai_confidence_score).length)}%
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Actions */}
      {bulkMode && selectedItems.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">
                  {selectedItems.length} itens selecionados
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => bulkAction('analyze')}
                  className="border-blue-200 text-blue-700 hover:bg-blue-100"
                >
                  <Brain className="h-3 w-3 mr-1" />
                  Analisar IA
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => bulkAction('archive')}
                  className="border-blue-200 text-blue-700 hover:bg-blue-100"
                >
                  <Archive className="h-3 w-3 mr-1" />
                  Arquivar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => bulkAction('export')}
                  className="border-blue-200 text-blue-700 hover:bg-blue-100"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Exportar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedItems([])}
                  className="border-red-200 text-red-700 hover:bg-red-50"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-1 sm:grid-cols-3 w-full">
          <TabsTrigger value="evidence">Evidências</TabsTrigger>
          <TabsTrigger value="analysis">Análise IA</TabsTrigger>
          <TabsTrigger value="chain">Cadeia de Custódia</TabsTrigger>
        </TabsList>

        <TabsContent value="evidence" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar evidências..."
                      value={filters.search}
                      onChange={(e) => updateFilter('search', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={filters.type} onValueChange={(value) => updateFilter('type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Tipos</SelectItem>
                    {evidenceTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filters.reliability} onValueChange={(value) => updateFilter('reliability', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Confiabilidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="High">Alta</SelectItem>
                    <SelectItem value="Medium">Média</SelectItem>
                    <SelectItem value="Low">Baixa</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.confidentiality} onValueChange={(value) => updateFilter('confidentiality', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Confidencialidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="Public">Pública</SelectItem>
                    <SelectItem value="Internal">Interna</SelectItem>
                    <SelectItem value="Confidential">Confidencial</SelectItem>
                    <SelectItem value="Restricted">Restrita</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" onClick={clearFilters}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Limpar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Evidence Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredEvidence.map((item) => {
              const TypeIcon = getTypeIcon(item.evidence_type);
              return (
                <Card 
                  key={item.id} 
                  className={cn(
                    "hover:shadow-md transition-shadow",
                    selectedEvidence === item.id ? "ring-2 ring-blue-500" : "",
                    selectedItems.includes(item.id) ? "ring-2 ring-green-500 bg-green-50" : ""
                  )}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2 flex-1">
                        {bulkMode && (
                          <Checkbox
                            checked={selectedItems.includes(item.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedItems(prev => [...prev, item.id]);
                              } else {
                                setSelectedItems(prev => prev.filter(id => id !== item.id));
                              }
                            }}
                            className="mt-1"
                          />
                        )}
                        <TypeIcon className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg truncate">{item.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {item.evidence_type}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="outline" className={getReliabilityColor(item.reliability)}>
                          {item.reliability}
                        </Badge>
                        {item.ai_analyzed && (
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                            <Brain className="h-3 w-3 mr-1" />
                            IA
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>

                    {/* File info */}
                    {item.file_name && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <File className="h-3 w-3" />
                        <span className="truncate">{item.file_name}</span>
                        {item.file_size && (
                          <span>({(item.file_size / 1024).toFixed(1)}KB)</span>
                        )}
                      </div>
                    )}

                    {/* Quality indicators */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Relevância:</span>
                        <Badge variant="outline" className={getReliabilityColor(item.relevance)}>
                          {item.relevance}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Suficiência:</span>
                        <Badge variant="outline" className={
                          item.sufficiency === 'Sufficient' 
                            ? 'text-green-600 bg-green-100 border-green-200'
                            : 'text-red-600 bg-red-100 border-red-200'
                        }>
                          {item.sufficiency}
                        </Badge>
                      </div>
                    </div>

                    {/* AI Analysis */}
                    {item.ai_analyzed && item.ai_confidence_score && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Confiança IA:</span>
                          <span className="font-medium">{item.ai_confidence_score}%</span>
                        </div>
                        <Progress value={item.ai_confidence_score} className="h-2" />
                        {item.ai_content_summary && (
                          <p className="text-xs text-purple-700 bg-purple-50 p-2 rounded">
                            {item.ai_content_summary.substring(0, 100)}...
                          </p>
                        )}
                      </div>
                    )}

                    {/* Tags */}
                    {item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {item.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            <Hash className="h-2 w-2 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                        {item.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{item.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="pt-2 border-t border-gray-200 space-y-1 text-xs text-gray-500">
                      <div className="flex items-center justify-between">
                        <span>Coletado por: {item.collected_by}</span>
                        <Badge variant="outline" className={getConfidentialityColor(item.confidentiality_level)}>
                          {item.confidentiality_level}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(item.collected_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedEvidence(item.id)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex gap-1">
                        {!item.ai_analyzed && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => performAIAnalysis(item.id)}
                            disabled={isAnalyzing}
                            className="border-purple-200 text-purple-700 hover:bg-purple-50"
                          >
                            <Brain className="h-3 w-3 mr-1" />
                            Analisar IA
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredEvidence.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  Nenhuma evidência encontrada com os filtros aplicados.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                Análise Avançada de IA
              </CardTitle>
              <CardDescription>
                Resultados detalhados da análise automatizada de evidências
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {evidence.filter(e => e.ai_analyzed).map((item) => (
                  <Card key={item.id} className="border-l-4 border-l-purple-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">{item.title}</h3>
                          <p className="text-sm text-gray-600">{item.evidence_type}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {item.ai_confidence_score}% confiança
                          </Badge>
                          <Star className="h-4 w-4 text-yellow-500" />
                        </div>
                      </div>

                      {item.ai_content_summary && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">Resumo da Análise:</p>
                          <p className="text-sm text-gray-600 bg-purple-50 p-2 rounded">
                            {item.ai_content_summary}
                          </p>
                        </div>
                      )}

                      {item.ai_extracted_metadata && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Metadados Extraídos:</p>
                            <div className="space-y-1 text-sm">
                              {Object.entries(item.ai_extracted_metadata).map(([key, value]) => (
                                <div key={key} className="flex justify-between">
                                  <span className="text-gray-600 capitalize">{key.replace('_', ' ')}:</span>
                                  <span className="font-medium">
                                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Indicadores de Qualidade:</p>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span>Confiabilidade:</span>
                                <Badge variant="outline" className={getReliabilityColor(item.reliability)}>
                                  {item.reliability}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span>Relevância:</span>
                                <Badge variant="outline" className={getReliabilityColor(item.relevance)}>
                                  {item.relevance}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span>Suficiência:</span>
                                <Badge variant="outline" className={
                                  item.sufficiency === 'Sufficient' 
                                    ? 'text-green-600 bg-green-100 border-green-200'
                                    : 'text-red-600 bg-red-100 border-red-200'
                                }>
                                  {item.sufficiency}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                
                {evidence.filter(e => e.ai_analyzed).length === 0 && (
                  <div className="text-center py-8">
                    <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      Nenhuma evidência foi analisada por IA ainda.
                    </p>
                    <Button
                      className="mt-4"
                      onClick={() => {
                        const unanalyzed = evidence.find(e => !e.ai_analyzed);
                        if (unanalyzed) performAIAnalysis(unanalyzed.id);
                      }}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Analisar Primeira Evidência
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chain" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                Cadeia de Custódia
              </CardTitle>
              <CardDescription>
                Rastreamento completo do manuseio de evidências
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {evidence.filter(e => e.chain_of_custody.length > 0).map((item) => (
                  <Card key={item.id} className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-medium text-gray-900">{item.title}</h3>
                          <p className="text-sm text-gray-600">{item.evidence_type}</p>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {item.chain_of_custody.length} registros
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        {item.chain_of_custody.map((entry, index) => (
                          <div key={index} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-b-0">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-green-700">{index + 1}</span>
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-gray-900">{entry.person}</span>
                                <span className="text-sm text-gray-500">
                                  {new Date(entry.date).toLocaleString('pt-BR')}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 mb-1">{entry.action}</p>
                              {entry.notes && (
                                <p className="text-xs text-gray-500 italic">{entry.notes}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {evidence.filter(e => e.chain_of_custody.length > 0).length === 0 && (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      Nenhuma evidência com cadeia de custódia registrada.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuditEvidenceManager;