import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
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
  Download,
  Tag
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

const STATUS_MAP: Record<string, { label: string; accent: string; pill: string; icon: React.ElementType }> = {
  draft: { label: 'Rascunho', accent: 'border-l-slate-400', pill: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300', icon: FileText },
  pending_approval: { label: 'Pendente', accent: 'border-l-amber-500', pill: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200', icon: Clock },
  approved: { label: 'Aprovada', accent: 'border-l-green-500', pill: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200', icon: CheckCircle },
  under_review: { label: 'Em Revisão', accent: 'border-l-blue-500', pill: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200', icon: Eye },
  rejected: { label: 'Rejeitada', accent: 'border-l-red-500', pill: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200', icon: AlertTriangle },
  published: { label: 'Publicada', accent: 'border-l-emerald-500', pill: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200', icon: BookOpen },
  expired: { label: 'Expirada', accent: 'border-l-orange-500', pill: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200', icon: AlertTriangle },
};

const ACTIONS_MAP: Record<string, Array<{ label: string; action: string; icon: React.ElementType; variant: 'outline' | 'default' | 'secondary' | 'destructive' }>> = {
  elaboration: [
    { label: 'Editar', action: 'edit', icon: Edit, variant: 'outline' },
    { label: 'Enviar Revisão', action: 'send_review', icon: Eye, variant: 'default' },
  ],
  review: [
    { label: 'Revisar', action: 'review', icon: Eye, variant: 'outline' },
    { label: 'Comentar', action: 'comment', icon: MessageSquare, variant: 'outline' },
    { label: 'Aprovar', action: 'approve', icon: CheckCircle, variant: 'default' },
  ],
  approval: [
    { label: 'Visualizar', action: 'view', icon: Eye, variant: 'outline' },
    { label: 'Aprovar', action: 'approve', icon: CheckCircle, variant: 'default' },
    { label: 'Rejeitar', action: 'reject', icon: AlertTriangle, variant: 'destructive' },
  ],
  publication: [
    { label: 'Publicar', action: 'publish', icon: BookOpen, variant: 'default' },
    { label: 'Agendar', action: 'schedule', icon: Calendar, variant: 'outline' },
  ],
  lifecycle: [
    { label: 'Visualizar', action: 'view', icon: Eye, variant: 'outline' },
    { label: 'Renovar', action: 'renew', icon: Calendar, variant: 'default' },
    { label: 'Arquivar', action: 'archive', icon: Trash2, variant: 'destructive' },
  ],
};

const PolicyProcessCard: React.FC<PolicyProcessCardProps> = ({
  policy,
  mode,
  onAction,
  alexInsights = [],
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusKey = policy.status?.toLowerCase() ?? 'draft';
  const status = STATUS_MAP[statusKey] ?? { ...STATUS_MAP.draft, label: policy.status };
  const StatusIcon = status.icon;
  const actions = ACTIONS_MAP[mode] ?? ACTIONS_MAP.elaboration;

  const formatDate = (d?: string) => {
    if (!d) return '—';
    try { return format(new Date(d), 'dd/MM/yy', { locale: ptBR }); }
    catch { return '—'; }
  };

  const getAttachedDocs = (): any[] => {
    if (!policy.metadata) return [];
    try {
      const p = typeof policy.metadata === 'string' ? JSON.parse(policy.metadata) : policy.metadata;
      return Array.isArray(p.attachedDocuments) ? p.attachedDocuments : [];
    } catch { return []; }
  };
  const attachedDocs = getAttachedDocs();
  const totalDocs = (policy.document_url ? 1 : 0) + attachedDocs.length;

  return (
    <div className={`rounded-lg border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow ${className}`}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>

        {/* ── Collapsed Row ── */}
        <CollapsibleTrigger asChild>
          <div className={`border-l-[3px] ${status.accent} flex items-start gap-2 px-3 py-3 cursor-pointer hover:bg-muted/30 transition-colors`}>

            {/* Chevron */}
            <div className="mt-0.5 shrink-0 text-muted-foreground">
              {isExpanded
                ? <ChevronDown className="h-3.5 w-3.5" />
                : <ChevronRight className="h-3.5 w-3.5" />}
            </div>

            {/* Main info */}
            <div className="flex-1 min-w-0 space-y-1">
              {/* Title row */}
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold leading-tight truncate">{policy.title}</p>
                {/* Status pill — fixed width, no wrapping */}
                <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${status.pill}`}>
                  <StatusIcon className="h-2.5 w-2.5" />
                  {status.label}
                </span>
              </div>

              {/* Meta row — soft, small, wrapping allowed */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <FileText className="h-2.5 w-2.5 shrink-0" />
                  {policy.document_type}
                </span>
                <span className="flex items-center gap-1">
                  <Tag className="h-2.5 w-2.5 shrink-0" />
                  {policy.category}
                </span>
                <span className="flex items-center gap-1 shrink-0">
                  <Calendar className="h-2.5 w-2.5" />
                  v{policy.version}
                </span>
                {totalDocs > 0 && (
                  <span className="flex items-center gap-0.5 shrink-0">
                    <Paperclip className="h-2.5 w-2.5" />
                    {totalDocs}
                  </span>
                )}
                {alexInsights.length > 0 && (
                  <span className="flex items-center gap-0.5 text-blue-500 dark:text-blue-400 shrink-0">
                    <Lightbulb className="h-2.5 w-2.5" />
                    {alexInsights.length}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CollapsibleTrigger>

        {/* ── Expanded Content ── */}
        <CollapsibleContent>
          <div className={`border-l-[3px] ${status.accent} px-4 py-3 space-y-4 border-t bg-muted/10`}>

            {/* Description */}
            {policy.description && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {policy.description}
              </p>
            )}

            {/* Dates + Docs */}
            <div className="grid grid-cols-2 gap-4">
              {/* Dates */}
              <div className="space-y-2">
                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Datas</p>
                <div className="space-y-1.5 text-xs">
                  {[
                    { label: 'Criada', value: policy.created_at },
                    { label: 'Atualizada', value: policy.updated_at },
                    { label: 'Vigência', value: policy.effective_date },
                    { label: 'Expiração', value: policy.expiry_date },
                  ].filter(row => !!row.value).map(row => (
                    <div key={row.label} className="flex items-center justify-between gap-1">
                      <span className="text-muted-foreground">{row.label}</span>
                      <span className="font-medium tabular-nums">{formatDate(row.value)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Documents */}
              <div className="space-y-2">
                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Documentos</p>
                {totalDocs === 0 ? (
                  <p className="text-[11px] text-muted-foreground italic">Nenhum</p>
                ) : (
                  <div className="space-y-1">
                    {policy.document_url && (
                      <DocItem
                        name="Principal"
                        icon={<FileText className="h-3 w-3 text-blue-500" />}
                        url={policy.document_url}
                      />
                    )}
                    {attachedDocs.slice(0, 4).map((doc: any, i: number) => (
                      <DocItem
                        key={i}
                        name={doc.name || `Doc ${i + 1}`}
                        icon={<Paperclip className="h-3 w-3 text-muted-foreground" />}
                        url={doc.url}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Insights */}
            {alexInsights.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Insights</p>
                {alexInsights.slice(0, 2).map((ins, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-2 px-2.5 py-2 rounded-md text-xs ${ins.type === 'warning'
                        ? 'bg-amber-50 dark:bg-amber-950/25 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-700'
                        : 'bg-blue-50 dark:bg-blue-950/25 text-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-700'
                      }`}
                  >
                    <Lightbulb className="h-3 w-3 mt-0.5 shrink-0 opacity-70" />
                    <span className="leading-snug">{ins.title}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-1 border-t border-border/50">
              {actions.map((act, i) => {
                const Icon = act.icon;
                return (
                  <Button
                    key={i}
                    variant={act.variant}
                    size="sm"
                    className="h-7 text-xs px-3 gap-1.5"
                    onClick={(e) => { e.stopPropagation(); onAction(act.action, policy.id); }}
                  >
                    <Icon className="h-3 w-3" />
                    {act.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

/** Sub-component: single document row */
const DocItem: React.FC<{ name: string; icon: React.ReactNode; url?: string }> = ({ name, icon, url }) => (
  <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-muted/60 text-[11px]">
    {icon}
    <span className="truncate flex-1">{name}</span>
    {url && (
      <button
        className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        onClick={(e) => { e.stopPropagation(); window.open(url, '_blank'); }}
      >
        <Download className="h-3 w-3" />
      </button>
    )}
  </div>
);

export default PolicyProcessCard;