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
  maturity_level: number | null;
  assessee_response: string | null;
  assessor_analysis: string | null;
  control: {
    control_code: string;
    control_text: string;
    domain: string;
  };
}

interface AssessmentResponseRowProps {
  response: AssessmentResponse;
  isSaving: boolean;
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

const AssessmentResponseRow: React.FC<AssessmentResponseRowProps> = ({
  response,
  isSaving,
  onUpdateResponse,
}) => {
  const isMobile = useIsMobile();

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
            <Textarea
              value={response.assessee_response || ''}
              onChange={(e) => onUpdateResponse(response.id, 'assessee_response', e.target.value)}
              placeholder="Descreva a implementação..."
              className="min-h-[60px] text-xs"
              disabled={isSaving}
            />
            <Textarea
              value={response.assessor_analysis || ''}
              onChange={(e) => onUpdateResponse(response.id, 'assessor_analysis', e.target.value)}
              placeholder="Análise do auditor..."
              className="min-h-[60px] text-xs"
              disabled={isSaving}
            />
          </div>
        )}
      </TableCell>
      {!isMobile && (
        <TableCell>
          <Badge variant="outline">{response.control?.domain}</Badge>
        </TableCell>
      )}
      <TableCell>
        <Select
          value={response.maturity_level?.toString() || ''}
          onValueChange={(value) => onUpdateResponse(response.id, 'maturity_level', parseInt(value))}
          disabled={isSaving}
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
        {response.maturity_level && (
          <Badge className={`mt-1 ${getMaturityLevelColor(response.maturity_level)}`}>
            {isMobile ? response.maturity_level : getMaturityLevelText(response.maturity_level)}
          </Badge>
        )}
      </TableCell>
      {!isMobile && (
        <TableCell>
          <Textarea
            value={response.assessee_response || ''}
            onChange={(e) => onUpdateResponse(response.id, 'assessee_response', e.target.value)}
            placeholder="Descreva a implementação do controle..."
            className="min-h-[60px]"
            disabled={isSaving}
          />
        </TableCell>
      )}
      {!isMobile && (
        <TableCell>
          <Textarea
            value={response.assessor_analysis || ''}
            onChange={(e) => onUpdateResponse(response.id, 'assessor_analysis', e.target.value)}
            placeholder="Análise do auditor..."
            className="min-h-[60px]"
            disabled={isSaving}
          />
        </TableCell>
      )}
    </TableRow>
  );
};

export default AssessmentResponseRow;