import React, { useState } from 'react';
import { Calendar, AlertTriangle, Database, Users, FileText, MoreHorizontal, Edit, Trash2, CheckCircle, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

import { DataInventory } from '@/types/privacy-management';
import { DATA_CATEGORIES, SENSITIVITY_LEVELS } from '@/types/privacy-management';

interface DataInventoryCardProps {
  item: DataInventory;
  selected: boolean;
  onSelect: (selected: boolean) => void;
  onUpdate: (id: string, updates: any) => Promise<{ success: boolean; error?: string }>;
  onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
  onMarkAsReviewed: (id: string) => Promise<{ success: boolean; error?: string }>;
  showReviewAlert?: boolean;
}

export function DataInventoryCard({ 
  item, 
  selected, 
  onSelect, 
  onUpdate,
  onDelete,
  onMarkAsReviewed,
  showReviewAlert = false
}: DataInventoryCardProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este item do inventário?')) {
      return;
    }

    setLoading(true);
    try {
      const result = await onDelete(item.id);
      if (result.success) {
        toast.success('Item excluído com sucesso');
      } else {
        toast.error(result.error || 'Erro ao excluir item');
      }
    } catch (error) {
      toast.error('Erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsReviewed = async () => {
    setLoading(true);
    try {
      const result = await onMarkAsReviewed(item.id);
      if (result.success) {
        toast.success('Item marcado como revisado');
      } else {
        toast.error(result.error || 'Erro ao marcar como revisado');
      }
    } catch (error) {
      toast.error('Erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  const getSensitivityBadge = (level: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      baixa: 'outline',
      media: 'secondary',
      alta: 'default',
      critica: 'destructive'
    };

    return (
      <Badge variant={variants[level as keyof typeof variants] || 'outline'}>
        {SENSITIVITY_LEVELS[level as keyof typeof SENSITIVITY_LEVELS] || level}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: 'default',
      archived: 'secondary',
      deleted: 'destructive',
      migrated: 'outline'
    };

    const labels = {
      active: 'Ativo',
      archived: 'Arquivado',
      deleted: 'Excluído',
      migrated: 'Migrado'
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const isOverdue = (nextReviewDate?: string) => {
    if (!nextReviewDate) return false;
    return new Date(nextReviewDate) < new Date();
  };

  const isDueSoon = (nextReviewDate?: string) => {
    if (!nextReviewDate) return false;
    const reviewDate = new Date(nextReviewDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return reviewDate <= thirtyDaysFromNow && reviewDate >= new Date();
  };

  const getReviewStatus = () => {
    if (isOverdue(item.next_review_date)) {
      return { status: 'overdue', label: 'Em Atraso', color: 'text-red-600' };
    }
    if (isDueSoon(item.next_review_date)) {
      return { status: 'due_soon', label: 'Vence em Breve', color: 'text-yellow-600' };
    }
    return { status: 'ok', label: 'Em Dia', color: 'text-green-600' };
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Não definida';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    }
    if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toString();
  };

  const reviewStatus = getReviewStatus();

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${selected ? 'ring-2 ring-primary' : ''}`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <Checkbox
                checked={selected}
                onCheckedChange={onSelect}
                className="mt-1"
              />
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-2">
                  <Database className="w-5 h-5 text-muted-foreground" />
                  <h3 className="font-semibold text-lg text-foreground">{item.name}</h3>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" disabled={loading}>
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Detalhes
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleMarkAsReviewed}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Marcar como Revisado
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {getStatusBadge(item.status)}
            {getSensitivityBadge(item.sensitivity_level)}
            <Badge variant="outline">
              {DATA_CATEGORIES[item.data_category as keyof typeof DATA_CATEGORIES] || item.data_category}
            </Badge>
            <Badge variant="outline">
              {item.data_origin.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
          </div>

          {/* Review Alert */}
          {showReviewAlert && (isOverdue(item.next_review_date) || isDueSoon(item.next_review_date)) && (
            <div className={`p-3 rounded-md border ${
              isOverdue(item.next_review_date) 
                ? 'bg-red-50 border-red-200' 
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-start space-x-2">
                <AlertTriangle className={`w-4 h-4 mt-0.5 ${
                  isOverdue(item.next_review_date) ? 'text-red-600' : 'text-yellow-600'
                }`} />
                <div>
                  <p className={`text-sm font-medium ${
                    isOverdue(item.next_review_date) ? 'text-red-800' : 'text-yellow-800'
                  }`}>
                    {isOverdue(item.next_review_date) ? 'Revisão Vencida' : 'Revisão Necessária'}
                  </p>
                  <p className={`text-xs ${
                    isOverdue(item.next_review_date) ? 'text-red-700' : 'text-yellow-700'
                  }`}>
                    Data prevista: {formatDate(item.next_review_date)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* System and Data Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Sistema</p>
                  <p className="text-sm text-muted-foreground">{item.system_name}</p>
                </div>
              </div>

              {item.database_name && (
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Banco de Dados</p>
                    <p className="text-sm text-muted-foreground">{item.database_name}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Volume Estimado</p>
                  <p className="text-sm text-muted-foreground">
                    {formatVolume(item.estimated_volume)} registros
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Data Steward</p>
                  <p className="text-sm text-muted-foreground">
                    {(item as any).data_steward?.full_name || 'Não definido'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Próxima Revisão</p>
                  <p className={`text-sm ${reviewStatus.color}`}>
                    {formatDate(item.next_review_date)} - {reviewStatus.label}
                  </p>
                </div>
              </div>

              {item.retention_period_months && (
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Retenção</p>
                    <p className="text-sm text-muted-foreground">
                      {item.retention_period_months} meses
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Data Types */}
          {item.data_types && item.data_types.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Tipos de Dados:</p>
              <div className="flex flex-wrap gap-1">
                {item.data_types.slice(0, 5).map((type, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {type}
                  </Badge>
                ))}
                {item.data_types.length > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{item.data_types.length - 5} mais
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Table Fields */}
          {item.table_field_names && item.table_field_names.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Tabelas/Campos:</p>
              <div className="flex flex-wrap gap-1">
                {item.table_field_names.slice(0, 3).map((field, index) => (
                  <Badge key={index} variant="secondary" className="text-xs font-mono">
                    {field}
                  </Badge>
                ))}
                {item.table_field_names.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{item.table_field_names.length - 3} mais
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Footer Info */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="text-xs text-muted-foreground">
              Criado em {formatDate(item.created_at)}
              {item.last_reviewed_at && (
                <> • Revisado em {formatDate(item.last_reviewed_at)}</>
              )}
            </div>
            
            {item.sensitivity_level === 'critica' && (
              <div className="flex items-center space-x-1">
                <AlertTriangle className="w-3 h-3 text-destructive" />
                <span className="text-xs text-destructive font-medium">Dados Críticos</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}