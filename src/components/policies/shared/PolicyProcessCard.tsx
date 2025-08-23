import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Calendar,
  User,
  Clock,
  CheckCircle,
  AlertTriangle,
  Edit,
  Trash2,
  Eye,
  MessageSquare,
  Lightbulb,
  BookOpen,
  Paperclip,
  Download
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PolicyProcessCardProps {
  policy: {
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
    document_url?: string;
    metadata?: any;
  };
  mode: 'elaboration' | 'review' | 'approval' | 'publication' | 'lifecycle' | 'analytics';
  onAction: (action: string, policyId: string, data?: any) => void;
  alexInsights?: Array<{
    type: 'suggestion' | 'warning' | 'info';
    title: string;
    description: string;
    action?: string;
  }>;
  className?: string;
}

const PolicyProcessCard: React.FC<PolicyProcessCardProps> = ({
  policy,
  mode,
  onAction,
  alexInsights = [],
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Sistema de cores melhorado com melhor contraste
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return {
          color: 'bg-slate-200 text-slate-900 border-slate-300',
          icon: FileText,
          label: 'Rascunho'
        };
      case 'pending_approval':
        return {
          color: 'bg-amber-200 text-amber-900 border-amber-300',
          icon: Clock,
          label: 'Aguardando Aprovação'
        };
      case 'approved':
        return {
          color: 'bg-emerald-200 text-emerald-900 border-emerald-300',
          icon: CheckCircle,
          label: 'Aprovada'
        };
      case 'under_review':
        return {
          color: 'bg-blue-200 text-blue-900 border-blue-300',
          icon: Eye,
          label: 'Em Revisão'
        };
      case 'rejected':
        return {
          color: 'bg-red-200 text-red-900 border-red-300',
          icon: AlertTriangle,
          label: 'Rejeitada'
        };
      case 'published':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: BookOpen,
          label: 'Publicada'
        };
      case 'expired':
        return {
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: AlertTriangle,
          label: 'Expirada'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: FileText,
          label: status
        };
    }
  };

  const statusConfig = getStatusConfig(policy.status);
  const StatusIcon = statusConfig.icon;

  const getModeActions = () => {
    switch (mode) {
      case 'elaboration':
        return [
          { label: 'Editar', action: 'edit', icon: Edit, variant: 'outline' as const },
          { label: 'Alex Sugestões', action: 'alex_suggestions', icon: Lightbulb, variant: 'secondary' as const },
          { label: 'Enviar para Revisão', action: 'send_review', icon: Eye, variant: 'default' as const }
        ];
      case 'review':
        return [
          { label: 'Revisar', action: 'review', icon: Eye, variant: 'outline' as const },
          { label: 'Comentar', action: 'comment', icon: MessageSquare, variant: 'secondary' as const },
          { label: 'Aprovar', action: 'approve', icon: CheckCircle, variant: 'default' as const }
        ];
      case 'approval':
        return [
          { label: 'Visualizar', action: 'view', icon: Eye, variant: 'outline' as const },
          { label: 'Aprovar', action: 'approve', icon: CheckCircle, variant: 'default' as const },
          { label: 'Rejeitar', action: 'reject', icon: AlertTriangle, variant: 'destructive' as const }
        ];
      case 'publication':
        return [
          { label: 'Publicar', action: 'publish', icon: BookOpen, variant: 'default' as const },
          { label: 'Agendar', action: 'schedule', icon: Calendar, variant: 'outline' as const }
        ];
      case 'lifecycle':
        return [
          { label: 'Visualizar', action: 'view', icon: Eye, variant: 'outline' as const },
          { label: 'Renovar', action: 'renew', icon: Calendar, variant: 'default' as const },
          { label: 'Arquivar', action: 'archive', icon: Trash2, variant: 'destructive' as const }
        ];
      default:
        return [
          { label: 'Visualizar', action: 'view', icon: Eye, variant: 'outline' as const },
          { label: 'Editar', action: 'edit', icon: Edit, variant: 'default' as const }
        ];
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Não definida';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  };

  const actions = getModeActions();

  return (
    <Card className={`w-full transition-all duration-200 hover:shadow-md ${className}`}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div className="flex-shrink-0">
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold text-lg truncate">{policy.title}</h3>
                    <Badge className={`${statusConfig.color} flex items-center space-x-1`}>
                      <StatusIcon className="h-3 w-3" />
                      <span>{statusConfig.label}</span>
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span className="flex items-center space-x-1">
                      <FileText className="h-3 w-3" />
                      <span>{policy.document_type}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>v{policy.version}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span>{policy.category}</span>
                    </span>
                    {(policy.document_url || policy.metadata?.attachedDocuments?.length > 0) && (
                      <span className="flex items-center space-x-1">
                        <Paperclip className="h-3 w-3" />
                        <span>
                          {policy.metadata?.attachedDocuments?.length || 1} doc(s)
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 flex-shrink-0">
                {alexInsights.length > 0 && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-900 border-blue-200 dark:bg-blue-950/30 dark:text-blue-100 dark:border-blue-700">
                    <Lightbulb className="h-3 w-3 mr-1" />
                    {alexInsights.length} Alex Insights
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Coluna 1: Informações Básicas */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">INFORMAÇÕES BÁSICAS</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Descrição:</span>
                      <p className="text-muted-foreground mt-1">{policy.description || 'Sem descrição'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Categoria:</span>
                      <span className="ml-2 text-muted-foreground">{policy.category}</span>
                    </div>
                    <div>
                      <span className="font-medium">Tipo:</span>
                      <span className="ml-2 text-muted-foreground">{policy.document_type}</span>
                    </div>
                    <div>
                      <span className="font-medium">Versão:</span>
                      <span className="ml-2 text-muted-foreground">{policy.version}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coluna 2: Timeline e Documentos */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">TIMELINE</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Criada:</span>
                      <span className="text-muted-foreground">{formatDate(policy.created_at)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Atualizada:</span>
                      <span className="text-muted-foreground">{formatDate(policy.updated_at)}</span>
                    </div>
                    {policy.effective_date && (
                      <div className="flex justify-between">
                        <span className="font-medium">Vigência:</span>
                        <span className="text-muted-foreground">{formatDate(policy.effective_date)}</span>
                      </div>
                    )}
                    {policy.review_date && (
                      <div className="flex justify-between">
                        <span className="font-medium">Revisão:</span>
                        <span className="text-muted-foreground">{formatDate(policy.review_date)}</span>
                      </div>
                    )}
                    {policy.expiry_date && (
                      <div className="flex justify-between">
                        <span className="font-medium">Expiração:</span>
                        <span className="text-muted-foreground">{formatDate(policy.expiry_date)}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Documentos Anexados */}
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">DOCUMENTOS</h4>
                  <div className="space-y-2">
                    {(() => {
                      // Verificar se tem documentos (debug simplificado)
                      let attachedDocs = [];
                      
                      if (policy.metadata) {
                        try {
                          let parsedMetadata;
                          if (typeof policy.metadata === 'string') {
                            parsedMetadata = JSON.parse(policy.metadata);
                          } else {
                            parsedMetadata = policy.metadata;
                          }
                          
                          if (parsedMetadata.attachedDocuments && Array.isArray(parsedMetadata.attachedDocuments)) {
                            attachedDocs = parsedMetadata.attachedDocuments;
                          }
                        } catch (error) {
                          console.error('📄 Erro ao processar metadata do card:', error);
                        }
                      }
                      
                      const hasDocuments = policy.document_url || attachedDocs.length > 0;
                      
                      // Log apenas se tiver documentos para debug
                      if (hasDocuments) {
                        console.log('📄 Política com documentos:', policy.title, '- URL:', !!policy.document_url, '- Anexos:', attachedDocs.length);
                      }
                      
                      return hasDocuments;
                    })() ? (
                      <div className="space-y-1">
                        {policy.document_url && (
                          <div className="flex items-center justify-between p-2 bg-muted/50 rounded text-xs">
                            <div className="flex items-center space-x-2">
                              <FileText className="h-3 w-3 text-blue-500" />
                              <span>Documento Principal</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(policy.document_url, '_blank');
                              }}
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                        {(() => {
                          let attachedDocs = [];
                          if (policy.metadata) {
                            try {
                              let parsedMetadata;
                              if (typeof policy.metadata === 'string') {
                                parsedMetadata = JSON.parse(policy.metadata);
                              } else {
                                parsedMetadata = policy.metadata;
                              }
                              
                              if (parsedMetadata.attachedDocuments && Array.isArray(parsedMetadata.attachedDocuments)) {
                                attachedDocs = parsedMetadata.attachedDocuments;
                              }
                            } catch (error) {
                              console.error('Erro ao processar metadata no render:', error);
                            }
                          }
                          
                          return attachedDocs.map((doc: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded text-xs">
                              <div className="flex items-center space-x-2">
                                <Paperclip className="h-3 w-3 text-gray-500" />
                                <span className="truncate max-w-[120px]">{doc.name || `Documento ${index + 1}`}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (doc.url) {
                                    window.open(doc.url, '_blank');
                                  }
                                }}
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                            </div>
                          ));
                        })()}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground italic">
                        Nenhum documento anexado
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Coluna 3: Ações e Alex Insights */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">AÇÕES</h4>
                  <div className="flex flex-wrap gap-2">
                    {actions.map((action, index) => {
                      const ActionIcon = action.icon;
                      return (
                        <Button
                          key={index}
                          variant={action.variant}
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAction(action.action, policy.id);
                          }}
                          className="flex items-center space-x-1"
                        >
                          <ActionIcon className="h-3 w-3" />
                          <span>{action.label}</span>
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* Alex Insights */}
                {alexInsights.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">ALEX POLICY INSIGHTS</h4>
                    <div className="space-y-2">
                      {alexInsights.slice(0, 3).map((insight, index) => (
                        <div
                          key={index}
                          className={`p-2 rounded-md text-xs ${
                            insight.type === 'suggestion'
                              ? 'bg-blue-50 text-blue-900 border border-blue-200 dark:bg-blue-950/20 dark:text-blue-100 dark:border-blue-800'
                              : insight.type === 'warning'
                              ? 'bg-amber-50 text-amber-900 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-100 dark:border-amber-800'
                              : 'bg-gray-50 text-gray-900 border border-gray-200 dark:bg-gray-950/20 dark:text-gray-100 dark:border-gray-800'
                          }`}
                        >
                          <div className="font-medium">{insight.title}</div>
                          <div className="mt-1 text-muted-foreground">{insight.description}</div>
                          {insight.action && (
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0 h-auto mt-1 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                onAction(insight.action!, policy.id);
                              }}
                            >
                              Aplicar sugestão
                            </Button>
                          )}
                        </div>
                      ))}
                      {alexInsights.length > 3 && (
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 h-auto text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAction('view_all_insights', policy.id);
                          }}
                        >
                          Ver todos os {alexInsights.length} insights
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default PolicyProcessCard;