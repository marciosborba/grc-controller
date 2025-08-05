import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAssessments, Assessment } from '@/hooks/useAssessments';
import AssessmentHeader from './AssessmentHeader';
import AssessmentProgress from './AssessmentProgress';
import AssessmentResponsesTable from './AssessmentResponsesTable';

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

const AssessmentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { assessments, isLoading } = useAssessments();
  
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [responses, setResponses] = useState<AssessmentResponse[]>([]);
  const [isLoadingResponses, setIsLoadingResponses] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (assessments.length > 0 && id) {
      const foundAssessment = assessments.find(a => a.id === id);
      setAssessment(foundAssessment || null);
    }
  }, [assessments, id]);

  useEffect(() => {
    if (id) {
      fetchResponses();
    }
  }, [id]);

  const fetchResponses = async () => {
    try {
      setIsLoadingResponses(true);
      const { data, error } = await supabase
        .from('assessment_responses')
        .select(`
          *,
          control:framework_controls (
            control_code,
            control_text,
            domain
          )
        `)
        .eq('assessment_id', id);

      if (error) throw error;
      
      // Sort responses by control_code after fetching
      const sortedData = (data || []).sort((a, b) => {
        const codeA = a.control?.control_code || '';
        const codeB = b.control?.control_code || '';
        return codeA.localeCompare(codeB);
      });
      
      setResponses(sortedData);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar respostas do assessment.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingResponses(false);
    }
  };

  const updateResponse = async (responseId: string, field: string, value: any) => {
    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('assessment_responses')
        .update({ [field]: value, last_updated_by_user_id: (await supabase.auth.getUser()).data.user?.id })
        .eq('id', responseId);

      if (error) throw error;

      // Update local state
      setResponses(prev => prev.map(response => 
        response.id === responseId 
          ? { ...response, [field]: value }
          : response
      ));

      toast({
        title: 'Sucesso',
        description: 'Resposta atualizada com sucesso.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Erro ao salvar resposta.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };


  if (isLoading || !assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const completedResponses = responses.filter(r => r.maturity_level !== null).length;
  const totalResponses = responses.length;
  const progressPercentage = totalResponses > 0 ? Math.round((completedResponses / totalResponses) * 100) : 0;

  return (
    <div className="space-y-6">
      <AssessmentHeader assessment={assessment} />
      
      <AssessmentProgress
        completedResponses={completedResponses}
        totalResponses={totalResponses}
        progressPercentage={progressPercentage}
      />

      <AssessmentResponsesTable
        responses={responses}
        isLoadingResponses={isLoadingResponses}
        isSaving={isSaving}
        onUpdateResponse={updateResponse}
      />
    </div>
  );
};

export default AssessmentDetailPage;