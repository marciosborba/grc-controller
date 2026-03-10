import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Assessment } from '@/types/assessment';
import { Calendar, Clock, Users } from 'lucide-react';

interface AssessmentCalendarProps {
  assessments: Assessment[];
}

export function AssessmentCalendar({ assessments }: AssessmentCalendarProps) {
  // Agrupar assessments por mês
  const groupAssessmentsByMonth = () => {
    const groups: { [key: string]: Assessment[] } = {};
    
    assessments.forEach(assessment => {
      if (assessment.data_fim_planejada) {
        const date = new Date(assessment.data_fim_planejada);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!groups[monthKey]) {
          groups[monthKey] = [];
        }
        groups[monthKey].push(assessment);
      }
    });
    
    return groups;
  };

  const assessmentsByMonth = groupAssessmentsByMonth();
  const sortedMonths = Object.keys(assessmentsByMonth).sort();

  const getStatusColor = (status: string) => {
    const colors = {
      'planejado': 'bg-gray-100 text-gray-800',
      'iniciado': 'bg-blue-100 text-blue-800',
      'em_andamento': 'bg-yellow-100 text-yellow-800',
      'em_revisao': 'bg-orange-100 text-orange-800',
      'concluido': 'bg-green-100 text-green-800',
      'cancelado': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatMonthYear = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  const isOverdue = (assessment: Assessment) => {
    if (!assessment.data_fim_planejada) return false;
    const today = new Date();
    const dueDate = new Date(assessment.data_fim_planejada);
    return dueDate < today && assessment.status !== 'concluido';
  };

  const getDaysUntilDue = (assessment: Assessment) => {
    if (!assessment.data_fim_planejada) return null;
    const today = new Date();
    const dueDate = new Date(assessment.data_fim_planejada);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Calendário de Assessments</h2>
      </div>

      {sortedMonths.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">Nenhum assessment agendado</h3>
              <p className="text-sm text-muted-foreground">
                Assessments com datas definidas aparecerão aqui
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {sortedMonths.map((monthKey) => {
            const monthAssessments = assessmentsByMonth[monthKey];
            
            return (
              <Card key={monthKey}>
                <CardHeader>
                  <CardTitle className="capitalize">
                    {formatMonthYear(monthKey)}
                    <Badge variant="secondary" className="ml-2">
                      {monthAssessments.length} assessment{monthAssessments.length > 1 ? 's' : ''}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {monthAssessments.map((assessment) => {
                      const daysUntilDue = getDaysUntilDue(assessment);
                      const overdue = isOverdue(assessment);
                      
                      return (
                        <div 
                          key={assessment.id} 
                          className={`p-4 border rounded-lg ${overdue ? 'border-red-200 bg-red-50' : 'border-border'}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium">{assessment.titulo}</h4>
                                <Badge className={getStatusColor(assessment.status)}>
                                  {assessment.status.replace('_', ' ')}
                                </Badge>
                                {overdue && (
                                  <Badge variant="destructive" className="text-xs">
                                    Atrasado
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="space-y-1 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>
                                    Data limite: {new Date(assessment.data_fim_planejada!).toLocaleDateString()}
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  <span>{assessment.responsavel_profile?.full_name || 'Não atribuído'}</span>
                                </div>
                                
                                {daysUntilDue !== null && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span>
                                      {overdue 
                                        ? `${Math.abs(daysUntilDue)} dias atrasado`
                                        : daysUntilDue === 0
                                        ? 'Vence hoje'
                                        : daysUntilDue === 1
                                        ? 'Vence amanhã'
                                        : `${daysUntilDue} dias restantes`
                                      }
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="text-sm font-medium">
                                {assessment.percentual_conclusao}%
                              </div>
                              <div className="text-xs text-muted-foreground">
                                concluído
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-3 flex justify-between items-center">
                            <div className="text-xs text-muted-foreground">
                              Framework: {assessment.framework?.nome}
                            </div>
                            
                            {assessment.gaps_identificados > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {assessment.gaps_identificados} gaps identificados
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}