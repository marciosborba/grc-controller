import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const maturityLevels = [
  { level: 1, label: 'Inicial', description: 'Processos imprevisíveis, mal controlados.' },
  { level: 2, label: 'Gerenciado', description: 'Processos planejados e executados conforme política.' },
  { level: 3, label: 'Definido', description: 'Processos bem caracterizados e entendidos.' },
  { level: 4, label: 'Quantitativamente Gerenciado', description: 'Processos controlados e medidos.' },
  { level: 5, label: 'Otimização', description: 'Foco em melhoria contínua.' },
];

const getCMMILevel = (score: number) => {
  if (score >= 90) return 5;
  if (score >= 75) return 4;
  if (score >= 60) return 3;
  if (score >= 40) return 2;
  return 1;
};

const AssessmentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [assessment, setAssessment] = useState<any>(null);
  const [responses, setResponses] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchAssessment = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('vendor_assessments')
        .select('*')
        .eq('id', id)
        .single();
      if (error) {
        toast({ title: 'Erro', description: 'Assessment não encontrado', variant: 'destructive' });
        navigate('/assessments');
        return;
      }
      setAssessment(data);
      setResponses(data.responses || {});
      setLoading(false);
    };
    if (id) fetchAssessment();
  }, [id, navigate, toast]);

  if (loading) return <div className="p-8 text-center">Carregando...</div>;
  if (!assessment) return null;

  const questions = assessment.questionnaire_data?.questions || [];

  // Cálculo de score simples: cada resposta "positiva" soma pontos
  const calcScore = () => {
    let total = 0;
    let max = 0;
    for (const q of questions) {
      max += 10;
      const r = responses[q.id];
      if (q.type === 'boolean') total += r ? 10 : 0;
      else if (q.type === 'select' && q.options) {
        const idx = q.options.indexOf(r);
        total += idx === 0 ? 10 : idx === 1 ? 8 : idx === 2 ? 6 : idx === 3 ? 4 : 0;
      } else if (q.type === 'multiple' && Array.isArray(r)) {
        total += Math.min(10, (r.length / (q.options?.length || 1)) * 10);
      } else if (q.type === 'number') {
        total += Math.min(10, Math.max(0, r / 10));
      }
    }
    return max > 0 ? Math.round((total / max) * 100) : 0;
  };

  const score = calcScore();
  const maturity = maturityLevels.find(m => m.level === getCMMILevel(score));

  const handleChange = (qid: string, value: any) => {
    setResponses((prev: any) => ({ ...prev, [qid]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('vendor_assessments')
      .update({ responses })
      .eq('id', id);
    setSaving(false);
    if (error) {
      toast({ title: 'Erro', description: 'Falha ao salvar respostas', variant: 'destructive' });
    } else {
      toast({ title: 'Sucesso', description: 'Respostas salvas com sucesso!' });
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{assessment.title}</CardTitle>
          <div className="text-sm text-muted-foreground">Framework: {assessment.framework || '-'}</div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Badge>Maturidade: {maturity?.label} ({score}%)</Badge>
            <div className="text-xs text-muted-foreground mt-1">{maturity?.description}</div>
          </div>
          <form className="space-y-6" onSubmit={e => { e.preventDefault(); handleSave(); }}>
            {questions.map((q: any, idx: number) => (
              <div key={q.id} className="space-y-1">
                <Label>{idx + 1}. {q.question}</Label>
                {q.type === 'boolean' && (
                  <div className="flex gap-4 mt-1">
                    <Button type="button" variant={responses[q.id] === true ? 'default' : 'outline'} onClick={() => handleChange(q.id, true)}>Sim</Button>
                    <Button type="button" variant={responses[q.id] === false ? 'default' : 'outline'} onClick={() => handleChange(q.id, false)}>Não</Button>
                  </div>
                )}
                {q.type === 'select' && (
                  <select className="input mt-1" value={responses[q.id] || ''} onChange={e => handleChange(q.id, e.target.value)}>
                    <option value="">Selecione...</option>
                    {q.options?.map((opt: string) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                )}
                {q.type === 'multiple' && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {q.options?.map((opt: string) => (
                      <label key={opt} className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={Array.isArray(responses[q.id]) && responses[q.id].includes(opt)}
                          onChange={e => {
                            const arr = Array.isArray(responses[q.id]) ? [...responses[q.id]] : [];
                            if (e.target.checked) arr.push(opt);
                            else arr.splice(arr.indexOf(opt), 1);
                            handleChange(q.id, arr);
                          }}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                )}
                {q.type === 'number' && (
                  <Input
                    type="number"
                    value={responses[q.id] || ''}
                    onChange={e => handleChange(q.id, Number(e.target.value))}
                    className="mt-1 w-32"
                  />
                )}
                {q.type === 'text' && (
                  <Textarea
                    value={responses[q.id] || ''}
                    onChange={e => handleChange(q.id, e.target.value)}
                    className="mt-1"
                  />
                )}
              </div>
            ))}
            <div className="flex gap-2 justify-end pt-4">
              <Button type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar Respostas'}</Button>
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>Voltar</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssessmentDetailPage; 