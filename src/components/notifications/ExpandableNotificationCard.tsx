import React, { useState, useCallback } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ChevronDown,
  ChevronRight,
  Bell,
  Eye,
  EyeOff,
  Archive,
  Trash2,
  MoreVertical,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowUp,
  ArrowDown,
  Info,
  FileText,
  Target,
  History,
  Mail
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { 
  Notification, 
  NotificationPriority, 
  NotificationStatus, 
  NotificationModule 
} from '@/types/notifications';

interface ExpandableNotificationCardProps {
  notification: Notification;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  onMarkAsRead: (id: string) => void;
  onMarkAsUnread: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onActionClick: (notification: Notification, actionId: string) => void;
  canEdit?: boolean;
}

const ExpandableNotificationCard: React.FC<ExpandableNotificationCardProps> = ({
  notification,
  isSelected,
  onSelect,
  onMarkAsRead,
  onMarkAsUnread,
  onArchive,
  onDelete,
  onActionClick,
  canEdit = true
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState<'details' | 'metadata' | 'actions' | 'history'>('details');

  // Debug: Log quando o status da notificação muda
  React.useEffect(() => {
    console.log('🔄 Notificação renderizada:', notification.id, 'Status:', notification.status, 'ReadAt:', notification.readAt);
  }, [notification.status, notification.readAt, notification.id]);

  // Configurações de prioridade
  const priorityConfig = {
    low: { color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800', icon: ArrowDown },
    medium: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800', icon: ArrowUp },
    high: { color: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800', icon: AlertTriangle },
    critical: { color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800', icon: XCircle }
  };

  // Configurações de status
  const statusConfig = {
    unread: { color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800', icon: Bell },
    read: { color: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800', icon: CheckCircle },
    archived: { color: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800', icon: Archive },
    dismissed: { color: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-900/20 dark:text-gray-500 dark:border-gray-800', icon: XCircle }
  };

  // Configurações de módulo
  const moduleConfig: Record<NotificationModule, { color: string; label: string }> = {
    assessments: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400', label: 'Assessments' },
    risks: { color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', label: 'Riscos' },
    compliance: { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', label: 'Compliance' },
    policies: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400', label: 'Políticas' },
    privacy: { color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400', label: 'Privacidade' },
    audit: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400', label: 'Auditoria' },
    users: { color: 'bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400', label: 'Usuários' },
    system: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400', label: 'Sistema' },
    'general-settings': { color: 'bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-400', label: 'Configurações' },
    frameworks: { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400', label: 'Frameworks' },
    incidents: { color: 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400', label: 'Incidentes' }
  };

  const PriorityIcon = priorityConfig[notification.priority].icon;
  const StatusIcon = statusConfig[notification.status].icon;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
  };

  const handleMarkAsRead = useCallback(() => {
    console.log('🔄 Alternando status da notificação:', notification.id, 'Status atual:', notification.status);
    if (notification.status === 'unread') {
      console.log('🔵 Marcando como lida...');
      onMarkAsRead(notification.id);
    } else {
      console.log('🔴 Marcando como não lida...');
      onMarkAsUnread(notification.id);
    }
  }, [notification.id, notification.status, onMarkAsRead, onMarkAsUnread]);

  const handleArchive = useCallback(() => {
    onArchive(notification.id);
  }, [notification.id, onArchive]);

  const handleDelete = useCallback(() => {
    if (confirm('Tem certeza que deseja excluir esta notificação?')) {
      onDelete(notification.id);
    }
  }, [notification.id, onDelete]);

  return (
    <Card className={cn(
      "rounded-lg border text-card-foreground w-full transition-all duration-300 overflow-hidden",
      isExpanded 
        ? "shadow-lg border-primary/30" 
        : "hover:bg-gray-50/50 dark:hover:bg-gray-800/50 border-border",
      notification.status === 'unread' && "border-l-4 border-l-blue-500",
      isSelected && "ring-2 ring-primary",
      notification.isSticky && "border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/50"
    )}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-3 cursor-pointer">
            <div className="flex items-center justify-between gap-4">
              {/* Left Section - Checkbox e Info */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={onSelect}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-shrink-0"
                  />
                  {isExpanded ? 
                    <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" /> : 
                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  }
                </div>
                
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                  priorityConfig[notification.priority].color
                )}>
                  <PriorityIcon className="h-5 w-5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={cn(
                      "font-medium text-sm truncate",
                      notification.status === 'unread' && "font-semibold"
                    )}>
                      {notification.title}
                    </h3>
                    {notification.isSticky && (
                      <Badge variant="outline" className="text-xs flex-shrink-0">
                        Fixado
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="truncate">{moduleConfig[notification.module].label}</span>
                    <span>•</span>
                    <span className="truncate">{formatDate(notification.createdAt)}</span>
                    {notification.metadata.dueDate && (
                      <>
                        <span>•</span>
                        <span className={cn(
                          "truncate",
                          new Date(notification.metadata.dueDate) < new Date() && "text-red-600 dark:text-red-400"
                        )}>
                          Vence {formatDate(notification.metadata.dueDate)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Center Section - Message Preview */}
              <div className="flex-1 min-w-0 hidden md:block">
                <p className={cn(
                  "text-sm line-clamp-2 text-center",
                  notification.status === 'unread' ? "text-foreground" : "text-muted-foreground"
                )}>
                  {notification.message}
                </p>
              </div>
              
              {/* Right Section - Status e Actions */}
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-2 mb-1 justify-end">
                  <Badge 
                    variant="outline" 
                    className={cn("text-xs", statusConfig[notification.status].color)}
                  >
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {notification.status === 'unread' ? 'Não lida' : 
                     notification.status === 'read' ? 'Lida' :
                     notification.status === 'archived' ? 'Arquivada' : 'Descartada'}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 justify-end">
                  {notification.actions && notification.actions.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {notification.actions.length} ação(ões)
                    </span>
                  )}
                  {!isExpanded && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleMarkAsRead}>
                          {notification.status === 'unread' ? (
                            <><Eye className="h-4 w-4 mr-2" />Marcar como lida</>
                          ) : (
                            <><EyeOff className="h-4 w-4 mr-2" />Marcar como não lida</>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleArchive}>
                          <Archive className="h-4 w-4 mr-2" />
                          Arquivar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-6">
              {/* Navigation Tabs */}
              <div className="flex flex-wrap gap-1 bg-muted/50 p-1 rounded-lg border overflow-x-auto">
                <button
                  onClick={() => setActiveSection('details')}
                  className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                    activeSection === 'details' 
                      ? 'bg-background shadow-sm text-foreground border border-border' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                  }`}
                >
                  <Info className="h-3 w-3 sm:h-4 sm:w-4" />
                  Detalhes
                </button>
                
                <button
                  onClick={() => setActiveSection('metadata')}
                  className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                    activeSection === 'metadata' 
                      ? 'bg-background shadow-sm text-foreground border border-border' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                  }`}
                >
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                  Metadados
                </button>
                
                <button
                  onClick={() => setActiveSection('actions')}
                  className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                    activeSection === 'actions' 
                      ? 'bg-background shadow-sm text-foreground border border-border' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                  }`}
                >
                  <Target className="h-3 w-3 sm:h-4 sm:w-4" />
                  Ações
                  {notification.actions && notification.actions.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 text-xs">
                      {notification.actions.length}
                    </Badge>
                  )}
                </button>
                
                <button
                  onClick={() => setActiveSection('history')}
                  className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                    activeSection === 'history' 
                      ? 'bg-background shadow-sm text-foreground border border-border' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                  }`}
                >
                  <History className="h-3 w-3 sm:h-4 sm:w-4" />
                  Histórico
                </button>
              </div>

              {/* Section Content */}
              {/* 1. DETALHES */}
              {activeSection === 'details' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-border">
                    <h4 className="text-lg font-semibold text-foreground">DETALHES DA NOTIFICAÇÃO</h4>
                    {canEdit && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleMarkAsRead}
                        >
                          {notification.status === 'unread' ? (
                            <><Eye className="h-4 w-4 mr-2" />Marcar como lida</>
                          ) : (
                            <><EyeOff className="h-4 w-4 mr-2" />Marcar como não lida</>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleArchive}
                        >
                          <Archive className="h-4 w-4 mr-2" />
                          Arquivar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDelete}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-6">
                      <div className="p-4 bg-muted/30 rounded-lg border">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Título</Label>
                        <p className="text-sm font-semibold text-foreground mt-1">{notification.title}</p>
                      </div>
                      
                      <div className="p-4 bg-muted/30 rounded-lg border">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Módulo</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={moduleConfig[notification.module].color}>
                            {moduleConfig[notification.module].label}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-muted/30 rounded-lg border">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tipo</Label>
                        <p className="text-sm font-medium mt-1 capitalize">{notification.type}</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="p-4 bg-muted/30 rounded-lg border">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status & Prioridade</Label>
                        <div className="space-y-3 mt-2">
                          <div className="flex items-center gap-2">
                            <StatusIcon className="h-4 w-4" />
                            <Badge className={cn("text-xs", statusConfig[notification.status].color)}>
                              {notification.status === 'unread' ? 'Não lida' : 
                               notification.status === 'read' ? 'Lida' :
                               notification.status === 'archived' ? 'Arquivada' : 'Descartada'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <PriorityIcon className="h-4 w-4" />
                            <Badge className={cn("text-xs", priorityConfig[notification.priority].color)}>
                              {notification.priority === 'low' ? 'Baixa' :
                               notification.priority === 'medium' ? 'Média' :
                               notification.priority === 'high' ? 'Alta' : 'Crítica'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-muted/30 rounded-lg border">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Criada em</Label>
                        <p className="text-sm font-medium mt-1">
                          {format(new Date(notification.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                      
                      {notification.readAt && (
                        <div className="p-4 bg-muted/30 rounded-lg border">
                          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Lida em</Label>
                          <p className="text-sm font-medium mt-1">
                            {format(new Date(notification.readAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-6">
                      {notification.metadata.dueDate && (
                        <div className="p-4 bg-muted/30 rounded-lg border">
                          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Vencimento</Label>
                          <p className={cn(
                            "text-sm font-medium mt-1",
                            new Date(notification.metadata.dueDate) < new Date() && "text-red-600 dark:text-red-400"
                          )}>
                            {format(new Date(notification.metadata.dueDate), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(notification.metadata.dueDate)}
                          </p>
                        </div>
                      )}

                      {notification.isSticky && (
                        <div className="p-4 bg-orange-50 dark:bg-orange-950/50 rounded-lg border border-orange-200 dark:border-orange-800">
                          <Label className="text-xs font-medium text-orange-800 dark:text-orange-400 uppercase tracking-wide">Notificação Fixada</Label>
                          <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                            Esta notificação permanecerá visível até ser processada
                          </p>
                        </div>
                      )}

                      {notification.emailSettings && (
                        <div className="p-4 bg-muted/30 rounded-lg border">
                          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Configurações de E-mail</Label>
                          <div className="mt-2 space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-4 w-4" />
                              <span>{notification.emailSettings.enabled ? 'Habilitado' : 'Desabilitado'}</span>
                            </div>
                            {notification.emailSettings.template && (
                              <p className="text-xs text-muted-foreground">
                                Template: {notification.emailSettings.template}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="col-span-1 md:col-span-2 lg:col-span-3">
                      <div className="p-4 bg-muted/30 rounded-lg border">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Mensagem</Label>
                        <p className="text-sm text-foreground mt-2 leading-relaxed">{notification.message}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. METADADOS */}
              {activeSection === 'metadata' && (
                <div className="space-y-6">
                  <div className="pb-4 border-b border-border">
                    <h4 className="text-lg font-semibold text-foreground">METADADOS</h4>
                  </div>
                  
                  {Object.keys(notification.metadata).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(notification.metadata).map(([key, value]) => {
                        if (key === 'dueDate') return null; // Já mostrado na seção de detalhes
                        
                        return (
                          <div key={key} className="p-4 bg-muted/30 rounded-lg border">
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              {key === 'assessmentId' ? 'Assessment ID' :
                               key === 'riskId' ? 'Risk ID' :
                               key === 'workflowStage' ? 'Etapa do Workflow' :
                               key === 'userId' ? 'Usuário' :
                               key === 'entityId' ? 'Entidade' :
                               key}
                            </Label>
                            <p className="text-sm font-medium mt-1">
                              {typeof value === 'string' ? value : JSON.stringify(value)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">Nenhum metadado disponível</p>
                      <p className="text-sm">Esta notificação não possui metadados adicionais</p>
                    </div>
                  )}
                </div>
              )}

              {/* 3. AÇÕES */}
              {activeSection === 'actions' && (
                <div className="space-y-6">
                  <div className="pb-4 border-b border-border">
                    <h4 className="text-lg font-semibold text-foreground">AÇÕES DISPONÍVEIS</h4>
                  </div>
                  
                  {notification.actions && notification.actions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {notification.actions.map((action) => (
                        <div key={action.id} className="p-4 bg-muted/30 rounded-lg border">
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm font-medium">{action.label}</Label>
                            <Badge 
                              variant={action.type === 'primary' ? 'default' : 
                                      action.type === 'danger' ? 'destructive' : 'outline'}
                              className="text-xs"
                            >
                              {action.type === 'primary' ? 'Principal' :
                               action.type === 'danger' ? 'Perigosa' : 'Secundária'}
                            </Badge>
                          </div>
                          {action.description && (
                            <p className="text-xs text-muted-foreground mb-3">{action.description}</p>
                          )}
                          <Button
                            variant={action.type === 'primary' ? 'default' : 
                                    action.type === 'danger' ? 'destructive' : 'outline'}
                            size="sm"
                            className="w-full"
                            onClick={() => onActionClick(notification, action.id)}
                          >
                            {action.label}
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
                      <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">Nenhuma ação disponível</p>
                      <p className="text-sm">Esta notificação não possui ações específicas</p>
                    </div>
                  )}
                </div>
              )}

              {/* 4. HISTÓRICO */}
              {activeSection === 'history' && (
                <div className="space-y-6">
                  <div className="pb-4 border-b border-border">
                    <h4 className="text-lg font-semibold text-foreground">HISTÓRICO</h4>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg border">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                        <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Notificação criada</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(notification.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                    </div>

                    {notification.readAt && (
                      <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg border">
                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
                          <Eye className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Notificação lida</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(notification.readAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                    )}

                    {notification.status === 'archived' && (
                      <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg border">
                        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0">
                          <Archive className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Notificação arquivada</p>
                          <p className="text-xs text-muted-foreground">Data não disponível</p>
                        </div>
                      </div>
                    )}

                    {(!notification.readAt && notification.status === 'unread') && (
                      <div className="text-center py-8 text-muted-foreground">
                        <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Aguardando interação do usuário</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default ExpandableNotificationCard;