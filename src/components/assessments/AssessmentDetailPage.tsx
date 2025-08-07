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
  assessment_id: string;
  maturity_level: number | null; // Deprecated - keeping for backward compatibility
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

const AssessmentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { assessments, isLoading } = useAssessments();
  
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [responses, setResponses] = useState<AssessmentResponse[]>([]);
  const [userRole, setUserRole] = useState<'respondent' | 'auditor' | null>(null);
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
      fetchUserRole();
    }
  }, [id]);

  const fetchUserRole = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data, error } = await supabase
        .from('assessment_user_roles')
        .select('role')
        .eq('assessment_id', id)
        .eq('user_id', userData.user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      setUserRole((data?.role as 'respondent' | 'auditor') || null);
    } catch (error: any) {
      // Silently handle if user has no role assigned
      setUserRole(null);
    }
  };

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
      
      setResponses(sortedData as AssessmentResponse[]);
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
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      
      let updateData: any = { [field]: value, last_updated_by_user_id: userId };
      
      // Auto-update status based on role and field
      if (userRole === 'respondent' && (field === 'respondent_maturity_level' || field === 'assessee_response' || field === 'respondent_comments')) {
        updateData.question_status = 'answered';
        updateData.answered_by_user_id = userId;
        updateData.answered_at = new Date().toISOString();
      } else if (userRole === 'auditor' && (field === 'auditor_maturity_level' || field === 'assessor_analysis' || field === 'auditor_comments')) {
        updateData.question_status = 'evaluated';
        updateData.evaluated_by_user_id = userId;
        updateData.evaluated_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('assessment_responses')
        .update(updateData)
        .eq('id', responseId);

      if (error) throw error;

      // Update local state
      setResponses(prev => prev.map(response => 
        response.id === responseId 
          ? { ...response, ...updateData }
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

  const completedResponses = responses.filter(r => r.question_status === 'evaluated').length;
  const totalResponses = responses.length;
  const progressPercentage = totalResponses > 0 ? Math.round((completedResponses / totalResponses) * 100) : 0;

  // Calculate CMMI average
  const responsesWithMaturity = responses.filter(r => 
    r.auditor_maturity_level !== null || r.respondent_maturity_level !== null
  );
  const cmmiAverage = responsesWithMaturity.length > 0 
    ? responsesWithMaturity.reduce((sum, r) => 
        sum + (r.auditor_maturity_level || r.respondent_maturity_level || 0), 0
      ) / responsesWithMaturity.length 
    : 0;

  return (
    <div className="space-y-6">
      <AssessmentHeader assessment={assessment} />
      
      <AssessmentProgress
        completedResponses={completedResponses}
        totalResponses={totalResponses}
        progressPercentage={progressPercentage}
        cmmiAverage={cmmiAverage}
        userRole={userRole}
      />

      <AssessmentResponsesTable
        responses={responses}
        isLoadingResponses={isLoadingResponses}
        isSaving={isSaving}
        userRole={userRole}
        onUpdateResponse={updateResponse}
      />
    </div>
  );
};

export default AssessmentDetailPage;