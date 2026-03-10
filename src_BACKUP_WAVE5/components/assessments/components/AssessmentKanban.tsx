import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Assessment } from '@/types/assessment';
import { Users, Calendar, Target, MoreHorizontal } from 'lucide-react';

interface AssessmentKanbanProps {
  assessments: Assessment[];
  onRefresh: () => void;
}

export function AssessmentKanban({ assessments, onRefresh }: AssessmentKanbanProps) {
  const columns = [
    { id: 'planejado', title: 'Planejado', color: 'border-t-gray-500' },
    { id: 'iniciado', title: 'Iniciado', color: 'border-t-blue-500' },
    { id: 'em_andamento', title: 'Em Andamento', color: 'border-t-yellow-500' },
    { id: 'em_revisao', title: 'Em Revisão', color: 'border-t-orange-500' },
    { id: 'concluido', title: 'Concluído', color: 'border-t-green-500' }
  ];

  const getAssessmentsByStatus = (status: string) => {
    return assessments.filter(assessment => assessment.status === status);
  };

  const getMaturityColor = (level: number) => {
    if (level >= 4) return 'text-green-600';
    if (level >= 3) return 'text-yellow-600';
    if (level >= 2) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Kanban de Assessments</h2>
        <Button variant="outline" onClick={onRefresh}>
          Atualizar
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {columns.map((column) => {
          const columnAssessments = getAssessmentsByStatus(column.id);
          
          return (
            <div key={column.id} className="space-y-3">
              <div className={`border-t-4 ${column.color} bg-muted/50 rounded-lg p-3`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{column.title}</h3>
                  <Badge variant="secondary">{columnAssessments.length}</Badge>
                </div>
              </div>
              
              <div className="space-y-3 min-h-[400px]">
                {columnAssessments.map((assessment) => (
                  <Card key={assessment.id} className="cursor-move hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-sm font-medium leading-tight">
                            {assessment.titulo}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground mt-1">
                            {assessment.codigo}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0 space-y-3">
                      {/* Framework */}
                      <div className="flex items-center gap-1 text-xs">
                        <Target className="h-3 w-3" />
                        <span className="truncate">{assessment.framework?.nome}</span>
                      </div>
                      
                      {/* Responsável */}
                      <div className="flex items-center gap-1 text-xs">
                        <Users className="h-3 w-3" />
                        <span className="truncate">
                          {assessment.responsavel_profile?.full_name || 'Não atribuído'}
                        </span>
                      </div>
                      
                      {/* Data Fim */}
                      {assessment.data_fim_planejada && (
                        <div className="flex items-center gap-1 text-xs">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(assessment.data_fim_planejada).toLocaleDateString()}</span>
                        </div>
                      )}
                      
                      {/* Progresso */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Progresso</span>
                          <span>{assessment.percentual_conclusao}%</span>
                        </div>
                        <Progress value={assessment.percentual_conclusao} className="h-1" />
                      </div>
                      
                      {/* Maturidade */}
                      {assessment.percentual_maturidade && (
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Maturidade</span>
                          <span className={`text-xs font-medium ${getMaturityColor(assessment.nivel_maturidade_geral || 1)}`}>
                            {assessment.percentual_maturidade}%
                          </span>
                        </div>
                      )}
                      
                      {/* Gaps */}
                      {assessment.gaps_identificados > 0 && (
                        <div className="flex gap-1">
                          <Badge variant="destructive" className="text-xs">
                            {assessment.gaps_identificados} gaps
                          </Badge>
                          {assessment.apontamentos_criticos > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {assessment.apontamentos_criticos} críticos
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                
                {columnAssessments.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    Nenhum assessment neste status
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}