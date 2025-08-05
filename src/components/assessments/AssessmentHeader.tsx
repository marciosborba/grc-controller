import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useIsMobile } from '@/hooks/use-mobile';
import type { Assessment } from '@/hooks/useAssessments';

interface AssessmentHeaderProps {
  assessment: Assessment;
}

const AssessmentHeader: React.FC<AssessmentHeaderProps> = ({ assessment }) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <>
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate('/assessments')} className="cursor-pointer">
              Assessments
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{assessment.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/assessments')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div className="flex-1">
          <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold tracking-tight`}>
            {assessment.name}
          </h1>
          <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'items-center'} gap-4 mt-2`}>
            <Badge variant="secondary">{assessment.framework?.short_name}</Badge>
            <Badge className={
              assessment.status === 'Concluído' ? 'bg-green-100 text-green-800' :
              assessment.status === 'Em Andamento' ? 'bg-blue-100 text-blue-800' :
              assessment.status === 'Em Revisão' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }>
              {assessment.status}
            </Badge>
          </div>
        </div>
      </div>
    </>
  );
};

export default AssessmentHeader;