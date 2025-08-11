import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  ChevronDown,
  ChevronRight,
  Shield,
  CheckCircle,
  Activity,
  Archive,
  AlertTriangle,
  Eye,
  EyeOff,
  MessageSquare,
  History,
  FileText,
} from 'lucide-react';

export interface EthicsReport {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  status: string;
  is_anonymous: boolean;
  reporter_name: string | null;
  reporter_email: string | null;
  reporter_phone: string | null;
  assigned_to: string | null;
  resolution: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

interface EthicsReportCardProps {
  report: EthicsReport;
  onEdit?: (report: EthicsReport) => void;
  onResolve?: (report: EthicsReport) => void;
  onDelete?: (id: string) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'open': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-800';
    case 'investigating': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800';
    case 'in_review': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-800';
    case 'resolved': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-800';
    case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/60 dark:text-gray-200 dark:border-gray-700';
    default: return 'bg-muted text-foreground/80';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'open': return <AlertTriangle className="h-4 w-4" />;
    case 'investigating': return <Activity className="h-4 w-4" />;
    case 'in_review': return <Eye className="h-4 w-4" />;
    case 'resolved': return <CheckCircle className="h-4 w-4" />;
    case 'closed': return <Archive className="h-4 w-4" />;
    default: return <Shield className="h-4 w-4" />;
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'low': return 'text-blue-600 dark:text-blue-300';
    case 'medium': return 'text-yellow-600 dark:text-yellow-300';
    case 'high': return 'text-orange-600 dark:text-orange-300';
    case 'critical': return 'text-red-600 dark:text-red-300';
    default: return 'text-muted-foreground';
  }
};

const EthicsReportCard: React.FC<EthicsReportCardProps> = ({ report, onEdit, onResolve, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState<'general' | 'investigation' | 'history'>('general');

  return (
    <Card className={`w-full transition-all duration-300 overflow-hidden ${
      isExpanded
        ? 'bg-gray-200 dark:bg-gray-700 shadow-xl ring-2 ring-gray-400 dark:ring-gray-500 border-gray-400 dark:border-gray-500'
        : 'bg-card hover:bg-muted/40 border-border'
    }`}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className={`cursor-pointer transition-colors py-3 px-4 rounded-t-lg ${
            isExpanded ? 'bg-gray-300 dark:bg-gray-600' : 'hover:bg-muted/60'
          }`} title={isExpanded ? 'Clique para recolher' : 'Clique para expandir'}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0 p-2 hover:bg-muted rounded-full transition-colors border border-border bg-background">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>

                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                  <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-sm font-semibold truncate">{report.title}</CardTitle>
                    <Badge className={`${getStatusColor(report.status)} border`}> 
                      <div className="flex items-center gap-1">
                        {getStatusIcon(report.status)}
                        <span className="capitalize">{report.status.replace('_', ' ')}</span>
                      </div>
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="truncate">{report.category}</span>
                    <span>•</span>
                    <span className={`truncate ${getSeverityColor(report.severity)}`}>{report.severity}</span>
                    <span>•</span>
                    <span className="truncate flex items-center gap-1">
                      {report.is_anonymous ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      {report.is_anonymous ? 'Anônima' : 'Identificada'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <div className="text-xs text-muted-foreground">
                  <div>Registrado:</div>
                  <div className="font-medium">
                    {format(new Date(report.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </div>
                </div>
                {report.resolved_at && (
                  <div className="text-xs mt-1 text-green-600 dark:text-green-300">
                    <div>Resolvido:</div>
                    <div className="font-medium">
                      {format(new Date(report.resolved_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-6">
              {/* Abas locais */}
              <div className="flex space-x-1 bg-muted p-1 rounded-lg">
                <button
                  onClick={() => setActiveSection('general')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    activeSection === 'general' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  Geral
                </button>

                <button
                  onClick={() => setActiveSection('investigation')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    activeSection === 'investigation' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <MessageSquare className="h-4 w-4" />
                  Investigação
                </button>

                <button
                  onClick={() => setActiveSection('history')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    activeSection === 'history' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <History className="h-4 w-4" />
                  Histórico
                </button>
              </div>

              {/* Seção: Geral */}
              {activeSection === 'general' && (
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground whitespace-pre-line">
                    {report.description}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <Badge variant="outline">Categoria: {report.category}</Badge>
                    <Badge variant="outline">Gravidade: {report.severity}</Badge>
                    {report.assigned_to && (
                      <Badge variant="outline">Atribuído a: {report.assigned_to}</Badge>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    {onEdit && (
                      <Button size="sm" variant="outline" onClick={() => onEdit(report)}>
                        Editar
                      </Button>
                    )}
                    {onResolve && (
                      <Button size="sm" onClick={() => onResolve(report)}>
                        Resolver / Atualizar Status
                      </Button>
                    )}
                    {onDelete && (
                      <Button size="sm" variant="destructive" onClick={() => onDelete(report.id)}>
                        Excluir
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Seção: Investigação */}
              {activeSection === 'investigation' && (
                <div className="space-y-3">
                  <Label>Evolução / Observações</Label>
                  <Textarea value={report.resolution || ''} readOnly rows={4} placeholder="Sem registros ainda" />
                </div>
              )}

              {/* Seção: Histórico */}
              {activeSection === 'history' && (
                <div className="text-sm text-muted-foreground">
                  Histórico detalhado poderá ser integrado aqui.
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default EthicsReportCard;
