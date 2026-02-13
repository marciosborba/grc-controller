import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LayoutDashboard } from 'lucide-react';
import AssessmentsDashboard from './AssessmentsDashboard';

export default function EnhancedAssessmentHub() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Central de Assessments</h1>
        <p className="text-muted-foreground">
          Gerencie avaliações, frameworks e acompanhe a conformidade da sua organização.
        </p>
      </div>

      <AssessmentsDashboard />
    </div>
  );
}