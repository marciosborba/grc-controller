import React from 'react';
import { FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';

interface AssessmentProgressProps {
  completedResponses: number;
  totalResponses: number;
  progressPercentage: number;
}

const AssessmentProgress: React.FC<AssessmentProgressProps> = ({
  completedResponses,
  totalResponses,
  progressPercentage,
}) => {
  const isMobile = useIsMobile();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Progresso do Assessment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-3'} gap-4`}>
          <div className="text-center">
            <div className="text-2xl font-bold">{progressPercentage}%</div>
            <div className="text-sm text-muted-foreground">Progresso</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{completedResponses}</div>
            <div className="text-sm text-muted-foreground">Controles Avaliados</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{totalResponses}</div>
            <div className="text-sm text-muted-foreground">Total de Controles</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AssessmentProgress;