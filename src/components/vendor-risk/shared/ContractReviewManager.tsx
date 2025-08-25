import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  FileText,
  Upload,
  Edit3,
  Settings,
  Shield,
  Lock,
  Clock,
  Eye,
  AlertTriangle,
  CheckCircle,
  Download,
  Trash2,
  Save,
  RefreshCw,
  Plus,
  Edit,
  X
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { useAIProviders } from '@/hooks/useAIProviders';

// Tipos para análise contratual
export type AnalysisMethod = 'document' | 'text';
export type DocumentType = 'pdf' | 'doc' | 'docx';
export type AnalysisStatus = 'pending' | 'analyzing' | 'completed' | 'error';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface AnalysisPoint {
  id: string;
  category: string;
  title: string;
  description: string;
  weight: number;
  enabled: boolean;
  keywords: string[];
}

export interface ContractAnalysis {
  id: string;
  vendorId: string;
  method: AnalysisMethod;
  documentName?: string;
  documentSize?: number;
  contractText?: string;
  analysisPoints: AnalysisPoint[];
  customPrompt: string;
  status: AnalysisStatus;
  result?: AnalysisResult;
  createdAt: string;
  analyzedAt?: string;
}

export interface AnalysisResult {
  documentName?: string;
  isValidContract?: boolean;
  documentType?: string;
  overallScore: number;
  riskLevel: RiskLevel;
  summary: string;
  findings: Finding[];
  recommendations: string[];
  missingClauses: string[];
  redFlags: string[];
}

export interface Finding {
  id: string;
  category: string;
  title: string;
  description: string;
  riskLevel: RiskLevel;
  recommendation: string;
  clauseReference?: string;
}

interface ContractReviewManagerProps {
  vendorId?: string;
  onAnalysisComplete: (completed: boolean, analysis?: ContractAnalysis) => void;
  onAnalysisChange?: (analysis: ContractAnalysis) => void;
  allowSkip?: boolean;
  onSkip?: () => void;
  onContractReviewComplete?: (completed: boolean) => void;
}

// Pontos de análise padrão
const DEFAULT_ANALYSIS_POINTS: AnalysisPoint[] = [
  {
    id: 'data_protection',
    category: 'Proteção de Dados',
    title: 'Cláusulas de Proteção de Dados',
    description: 'Verificar conformidade com LGPD/GDPR, tratamento de dados pessoais, direitos dos titulares',
    weight: 10,
    enabled: true,
    keywords: ['dados pessoais', 'LGPD', 'GDPR', 'privacidade', 'titular', 'consentimento', 'anonimização']
  },
  {
    id: 'information_security',
    category: 'Segurança da Informação',
    title: 'Cláusulas de Segurança da Informação',
    description: 'Avaliar medidas de segurança, controles de acesso, criptografia, backup',
    weight: 10,
    enabled: true,
    keywords: ['segurança', 'criptografia', 'backup', 'acesso', 'autenticação', 'firewall', 'antivírus']
  },
  {
    id: 'confidentiality',
    category: 'Confidencialidade',
    title: 'Cláusulas de Confidencialidade e NDA',
    description: 'Verificar acordos de não divulgação, proteção de informações confidenciais',
    weight: 9,
    enabled: true,
    keywords: ['confidencial', 'NDA', 'não divulgação', 'sigilo', 'propriedade intelectual']
  },
  {
    id: 'sla_availability',
    category: 'SLA e Disponibilidade',
    title: 'Níveis de Serviço e Disponibilidade',
    description: 'Analisar SLAs, uptime, tempo de resposta, penalidades por indisponibilidade',
    weight: 8,
    enabled: true,
    keywords: ['SLA', 'disponibilidade', 'uptime', 'tempo de resposta', 'penalidade', 'indisponibilidade']
  },
  {
    id: 'liability_limitation',
    category: 'Responsabilidade',
    title: 'Limitação de Responsabilidade',
    description: 'Verificar cláusulas de limitação de responsabilidade, indenizações, seguros',
    weight: 9,
    enabled: true,
    keywords: ['responsabilidade', 'indenização', 'seguro', 'limitação', 'danos', 'prejuízos']
  },
  {
    id: 'termination',
    category: 'Rescisão',
    title: 'Cláusulas de Rescisão',
    description: 'Analisar condições de rescisão, prazos de aviso, devolução de dados',
    weight: 7,
    enabled: true,
    keywords: ['rescisão', 'término', 'cancelamento', 'aviso prévio', 'devolução de dados']
  },
  {
    id: 'compliance',
    category: 'Compliance',
    title: 'Conformidade Regulatória',
    description: 'Verificar aderência a normas, certificações, auditorias',
    weight: 8,
    enabled: true,
    keywords: ['compliance', 'conformidade', 'auditoria', 'certificação', 'norma', 'regulamentação']
  },
  {
    id: 'incident_response',
    category: 'Resposta a Incidentes',
    title: 'Gestão de Incidentes',
    description: 'Avaliar procedimentos de resposta a incidentes, notificação, comunicação',
    weight: 8,
    enabled: true,
    keywords: ['incidente', 'resposta', 'notificação', 'comunicação', 'breach', 'vazamento']
  },
  {
    id: 'data_location',
    category: 'Localização de Dados',
    title: 'Localização e Transferência de Dados',
    description: 'Verificar onde os dados serão armazenados e processados, transferências internacionais',
    weight: 7,
    enabled: true,
    keywords: ['localização', 'armazenamento', 'transferência', 'internacional', 'país', 'jurisdição']
  },
  {
    id: 'subcontractors',
    category: 'Subcontratação',
    title: 'Subcontratados e Terceiros',
    description: 'Analisar uso de subcontratados, due diligence, responsabilidades',
    weight: 6,
    enabled: true,
    keywords: ['subcontratado', 'terceiro', 'parceiro', 'fornecedor', 'due diligence']
  }
];

