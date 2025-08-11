import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Target, Star } from 'lucide-react';

interface AssessmentProgressProps {
  completedResponses: number;
  totalResponses: number;
  progressPercentage: number;
  cmmiAverage?: number;
  userRole?: 'respondent' | 'auditor' | null;
}

const AssessmentProgress: React.FC<AssessmentProgressProps> = ({
  completedResponses,
  totalResponses,
  progressPercentage,
  cmmiAverage = 0,
  userRole,
}) => {
  const getRoleText = () => {
    if (userRole === 'respondent') return 'Respondente';
    if (userRole === 'auditor') return 'Auditor';
    return 'Visualizador';
  };

  const getRoleColor = () => {
    if (userRole === 'respondent') return 'bg-blue-100 text-blue-800';
    if (userRole === 'auditor') return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-4">
      {userRole && (
        <Card className="overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Seu papel neste assessment</h3>
                <Badge className={getRoleColor()}>
                  {getRoleText()}
                </Badge>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Permissões</div>
                <div className="text-xs">
                  {userRole === 'respondent' && 'Responder questões e definir maturidade'}
                  {userRole === 'auditor' && 'Avaliar respostas e validar maturidade'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progresso Geral</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressPercentage}%</div>
            <Progress value={progressPercentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {completedResponses} de {totalResponses} controles avaliados
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Controles Avaliados</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedResponses}</div>
            <p className="text-xs text-muted-foreground">
              Controles com status "avaliado"
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Controles Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalResponses - completedResponses}</div>
            <p className="text-xs text-muted-foreground">
              Controles aguardando avaliação
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média CMMI</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cmmiAverage.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Nível médio de maturidade
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AssessmentProgress;