import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Edit, Trash2, Play, Users, Calendar } from 'lucide-react';
import { Assessment } from '@/types/assessment';

interface AssessmentTableProps {
  assessments: Assessment[];
  onRefresh: () => void;
}

export function AssessmentTable({ assessments, onRefresh }: AssessmentTableProps) {
  const getStatusBadge = (status: string) => {
    const colors = {
      'planejado': 'bg-gray-100 text-gray-800',
      'iniciado': 'bg-blue-100 text-blue-800',
      'em_andamento': 'bg-yellow-100 text-yellow-800',
      'em_revisao': 'bg-orange-100 text-orange-800',
      'aguardando_aprovacao': 'bg-purple-100 text-purple-800',
      'concluido': 'bg-green-100 text-green-800',
      'cancelado': 'bg-red-100 text-red-800',
      'suspenso': 'bg-slate-100 text-slate-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getMaturityColor = (level: number) => {
    if (level >= 4) return 'text-green-600';
    if (level >= 3) return 'text-yellow-600';
    if (level >= 2) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Assessments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código/Título</TableHead>
                <TableHead>Framework</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Progresso</TableHead>
                <TableHead>Maturidade</TableHead>
                <TableHead>Data Fim</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assessments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Nenhum assessment encontrado
                  </TableCell>
                </TableRow>
              ) : (
                assessments.map((assessment) => (
                  <TableRow key={assessment.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{assessment.titulo}</div>
                        <div className="text-sm text-muted-foreground">{assessment.codigo}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{assessment.framework?.nome}</div>
                        <div className="text-sm text-muted-foreground">{assessment.framework?.tipo_framework}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(assessment.status)}>
                        {assessment.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {assessment.responsavel_profile?.full_name || 'Não atribuído'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="w-20">
                        <Progress value={assessment.percentual_conclusao} className="h-2" />
                        <div className="text-xs text-muted-foreground mt-1">
                          {assessment.percentual_conclusao}%
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {assessment.percentual_maturidade ? (
                        <div className={`font-medium ${getMaturityColor(assessment.nivel_maturidade_geral || 1)}`}>
                          {assessment.percentual_maturidade}%
                          <div className="text-xs text-muted-foreground">
                            {assessment.nivel_maturidade_nome}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {assessment.data_fim_planejada ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(assessment.data_fim_planejada).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}