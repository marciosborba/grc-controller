import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Edit,
  Plus,
  FileText,
  MessageSquare,
  Lightbulb,
  BookOpen,
  Search,
  Filter,
  RefreshCw,
  Loader2,
  CheckCircle,
  Save,
  X,
  Upload,
  Download,
  Eye,
  AlertTriangle,
  Paperclip
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import PolicyProcessCard from '../shared/PolicyProcessCard';
import AlexPolicyChat from '../shared/AlexPolicyChat';
// import PolicyEditModalSimple from '../shared/PolicyEditModalSimple';
// import PolicyCreateModalSimple from '../shared/PolicyCreateModalSimple';

interface Policy {
  id: string;
  title: string;
  description?: string;
  status: string;
  category: string;
  document_type: string;
  version: string;
  created_at: string;
  updated_at: string;
  effective_date?: string;
  review_date?: string;
  expiry_date?: string;
  created_by?: string;
  approved_by?: string;
  approval_date?: string;
  tenant_id?: string;
  document_url?: string;
  metadata?: any;
  priority?: string;
}

interface PolicyElaborationProps {
  policies: Policy[];
  onPolicyUpdate: () => void;
  alexConfig?: any;
  searchTerm?: string;
  filters?: any;
}

const PolicyElaboration: React.FC<PolicyElaborationProps> = ({
  policies,
  onPolicyUpdate,
  alexConfig,
  searchTerm = '',
  filters = {}
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [showAlexChat, setShowAlexChat] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    category: '',
    document_type: '',
    priority: 'medium',
    effective_date: '',
    review_date: '',
    expiry_date: ''
  });
  const [createFormData, setCreateFormData] = useState({
    title: '',
    description: '',
    category: '',
    document_type: 'Política',
    priority: 'medium',
    effective_date: '',
    review_date: '',
    expiry_date: ''
  });
  const [createAttachedDocuments, setCreateAttachedDocuments] = useState<any[]>([]);
  const [isCreateUploading, setIsCreateUploading] = useState(false);
  const [createDragActive, setCreateDragActive] = useState(false);
  const [attachedDocuments, setAttachedDocuments] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Filtrar políticas para elaboração (draft, under_review)
  const filteredPolicies = policies.filter(policy => {
    const elaborationStatuses = ['draft', 'under_review', 'pending_approval'];
    const matchesStatus = elaborationStatuses.includes(policy.status.toLowerCase());
    const matchesSearch = !searchTerm || 
      policy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  // Gerar insights do Alex Policy para cada política
  const generateAlexInsights = (policy: Policy) => {
    const insights = [];
    
    // Verificar se precisa de descrição
    if (!policy.description || policy.description.length < 50) {
      insights.push({
        type: 'suggestion' as const,
        title: 'Descrição incompleta',
        description: 'Adicione uma descrição mais detalhada para melhor compreensão',
        action: 'improve_description'
      });
    }

    // Verificar se está há muito tempo em rascunho
    const daysSinceCreation = Math.floor(
      (new Date().getTime() - new Date(policy.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceCreation > 7 && policy.status === 'draft') {
      insights.push({
        type: 'warning' as const,
        title: 'Política em rascunho há muito tempo',
        description: `Esta política está em elaboração há ${daysSinceCreation} dias`,
        action: 'expedite_review'
      });
    }

    // Sugestão de estrutura baseada no tipo
    if (policy.document_type === 'Política' && !policy.description?.includes('objetivo')) {
      insights.push({
        type: 'suggestion' as const,
        title: 'Estrutura recomendada',
        description: 'Considere adicionar seções de objetivo, escopo e responsabilidades',
        action: 'suggest_structure'
      });
    }

    return insights;
  };

  const handlePolicyAction = async (action: string, policyId: string, data?: any) => {
    setIsLoading(true);
    
    try {
      switch (action) {
        case 'edit':
          const policyToEdit = policies.find(p => p.id === policyId);
          if (policyToEdit) {
            console.log('✏️ Abrindo edição:', policyToEdit.title);
            console.log('  - document_url:', !!(policyToEdit as any).document_url);
            console.log('  - metadata:', !!(policyToEdit as any).metadata);
            
            setEditingPolicy(policyToEdit);
            setEditFormData({
              title: policyToEdit.title || '',
              description: policyToEdit.description || '',
              category: policyToEdit.category || '',
              document_type: policyToEdit.document_type || '',
              priority: (policyToEdit as any).priority || 'medium',
              effective_date: policyToEdit.effective_date || '',
              review_date: policyToEdit.review_date || '',
              expiry_date: policyToEdit.expiry_date || ''
            });
            
            // Carregar documentos existentes
            loadExistingDocuments(policyToEdit);
            setShowEditModal(true);
          }
          break;
          
        case 'alex_suggestions':
          setSelectedPolicy(policies.find(p => p.id === policyId) || null);
          setShowAlexChat(true);
          break;
          
        case 'send_review':
          await updatePolicyStatus(policyId, 'under_review');
          toast({
            title: "Política enviada para revisão",
            description: "A política foi enviada para a equipe de revisão",
          });
          break;
          
        case 'improve_description':
          toast({
            title: "Alex Policy",
            description: "Sugestão: Adicione mais detalhes sobre o propósito e escopo da política",
          });
          break;
          
        case 'suggest_structure':
          toast({
            title: "Alex Policy",
            description: "Sugestão de estrutura enviada para o chat",
          });
          setSelectedPolicy(policies.find(p => p.id === policyId) || null);
          setShowAlexChat(true);
          break;
          
        default:
          console.log('Ação não implementada:', action);
      }
    } catch (error) {
      console.error('Erro ao executar ação:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao executar a ação",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePolicy = async (updatedPolicy: Policy) => {
    console.log('\n=== 💾 INÍCIO DO SALVAMENTO NO BANCO ===');
    console.log('📥 updatedPolicy recebido:', updatedPolicy);
    
    try {
      console.log('🏗️ Construindo updateData...');
      
      // Usando função RPC para contornar problema de cache do PostgREST
      console.log('📎 DEBUG METADADOS:');
      console.log('  - updatedPolicy.metadata (original):', (updatedPolicy as any).metadata);
      console.log('  - Tipo dos metadados:', typeof (updatedPolicy as any).metadata);
      
      let metadataString;
      try {
        if ((updatedPolicy as any).metadata) {
          metadataString = typeof (updatedPolicy as any).metadata === 'string' 
            ? (updatedPolicy as any).metadata 
            : JSON.stringify((updatedPolicy as any).metadata);
          console.log('  - metadataString gerada:', metadataString);
          console.log('  - Tamanho da string:', metadataString.length);
        } else {
          metadataString = '{}';
          console.log('  - Usando metadata vazia');
        }
      } catch (metadataError) {
        console.error('  - Erro ao processar metadata:', metadataError);
        metadataString = '{}';
      }
      
      const updateData = {
        title: updatedPolicy.title,
        description: updatedPolicy.description,
        category: updatedPolicy.category,
        document_type: updatedPolicy.document_type,
        effective_date: updatedPolicy.effective_date,
        review_date: updatedPolicy.review_date,
        expiry_date: (updatedPolicy as any).expiry_date || null, // Campo correto
        priority: (updatedPolicy as any).priority,
        document_url: (updatedPolicy as any).document_url,
        metadata: metadataString,
        updated_at: new Date().toISOString(),
        updated_by: user?.id
      };
      
      console.log('📎 updateData.metadata final:', updateData.metadata);
      console.log('📎 updateData.document_url:', updateData.document_url);
      
      console.log('✅ Campo expiration_date reativado usando função RPC personalizada');
      
      console.log('📊 updateData construído:');
      Object.entries(updateData).forEach(([key, value]) => {
        console.log(`  - ${key}:`, typeof value, '→', value);
      });
      
      console.log('🆔 ID da política para update:', updatedPolicy.id);
      console.log('🔍 Tipo do ID:', typeof updatedPolicy.id);
      
      console.log('🚀 Executando query no Supabase...');
      console.log('📡 Tabela: policies');
      console.log('🔧 Operação: UPDATE');
      console.log('🎯 Condição: id =', updatedPolicy.id);
      
      const startTime = Date.now();
      
      // Tentar abordagem alternativa com RPC para contornar problema de cache
      console.log('🔧 Tentando abordagem com função RPC personalizada...');
      
      let error = null;
      let data = null;
      
      try {
        const { error: rpcError, data: rpcData } = await supabase.rpc('update_policy_direct', {
          policy_id: updatedPolicy.id,
          policy_data: updateData
        });
        
        if (rpcError) {
          console.log('🔄 RPC falhou, tentando método tradicional...', rpcError.message);
          throw rpcError;
        }
        
        console.log('✅ RPC executada com sucesso!');
        error = null;
        data = rpcData ? [rpcData] : [];
        
      } catch (rpcError) {
        console.log('🔄 Fallback para método tradicional sem expiration_date...');
        
        // Remover expiry_date para o fallback
        const { expiry_date, ...updateDataWithoutExpiration } = updateData;
        
        const { error: updateError, data: updateData2 } = await supabase
          .from('policies')
          .update(updateDataWithoutExpiration)
          .eq('id', updatedPolicy.id)
          .select();
          
        if (updateError) {
          throw updateError;
        }
        
        console.log('✅ Update tradicional funcionou!');
        error = null;
        data = updateData2;
        
        // Tentar atualizar expiry_date separadamente se necessário
        if (expiry_date) {
          console.log('🔄 Tentando atualizar expiry_date separadamente...');
          
          try {
            await supabase
              .from('policies')
              .update({ expiry_date })
              .eq('id', updatedPolicy.id);
              
            console.log('✅ expiry_date atualizado separadamente!');
          } catch (expirationError) {
            console.log('⚠️ Aviso: Não foi possível atualizar expiry_date:', expirationError.message);
          }
        }
      }
      
      const endTime = Date.now();
      console.log(`⏱️ Query executada em ${endTime - startTime}ms`);
      
      console.log('📡 Resposta completa do Supabase:');
      console.log('  - error:', error);
      console.log('  - data:', data);
      console.log('  - data length:', data?.length);
      
      if (error) {
        console.log('\n=== ❌ ERRO DO SUPABASE DETECTADO ===');
        console.error('🚨 Erro completo:', error);
        console.error('🚨 Código do erro:', error.code);
        console.error('🚨 Mensagem:', error.message);
        console.error('🚨 Detalhes:', error.details);
        console.error('🚨 Hint:', error.hint);
        
        // Verificar se é erro de constraint
        if (error.code === '23514') {
          console.log('🔍 ERRO DE CONSTRAINT DETECTADO!');
          console.log('🔍 Verificando valores que podem estar causando o erro...');
          
          if (updateData.category && !categories.includes(updateData.category)) {
            console.log('❌ Categoria inválida:', updateData.category);
            console.log('✅ Categorias válidas:', categories);
          }
          
          if (updateData.document_type && !documentTypes.includes(updateData.document_type)) {
            console.log('❌ Tipo de documento inválido:', updateData.document_type);
            console.log('✅ Tipos válidos:', documentTypes);
          }
        }
        
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.log('⚠️ AVISO: Update executado mas nenhuma linha foi retornada');
        console.log('🔍 Isso pode indicar que o ID não foi encontrado');
      } else {
        console.log('✅ Update realizado com sucesso!');
        console.log('📄 Linhas afetadas:', data.length);
        console.log('📄 Dados atualizados:', data[0]);
      }
      
      console.log('🔄 Chamando onPolicyUpdate()...');
      onPolicyUpdate();
      
      console.log('🎉 Exibindo toast de sucesso...');
      toast({
        title: "Política atualizada",
        description: "As alterações foram salvas com sucesso.",
      });
      
      console.log('✅ handleSavePolicy concluído com sucesso');
      
    } catch (error) {
      console.log('\n=== ❌ ERRO CAPTURADO EM handleSavePolicy ===');
      console.error('🚨 Erro capturado:', error);
      console.error('🚨 Tipo:', typeof error);
      console.error('🚨 Nome:', error.name);
      console.error('🚨 Mensagem:', error.message);
      
      console.log('🔄 Re-throwing error para handleSaveEdit...');
      throw error;
    }
    
    console.log('=== 💾 FIM DO SALVAMENTO NO BANCO ===\n');
  };

  const updatePolicyStatus = async (policyId: string, newStatus: string) => {
    const { error } = await supabase
      .from('policies')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', policyId);

    if (error) throw error;
    onPolicyUpdate();
  };

  const handleCreateNewPolicy = () => {
    console.log('🆕 Abrindo modal de criação de nova política');
    
    // Resetar formulário
    setCreateFormData({
      title: '',
      description: '',
      category: '',
      document_type: 'Política',
      priority: 'medium',
      effective_date: '',
      review_date: '',
      expiry_date: ''
    });
    
    // Limpar documentos anexados
    setCreateAttachedDocuments([]);
    
    // Abrir modal
    setShowCreateModal(true);
  };

  const handleEditInputChange = (field: string, value: string) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleCreateInputChange = (field: string, value: string) => {
    setCreateFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const loadExistingDocuments = (policy: Policy) => {
    console.log('📁 Carregando documentos para:', policy.title);
    
    const documents = [];
    
    // Carregar documento principal se existir
    if ((policy as any).document_url) {
      const mainDoc = {
        id: 'main-document',
        name: `${policy.title}.pdf`,
        size: 1024000,
        type: 'application/pdf',
        url: (policy as any).document_url,
        storagePath: '',
        uploadedAt: new Date().toISOString()
      };
      documents.push(mainDoc);
      console.log('✅ Documento principal carregado');
    }
    
    // Carregar documentos dos metadados se existirem
    try {
      const metadata = (policy as any).metadata;
      if (metadata) {
        let parsedMetadata;
        
        if (typeof metadata === 'string') {
          parsedMetadata = JSON.parse(metadata);
        } else {
          parsedMetadata = metadata;
        }
        
        if (parsedMetadata.attachedDocuments && Array.isArray(parsedMetadata.attachedDocuments)) {
          parsedMetadata.attachedDocuments.forEach((doc: any, index: number) => {
            const processedDoc = {
              id: doc.id || `metadata-${index}`,
              name: doc.name || `Documento ${index + 1}`,
              size: doc.size || 0,
              type: doc.type || 'application/octet-stream',
              url: doc.url || '',
              storagePath: doc.storagePath || '',
              uploadedAt: doc.uploadedAt || new Date().toISOString()
            };
            
            documents.push(processedDoc);
          });
          console.log(`✅ ${parsedMetadata.attachedDocuments.length} anexos carregados dos metadados`);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao carregar documentos dos metadados:', error);
    }
    
    console.log(`📁 Total: ${documents.length} documentos carregados`);
    setAttachedDocuments(documents);
  };

  const handleFileUpload = async (files: FileList) => {
    if (!files.length) return;
    
    setIsUploading(true);
    
    try {
      for (const file of Array.from(files)) {
        const allowedTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain'
        ];
        
        if (!allowedTypes.includes(file.type)) {
          toast({
            title: "Tipo de arquivo não suportado",
            description: `O arquivo ${file.name} não é suportado. Use PDF, DOC, DOCX ou TXT.`,
            variant: "destructive",
          });
          continue;
        }
        
        if (file.size > 10 * 1024 * 1024) {
          toast({
            title: "Arquivo muito grande",
            description: `O arquivo ${file.name} é muito grande. Máximo: 10MB.`,
            variant: "destructive",
          });
          continue;
        }
        
        console.log('📁 Iniciando upload real do arquivo:', file.name);
        
        // Gerar nome único para o arquivo
        const fileExtension = file.name.split('.').pop();
        const fileName = `${user?.tenantId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
        
        console.log('📁 Nome do arquivo no storage:', fileName);
        
        // === DEBUG COMPLETO DO UPLOAD ===
        console.log('\n=== 🔍 DEBUG COMPLETO DO UPLOAD ===');
        console.log('⏰ Timestamp:', new Date().toISOString());
        console.log('📁 Arquivo selecionado:');
        console.log('  - Nome:', file.name);
        console.log('  - Tamanho:', file.size, 'bytes');
        console.log('  - Tipo MIME:', file.type);
        console.log('  - Última modificação:', new Date(file.lastModified).toISOString());
        
        // 1. Verificar autenticação
        console.log('\n🔑 ETAPA 1: Verificando autenticação...');
        const session = await supabase.auth.getSession();
        console.log('  - Sessão existe:', !!session.data.session);
        
        if (session.data.session) {
          console.log('  - User ID:', session.data.session.user?.id);
          console.log('  - Email:', session.data.session.user?.email);
          console.log('  - Role:', session.data.session.user?.role);
          console.log('  - Token expira em:', new Date(session.data.session.expires_at! * 1000).toISOString());
          console.log('  - Token válido:', new Date(session.data.session.expires_at! * 1000) > new Date());
        } else {
          console.error('❌ Sessão não encontrada!');
          
          // Tentar obter usuário diretamente
          const { data: userData, error: userError } = await supabase.auth.getUser();
          console.log('  - Tentativa getUser():', userData.user ? 'Sucesso' : 'Falhou');
          if (userError) console.log('  - Erro getUser():', userError.message);
        }
        
        // 2. Verificar configuração do cliente Supabase
        console.log('\n🔧 ETAPA 2: Verificando configuração do cliente...');
        console.log('  - URL Supabase:', supabase.supabaseUrl);
        console.log('  - Chave pública:', supabase.supabaseKey.substring(0, 20) + '...');
        
        // 3. Gerar nome do arquivo
        console.log('\n📝 ETAPA 3: Gerando nome do arquivo...');
        console.log('  - Tenant ID:', user?.tenantId);
        console.log('  - Timestamp:', Date.now());
        console.log('  - Random:', Math.random().toString(36).substring(2));
        console.log('  - Extensão:', file.name.split('.').pop());
        console.log('  - Caminho final:', fileName);
        
        // 4. Verificar bucket
        console.log('\n📦 ETAPA 4: Verificando bucket...');
        try {
          const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
          console.log('  - Lista de buckets:', buckets?.map(b => b.name) || 'Erro ao listar');
          if (bucketsError) console.log('  - Erro ao listar buckets:', bucketsError.message);
          
          const policyBucket = buckets?.find(b => b.name === 'policy-documents');
          if (policyBucket) {
            console.log('  - Bucket policy-documents encontrado:');
            console.log('    - ID:', policyBucket.id);
            console.log('    - Público:', policyBucket.public);
            console.log('    - Criado em:', policyBucket.created_at);
          } else {
            console.error('  - ❌ Bucket policy-documents NÃO encontrado!');
          }
        } catch (bucketError) {
          console.error('  - ❌ Erro ao verificar buckets:', bucketError);
        }
        
        // 5. Tentar upload
        console.log('\n🚀 ETAPA 5: Executando upload...');
        console.log('  - Bucket de destino: policy-documents');
        console.log('  - Caminho do arquivo:', fileName);
        console.log('  - Opções de upload:', { cacheControl: '3600', upsert: false });
        
        const uploadStartTime = Date.now();
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('policy-documents')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });
        
        const uploadEndTime = Date.now();
        const uploadDuration = uploadEndTime - uploadStartTime;
        
        console.log('\n📡 ETAPA 6: Analisando resposta...');
        console.log('  - Duração do upload:', uploadDuration + 'ms');
        console.log('  - Upload data:', uploadData);
        console.log('  - Upload error:', uploadError);
        
        if (uploadError) {
          console.error('\n❌ ERRO DETALHADO DO UPLOAD:');
          console.error('  - Tipo do erro:', typeof uploadError);
          console.error('  - Nome da classe:', uploadError.constructor?.name);
          console.error('  - Mensagem:', uploadError.message);
          console.error('  - Código de status:', uploadError.statusCode);
          console.error('  - Stack trace:', uploadError.stack);
          
          // Tentar extrair mais informações
          if (uploadError.cause) {
            console.error('  - Causa:', uploadError.cause);
          }
          
          // Serializar o erro completo
          try {
            const errorSerialized = JSON.stringify(uploadError, Object.getOwnPropertyNames(uploadError), 2);
            console.error('  - Erro serializado:', errorSerialized);
          } catch (serError) {
            console.error('  - Erro ao serializar:', serError.message);
          }
          
          // Verificar se é erro de RLS
          if (uploadError.message?.includes('row-level security') || uploadError.message?.includes('RLS')) {
            console.error('  - 🚨 ERRO DE RLS DETECTADO!');
            console.error('  - Verificar políticas de segurança do bucket');
          }
          
          // Verificar se é erro de autenticação
          if (uploadError.message?.includes('Unauthorized') || uploadError.statusCode === 401) {
            console.error('  - 🚨 ERRO DE AUTENTICAÇÃO DETECTADO!');
            console.error('  - Token pode estar expirado ou inválido');
          }
          
          // Verificar se é erro de permissão
          if (uploadError.statusCode === 403) {
            console.error('  - 🚨 ERRO DE PERMISSÃO DETECTADO!');
            console.error('  - Usuário não tem permissão para upload');
          }
          
          toast({
            title: "Erro no upload",
            description: `Erro ao enviar ${file.name}: ${uploadError.message}`,
            variant: "destructive",
          });
          
          console.log('=== FIM DO DEBUG (COM ERRO) ===\n');
          continue;
        }
        
        console.log('✅ Upload realizado com sucesso:', uploadData);
        
        // Obter URL pública do arquivo
        const { data: urlData } = supabase.storage
          .from('policy-documents')
          .getPublicUrl(fileName);
        
        console.log('🔗 URL pública gerada:', urlData.publicUrl);
        
        const newDocument = {
          id: Date.now().toString(),
          name: file.name,
          size: file.size,
          type: file.type,
          url: urlData.publicUrl,
          storagePath: fileName,
          uploadedAt: new Date().toISOString()
        };
        
        setAttachedDocuments(prev => [...prev, newDocument]);
        
        toast({
          title: "Documento anexado",
          description: `${file.name} foi enviado e anexado com sucesso.`,
        });
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro no upload",
        description: "Ocorreu um erro ao anexar o documento.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };
  
  // Funções para modal de criação
  const handleCreateFileUpload = async (files: FileList) => {
    if (!files.length) return;
    
    setIsCreateUploading(true);
    
    try {
      for (const file of Array.from(files)) {
        const allowedTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain'
        ];
        
        if (!allowedTypes.includes(file.type)) {
          toast({
            title: "Tipo de arquivo não suportado",
            description: `O arquivo ${file.name} não é suportado. Use PDF, DOC, DOCX ou TXT.`,
            variant: "destructive",
          });
          continue;
        }
        
        if (file.size > 10 * 1024 * 1024) {
          toast({
            title: "Arquivo muito grande",
            description: `O arquivo ${file.name} é muito grande. Máximo: 10MB.`,
            variant: "destructive",
          });
          continue;
        }
        
        console.log('📁 Iniciando upload real do arquivo (criação):', file.name);
        
        // Gerar nome único para o arquivo
        const fileExtension = file.name.split('.').pop();
        const fileName = `${user?.tenantId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
        
        console.log('📁 Nome do arquivo no storage:', fileName);
        
        // === DEBUG COMPLETO DO UPLOAD (CRIAÇÃO) ===
        console.log('\n=== 🔍 DEBUG COMPLETO DO UPLOAD (CRIAÇÃO) ===');
        console.log('⏰ Timestamp:', new Date().toISOString());
        console.log('📁 Arquivo selecionado:');
        console.log('  - Nome:', file.name);
        console.log('  - Tamanho:', file.size, 'bytes');
        console.log('  - Tipo MIME:', file.type);
        console.log('  - Última modificação:', new Date(file.lastModified).toISOString());
        
        // 1. Verificar autenticação
        console.log('\n🔑 ETAPA 1: Verificando autenticação...');
        const session = await supabase.auth.getSession();
        console.log('  - Sessão existe:', !!session.data.session);
        
        if (session.data.session) {
          console.log('  - User ID:', session.data.session.user?.id);
          console.log('  - Email:', session.data.session.user?.email);
          console.log('  - Role:', session.data.session.user?.role);
          console.log('  - Token expira em:', new Date(session.data.session.expires_at! * 1000).toISOString());
          console.log('  - Token válido:', new Date(session.data.session.expires_at! * 1000) > new Date());
        } else {
          console.error('❌ Sessão não encontrada!');
          
          // Tentar obter usuário diretamente
          const { data: userData, error: userError } = await supabase.auth.getUser();
          console.log('  - Tentativa getUser():', userData.user ? 'Sucesso' : 'Falhou');
          if (userError) console.log('  - Erro getUser():', userError.message);
        }
        
        // 2. Verificar configuração do cliente Supabase
        console.log('\n🔧 ETAPA 2: Verificando configuração do cliente...');
        console.log('  - URL Supabase:', supabase.supabaseUrl);
        console.log('  - Chave pública:', supabase.supabaseKey.substring(0, 20) + '...');
        
        // 3. Gerar nome do arquivo
        console.log('\n📝 ETAPA 3: Gerando nome do arquivo...');
        console.log('  - Tenant ID:', user?.tenantId);
        console.log('  - Timestamp:', Date.now());
        console.log('  - Random:', Math.random().toString(36).substring(2));
        console.log('  - Extensão:', file.name.split('.').pop());
        console.log('  - Caminho final:', fileName);
        
        // 4. Verificar bucket
        console.log('\n📦 ETAPA 4: Verificando bucket...');
        try {
          const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
          console.log('  - Lista de buckets:', buckets?.map(b => b.name) || 'Erro ao listar');
          if (bucketsError) console.log('  - Erro ao listar buckets:', bucketsError.message);
          
          const policyBucket = buckets?.find(b => b.name === 'policy-documents');
          if (policyBucket) {
            console.log('  - Bucket policy-documents encontrado:');
            console.log('    - ID:', policyBucket.id);
            console.log('    - Público:', policyBucket.public);
            console.log('    - Criado em:', policyBucket.created_at);
          } else {
            console.error('  - ❌ Bucket policy-documents NÃO encontrado!');
          }
        } catch (bucketError) {
          console.error('  - ❌ Erro ao verificar buckets:', bucketError);
        }
        
        // 5. Tentar upload
        console.log('\n🚀 ETAPA 5: Executando upload...');
        console.log('  - Bucket de destino: policy-documents');
        console.log('  - Caminho do arquivo:', fileName);
        console.log('  - Opções de upload:', { cacheControl: '3600', upsert: false });
        
        const uploadStartTime = Date.now();
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('policy-documents')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });
        
        const uploadEndTime = Date.now();
        const uploadDuration = uploadEndTime - uploadStartTime;
        
        console.log('\n📡 ETAPA 6: Analisando resposta...');
        console.log('  - Duração do upload:', uploadDuration + 'ms');
        console.log('  - Upload data:', uploadData);
        console.log('  - Upload error:', uploadError);
        
        if (uploadError) {
          console.error('\n❌ ERRO DETALHADO DO UPLOAD:');
          console.error('  - Tipo do erro:', typeof uploadError);
          console.error('  - Nome da classe:', uploadError.constructor?.name);
          console.error('  - Mensagem:', uploadError.message);
          console.error('  - Código de status:', uploadError.statusCode);
          console.error('  - Stack trace:', uploadError.stack);
          
          // Tentar extrair mais informações
          if (uploadError.cause) {
            console.error('  - Causa:', uploadError.cause);
          }
          
          // Serializar o erro completo
          try {
            const errorSerialized = JSON.stringify(uploadError, Object.getOwnPropertyNames(uploadError), 2);
            console.error('  - Erro serializado:', errorSerialized);
          } catch (serError) {
            console.error('  - Erro ao serializar:', serError.message);
          }
          
          // Verificar se é erro de RLS
          if (uploadError.message?.includes('row-level security') || uploadError.message?.includes('RLS')) {
            console.error('  - 🚨 ERRO DE RLS DETECTADO!');
            console.error('  - Verificar políticas de segurança do bucket');
          }
          
          // Verificar se é erro de autenticação
          if (uploadError.message?.includes('Unauthorized') || uploadError.statusCode === 401) {
            console.error('  - 🚨 ERRO DE AUTENTICAÇÃO DETECTADO!');
            console.error('  - Token pode estar expirado ou inválido');
          }
          
          // Verificar se é erro de permissão
          if (uploadError.statusCode === 403) {
            console.error('  - 🚨 ERRO DE PERMISSÃO DETECTADO!');
            console.error('  - Usuário não tem permissão para upload');
          }
          
          toast({
            title: "Erro no upload",
            description: `Erro ao enviar ${file.name}: ${uploadError.message}`,
            variant: "destructive",
          });
          
          console.log('=== FIM DO DEBUG (COM ERRO) ===\n');
          continue;
        }
        
        console.log('✅ Upload realizado com sucesso:', uploadData);
        
        // Obter URL pública do arquivo
        const { data: urlData } = supabase.storage
          .from('policy-documents')
          .getPublicUrl(fileName);
        
        console.log('🔗 URL pública gerada:', urlData.publicUrl);
        
        const newDocument = {
          id: Date.now().toString(),
          name: file.name,
          size: file.size,
          type: file.type,
          url: urlData.publicUrl,
          storagePath: fileName,
          uploadedAt: new Date().toISOString()
        };
        
        setCreateAttachedDocuments(prev => [...prev, newDocument]);
        
        toast({
          title: "Documento anexado",
          description: `${file.name} foi enviado e anexado com sucesso.`,
        });
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro no upload",
        description: "Ocorreu um erro ao anexar o documento.",
        variant: "destructive",
      });
    } finally {
      setIsCreateUploading(false);
    }
  };
  
  const handleCreateDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setCreateDragActive(false);
    
    if (e.dataTransfer.files) {
      handleCreateFileUpload(e.dataTransfer.files);
    }
  };

  const handleCreateDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setCreateDragActive(true);
  };

  const handleCreateDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setCreateDragActive(false);
  };
  
  const removeCreateDocument = async (documentId: string) => {
    const document = createAttachedDocuments.find(doc => doc.id === documentId);
    
    if (document && document.storagePath) {
      console.log('🗑️ Removendo arquivo do storage:', document.storagePath);
      
      try {
        const { error } = await supabase.storage
          .from('policy-documents')
          .remove([document.storagePath]);
          
        if (error) {
          console.error('❌ Erro ao remover arquivo do storage:', error);
        } else {
          console.log('✅ Arquivo removido do storage com sucesso');
        }
      } catch (error) {
        console.error('❌ Erro ao remover arquivo:', error);
      }
    }
    
    setCreateAttachedDocuments(prev => prev.filter(doc => doc.id !== documentId));
    toast({
      title: "Documento removido",
      description: "O documento foi removido da política.",
    });
  };

  const removeDocument = async (documentId: string) => {
    const document = attachedDocuments.find(doc => doc.id === documentId);
    
    if (document && document.storagePath) {
      console.log('🗑️ Removendo arquivo do storage:', document.storagePath);
      
      try {
        const { error } = await supabase.storage
          .from('policy-documents')
          .remove([document.storagePath]);
          
        if (error) {
          console.error('❌ Erro ao remover arquivo do storage:', error);
        } else {
          console.log('✅ Arquivo removido do storage com sucesso');
        }
      } catch (error) {
        console.error('❌ Erro ao remover arquivo:', error);
      }
    }
    
    setAttachedDocuments(prev => prev.filter(doc => doc.id !== documentId));
    toast({
      title: "Documento removido",
      description: "O documento foi removido da política.",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const handleCreatePolicy = async () => {
    console.log('\n=== 🆕 DEBUG DETALHADO - CRIAÇÃO DE NOVA POLÍTICA ===');
    console.log('⏰ Timestamp:', new Date().toISOString());
    console.log('👤 Usuário:', user);
    console.log('📋 createFormData:', createFormData);
    console.log('📎 createAttachedDocuments:', createAttachedDocuments);
    
    // Validação 1: Título
    if (!createFormData.title.trim()) {
      console.log('❌ ERRO: Título vazio');
      toast({
        title: "Título obrigatório",
        description: "Por favor, informe o título da política.",
        variant: "destructive",
      });
      return;
    }
    
    // Validação 2: Categoria
    if (!createFormData.category) {
      console.log('❌ ERRO: Categoria vazia');
      toast({
        title: "Categoria obrigatória",
        description: "Por favor, selecione uma categoria.",
        variant: "destructive",
      });
      return;
    }
    
    console.log('✅ Validações passaram, iniciando criação...');
    
    // Verificar dados do usuário
    console.log('🔍 Verificando dados do usuário:');
    console.log('  - user.id:', user?.id);
    console.log('  - user.tenantId:', user?.tenantId);
    console.log('  - user.tenant:', user?.tenant);
    
    if (!user?.id) {
      console.log('❌ ERRO: Usuário não tem ID');
      toast({
        title: "Erro de autenticação",
        description: "Usuário não está autenticado corretamente.",
        variant: "destructive",
      });
      return;
    }
    
    if (!user?.tenantId) {
      console.log('❌ ERRO: Usuário não tem tenantId');
      toast({
        title: "Erro de tenant",
        description: "Usuário não está associado a um tenant.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Preparar dados da nova política (sem expiration_date devido ao cache do PostgREST)
      const newPolicyData = {
        title: createFormData.title.trim(),
        description: createFormData.description || null,
        category: createFormData.category,
        document_type: createFormData.document_type,
        priority: createFormData.priority,
        effective_date: createFormData.effective_date || null,
        review_date: createFormData.review_date || null,
        expiry_date: createFormData.expiry_date || null, // Campo correto
        status: 'draft',
        version: '1.0',
        document_url: createAttachedDocuments.length > 0 ? createAttachedDocuments[0].url : null,
        metadata: JSON.stringify({
          attachedDocuments: createAttachedDocuments.map(doc => ({
            id: doc.id,
            name: doc.name,
            size: doc.size,
            type: doc.type,
            url: doc.url,
            storagePath: doc.storagePath,
            uploadedAt: doc.uploadedAt
          }))
        }),
        created_by: user.id,
        updated_by: user.id,
        owner_id: user.id,
        tenant_id: user.tenantId
      };
      
      console.log('✅ Campo expiry_date incluído na criação');
      
      console.log('📦 Dados da nova política:', newPolicyData);
      
      // Inserir nova política no banco
      console.log('🚀 Executando INSERT no Supabase...');
      console.log('📊 Dados para inserção:', newPolicyData);
      
      const { error, data } = await supabase
        .from('policies')
        .insert([newPolicyData])
        .select();
      
      console.log('📡 Resposta do INSERT:');
      console.log('  - error:', error);
      console.log('  - data:', data);
      
      if (error) {
        console.error('❌ Erro detalhado ao criar política:', error);
        console.error('❌ Código do erro:', error.code);
        console.error('❌ Mensagem:', error.message);
        console.error('❌ Detalhes:', error.details);
        console.error('❌ Hint:', error.hint);
        
        // Verificar se é erro de constraint
        if (error.code === '23514') {
          console.log('🔍 ERRO DE CONSTRAINT DETECTADO!');
          console.log('🔍 Verificando valores que podem estar causando o erro...');
          
          if (newPolicyData.category && !categories.includes(newPolicyData.category)) {
            console.log('❌ Categoria inválida:', newPolicyData.category);
            console.log('✅ Categorias válidas:', categories);
          }
          
          if (newPolicyData.document_type && !documentTypes.includes(newPolicyData.document_type)) {
            console.log('❌ Tipo de documento inválido:', newPolicyData.document_type);
            console.log('✅ Tipos válidos:', documentTypes);
          }
        }
        
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.log('⚠️ AVISO: INSERT executado mas nenhuma linha foi retornada');
        throw new Error('Nenhum dado foi retornado após a inserção');
      }
      
      console.log('✅ Política criada com sucesso:', data[0]);
      console.log('🆔 ID da nova política:', data[0].id);
      
      // Campo expiry_date já incluído na criação, não precisa de update separado
      console.log('✅ Política criada com todos os campos, incluindo expiry_date');
      
      // Atualizar lista de políticas
      onPolicyUpdate();
      
      // Fechar modal e limpar formulário
      setShowCreateModal(false);
      setCreateFormData({
        title: '',
        description: '',
        category: '',
        document_type: 'Política',
        priority: 'medium',
        effective_date: '',
        review_date: '',
        expiry_date: ''
      });
      setCreateAttachedDocuments([]);
      
      toast({
        title: "Política criada",
        description: `A política "${createFormData.title}" foi criada com sucesso.`,
      });
      
      console.log('🎉 CRIAÇÃO CONCLUÍDA COM SUCESSO!');
      
    } catch (error) {
      console.log('\n=== ❌ ERRO CAPTURADO NA CRIAÇÃO ===');
      console.error('❌ Erro completo:', error);
      console.error('❌ Tipo do erro:', typeof error);
      console.error('❌ Nome do erro:', error.name);
      console.error('❌ Mensagem do erro:', error.message);
      console.error('❌ Stack trace:', error.stack);
      
      toast({
        title: "Erro ao criar política",
        description: `Erro: ${error.message || 'Ocorreu um erro ao criar a política.'}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      console.log('=== 🆕 FIM DO DEBUG DE CRIAÇÃO ===\n');
    }
  };

  const handleSaveEdit = async () => {
    console.log('\n=== 🔍 DEBUG DETALHADO - INÍCIO DO SALVAMENTO ===');
    console.log('⏰ Timestamp:', new Date().toISOString());
    console.log('👤 Usuário:', user);
    console.log('📝 editingPolicy:', editingPolicy);
    console.log('📋 editFormData:', editFormData);
    console.log('📎 attachedDocuments:', attachedDocuments);
    console.log('🔄 isLoading atual:', isLoading);
    
    // Validação 1: Política sendo editada
    if (!editingPolicy) {
      console.log('❌ ERRO CRÍTICO: editingPolicy é null ou undefined');
      console.log('🔍 Tipo de editingPolicy:', typeof editingPolicy);
      console.log('🔍 Valor de editingPolicy:', editingPolicy);
      return;
    }
    console.log('✅ VALIDAÇÃO 1: editingPolicy existe');
    
    // Validação 2: Título
    console.log('🔍 Validando título...');
    console.log('📝 Título atual:', `"${editFormData.title}"`);
    console.log('📏 Comprimento do título:', editFormData.title.length);
    console.log('🧹 Título após trim:', `"${editFormData.title.trim()}"`);
    
    if (!editFormData.title.trim()) {
      console.log('❌ ERRO: Título vazio após trim');
      toast({
        title: "Título obrigatório",
        description: "Por favor, informe o título da política.",
        variant: "destructive",
      });
      return;
    }
    console.log('✅ VALIDAÇÃO 2: Título válido');
    
    // Validação 3: Categoria
    console.log('🔍 Validando categoria...');
    console.log('📂 Categoria atual:', `"${editFormData.category}"`);
    console.log('📂 Tipo da categoria:', typeof editFormData.category);
    console.log('📋 Categorias disponíveis:', categories);
    console.log('🔍 Categoria está na lista?', categories.includes(editFormData.category));
    
    if (!editFormData.category) {
      console.log('❌ ERRO: Categoria vazia');
      toast({
        title: "Categoria obrigatória",
        description: "Por favor, selecione uma categoria.",
        variant: "destructive",
      });
      return;
    }
    console.log('✅ VALIDAÇÃO 3: Categoria válida');
    
    // Validação 4: Tipo de documento
    console.log('🔍 Validando tipo de documento...');
    console.log('📄 Tipo atual:', `"${editFormData.document_type}"`);
    console.log('📄 Tipo está na lista?', documentTypes.includes(editFormData.document_type));
    
    console.log('✅ TODAS AS VALIDAÇÕES PASSARAM - Iniciando salvamento...');
    
    try {
      console.log('🔄 Definindo isLoading = true');
      setIsLoading(true);
      
      console.log('🏗️ Construindo objeto updatedPolicy...');
      const updatedPolicy = {
        ...editingPolicy,
        ...editFormData,
        document_url: attachedDocuments.length > 0 ? attachedDocuments[0].url : null,
        metadata: {
          attachedDocuments: attachedDocuments.map(doc => ({
            id: doc.id,
            name: doc.name,
            size: doc.size,
            type: doc.type,
            url: doc.url,
            storagePath: doc.storagePath,
            uploadedAt: doc.uploadedAt
          }))
        },
        updated_at: new Date().toISOString(),
        updated_by: user?.id
      };
      
      console.log('📦 updatedPolicy construído:');
      console.log('  - ID:', updatedPolicy.id);
      console.log('  - Título:', updatedPolicy.title);
      console.log('  - Categoria:', updatedPolicy.category);
      console.log('  - Tipo:', updatedPolicy.document_type);
      console.log('  - Prioridade:', updatedPolicy.priority);
      console.log('  - Data efetiva:', updatedPolicy.effective_date);
      console.log('  - Data revisão:', updatedPolicy.review_date);
      console.log('  - Data expiração:', updatedPolicy.expiry_date);
      console.log('  - URL documento:', updatedPolicy.document_url);
      console.log('  - Metadados:', updatedPolicy.metadata);
      console.log('  - Updated by:', updatedPolicy.updated_by);
      
      console.log('🚀 Chamando handleSavePolicy...');
      console.log('📎 Anexos que serão salvos:', updatedPolicy.metadata);
      console.log('📎 Número de anexos:', updatedPolicy.metadata?.attachedDocuments?.length || 0);
      
      await handleSavePolicy(updatedPolicy);
      
      console.log('✅ handleSavePolicy retornou com sucesso');
      console.log('🔍 Verificando se os anexos foram salvos...');
      
      // Verificar se a política foi realmente atualizada
      try {
        const { data: verifyData, error: verifyError } = await supabase
          .from('policies')
          .select('metadata, document_url')
          .eq('id', updatedPolicy.id)
          .single();
          
        if (verifyError) {
          console.error('❌ Erro ao verificar salvamento:', verifyError);
        } else {
          console.log('✅ Dados salvos no banco:');
          console.log('  - document_url:', verifyData.document_url);
          console.log('  - metadata:', verifyData.metadata);
          
          if (verifyData.metadata) {
            let parsedMetadata;
            try {
              parsedMetadata = typeof verifyData.metadata === 'string' 
                ? JSON.parse(verifyData.metadata) 
                : verifyData.metadata;
              console.log('  - attachedDocuments salvos:', parsedMetadata.attachedDocuments?.length || 0);
            } catch (parseError) {
              console.error('❌ Erro ao parsear metadata:', parseError);
            }
          }
        }
      } catch (verifyError) {
        console.error('❌ Erro na verificação:', verifyError);
      }
      console.log('🔄 Fechando modal e limpando estado...');
      
      setShowEditModal(false);
      setEditingPolicy(null);
      setAttachedDocuments([]);
      
      console.log('🎉 SALVAMENTO CONCLUÍDO COM SUCESSO!');
      
    } catch (error) {
      console.log('\n=== ❌ ERRO CAPTURADO ===');
      console.error('🚨 Tipo do erro:', typeof error);
      console.error('🚨 Nome do erro:', error.name);
      console.error('🚨 Mensagem do erro:', error.message);
      console.error('🚨 Código do erro:', error.code);
      console.error('🚨 Detalhes do erro:', error.details);
      console.error('🚨 Hint do erro:', error.hint);
      console.error('🚨 Erro completo:', error);
      console.error('🚨 Stack trace:', error.stack);
      
      if (error.message) {
        console.log('📝 Mensagem de erro extraída:', error.message);
      }
      
      toast({
        title: "Erro ao salvar",
        description: `Erro: ${error.message || error.toString() || 'Erro desconhecido ao salvar as alterações.'}`,
        variant: "destructive",
      });
    } finally {
      console.log('🔄 Definindo isLoading = false');
      setIsLoading(false);
      console.log('=== 🏁 FIM DO DEBUG DETALHADO ===\n');
    }
  };

  const categories = [
    'Segurança da Informação',
    'Privacidade de Dados',
    'Recursos Humanos',
    'Financeiro',
    'Operacional',
    'Compliance',
    'Gestão de Riscos',
    'Ética',
    'Qualidade',
    'Ambiental'
  ];

  const documentTypes = [
    'Política',
    'Procedimento',
    'Instrução de Trabalho',
    'Manual',
    'Regulamento',
    'Norma',
    'Diretriz',
    'Padrão',
    'Código'
  ];

  const priorities = [
    { value: 'low', label: 'Baixa' },
    { value: 'medium', label: 'Média' },
    { value: 'high', label: 'Alta' },
    { value: 'critical', label: 'Crítica' }
  ];

  const handleAlexSuggestion = (suggestion: any) => {
    toast({
      title: "Alex Policy",
      description: `Sugestão "${suggestion.title}" aplicada com sucesso!`,
    });
  };

  return (
    <div className="space-y-6">

      {/* Header da seção */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold">Elaboração de Políticas</h2>
          <p className="text-muted-foreground">
            Crie, edite e desenvolva políticas com assistência da IA Alex Policy
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAlexChat(!showAlexChat)}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            {showAlexChat ? 'Ocultar' : 'Mostrar'} Alex Chat
          </Button>
          
          <Button onClick={handleCreateNewPolicy}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Política
          </Button>
        </div>
      </div>

      {/* Layout principal */}
      <div className={`grid gap-6 ${showAlexChat ? 'lg:grid-cols-3' : 'lg:grid-cols-1'}`}>
        {/* Coluna principal - Lista de políticas */}
        <div className={`space-y-4 ${showAlexChat ? 'lg:col-span-2' : 'lg:col-span-1'}`}>
          {/* Estatísticas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Em Elaboração</p>
                    <p className="text-2xl font-bold">
                      {filteredPolicies.filter(p => p.status === 'draft').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Edit className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium">Em Revisão</p>
                    <p className="text-2xl font-bold">
                      {filteredPolicies.filter(p => p.status === 'under_review').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Lightbulb className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium">Com Insights Alex</p>
                    <p className="text-2xl font-bold">
                      {filteredPolicies.filter(p => generateAlexInsights(p).length > 0).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtros e busca */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar políticas em elaboração..."
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Políticas com Cards Expansíveis */}
          <div className="space-y-4">
            {filteredPolicies.length > 0 ? (
              filteredPolicies.map((policy) => (
                <PolicyProcessCard
                  key={policy.id}
                  policy={policy}
                  mode="elaboration"
                  onAction={handlePolicyAction}
                  alexInsights={generateAlexInsights(policy)}
                />
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma política em elaboração</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Comece criando uma nova política ou verifique os filtros aplicados.
                  </p>
                  <Button onClick={handleCreateNewPolicy}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Nova Política
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Coluna lateral - Alex Policy Chat */}
        {showAlexChat && (
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <AlexPolicyChat
                policyId={selectedPolicy?.id}
                policyTitle={selectedPolicy?.title}
                mode="elaboration"
                onApplySuggestion={handleAlexSuggestion}
                className="h-[600px]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Modal de Edição Completo */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Editar Política
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Informações Básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Título *</Label>
                <Input
                  id="edit-title"
                  value={editFormData.title}
                  onChange={(e) => handleEditInputChange('title', e.target.value)}
                  placeholder="Digite o título da política"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-category">Categoria *</Label>
                <Select value={editFormData.category} onValueChange={(value) => handleEditInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-document-type">Tipo de Documento</Label>
                <Select value={editFormData.document_type} onValueChange={(value) => handleEditInputChange('document_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-priority">Prioridade</Label>
                <Select value={editFormData.priority} onValueChange={(value) => handleEditInputChange('priority', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map(priority => (
                      <SelectItem key={priority.value} value={priority.value}>{priority.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={editFormData.description}
                onChange={(e) => handleEditInputChange('description', e.target.value)}
                placeholder="Descreva o objetivo e escopo da política"
                rows={4}
              />
            </div>
            
            {/* Datas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-effective-date">Data de Vigência</Label>
                <Input
                  id="edit-effective-date"
                  type="date"
                  value={editFormData.effective_date}
                  onChange={(e) => handleEditInputChange('effective_date', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-review-date">Data de Revisão</Label>
                <Input
                  id="edit-review-date"
                  type="date"
                  value={editFormData.review_date}
                  onChange={(e) => handleEditInputChange('review_date', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-expiry-date">Data de Expiração</Label>
                <Input
                  id="edit-expiry-date"
                  type="date"
                  value={editFormData.expiry_date}
                  onChange={(e) => handleEditInputChange('expiry_date', e.target.value)}
                />
              </div>
            </div>
            
            {/* Upload de Documentos */}
            <div className="space-y-4">
              <div>
                <Label>Documentos Anexados</Label>
                <p className="text-sm text-muted-foreground">
                  Anexe o documento principal da política (PDF, DOC, DOCX, TXT - máx. 10MB)
                </p>
              </div>
              
              {/* Área de Upload */}
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted-foreground/25 hover:border-primary/50'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                {isUploading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Enviando documento...</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Arraste arquivos aqui ou clique para selecionar</p>
                      <p className="text-xs text-muted-foreground">PDF, DOC, DOCX, TXT (máx. 10MB)</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.multiple = true;
                        input.accept = '.pdf,.doc,.docx,.txt';
                        input.onchange = (e) => {
                          const files = (e.target as HTMLInputElement).files;
                          if (files) handleFileUpload(files);
                        };
                        input.click();
                      }}
                    >
                      Selecionar Arquivos
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Lista de Documentos Anexados */}
              {attachedDocuments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Documentos Anexados ({attachedDocuments.length})</h4>
                  <div className="space-y-2">
                    {attachedDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="text-sm font-medium">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(doc.size)} • {new Date(doc.uploadedAt).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(doc.url, '_blank')}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const a = document.createElement('a');
                              a.href = doc.url;
                              a.download = doc.name;
                              a.click();
                            }}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeDocument(doc.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Aviso sobre controle de versão */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Controle de Versão:</strong> Os documentos anexados seguirão a política através de todas as etapas 
                (elaboração → revisão → aprovação → publicação), garantindo rastreabilidade completa do processo.
              </AlertDescription>
            </Alert>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowEditModal(false);
              setAttachedDocuments([]);
            }} disabled={isLoading}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Criação de Nova Política */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Nova Política
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Informações Básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-title">Título *</Label>
                <Input
                  id="create-title"
                  value={createFormData.title}
                  onChange={(e) => handleCreateInputChange('title', e.target.value)}
                  placeholder="Digite o título da política"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="create-category">Categoria *</Label>
                <Select value={createFormData.category} onValueChange={(value) => handleCreateInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="create-document-type">Tipo de Documento</Label>
                <Select value={createFormData.document_type} onValueChange={(value) => handleCreateInputChange('document_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="create-priority">Prioridade</Label>
                <Select value={createFormData.priority} onValueChange={(value) => handleCreateInputChange('priority', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map(priority => (
                      <SelectItem key={priority.value} value={priority.value}>{priority.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="create-description">Descrição</Label>
              <Textarea
                id="create-description"
                value={createFormData.description}
                onChange={(e) => handleCreateInputChange('description', e.target.value)}
                placeholder="Descreva o objetivo e escopo da política"
                rows={4}
              />
            </div>
            
            {/* Datas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-effective-date">Data de Vigência</Label>
                <Input
                  id="create-effective-date"
                  type="date"
                  value={createFormData.effective_date}
                  onChange={(e) => handleCreateInputChange('effective_date', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="create-review-date">Data de Revisão</Label>
                <Input
                  id="create-review-date"
                  type="date"
                  value={createFormData.review_date}
                  onChange={(e) => handleCreateInputChange('review_date', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="create-expiry-date">Data de Expiração</Label>
                <Input
                  id="create-expiry-date"
                  type="date"
                  value={createFormData.expiry_date}
                  onChange={(e) => handleCreateInputChange('expiry_date', e.target.value)}
                />
              </div>
            </div>
            
            {/* Upload de Documentos */}
            <div className="space-y-4">
              <div>
                <Label>Documentos Anexados</Label>
                <p className="text-sm text-muted-foreground">
                  Anexe o documento principal da política (PDF, DOC, DOCX, TXT - máx. 10MB)
                </p>
              </div>
              
              {/* Área de Upload */}
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  createDragActive 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted-foreground/25 hover:border-primary/50'
                }`}
                onDrop={handleCreateDrop}
                onDragOver={handleCreateDragOver}
                onDragLeave={handleCreateDragLeave}
              >
                {isCreateUploading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Enviando documento...</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Arraste arquivos aqui ou clique para selecionar</p>
                      <p className="text-xs text-muted-foreground">PDF, DOC, DOCX, TXT (máx. 10MB)</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.multiple = true;
                        input.accept = '.pdf,.doc,.docx,.txt';
                        input.onchange = (e) => {
                          const files = (e.target as HTMLInputElement).files;
                          if (files) handleCreateFileUpload(files);
                        };
                        input.click();
                      }}
                    >
                      Selecionar Arquivos
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Lista de Documentos Anexados */}
              {createAttachedDocuments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Documentos Anexados ({createAttachedDocuments.length})</h4>
                  <div className="space-y-2">
                    {createAttachedDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="text-sm font-medium">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(doc.size)} • {new Date(doc.uploadedAt).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(doc.url, '_blank')}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const a = document.createElement('a');
                              a.href = doc.url;
                              a.download = doc.name;
                              a.click();
                            }}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeCreateDocument(doc.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Aviso sobre status inicial */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Status Inicial:</strong> A política será criada com status "Rascunho" e poderá ser editada 
                antes de ser enviada para revisão. Você poderá adicionar mais detalhes e documentos posteriormente.
              </AlertDescription>
            </Alert>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCreateModal(false);
              setCreateAttachedDocuments([]);
            }} disabled={isLoading}>
              Cancelar
            </Button>
            <Button onClick={handleCreatePolicy} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Política
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Processando...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PolicyElaboration;