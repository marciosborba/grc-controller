import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useIsMobile } from '@/hooks/use-mobile';

interface AssessmentResponse {
  id: string;
  control_id: string;
  assessment_id: string;
  maturity_level: number | null;
  respondent_maturity_level: number | null;
  auditor_maturity_level: number | null;
  assessee_response: string | null;
  assessor_analysis: string | null;
  respondent_comments: string | null;
  auditor_comments: string | null;
  question_status: 'pending' | 'answered' | 'under_review' | 'evaluated';
  answered_by_user_id: string | null;
  answered_at: string | null;
  evaluated_by_user_id: string | null;
  evaluated_at: string | null;
  last_updated_by_user_id: string | null;
  control: {
    control_code: string;
    control_text: string;
    domain: string;
  };
}

interface AssessmentResponseRowProps {
  response: AssessmentResponse;
  isSaving: boolean;
  userRole: 'respondent' | 'auditor' | null;
  onUpdateResponse: (responseId: string, field: string, value: any) => void;
}

const getMaturityLevelText = (level: number | null) => {
  const levels = {
    1: 'Inexistente',
    2: 'Ad Hoc',
    3: 'Definido',
    4: 'Gerenciado',
    5: 'Otimizado'
  };
  return level ? levels[level as keyof typeof levels] : 'Não avaliado';
};

const getMaturityLevelColor = (level: number | null) => {
  const colors = {
    1: 'bg-red-100 text-red-800',
    2: 'bg-orange-100 text-orange-800',
    3: 'bg-yellow-100 text-yellow-800',
    4: 'bg-blue-100 text-blue-800',
    5: 'bg-green-100 text-green-800'
  };
  return level ? colors[level as keyof typeof colors] : 'bg-gray-100 text-gray-800';
};

const getStatusText = (status: string) => {
  const statusMap = {
    pending: 'Pendente',
    answered: 'Respondido',
    under_review: 'Em Revisão',
    evaluated: 'Avaliado'
  };
  return statusMap[status as keyof typeof statusMap] || status;
};

const getStatusColor = (status: string) => {
  const colorMap = {
    pending: 'bg-gray-100 text-gray-800',
    answered: 'bg-blue-100 text-blue-800',
    under_review: 'bg-yellow-100 text-yellow-800',
    evaluated: 'bg-green-100 text-green-800'
  };
  return colorMap[status as keyof typeof colorMap] || 'bg-gray-100 text-gray-800';
};

const AssessmentResponseRow: React.FC<AssessmentResponseRowProps> = ({
  response,
  isSaving,
  userRole,
  onUpdateResponse,
}) => {
  const isMobile = useIsMobile();
  
  const currentMaturity = response.auditor_maturity_level || response.respondent_maturity_level;
  const isRespondent = userRole === 'respondent';
  const isAuditor = userRole === 'auditor';

  return (
    <TableRow>
      <TableCell className="font-medium">
        {response.control?.control_code}
      </TableCell>
      <TableCell className="max-w-xs">
        <div className="text-sm">
          {response.control?.control_text?.length > 100 
            ? `${response.control.control_text.substring(0, 100)}...`
            : response.control?.control_text
          }
        </div>
        {isMobile && (
          <div className="mt-2 space-y-2">
            <Badge variant="outline" className="text-xs">
              {response.control?.domain}
            </Badge>
            <Badge className={`text-xs ${getStatusColor(response.question_status)}`}>
              {getStatusText(response.question_status)}
            </Badge>
            {(isRespondent || !userRole) && (
              <Textarea
                value={response.assessee_response || ''}
                onChange={(e) => onUpdateResponse(response.id, 'assessee_response', e.target.value)}
                placeholder="Descreva a implementação..."
                className="min-h-[60px] text-xs"
                disabled={isSaving || (isAuditor && response.question_status === 'evaluated')}
              />
            )}
            {(isAuditor || !userRole) && (
              <Textarea
                value={response.assessor_analysis || ''}
                onChange={(e) => onUpdateResponse(response.id, 'assessor_analysis', e.target.value)}
                placeholder="Análise do auditor..."
                className="min-h-[60px] text-xs"
                disabled={isSaving || (isRespondent)}
              />
            )}
          </div>
        )}
      </TableCell>
      {!isMobile && (
        <TableCell>
          <Badge variant="outline">{response.control?.domain}</Badge>
        </TableCell>
      )}
      <TableCell>
        <Badge className={getStatusColor(response.question_status)}>
          {getStatusText(response.question_status)}
        </Badge>
      </TableCell>
      <TableCell>
        <Select
          value={isRespondent 
            ? (response.respondent_maturity_level?.toString() || '') 
            : isAuditor 
            ? (response.auditor_maturity_level?.toString() || '')
            : (currentMaturity?.toString() || '')
          }
          onValueChange={(value) => {
            const field = isRespondent ? 'respondent_maturity_level' : 'auditor_maturity_level';
            onUpdateResponse(response.id, field, parseInt(value));
          }}
          disabled={isSaving || !userRole}
        >
          <SelectTrigger className={isMobile ? "w-32" : "w-40"}>
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 - Inexistente</SelectItem>
            <SelectItem value="2">2 - Ad Hoc</SelectItem>
            <SelectItem value="3">3 - Definido</SelectItem>
            <SelectItem value="4">4 - Gerenciado</SelectItem>
            <SelectItem value="5">5 - Otimizado</SelectItem>
          </SelectContent>
        </Select>
        {currentMaturity && (
          <Badge className={`mt-1 ${getMaturityLevelColor(currentMaturity)}`}>
            {isMobile ? currentMaturity : getMaturityLevelText(currentMaturity)}
          </Badge>
        )}
        {!isMobile && response.respondent_maturity_level && response.auditor_maturity_level && 
         response.respondent_maturity_level !== response.auditor_maturity_level && (
          <div className="text-xs text-amber-600 mt-1">
            Respondente: {response.respondent_maturity_level} | Auditor: {response.auditor_maturity_level}
          </div>
        )}
      </TableCell>
      {!isMobile && (
        <TableCell>
          <Textarea
            value={response.assessee_response || ''}
            onChange={(e) => onUpdateResponse(response.id, 'assessee_response', e.target.value)}
            placeholder={isRespondent ? "Descreva a implementação do controle..." : "Resposta do respondente"}
            className="min-h-[60px]"
            disabled={isSaving || (isAuditor && response.question_status === 'evaluated') || (!isRespondent && !isAuditor)}
            readOnly={isAuditor}
          />
        </TableCell>
      )}
      {!isMobile && (
        <TableCell>
          <Textarea
            value={response.assessor_analysis || ''}
            onChange={(e) => onUpdateResponse(response.id, 'assessor_analysis', e.target.value)}
            placeholder={isAuditor ? "Sua análise..." : "Análise do auditor"}
            className="min-h-[60px]"
            disabled={isSaving || isRespondent || (!isRespondent && !isAuditor)}
            readOnly={isRespondent}
          />
        </TableCell>
      )}
    </TableRow>
  );
};

export default AssessmentResponseRow;