// Prompt padrão para análise
const DEFAULT_PROMPT = `Você é um especialista em análise de contratos com foco em segurança da informação, proteção de dados e gestão de riscos. Analise o contrato fornecido considerando os seguintes aspectos críticos:

**PROTEÇÃO DE DADOS E PRIVACIDADE:**
- Conformidade com LGPD/GDPR
- Tratamento de dados pessoais e sensíveis
- Direitos dos titulares de dados
- Bases legais para tratamento
- Transferências internacionais de dados
- Retenção e exclusão de dados

**SEGURANÇA DA INFORMAÇÃO:**
- Medidas de segurança técnicas e organizacionais
- Controles de acesso e autenticação
- Criptografia e proteção em trânsito/repouso
- Backup e recuperação de dados
- Gestão de vulnerabilidades
- Monitoramento e logs

**NÍVEIS DE SERVIÇO (SLA):**
- Disponibilidade e uptime garantidos
- Tempos de resposta e resolução
- Penalidades por descumprimento
- Procedimentos de escalação
- Métricas de performance

**CONFIDENCIALIDADE:**
- Acordos de não divulgação (NDA)
- Proteção de informações confidenciais
- Propriedade intelectual
- Classificação de informações

**RESPONSABILIDADE E RISCOS:**
- Limitação de responsabilidade
- Cobertura de seguros
- Indenizações e compensações
- Força maior e caso fortuito

**GESTÃO DE INCIDENTES:**
- Procedimentos de notificação
- Tempos de comunicação
- Planos de resposta a incidentes
- Comunicação com autoridades

**COMPLIANCE E AUDITORIA:**
- Certificações exigidas
- Direitos de auditoria
- Relatórios de compliance
- Aderência a normas e regulamentações

**RESCISÃO E CONTINUIDADE:**
- Condições de rescisão
- Prazos de aviso prévio
- Devolução/destruição de dados
- Continuidade de serviços
- Transição para novo fornecedor

**INSTRUÇÕES DE ANÁLISE:**
1. Identifique cláusulas presentes e ausentes
2. Avalie riscos para a contratante
3. Destaque red flags e pontos críticos
4. Sugira melhorias e cláusulas adicionais
5. Classifique o risco geral (baixo/médio/alto/crítico)
6. Forneça recomendações específicas

**FORMATO DE RESPOSTA:**
Estruture sua análise de forma clara e objetiva, priorizando sempre os interesses e a proteção da empresa contratante. Seja específico nas recomendações e cite trechos relevantes do contrato quando aplicável.`;

