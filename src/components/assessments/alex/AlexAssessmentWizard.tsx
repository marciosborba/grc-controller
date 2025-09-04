/**
 * ALEX ASSESSMENT WIZARD - Wizard para criação de assessments
 * 
 * Wizard inteligente guiado por IA para criação de assessments
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface AlexAssessmentWizardProps {
  userRole: string;
  tenantConfig: any;
  selectedFramework?: string | null;
  onComplete: (data: any) => void;
  onCancel: () => void;
}

const AlexAssessmentWizard: React.FC<AlexAssessmentWizardProps> = ({
  userRole,
  tenantConfig,
  selectedFramework,
  onComplete,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState(1);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl mx-4 max-h-[90vh] overflow-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Alex Assessment Wizard</CardTitle>
              <p className="text-gray-600">Criação inteligente de assessments</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">Alex Assessment Wizard</h3>
            <p className="text-gray-600 mb-4">
              Wizard inteligente para criação de assessments com IA
            </p>
            {selectedFramework && (
              <Badge className="mb-4">Framework: {selectedFramework}</Badge>
            )}
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button onClick={() => onComplete({ name: 'Assessment Teste', framework: selectedFramework })}>
                Simular Criação
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AlexAssessmentWizard;