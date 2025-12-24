import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, Library, AreaChart, Settings } from 'lucide-react';
import AssessmentsDashboard from './AssessmentsDashboard';
import FrameworksAssessment from './FrameworksAssessment'; // We will evolve this into FrameworkCenter
// import AnalyticsDashboard from './AnalyticsDashboard'; // Placeholder

export default function EnhancedAssessmentHub() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-[1600px]">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Central de Assessments</h1>
        <p className="text-muted-foreground">
          Gerencie avaliações, frameworks e acompanhe a conformidade da sua organização.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-full max-w-[600px] grid-cols-3 bg-muted/50 p-1">
            <TabsTrigger value="overview" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="frameworks" className="gap-2">
              <Library className="h-4 w-4" />
              Frameworks
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <AreaChart className="h-4 w-4" />
              Análises
            </TabsTrigger>
          </TabsList>

          {/* Future settings or global actions */}
          {/* <Button variant="ghost" size="icon"><Settings className="h-4 w-4" /></Button> */}
        </div>

        <TabsContent value="overview" className="space-y-4 focus-visible:outline-none focus-visible:ring-0">
          <AssessmentsDashboard />
        </TabsContent>

        <TabsContent value="frameworks" className="space-y-4 focus-visible:outline-none focus-visible:ring-0">
          <FrameworksAssessment />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4 focus-visible:outline-none focus-visible:ring-0">
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              <AreaChart className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <h3 className="text-lg font-medium mb-2">Análises Avançadas em Breve</h3>
              <p>Métricas detalhadas de conformidade e evolução de maturidade por domínio.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}