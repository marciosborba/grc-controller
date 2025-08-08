import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useIsMobile } from '@/hooks/use-mobile';
import AssessmentResponseRow from './AssessmentResponseRow';

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

interface AssessmentResponsesTableProps {
  responses: AssessmentResponse[];
  isLoadingResponses: boolean;
  isSaving: boolean;
  userRole: 'respondent' | 'auditor' | null;
  onUpdateResponse: (responseId: string, field: string, value: any) => void;
  onAddControl?: () => void;
}

const AssessmentResponsesTable: React.FC<AssessmentResponsesTableProps> = ({
  responses,
  isLoadingResponses,
  isSaving,
  userRole,
  onUpdateResponse,
  onAddControl,
}) => {
  const isMobile = useIsMobile();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Controles do Framework</CardTitle>
        {onAddControl && userRole && (
          <Button onClick={onAddControl} size="sm" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Adicionar Controle
          </Button>
        )}
      </CardHeader>
      <CardContent className={isMobile ? "p-2" : "p-0"}>
        <div className={isMobile ? "overflow-x-auto" : ""}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Controle</TableHead>
                {!isMobile && <TableHead>Domínio</TableHead>}
                <TableHead>Status</TableHead>
                <TableHead>Maturidade</TableHead>
                {!isMobile && <TableHead>{userRole === 'respondent' ? 'Sua Resposta' : 'Resposta'}</TableHead>}
                {!isMobile && <TableHead>{userRole === 'auditor' ? 'Sua Análise' : 'Análise'}</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingResponses ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Carregando controles...
                  </TableCell>
                </TableRow>
              ) : responses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Nenhum controle encontrado para este assessment.
                  </TableCell>
                </TableRow>
              ) : (
                responses.map((response) => (
                  <AssessmentResponseRow
                    key={response.id}
                    response={response}
                    isSaving={isSaving}
                    userRole={userRole}
                    onUpdateResponse={onUpdateResponse}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AssessmentResponsesTable;