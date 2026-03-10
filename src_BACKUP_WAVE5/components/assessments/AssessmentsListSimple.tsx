import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play } from 'lucide-react';

export default function AssessmentsListSimple() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/assessments')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="border-l border-muted-foreground/20 pl-4">
            <h1 className="text-2xl font-bold">Lista de Assessments</h1>
            <p className="text-muted-foreground">
              Selecione um assessment para executar ou visualizar
            </p>
          </div>
        </div>
        <Button onClick={() => navigate('/assessments/execution')}>
          <Play className="h-4 w-4 mr-2" />
          Novo Assessment
        </Button>
      </div>

      {/* Conteúdo */}
      <Card>
        <CardHeader>
          <CardTitle>Assessments Disponíveis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Esta é uma versão simplificada da lista de assessments.
            O componente completo será carregado em breve.
          </p>
          <div className="mt-4">
            <Button onClick={() => navigate('/assessments/execution')}>
              <Play className="h-4 w-4 mr-2" />
              Executar Assessment de Exemplo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}