import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { GitBranch, Building, FileCheck, Clock, CheckCircle2 } from 'lucide-react';
import type { VendorRegistry, VendorAssessment } from '@/hooks/useVendorRiskManagement';

export interface VendorProcessViewProps {
  vendors: VendorRegistry[];
  assessments: VendorAssessment[];
  loading: boolean;
}

export const VendorProcessView: React.FC<VendorProcessViewProps> = ({
  vendors,
  assessments,
  loading
}) => {
  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const processStages = [
    {
      id: 'onboarding',
      title: 'Onboarding',
      description: 'Cadastro e validação inicial',
      icon: Building,
      vendors: vendors.filter(v => v.status === 'onboarding'),
      color: 'bg-blue-100 text-blue-600 border-blue-200'
    },
    {
      id: 'assessment',
      title: 'Assessment',
      description: 'Avaliação de riscos em andamento',
      icon: FileCheck,
      vendors: vendors.filter(v => 
        assessments.some(a => a.vendor_id === v.id && a.status === 'in_progress')
      ),
      color: 'bg-amber-100 text-amber-600 border-amber-200'
    },
    {
      id: 'review',
      title: 'Revisão',
      description: 'Aguardando aprovação',
      icon: Clock,
      vendors: vendors.filter(v => 
        assessments.some(a => a.vendor_id === v.id && a.status === 'completed')
      ),
      color: 'bg-purple-100 text-purple-600 border-purple-200'
    },
    {
      id: 'active',
      title: 'Ativo',
      description: 'Operacional e monitorado',
      icon: CheckCircle2,
      vendors: vendors.filter(v => v.status === 'active'),
      color: 'bg-green-100 text-green-600 border-green-200'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Process Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {processStages.map((stage) => (
          <Card key={stage.id} className="transition-all hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${stage.color.split(' ')[0]} ${stage.color.split(' ')[1]}`}>
                  <stage.icon className="h-5 w-5" />
                </div>
                <Badge variant="outline" className="text-xs">
                  {stage.vendors.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">{stage.title}</h3>
                <p className="text-xs text-gray-600">{stage.description}</p>
                <div className="space-y-1">
                  {stage.vendors.slice(0, 3).map((vendor) => (
                    <div key={vendor.id} className="text-xs text-gray-500 truncate">
                      • {vendor.name}
                    </div>
                  ))}
                  {stage.vendors.length > 3 && (
                    <div className="text-xs text-gray-400">
                      +{stage.vendors.length - 3} mais
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Process Flow */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Fluxo do Processo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <GitBranch className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Visualização de processo em desenvolvimento</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};