export const ContractReviewManager: React.FC<ContractReviewManagerProps> = ({
  vendorId,
  onAnalysisComplete,
  onAnalysisChange,
  allowSkip = false,
  onSkip,
  onContractReviewComplete
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { chatCompletion, primaryProvider, loading: aiLoading } = useAIProviders();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estados principais
  const [analysisMethod, setAnalysisMethod] = useState<AnalysisMethod>('document');
  const [contractText, setContractText] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisPoints, setAnalysisPoints] = useState<AnalysisPoint[]>(DEFAULT_ANALYSIS_POINTS);
  const [customPrompt, setCustomPrompt] = useState(DEFAULT_PROMPT);
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>('pending');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  
  // Estados de UI
  const [showPromptEditor, setShowPromptEditor] = useState(false);
  const [showAnalysisConfig, setShowAnalysisConfig] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAddPointModal, setShowAddPointModal] = useState(false);
  const [editingPoint, setEditingPoint] = useState<AnalysisPoint | null>(null);
  const [showEditPointModal, setShowEditPointModal] = useState(false);
  const [isReviewSkipped, setIsReviewSkipped] = useState(false);
  
  // Estados para novo ponto de análise
  const [newPoint, setNewPoint] = useState<Partial<AnalysisPoint>>({
    category: '',
    title: '',
    description: '',
    weight: 5,
    enabled: true,
    keywords: []
  });
  
  // Estado para keywords temporárias
  const [tempKeyword, setTempKeyword] = useState('');
  const [editTempKeyword, setEditTempKeyword] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [extractedText, setExtractedText] = useState<string>('');
  
  // Carregar dados persistidos ao inicializar
  useEffect(() => {
    // Carregar prompt personalizado salvo
    const savedPrompt = localStorage.getItem('contract_review_custom_prompt');
    if (savedPrompt) {
      setCustomPrompt(savedPrompt);
    }
    
    // Carregar pontos de análise personalizados
    const savedPoints = localStorage.getItem('contract_review_analysis_points');
    if (savedPoints) {
      try {
        const parsedPoints = JSON.parse(savedPoints);
        setAnalysisPoints(parsedPoints);
      } catch (error) {
        console.error('Erro ao carregar pontos de análise salvos:', error);
      }
    }
  }, []);

  // Função para validar arquivo
  const validateFile = (file: File): boolean => {
    // Validar tipo de arquivo - aceitar mais tipos e extensões
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/rtf'
    ];
    
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt', '.rtf'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    // Verificar tipo MIME ou extensão
    const isValidType = allowedTypes.includes(file.type) || allowedExtensions.includes(fileExtension);
    
    if (!isValidType) {
      toast({
        title: 'Tipo de arquivo não suportado',
        description: 'Por favor, envie apenas arquivos PDF, DOC, DOCX, TXT ou RTF.',
        variant: 'destructive',
      });
      return false;
    }
    
    // Validar tamanho (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O arquivo deve ter no máximo 10MB.',
        variant: 'destructive',
      });
      return false;
    }
    
    return true;
  };
  
  // Função para extrair texto de arquivo
  const extractTextFromFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          const result = event.target?.result;
          
          if (file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')) {
            // Arquivo de texto simples
            resolve(result as string);
          } else if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
            // Para PDF, tentar extrair texto real (limitado sem biblioteca)
            toast({
              title: 'Processando PDF',
              description: 'Tentando extrair texto do documento PDF...',
            });
            
            // Tentar extrair texto do PDF (limitado sem biblioteca especializada)
            try {
              // Converter ArrayBuffer para string e tentar extrair texto visível
              const uint8Array = new Uint8Array(result as ArrayBuffer);
              let extractedText = '';
              
              // Procurar por texto visível no PDF (método simples)
              for (let i = 0; i < uint8Array.length - 1; i++) {
                const char = String.fromCharCode(uint8Array[i]);
                // Filtrar apenas caracteres imprimíveis
                if (char.match(/[\x20-\x7E\u00C0-\u017F\u0100-\u024F]/)) {
                  extractedText += char;
                }
              }
              
              // Limpar e formatar o texto extraído
              extractedText = extractedText
                .replace(/[\x00-\x1F\x7F-\x9F]/g, ' ') // Remover caracteres de controle
                .replace(/\s+/g, ' ') // Normalizar espaços
                .trim();
              
              if (extractedText.length > 100) {
                resolve(extractedText);
              } else {
                // Se não conseguiu extrair texto suficiente, informar limitação
                resolve(`ERRO: Não foi possível extrair texto do PDF "${file.name}". \n\nEste arquivo PDF pode estar protegido, ser uma imagem digitalizada, ou ter codificação especial que requer bibliotecas especializadas para extração de texto.\n\nPor favor, tente:\n1. Converter o PDF para texto (.txt) manualmente\n2. Copiar e colar o conteúdo na aba "Inserir Texto"\n3. Usar um PDF que não seja protegido ou digitalizado`);
              }
            } catch (error) {
              resolve(`ERRO: Falha ao processar o PDF "${file.name}". \n\nNão foi possível extrair o conteúdo do arquivo. Por favor, use a opção "Inserir Texto" para colar o conteúdo manualmente.`);
            }
          } else {
            // Para outros tipos, tentar ler como texto
            resolve(result as string);
          }
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Erro ao ler o arquivo'));
      };
      
      if (file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')) {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  };
  
  // Função para processar arquivo
  const processFile = async (file: File) => {
    if (validateFile(file)) {
      setUploadedFile(file);
      
      // Extrair texto do arquivo
      try {
        const text = await extractTextFromFile(file);
        setExtractedText(text);
        
        toast({
          title: 'Arquivo carregado',
          description: `${file.name} foi carregado e processado com sucesso.`,
        });
      } catch (error) {
        console.error('Erro ao extrair texto:', error);
        toast({
          title: 'Arquivo carregado',
          description: `${file.name} foi carregado, mas houve erro na extração de texto.`,
          variant: 'destructive',
        });
      }
      
      // Resetar o input para permitir selecionar o mesmo arquivo novamente
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  // Função para upload de arquivo via input
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };
  
  // Funções para drag and drop
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  };
  
  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
  };
  
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
    
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      processFile(file);
    }
  };
  
  // Função para abrir seletor de arquivo
  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Função para remover arquivo
  const removeFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Função para alternar ponto de análise
  const toggleAnalysisPoint = (pointId: string) => {
    setAnalysisPoints(prev => 
      prev.map(point => 
        point.id === pointId 
          ? { ...point, enabled: !point.enabled }
          : point
      )
    );
  };

  // Função para atualizar peso do ponto de análise
  const updateAnalysisPointWeight = (pointId: string, weight: number) => {
    setAnalysisPoints(prev => 
      prev.map(point => 
        point.id === pointId 
          ? { ...point, weight }
          : point
      )
    );
  };

  // Função para resetar prompt para padrão
  const resetPromptToDefault = () => {
    setCustomPrompt(DEFAULT_PROMPT);
    localStorage.removeItem('contract_review_custom_prompt');
    toast({
      title: 'Prompt resetado',
      description: 'O prompt foi restaurado para o padrão.',
    });
  };
  
  // Função para salvar prompt personalizado
  const saveCustomPrompt = () => {
    localStorage.setItem('contract_review_custom_prompt', customPrompt);
    toast({
      title: 'Prompt salvo',
      description: 'O prompt personalizado foi salvo com sucesso.',
    });
  };
  
  // Função para salvar pontos de análise
  const saveAnalysisPoints = () => {
    localStorage.setItem('contract_review_analysis_points', JSON.stringify(analysisPoints));
    toast({
      title: 'Pontos de análise salvos',
      description: 'As configurações foram salvas com sucesso.',
    });
  };
  
  // Função para adicionar novo ponto de análise
  const addAnalysisPoint = () => {
    if (!newPoint.title || !newPoint.category || !newPoint.description) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha título, categoria e descrição.',
        variant: 'destructive',
      });
      return;
    }
    
    const point: AnalysisPoint = {
      id: `custom_${Date.now()}`,
      category: newPoint.category!,
      title: newPoint.title!,
      description: newPoint.description!,
      weight: newPoint.weight || 5,
      enabled: newPoint.enabled || true,
      keywords: newPoint.keywords || []
    };
    
    setAnalysisPoints(prev => [...prev, point]);
    setNewPoint({
      category: '',
      title: '',
      description: '',
      weight: 5,
      enabled: true,
      keywords: []
    });
    setShowAddPointModal(false);
    
    toast({
      title: 'Ponto adicionado',
      description: 'Novo ponto de análise foi criado com sucesso.',
    });
  };
  
  // Função para editar ponto de análise
  const updateAnalysisPoint = () => {
    if (!editingPoint) return;
    
    setAnalysisPoints(prev => 
      prev.map(point => 
        point.id === editingPoint.id ? editingPoint : point
      )
    );
    
    setEditingPoint(null);
    setShowEditPointModal(false);
    
    toast({
      title: 'Ponto atualizado',
      description: 'O ponto de análise foi atualizado com sucesso.',
    });
  };
  
  // Função para remover ponto de análise
  const removeAnalysisPoint = (pointId: string) => {
    setAnalysisPoints(prev => prev.filter(point => point.id !== pointId));
    toast({
      title: 'Ponto removido',
      description: 'O ponto de análise foi removido com sucesso.',
    });
  };
  
  // Função para adicionar keyword
  const addKeyword = (isEditing: boolean = false) => {
    const keyword = isEditing ? editTempKeyword : tempKeyword;
    if (!keyword.trim()) return;
    
    if (isEditing && editingPoint) {
      setEditingPoint({
        ...editingPoint,
        keywords: [...(editingPoint.keywords || []), keyword.trim()]
      });
      setEditTempKeyword('');
    } else {
      setNewPoint(prev => ({
        ...prev,
        keywords: [...(prev.keywords || []), keyword.trim()]
      }));
      setTempKeyword('');
    }
  };
  
  // Função para remover keyword
  const removeKeyword = (index: number, isEditing: boolean = false) => {
    if (isEditing && editingPoint) {
      setEditingPoint({
        ...editingPoint,
        keywords: editingPoint.keywords?.filter((_, i) => i !== index) || []
      });
    } else {
      setNewPoint(prev => ({
        ...prev,
        keywords: prev.keywords?.filter((_, i) => i !== index) || []
      }));
    }
  };
  
  // Função para análise real com IA usando o sistema configurado
  const analyzeContractWithAI = async (contractContent: string, analysisPrompt: string): Promise<AnalysisResult> => {
    try {
      // Verificar se há provedor de IA disponível
      if (!primaryProvider) {
        console.warn('Nenhum provedor de IA configurado, usando análise por palavras-chave');
        const keywordAnalysis = analyzeByKeywords(contractContent);
        keywordAnalysis.summary = `[ANÁLISE POR PALAVRAS-CHAVE] ${keywordAnalysis.summary}`;
        keywordAnalysis.recommendations.unshift('Nota: Configure um provedor de IA na "Gestão de IA" para análise mais precisa.');
        return keywordAnalysis;
      }
      
      // Obter pontos de análise habilitados
      const enabledPoints = analysisPoints.filter(p => p.enabled);
      
      // Preparar informações dos pontos de análise para a IA
      const analysisPointsInfo = enabledPoints.map(point => 
        `- **${point.category}**: ${point.title}\n  Descrição: ${point.description}\n  Peso: ${point.weight}\n  Palavras-chave: ${point.keywords.join(', ')}`
      ).join('\n\n');
      
      // Obter nome do documento
      const documentName = analysisMethod === 'document' && uploadedFile 
        ? uploadedFile.name 
        : 'Texto inserido manualmente';
      
      // Preparar o prompt completo com as configurações da etapa
      const systemPrompt = `Você é um especialista em análise de contratos corporativos com foco em GRC (Governança, Risco e Compliance). 

**INSTRUÇÕES IMPORTANTES:**
- RESPONDA SEMPRE EM PORTUGUÊS BRASILEIRO
- Primeiro, identifique se o documento é realmente um contrato válido
- Se não for um contrato, retorne riskLevel como "critical" e explique o motivo
- Se for um contrato, analise conforme os pontos configurados

**PROMPT PERSONALIZADO:**
${analysisPrompt}

**PONTOS DE ANÁLISE CONFIGURADOS:**
${analysisPointsInfo}

**INSTRUÇÕES ESPECÍFICAS:**
- Analise o documento focando nos pontos de análise configurados acima
- Considere o peso de cada ponto na avaliação geral
- Use as palavras-chave como referência para identificar cláusulas relevantes
- Identifique o tipo de documento e se é realmente um contrato
- Seja preciso e baseie-se nas configurações desta etapa de análise
- TODAS as respostas devem ser em português brasileiro`;
      
      const userPrompt = `**DOCUMENTO PARA ANÁLISE:**
Nome do arquivo: ${documentName}

Conteúdo:
${contractContent}

**FORMATO DE RESPOSTA OBRIGATÓRIO:**
Retorne APENAS um JSON válido em português com esta estrutura exata:
{
  "documentName": "${documentName}",
  "isValidContract": boolean,
  "documentType": "string (ex: contrato de prestação de serviços, termo de uso, etc.)",
  "overallScore": number (0-100),
  "riskLevel": "low" | "medium" | "high" | "critical",
  "summary": "string em português",
  "findings": [
    {
      "id": "string",
      "category": "string em português",
      "title": "string em português",
      "description": "string em português",
      "riskLevel": "low" | "medium" | "high" | "critical",
      "recommendation": "string em português",
      "clauseReference": "string em português"
    }
  ],
  "recommendations": ["strings em português"],
  "missingClauses": ["strings em português"],
  "redFlags": ["strings em português"]
}

**IMPORTANTE:** Se o documento NÃO for um contrato válido, defina isValidContract como false, riskLevel como "critical" e explique no summary o motivo.`
      
      // Tentar análise com IA real
      try {
        console.log('Iniciando análise com IA:', primaryProvider.name);
        
        const response = await chatCompletion({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.3,
          max_tokens: 2000
        });
        
        // Tentar fazer parse da resposta JSON
        try {
          // Limpar a resposta removendo possíveis caracteres extras
          let cleanResponse = response.content.trim();
          
          // Remover markdown code blocks se existirem
          cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
          
          // Tentar encontrar o JSON na resposta
          const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            cleanResponse = jsonMatch[0];
          }
          
          const parsedResult = JSON.parse(cleanResponse);
          
          // Validar estrutura básica
          if (parsedResult.overallScore !== undefined && parsedResult.riskLevel && parsedResult.summary) {
            console.log('Análise com IA concluída com sucesso');
            
            // Forçar risco crítico se não for um contrato válido
            if (parsedResult.isValidContract === false) {
              parsedResult.overallScore = 0;
              parsedResult.riskLevel = 'critical';
              
              // Garantir que há red flags apropriados
              if (!parsedResult.redFlags || parsedResult.redFlags.length === 0) {
                parsedResult.redFlags = ['Documento não é um contrato válido'];
              }
              
              // Adicionar recomendação crítica
              if (!parsedResult.recommendations) {
                parsedResult.recommendations = [];
              }
              parsedResult.recommendations.unshift('URGENTE: Forneceça um documento de contrato válido para análise.');
            }
            
            // Forçar risco crítico se score for muito baixo (menos de 30)
            if (parsedResult.overallScore < 30 && parsedResult.riskLevel !== 'critical') {
              parsedResult.riskLevel = 'critical';
              parsedResult.summary = `RISCO CRÍTICO DETECTADO: ${parsedResult.summary}`;
            }
            
            // Adicionar nota sobre o método usado
            parsedResult.summary = `[ANÁLISE COM IA - ${primaryProvider.name}] ${parsedResult.summary}`;
            
            return parsedResult as AnalysisResult;
          } else {
            throw new Error('Estrutura de resposta inválida');
          }
        } catch (parseError) {
          console.warn('Erro ao fazer parse da resposta da IA:', parseError);
          console.log('Resposta da IA:', response.content);
          throw new Error('Resposta da IA em formato inválido');
        }
        
      } catch (aiError) {
        console.warn('Erro na chamada da IA:', aiError);
        console.log('Usando análise por palavras-chave como fallback');
        
        // Fallback para análise por palavras-chave
        const keywordAnalysis = analyzeByKeywords(contractContent);
        
        // Adicionar nota sobre o método usado e o erro
        keywordAnalysis.summary = `[FALLBACK - PALAVRAS-CHAVE] ${keywordAnalysis.summary}`;
        keywordAnalysis.recommendations.unshift(
          `Nota: Houve erro na análise com IA (${aiError.message}). Resultado baseado em palavras-chave.`,
          'Para análise mais precisa, verifique a configuração do provedor de IA.'
        );
        
        return keywordAnalysis;
      }
      
    } catch (error) {
      console.error('Erro na análise com IA:', error);
      throw new Error('Falha na análise do contrato');
    }
  };
  
  // Função para validar se é realmente um contrato
  const validateContractStructure = (content: string): { isValid: boolean; reason?: string } => {
    const lowerContent = content.toLowerCase();
    
    // Palavras-chave obrigatórias que indicam um contrato
    const contractKeywords = [
      'contrato', 'acordo', 'termo', 'avença', 'instrumento',
      'contratante', 'contratada', 'prestador', 'tomador',
      'partes', 'cláusula', 'objeto', 'obrigações'
    ];
    
    // Estruturas típicas de contrato
    const contractStructures = [
      'cláusula', 'artigo', 'parágrafo', 'inciso',
      'do objeto', 'das obrigações', 'da responsabilidade',
      'das condições', 'dos prazos', 'da rescisão'
    ];
    
    // Verificar se tem palavras-chave mínimas de contrato
    const foundKeywords = contractKeywords.filter(keyword => 
      lowerContent.includes(keyword)
    );
    
    if (foundKeywords.length < 3) {
      return {
        isValid: false,
        reason: 'Documento não parece ser um contrato. Palavras-chave contratuais insuficientes.'
      };
    }
    
    // Verificar estrutura de contrato
    const foundStructures = contractStructures.filter(structure => 
      lowerContent.includes(structure)
    );
    
    if (foundStructures.length < 2) {
      return {
        isValid: false,
        reason: 'Documento não possui estrutura típica de contrato (cláusulas, artigos, etc.).'
      };
    }
    
    // Verificar se tem conteúdo mínimo
    if (content.length < 500) {
      return {
        isValid: false,
        reason: 'Documento muito curto para ser um contrato válido.'
      };
    }
    
    // Verificar se não é um tipo de documento incompatível
    const incompatibleTypes = [
      'curriculum', 'currículo', 'cv', 'resume', 'curriculo',
      'relatório', 'report', 'ata', 'minutes', 'relatorio',
      'manual', 'instruções', 'tutorial', 'instrucoes',
      'carta', 'letter', 'email', 'e-mail',
      'notícia', 'news', 'artigo científico', 'noticia',
      'receita', 'recipe', 'lista de compras',
      'apresentação', 'presentation', 'slide',
      'planilha', 'spreadsheet', 'tabela',
      'invoice', 'fatura', 'nota fiscal',
      'orçamento', 'budget', 'estimate', 'orcamento',
      'proposta comercial', 'proposal',
      'especificação', 'specification', 'especificacao',
      'documentação', 'documentation', 'documentacao',
      'política', 'policy', 'politica',
      'procedimento', 'procedure',
      'norma', 'standard', 'guideline',
      'checklist', 'lista de verificação',
      'formulário', 'form', 'formulario',
      'declaração', 'declaration', 'declaracao',
      'certidão', 'certificate', 'certidao',
      'comprovante', 'receipt', 'voucher'
    ];
    
    const foundIncompatible = incompatibleTypes.filter(type => 
      lowerContent.includes(type)
    );
    
    if (foundIncompatible.length > 0) {
      return {
        isValid: false,
        reason: `Documento parece ser do tipo: ${foundIncompatible.join(', ')}. Não é um contrato.`
      };
    }
    
    // Verificar se tem elementos essenciais de um contrato de prestação de serviços
    const essentialElements = [
      // Pelo menos uma dessas combinações deve existir
      { keywords: ['objeto', 'serviço'], required: true },
      { keywords: ['contratante', 'contratada'], required: true },
      { keywords: ['obrigações', 'responsabilidade'], required: false },
      { keywords: ['prazo', 'vigência', 'duração'], required: false },
      { keywords: ['valor', 'preço', 'remuneração', 'pagamento'], required: false }
    ];
    
    let foundEssential = 0;
    let requiredFound = 0;
    
    essentialElements.forEach(element => {
      const hasElement = element.keywords.some(keyword => 
        lowerContent.includes(keyword)
      );
      
      if (hasElement) {
        foundEssential++;
        if (element.required) {
          requiredFound++;
        }
      }
    });
    
    const requiredElements = essentialElements.filter(e => e.required).length;
    
    if (requiredFound < requiredElements) {
      return {
        isValid: false,
        reason: 'Documento não contém elementos essenciais de um contrato (objeto do serviço, partes contratantes).'
      };
    }
    
    if (foundEssential < 2) {
      return {
        isValid: false,
        reason: 'Documento não possui estrutura mínima de contrato de prestação de serviços.'
      };
    }
    
    return { isValid: true };
  };
  
  // Função para análise baseada em palavras-chave (fallback)
  const analyzeByKeywords = (contractContent: string): AnalysisResult => {
    const content = contractContent.toLowerCase();
    
    // Primeiro, validar se é realmente um contrato
    const validation = validateContractStructure(contractContent);
    
    if (!validation.isValid) {
      return {
        overallScore: 0,
        riskLevel: 'critical',
        summary: `DOCUMENTO INVÁLIDO: ${validation.reason}`,
        findings: [{
          id: 'invalid_document',
          category: 'Validação de Documento',
          title: 'Documento não é um contrato válido',
          description: validation.reason || 'O documento fornecido não atende aos critérios mínimos de um contrato.',
          riskLevel: 'critical',
          recommendation: 'Forneceça um documento de contrato válido para análise.',
          clauseReference: 'N/A'
        }],
        recommendations: [
          'Verificar se o documento é realmente um contrato',
          'Garantir que o documento contém cláusulas contratuais',
          'Revisar a estrutura do documento'
        ],
        missingClauses: ['Estrutura contratual válida'],
        redFlags: ['Documento não é um contrato']
      };
    }
    
    const findings: Finding[] = [];
    const recommendations: string[] = [];
    const missingClauses: string[] = [];
    const redFlags: string[] = [];
    
    let totalScore = 0;
    let maxScore = 0;
    
    // Analisar cada ponto habilitado
    analysisPoints.filter(point => point.enabled).forEach(point => {
      maxScore += point.weight;
      let pointScore = 0;
      const foundKeywords: string[] = [];
      
      // Verificar palavras-chave
      point.keywords.forEach(keyword => {
        if (content.includes(keyword.toLowerCase())) {
          foundKeywords.push(keyword);
          pointScore += 1;
        }
      });
      
      // Calcular score do ponto (0-100% do peso)
      const pointPercentage = Math.min(pointScore / Math.max(point.keywords.length * 0.3, 1), 1);
      totalScore += pointPercentage * point.weight;
      
      // Gerar findings baseado na análise
      if (pointPercentage < 0.3) {
        // Ponto com baixa cobertura
        findings.push({
          id: `finding_${point.id}`,
          category: point.category,
          title: `${point.title} - Cobertura Insuficiente`,
          description: `O contrato não aborda adequadamente aspectos de ${point.category.toLowerCase()}. Palavras-chave encontradas: ${foundKeywords.join(', ') || 'nenhuma'}.`,
          riskLevel: pointPercentage < 0.1 ? 'high' : 'medium',
          recommendation: `Incluir cláusulas específicas sobre ${point.description.toLowerCase()}.`,
          clauseReference: 'Não identificada'
        });
        
        missingClauses.push(`Cláusulas de ${point.category}`);
      } else if (pointPercentage < 0.7) {
        // Ponto com cobertura parcial
        findings.push({
          id: `finding_${point.id}`,
          category: point.category,
          title: `${point.title} - Requer Atenção`,
          description: `O contrato aborda parcialmente aspectos de ${point.category.toLowerCase()}. Recomenda-se revisão para garantir cobertura completa.`,
          riskLevel: 'medium',
          recommendation: `Revisar e fortalecer cláusulas relacionadas a ${point.description.toLowerCase()}.`,
          clauseReference: 'Identificada parcialmente'
        });
      }
      
      // Adicionar recomendações gerais
      if (pointPercentage < 0.5) {
        recommendations.push(`Fortalecer aspectos de ${point.category} no contrato`);
      }
    });
    
    // Calcular score geral
    let overallScore = Math.round((totalScore / maxScore) * 100);
    
    // Forçar score 0 se não encontrou nenhuma palavra-chave relevante
    if (totalScore === 0) {
      overallScore = 0;
    }
    
    // Determinar nível de risco (mais rigoroso)
    let riskLevel: RiskLevel = 'low';
    if (overallScore === 0) riskLevel = 'critical';
    else if (overallScore < 30) riskLevel = 'critical';
    else if (overallScore < 50) riskLevel = 'high';
    else if (overallScore < 75) riskLevel = 'medium';
    
    // Identificar red flags
    const redFlagKeywords = ['limitação total', 'isento de responsabilidade', 'sem garantia', 'uso por conta e risco'];
    redFlagKeywords.forEach(flag => {
      if (content.includes(flag)) {
        redFlags.push(`Identificada cláusula de risco: "${flag}"`);
      }
    });
    
    // Adicionar red flags para documentos com score muito baixo
    if (overallScore === 0) {
      redFlags.push('Documento não contém estrutura contratual válida');
      redFlags.push('Ausência total de cláusulas contratuais essenciais');
    } else if (overallScore < 30) {
      redFlags.push('Score extremamente baixo indica contrato inadequado');
      redFlags.push('Deficiências graves na estrutura contratual');
    }
    
    // Gerar resumo baseado no risco
    let summary = '';
    if (overallScore === 0) {
      summary = `DOCUMENTO INVÁLIDO OU SEM CLÁUSULAS CONTRATUAIS: Score 0%. ` +
        `O documento não contém elementos essenciais de um contrato. ` +
        `RISCO CRÍTICO - Requer revisão imediata.`;
    } else if (riskLevel === 'critical') {
      summary = `RISCO CRÍTICO DETECTADO: Score ${overallScore}%. ` +
        `O contrato apresenta deficiências graves que requerem atenção imediata. ` +
        `${findings.length} pontos críticos identificados.`;
    } else {
      summary = `Análise baseada em ${analysisPoints.filter(p => p.enabled).length} pontos de verificação. ` +
        `Score geral: ${overallScore}%. ` +
        `${findings.length} pontos requerem atenção. ` +
        `Nível de risco: ${riskLevel.toUpperCase()}.`;
    }
    
    return {
      overallScore,
      riskLevel,
      summary,
      findings,
      recommendations,
      missingClauses,
      redFlags
    };
  };

  // Função para iniciar análise
  const startAnalysis = async () => {
    // Validações
    if (analysisMethod === 'document' && !uploadedFile) {
      toast({
        title: 'Documento necessário',
        description: 'Por favor, faça upload de um documento para análise.',
        variant: 'destructive',
      });
      return;
    }
    
    if (analysisMethod === 'text' && !contractText.trim()) {
      toast({
        title: 'Texto necessário',
        description: 'Por favor, insira o texto do contrato para análise.',
        variant: 'destructive',
      });
      return;
    }
    
    const enabledPoints = analysisPoints.filter(point => point.enabled);
    if (enabledPoints.length === 0) {
      toast({
        title: 'Pontos de análise necessários',
        description: 'Por favor, selecione pelo menos um ponto de análise.',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStatus('analyzing');
    
    try {
      // Obter conteúdo do contrato
      let contractContent = '';
      
      if (analysisMethod === 'document') {
        if (extractedText) {
          contractContent = extractedText;
        } else {
          toast({
            title: 'Erro na extração',
            description: 'Não foi possível extrair o texto do documento.',
            variant: 'destructive',
          });
          return;
        }
      } else {
        contractContent = contractText;
      }
      
      if (!contractContent.trim()) {
        toast({
          title: 'Conteúdo vazio',
          description: 'Não há conteúdo para analisar.',
          variant: 'destructive',
        });
        return;
      }
      
      // Realizar análise real com IA
      toast({
        title: 'Analisando contrato',
        description: 'Processando conteúdo com inteligência artificial...',
      });
      
      const analysisResult = await analyzeContractWithAI(contractContent, customPrompt);
      
      setAnalysisResult(analysisResult);
      setAnalysisStatus('completed');
      
      // Criar objeto de análise completa
      const analysis: ContractAnalysis = {
        id: `analysis_${Date.now()}`,
        vendorId: vendorId || '',
        method: analysisMethod,
        documentName: uploadedFile?.name,
        documentSize: uploadedFile?.size,
        contractText: analysisMethod === 'text' ? contractText : extractedText,
        analysisPoints: enabledPoints,
        customPrompt,
        status: 'completed',
        result: analysisResult,
        createdAt: new Date().toISOString(),
        analyzedAt: new Date().toISOString()
      };
      
      onAnalysisComplete(true, analysis);
      
      if (onAnalysisChange) {
        onAnalysisChange(analysis);
      }
      
      toast({
        title: 'Análise concluída',
        description: 'A análise do contrato foi finalizada com sucesso.',
      });
      
    } catch (error) {
      console.error('Erro na análise:', error);
      setAnalysisStatus('error');
      toast({
        title: 'Erro na análise',
        description: 'Ocorreu um erro durante a análise do contrato.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Função para pular a revisão contratual
  const handleSkipReview = () => {
    setIsReviewSkipped(true);
    
    if (onSkip) {
      onSkip();
    }
    
    // Notificar que a etapa foi "completada" (pulada)
    onAnalysisComplete(true);
    
    // Notificar especificamente sobre a conclusão da revisão contratual
    if (onContractReviewComplete) {
      onContractReviewComplete(true);
    }
    
    toast({
      title: 'Revisão adiada',
      description: 'A revisão contratual foi marcada para ser feita posteriormente. Você pode prosseguir para a próxima etapa.',
      variant: 'default',
    });
  };
  
  // Função para cancelar o pulo da revisão
  const handleCancelSkip = () => {
    setIsReviewSkipped(false);
    
    // Notificar que a etapa não está mais completada
    onAnalysisComplete(false);
    
    // Notificar especificamente sobre a reativação da revisão contratual
    if (onContractReviewComplete) {
      onContractReviewComplete(false);
    }
    
    toast({
      title: 'Revisão reativada',
      description: 'A revisão contratual foi reativada. Complete a análise para prosseguir.',
      variant: 'default',
    });
  };
  
  // Função para obter estilo do risco (usando estilos inline para garantir aplicação)
  const getRiskStyle = (risk: RiskLevel): React.CSSProperties => {
    switch (risk) {
      case 'low': 
        return {
          color: '#ffffff', // texto branco
          backgroundColor: '#16a34a', // green-600 (mais escuro)
          borderColor: '#16a34a',
        };
      case 'medium': 
        return {
          color: '#ffffff', // texto branco
          backgroundColor: '#ca8a04', // yellow-600 (mais escuro)
          borderColor: '#ca8a04',
        };
      case 'high': 
        return {
          color: '#ffffff', // texto branco
          backgroundColor: '#ea580c', // orange-600 (mais escuro)
          borderColor: '#ea580c',
        };
      case 'critical': 
        return {
          color: '#ffffff', // texto branco
          backgroundColor: '#dc2626', // red-600 (mais escuro e visível)
          borderColor: '#dc2626',
        };
      default: 
        return {
          color: '#ffffff', // texto branco
          backgroundColor: '#6b7280', // gray-500
          borderColor: '#6b7280',
        };
    }
  };
  
  // Função para obter variante do badge
  const getRiskVariant = (risk: RiskLevel): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (risk) {
      case 'low': return 'outline';
      case 'medium': return 'secondary';
      case 'high': return 'secondary';
      case 'critical': return 'destructive';
      default: return 'outline';
    }
  };
  
  // Componente de badge de risco personalizado (apenas estilos inline)
  const RiskBadge: React.FC<{ risk: RiskLevel; size?: 'sm' | 'md' | 'lg' }> = ({ risk, size = 'md' }) => {
    const sizeStyles = {
      sm: { fontSize: '12px', padding: '2px 8px' },
      md: { fontSize: '14px', padding: '4px 12px' },
      lg: { fontSize: '16px', padding: '8px 16px' }
    };
    
    const riskStyles = getRiskStyle(risk);
    
    const finalStyle: React.CSSProperties = {
      display: 'inline-block',
      borderRadius: '12px',
      border: `1px solid ${riskStyles.borderColor}`,
      fontWeight: 'bold',
      textAlign: 'center',
      whiteSpace: 'nowrap',
      userSelect: 'none',
      ...sizeStyles[size],
      color: riskStyles.color,
      backgroundColor: riskStyles.backgroundColor,
    };
    
    return (
      <span style={finalStyle}>
        {risk.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
            <FileText className="h-5 w-5" />
            Revisão Contratual com IA
          </CardTitle>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Configure e execute análise inteligente de contratos com foco em segurança, privacidade e compliance
          </p>
        </CardHeader>
      </Card>

      {/* Método de Análise */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Método de Análise</CardTitle>
          <p className="text-sm text-muted-foreground">
            Escolha como fornecer o contrato para análise
          </p>
        </CardHeader>
        <CardContent>
          <Tabs value={analysisMethod} onValueChange={(value) => setAnalysisMethod(value as AnalysisMethod)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="document" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload de Documento
              </TabsTrigger>
              <TabsTrigger value="text" className="flex items-center gap-2">
                <Edit3 className="h-4 w-4" />
                Inserir Texto
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="document" className="space-y-4">
              <div 
                className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
                  isDragOver 
                    ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/20' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {!uploadedFile ? (
                  <div className="text-center">
                    <Upload className={`mx-auto h-12 w-12 ${
                      isDragOver ? 'text-blue-500' : 'text-gray-400'
                    }`} />
                    <div className="mt-4">
                      <div className="cursor-pointer" onClick={openFileSelector}>
                        <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
                          {isDragOver ? 'Solte o arquivo aqui' : 'Clique para fazer upload ou arraste o arquivo aqui'}
                        </span>
                        <span className="mt-1 block text-xs text-gray-500">
                          PDF, DOC, DOCX, TXT ou RTF até 10MB
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={openFileSelector}
                        className="mt-4"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Selecionar Arquivo
                      </Button>
                      <Input
                        id="file-upload"
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.txt,.rtf"
                        onChange={handleFileUpload}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-green-600" />
                        <div>
                          <p className="font-medium text-green-900 dark:text-green-100">
                            {uploadedFile.name}
                          </p>
                          <p className="text-sm text-green-600 dark:text-green-400">
                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • {uploadedFile.type || 'Tipo não identificado'}
                          </p>
                          <p className="text-xs text-green-500 dark:text-green-400">
                            Carregado em {new Date().toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={openFileSelector}
                          className="text-blue-600 hover:text-blue-700"
                          title="Substituir arquivo"
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={removeFile}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                          title="Remover arquivo"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Informações adicionais do arquivo */}
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        Arquivo pronto para análise. Configure os pontos de análise abaixo e clique em "Iniciar Análise".
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="text" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contract-text">Texto do Contrato</Label>
                <Textarea
                  id="contract-text"
                  placeholder="Cole aqui o texto completo do contrato para análise..."
                  value={contractText}
                  onChange={(e) => setContractText(e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  {contractText.length} caracteres
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Configuração da Análise */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Configuração da Análise</CardTitle>
              <p className="text-sm text-muted-foreground">
                Personalize os pontos de análise e o prompt da IA
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowAnalysisConfig(!showAnalysisConfig)}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              {showAnalysisConfig ? 'Ocultar' : 'Configurar'}
            </Button>
          </div>
        </CardHeader>
        
        {showAnalysisConfig && (
          <CardContent className="space-y-6">
            {/* Pontos de Análise */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Pontos de Análise
                </h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddPointModal(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-3 w-3" />
                    Adicionar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={saveAnalysisPoints}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-3 w-3" />
                    Salvar
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysisPoints.map((point) => (
                  <div key={point.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2 flex-1">
                        <Checkbox
                          checked={point.enabled}
                          onCheckedChange={() => toggleAnalysisPoint(point.id)}
                        />
                        <div className="flex-1">
                          <Label className="font-medium">{point.title}</Label>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {point.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingPoint(point);
                            setShowEditPointModal(true);
                          }}
                          className="h-6 w-6 p-0"
                          title="Editar ponto"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAnalysisPoint(point.id)}
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Remover ponto"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {point.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs">Peso:</Label>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={point.weight}
                        onChange={(e) => updateAnalysisPointWeight(point.id, parseInt(e.target.value) || 1)}
                        className="w-16 h-8 text-xs"
                        disabled={!point.enabled}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Editor de Prompt */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <Edit3 className="h-4 w-4" />
                  Prompt Personalizado
                </h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetPromptToDefault}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Resetar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={saveCustomPrompt}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-3 w-3" />
                    Salvar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPromptEditor(!showPromptEditor)}
                  >
                    {showPromptEditor ? 'Ocultar' : 'Editar'}
                  </Button>
                </div>
              </div>
              
              {showPromptEditor && (
                <div className="space-y-2">
                  <Textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    className="min-h-[300px] font-mono text-sm"
                    placeholder="Digite o prompt personalizado para a análise..."
                  />
                  <p className="text-xs text-muted-foreground">
                    {customPrompt.length} caracteres - Este prompt será usado para guiar a análise da IA
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Botão de Análise */}
      <Card>
        <CardContent className="p-6">
          {allowSkip && !isReviewSkipped && (
            <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">Opção Flexível</span>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                Você pode prosseguir sem fazer a análise agora e revisar o contrato posteriormente.
              </p>
            </div>
          )}
          
          {isReviewSkipped && (
            <div className="mb-4 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Revisão Adiada</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelSkip}
                  className="text-green-700 border-green-300 hover:bg-green-100"
                >
                  Cancelar
                </Button>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                A revisão contratual foi marcada para ser feita posteriormente. Você pode prosseguir para a próxima etapa do onboarding.
              </p>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-semibold">Iniciar Análise</h3>
              <p className="text-sm text-muted-foreground">
                {primaryProvider 
                  ? `Análise com IA (${primaryProvider.name}) baseada nas configurações definidas`
                  : 'Análise por palavras-chave (configure IA na "Gestão de IA" para melhor precisão)'
                }
              </p>
              
              {/* Status do provedor */}
              <div className="flex items-center gap-2 mt-2">
                {primaryProvider ? (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-600 font-medium">
                      IA Ativa: {primaryProvider.name} ({primaryProvider.model_name})
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-xs text-yellow-600 font-medium">
                      IA não configurada - usando análise por palavras-chave
                    </span>
                  </>
                )}
              </div>
              
              {/* Pontos de análise habilitados */}
              <div className="mt-2">
                <span className="text-xs text-muted-foreground">
                  {analysisPoints.filter(p => p.enabled).length} pontos de análise habilitados
                </span>
              </div>
            </div>
            
            <div className="flex gap-3">
              {allowSkip && !isReviewSkipped && (
                <Button
                  variant="outline"
                  onClick={handleSkipReview}
                  disabled={isAnalyzing || analysisStatus === 'analyzing'}
                  className="flex items-center gap-2 border-amber-300 text-amber-700 hover:bg-amber-50"
                >
                  <Clock className="h-4 w-4" />
                  Revisar Mais Tarde
                </Button>
              )}
              
              {!isReviewSkipped && (
                <Button
                  onClick={startAnalysis}
                  disabled={isAnalyzing || analysisStatus === 'analyzing' || aiLoading}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  {isAnalyzing ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Shield className="h-4 w-4" />
                  )}
                  {isAnalyzing ? 'Analisando...' : 'Iniciar Análise'}
                </Button>
              )}
              
              {isReviewSkipped && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resultado da Análise */}
      {analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Resultado da Análise
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Resumo Geral */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {analysisResult.overallScore}%
                </div>
                <div className="text-sm text-muted-foreground">Score Geral</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="flex justify-center">
                  <RiskBadge risk={analysisResult.riskLevel} size="md" />
                </div>
                <div className="text-sm text-muted-foreground mt-2">Nível de Risco</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {analysisResult.findings.length}
                </div>
                <div className="text-sm text-muted-foreground">Achados</div>
              </div>
            </div>

            {/* Resumo */}
            <div className="space-y-2">
              <h4 className="font-semibold">Resumo Executivo</h4>
              <p className="text-sm text-muted-foreground">
                {analysisResult.summary}
              </p>
            </div>

            {/* Achados */}
            <div className="space-y-4">
              <h4 className="font-semibold">Principais Achados</h4>
              <div className="space-y-3">
                {analysisResult.findings.map((finding) => (
                  <div key={finding.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {finding.category}
                          </Badge>
                          <RiskBadge risk={finding.riskLevel} size="sm" />
                          {finding.clauseReference && (
                            <span className="text-xs text-muted-foreground">
                              {finding.clauseReference}
                            </span>
                          )}
                        </div>
                        <h5 className="font-medium">{finding.title}</h5>
                        <p className="text-sm text-muted-foreground mt-1">
                          {finding.description}
                        </p>
                      </div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded border-l-4 border-blue-400">
                      <p className="text-sm">
                        <strong>Recomendação:</strong> {finding.recommendation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Red Flags */}
            {analysisResult.redFlags.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-4 w-4" />
                  Red Flags
                </h4>
                <div className="space-y-2">
                  {analysisResult.redFlags.map((flag, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-950/20 p-2 rounded">
                      <AlertTriangle className="h-3 w-3" />
                      {flag}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cláusulas Ausentes */}
            {analysisResult.missingClauses.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold">Cláusulas Ausentes</h4>
                <div className="space-y-1">
                  {analysisResult.missingClauses.map((clause, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                      {clause}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recomendações */}
            <div className="space-y-2">
              <h4 className="font-semibold">Recomendações Gerais</h4>
              <div className="space-y-1">
                {analysisResult.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    {rec}
                  </div>
                ))}
              </div>
            </div>

            {/* Ações */}
            <div className="flex gap-2 pt-4 border-t">
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Baixar Relatório
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Gerar Adendo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Modal para Adicionar Ponto de Análise */}
      <Dialog open={showAddPointModal} onOpenChange={setShowAddPointModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Ponto de Análise</DialogTitle>
            <DialogDescription>
              Crie um novo ponto de análise personalizado para suas necessidades.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-category">Categoria *</Label>
                <Input
                  id="new-category"
                  value={newPoint.category || ''}
                  onChange={(e) => setNewPoint(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="Ex: Segurança da Informação"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-weight">Peso (1-10)</Label>
                <Input
                  id="new-weight"
                  type="number"
                  min="1"
                  max="10"
                  value={newPoint.weight || 5}
                  onChange={(e) => setNewPoint(prev => ({ ...prev, weight: parseInt(e.target.value) || 5 }))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-title">Título *</Label>
              <Input
                id="new-title"
                value={newPoint.title || ''}
                onChange={(e) => setNewPoint(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Cláusulas de Backup e Recuperação"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-description">Descrição *</Label>
              <Textarea
                id="new-description"
                value={newPoint.description || ''}
                onChange={(e) => setNewPoint(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva o que deve ser analisado neste ponto..."
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Palavras-chave</Label>
              <div className="flex gap-2">
                <Input
                  value={tempKeyword}
                  onChange={(e) => setTempKeyword(e.target.value)}
                  placeholder="Digite uma palavra-chave"
                  onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addKeyword()}
                  disabled={!tempKeyword.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {(newPoint.keywords || []).map((keyword, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {keyword}
                    <button
                      onClick={() => removeKeyword(index)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={newPoint.enabled || true}
                onCheckedChange={(checked) => setNewPoint(prev => ({ ...prev, enabled: !!checked }))}
              />
              <Label>Habilitado por padrão</Label>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowAddPointModal(false)}>
              Cancelar
            </Button>
            <Button onClick={addAnalysisPoint}>
              Adicionar Ponto
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Modal para Editar Ponto de Análise */}
      <Dialog open={showEditPointModal} onOpenChange={setShowEditPointModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Ponto de Análise</DialogTitle>
            <DialogDescription>
              Modifique as configurações do ponto de análise selecionado.
            </DialogDescription>
          </DialogHeader>
          
          {editingPoint && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Categoria *</Label>
                  <Input
                    id="edit-category"
                    value={editingPoint.category}
                    onChange={(e) => setEditingPoint({ ...editingPoint, category: e.target.value })}
                    placeholder="Ex: Segurança da Informação"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-weight">Peso (1-10)</Label>
                  <Input
                    id="edit-weight"
                    type="number"
                    min="1"
                    max="10"
                    value={editingPoint.weight}
                    onChange={(e) => setEditingPoint({ ...editingPoint, weight: parseInt(e.target.value) || 5 })}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-title">Título *</Label>
                <Input
                  id="edit-title"
                  value={editingPoint.title}
                  onChange={(e) => setEditingPoint({ ...editingPoint, title: e.target.value })}
                  placeholder="Ex: Cláusulas de Backup e Recuperação"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-description">Descrição *</Label>
                <Textarea
                  id="edit-description"
                  value={editingPoint.description}
                  onChange={(e) => setEditingPoint({ ...editingPoint, description: e.target.value })}
                  placeholder="Descreva o que deve ser analisado neste ponto..."
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Palavras-chave</Label>
                <div className="flex gap-2">
                  <Input
                    value={editTempKeyword}
                    onChange={(e) => setEditTempKeyword(e.target.value)}
                    placeholder="Digite uma palavra-chave"
                    onKeyPress={(e) => e.key === 'Enter' && addKeyword(true)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addKeyword(true)}
                    disabled={!editTempKeyword.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(editingPoint.keywords || []).map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {keyword}
                      <button
                        onClick={() => removeKeyword(index, true)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={editingPoint.enabled}
                  onCheckedChange={(checked) => setEditingPoint({ ...editingPoint, enabled: !!checked })}
                />
                <Label>Habilitado</Label>
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowEditPointModal(false)}>
              Cancelar
            </Button>
            <Button onClick={updateAnalysisPoint}>
              Salvar Alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContractReviewManager;