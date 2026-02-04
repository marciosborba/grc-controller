import React, { useState } from 'react';
import { Check, Eye, EyeOff, AlertTriangle, Database, FileText, Shield, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

import { DataDiscoveryResult } from '@/types/privacy-management';
import { DATA_CATEGORIES, SENSITIVITY_LEVELS } from '@/types/privacy-management';

interface DataDiscoveryResultCardProps {
  result: DataDiscoveryResult;
  selected: boolean;
  onSelect: (selected: boolean) => void;
  onUpdateStatus: (resultId: string, status: 'validated' | 'classified' | 'ignored') => Promise<{ success: boolean; error?: string }>;
}

export function DataDiscoveryResultCard({
  result,
  selected,
  onSelect,
  onUpdateStatus
}: DataDiscoveryResultCardProps) {
  const [loading, setLoading] = useState(false);
  const [showSampleData, setShowSampleData] = useState(false);

  const handleStatusUpdate = async (status: 'validated' | 'classified' | 'ignored') => {
    setLoading(true);

    try {
      const response = await onUpdateStatus(result.id, status);

      if (response.success) {
        const statusLabels = {
          validated: 'validado',
          classified: 'classificado',
          ignored: 'ignorado'
        };
        toast.success(`Resultado ${statusLabels[status]} com sucesso`);
      } else {
        toast.error(response.error || 'Erro ao atualizar status');
      }
    } catch (error) {
      toast.error('Erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'discovered':
        return <Eye className="w-4 h-4 text-blue-500 dark:text-blue-400" />;
      case 'validated':
        return <Check className="w-4 h-4 text-green-500 dark:text-green-400" />;
      case 'classified':
        return <Shield className="w-4 h-4 text-purple-500 dark:text-purple-400" />;
      case 'ignored':
        return <X className="w-4 h-4 text-gray-400" />;
      default:
        return <Eye className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      discovered: 'secondary',
      validated: 'default',
      classified: 'default',
      ignored: 'outline'
    };

    const labels = {
      discovered: 'Descoberto',
      validated: 'Validado',
      classified: 'Classificado',
      ignored: 'Ignorado'
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
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

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 dark:text-green-400';
    if (score >= 0.6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const formatLocation = () => {
    if (result.table_name && result.field_name) {
      return `${result.table_name}.${result.field_name}`;
    }
    if (result.file_path) {
      return result.file_path;
    }
    return 'Localização não especificada';
  };

  const getDataTypeIcon = () => {
    const iconMap: Record<string, React.ReactNode> = {
      database: <Database className="w-4 h-4" />,
      file_system: <FileText className="w-4 h-4" />,
      default: <Database className="w-4 h-4" />
    };

    // Assuming we have source info in result, otherwise use default
    return iconMap.default;
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${selected ? 'ring-2 ring-primary' : ''}`}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <Checkbox
                checked={selected}
                onCheckedChange={onSelect}
                className="mt-1"
              />
              <div className="flex-1 space-y-1">
                <div className="flex items-center space-x-2">
                  {getDataTypeIcon()}
                  <h4 className="font-medium text-foreground">
                    {formatLocation()}
                  </h4>
                  {getStatusIcon(result.status)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {DATA_CATEGORIES[result.data_category as keyof typeof DATA_CATEGORIES]} • {result.data_type}
                </p>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" disabled={loading}>
                  Ações
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleStatusUpdate('validated')}>
                  <Check className="w-4 h-4 mr-2" />
                  Validar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusUpdate('classified')}>
                  <Shield className="w-4 h-4 mr-2" />
                  Classificar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusUpdate('ignored')}>
                  <X className="w-4 h-4 mr-2" />
                  Ignorar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Status and Badges */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getStatusBadge(result.status)}
              {getSensitivityBadge(result.sensitivity_level)}
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <div className="text-muted-foreground">
                Confiança:
                <span className={`ml-1 font-medium ${getConfidenceColor(result.confidence_score)}`}>
                  {Math.round(result.confidence_score * 100)}%
                </span>
              </div>
              <div className="text-muted-foreground">
                Registros: <span className="font-medium">{result.estimated_records.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Sample Data */}
          {result.sample_data && (
            <div className="border-t pt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Dados de Exemplo:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSampleData(!showSampleData)}
                >
                  {showSampleData ? (
                    <>
                      <EyeOff className="w-3 h-3 mr-1" />
                      Ocultar
                    </>
                  ) : (
                    <>
                      <Eye className="w-3 h-3 mr-1" />
                      Mostrar
                    </>
                  )}
                </Button>
              </div>

              {showSampleData && (
                <div className="bg-muted p-3 rounded-md">
                  <code className="text-sm font-mono">{result.sample_data}</code>
                </div>
              )}
            </div>
          )}

          {/* Additional Info */}
          <div className="grid grid-cols-2 gap-4 pt-2 text-sm">
            <div>
              <span className="text-muted-foreground">Descoberto em:</span>
              <div className="font-medium">
                {new Date(result.discovered_at).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>

            {result.reviewed_at && result.reviewed_by && (
              <div>
                <span className="text-muted-foreground">Revisado em:</span>
                <div className="font-medium">
                  {new Date(result.reviewed_at).toLocaleDateString('pt-BR')}
                </div>
              </div>
            )}
          </div>

          {/* High Sensitivity Alert */}
          {result.sensitivity_level === 'critica' && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-destructive mt-0.5" />
                <div>
                  <h5 className="text-sm font-medium text-destructive">Dados Críticos Detectados</h5>
                  <p className="text-sm text-destructive/80">
                    Este resultado contém dados altamente sensíveis que requerem atenção especial conforme LGPD.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}