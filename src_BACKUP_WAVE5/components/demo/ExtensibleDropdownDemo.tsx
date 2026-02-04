// ============================================================================
// DEMONSTRAÇÃO DOS DROPDOWNS EXTENSÍVEIS
// ============================================================================

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ProfessionalExtensibleSelect } from '@/components/ui/professional-extensible-select';
import { 
  useDepartmentOptions, 
  useJobTitleOptions, 
  useComplianceFrameworkOptions,
  useRiskCategoryOptions,
  useIncidentTypeOptions,
  useDropdownStats,
  useDropdownManagement
} from '@/hooks/useExtensibleDropdowns';
import { Building2, Briefcase, Shield, AlertTriangle, Zap, BarChart3, Download, Upload, RotateCcw } from 'lucide-react';

export const ExtensibleDropdownDemo: React.FC = () => {
  // Estados para demonstração
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedJobTitle, setSelectedJobTitle] = useState('');
  const [selectedFramework, setSelectedFramework] = useState('');
  const [selectedRiskCategory, setSelectedRiskCategory] = useState('');
  const [selectedIncidentType, setSelectedIncidentType] = useState('');

  // Hooks
  const departmentOptions = useDepartmentOptions();
  const jobTitleOptions = useJobTitleOptions();
  const frameworkOptions = useComplianceFrameworkOptions();
  const riskCategoryOptions = useRiskCategoryOptions();
  const incidentTypeOptions = useIncidentTypeOptions();
  const stats = useDropdownStats();
  const { resetToDefaults, exportAllData } = useDropdownManagement();

  return (
    <div className="space-y-6 p-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Dropdowns Extensíveis</h1>
        <p className="text-muted-foreground">
          Sistema profissional de dropdowns com funcionalidade "Adicionar Novo"
        </p>
      </div>

      {/* Estatísticas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Estatísticas do Sistema
          </CardTitle>
          <CardDescription>
            Visão geral dos dados disponíveis nos dropdowns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center space-y-1">
              <Building2 className="h-8 w-8 mx-auto text-blue-500" />
              <div className="text-2xl font-bold">{stats.departments.active}</div>
              <div className="text-sm text-muted-foreground">Departamentos</div>
            </div>
            <div className="text-center space-y-1">
              <Briefcase className="h-8 w-8 mx-auto text-green-500" />
              <div className="text-2xl font-bold">{stats.jobTitles.active}</div>
              <div className="text-sm text-muted-foreground">Cargos</div>
            </div>
            <div className="text-center space-y-1">
              <Shield className="h-8 w-8 mx-auto text-purple-500" />
              <div className="text-2xl font-bold">{stats.complianceFrameworks.active}</div>
              <div className="text-sm text-muted-foreground">Frameworks</div>
            </div>
            <div className="text-center space-y-1">
              <AlertTriangle className="h-8 w-8 mx-auto text-orange-500" />
              <div className="text-2xl font-bold">{stats.riskCategories.active}</div>
              <div className="text-sm text-muted-foreground">Categorias</div>
            </div>
            <div className="text-center space-y-1">
              <Zap className="h-8 w-8 mx-auto text-red-500" />
              <div className="text-2xl font-bold">{stats.incidentTypes.active}</div>
              <div className="text-sm text-muted-foreground">Incidentes</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demonstração dos Dropdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Departamentos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-500" />
              Departamentos
            </CardTitle>
            <CardDescription>
              Selecione ou adicione um departamento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ProfessionalExtensibleSelect
              value={selectedDepartment}
              onValueChange={setSelectedDepartment}
              type="departments"
              canAddNew={true}
              hasAddPermission={departmentOptions.canAdd}
              validateNewItem={departmentOptions.validateNewItem}
              showDescription={true}
              allowClear={true}
            />
            {selectedDepartment && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm font-medium">Selecionado:</div>
                <div className="text-sm text-muted-foreground">{selectedDepartment}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cargos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-green-500" />
              Cargos
            </CardTitle>
            <CardDescription>
              Selecione ou adicione um cargo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ProfessionalExtensibleSelect
              value={selectedJobTitle}
              onValueChange={setSelectedJobTitle}
              type="jobTitles"
              canAddNew={true}
              hasAddPermission={jobTitleOptions.canAdd}
              validateNewItem={jobTitleOptions.validateNewItem}
              showDescription={true}
              allowClear={true}
            />
            {selectedJobTitle && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm font-medium">Selecionado:</div>
                <div className="text-sm text-muted-foreground">{selectedJobTitle}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Frameworks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-500" />
              Frameworks de Compliance
            </CardTitle>
            <CardDescription>
              Selecione ou adicione um framework
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ProfessionalExtensibleSelect
              value={selectedFramework}
              onValueChange={setSelectedFramework}
              type="complianceFrameworks"
              canAddNew={true}
              hasAddPermission={frameworkOptions.canAdd}
              validateNewItem={frameworkOptions.validateNewItem}
              showDescription={true}
              allowClear={true}
            />
            {selectedFramework && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm font-medium">Selecionado:</div>
                <div className="text-sm text-muted-foreground">{selectedFramework}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Categorias de Risco */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Categorias de Risco
            </CardTitle>
            <CardDescription>
              Selecione ou adicione uma categoria
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ProfessionalExtensibleSelect
              value={selectedRiskCategory}
              onValueChange={setSelectedRiskCategory}
              type="riskCategories"
              canAddNew={true}
              hasAddPermission={riskCategoryOptions.canAdd}
              validateNewItem={riskCategoryOptions.validateNewItem}
              showDescription={true}
              allowClear={true}
            />
            {selectedRiskCategory && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm font-medium">Selecionado:</div>
                <div className="text-sm text-muted-foreground">{selectedRiskCategory}</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tipos de Incidente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-red-500" />
            Tipos de Incidente
          </CardTitle>
          <CardDescription>
            Selecione ou adicione um tipo de incidente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-w-md">
            <ProfessionalExtensibleSelect
              value={selectedIncidentType}
              onValueChange={setSelectedIncidentType}
              type="incidentTypes"
              canAddNew={true}
              hasAddPermission={incidentTypeOptions.canAdd}
              validateNewItem={incidentTypeOptions.validateNewItem}
              showDescription={true}
              allowClear={true}
            />
          </div>
          {selectedIncidentType && (
            <div className="p-3 bg-muted rounded-lg max-w-md">
              <div className="text-sm font-medium">Selecionado:</div>
              <div className="text-sm text-muted-foreground">{selectedIncidentType}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ações de Gerenciamento */}
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Dados</CardTitle>
          <CardDescription>
            Ações para gerenciar os dados dos dropdowns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={exportAllData}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar Dados
            </Button>
            <Button
              variant="outline"
              onClick={resetToDefaults}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Restaurar Padrões
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Informações sobre Permissões */}
      <Card>
        <CardHeader>
          <CardTitle>Status das Permissões</CardTitle>
          <CardDescription>
            Suas permissões para gerenciar os dropdowns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <div className="font-medium text-sm">Departamentos</div>
              <div className="space-y-1">
                <Badge variant={departmentOptions.canAdd ? "default" : "secondary"}>
                  {departmentOptions.canAdd ? "Pode Adicionar" : "Sem Permissão"}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="font-medium text-sm">Cargos</div>
              <div className="space-y-1">
                <Badge variant={jobTitleOptions.canAdd ? "default" : "secondary"}>
                  {jobTitleOptions.canAdd ? "Pode Adicionar" : "Sem Permissão"}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="font-medium text-sm">Frameworks</div>
              <div className="space-y-1">
                <Badge variant={frameworkOptions.canAdd ? "default" : "secondary"}>
                  {frameworkOptions.canAdd ? "Pode Adicionar" : "Sem Permissão"}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="font-medium text-sm">Categorias</div>
              <div className="space-y-1">
                <Badge variant={riskCategoryOptions.canAdd ? "default" : "secondary"}>
                  {riskCategoryOptions.canAdd ? "Pode Adicionar" : "Sem Permissão"}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="font-medium text-sm">Incidentes</div>
              <div className="space-y-1">
                <Badge variant={incidentTypeOptions.canAdd ? "default" : "secondary"}>
                  {incidentTypeOptions.canAdd ? "Pode Adicionar" : "Sem Permissão"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};