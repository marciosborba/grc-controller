import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Activity, 
  Plus, 
  Edit, 
  Trash2, 
  Target, 
  AlertTriangle,
  CheckCircle,
  Settings,
  Palette
} from 'lucide-react';
import { toast } from 'sonner';

interface RiskLevel {
  id: string;
  name: string;
  value: number;
  color: string;
  description: string;
}

interface ImpactLevel {
  id: string;
  name: string;
  value: number;
  description: string;
  examples: string[];
}

interface ProbabilityLevel {
  id: string;
  name: string;
  value: number;
  description: string;
  percentage: string;
}

interface RiskMatrixConfig {
  dimensions: {
    probability: ProbabilityLevel[];
    impact: ImpactLevel[];
  };
  riskLevels: RiskLevel[];
  matrix: number[][];
  settings: {
    matrixSize: '3x3' | '4x4' | '5x5';
    calculationMethod: 'multiplication' | 'addition' | 'custom';
    autoCalculation: boolean;
  };
}

interface RiskMatrixConfigSectionProps {
  tenantId: string;
  onSettingsChange: () => void;
}

export const RiskMatrixConfigSection: React.FC<RiskMatrixConfigSectionProps> = ({
  tenantId,
  onSettingsChange
}) => {
  const [config, setConfig] = useState<RiskMatrixConfig>({
    dimensions: {
      probability: [
        { id: '1', name: 'Raro', value: 1, description: 'Evento muito improvável', percentage: '< 5%' },
        { id: '2', name: 'Improvavel', value: 2, description: 'Evento improvável', percentage: '5-25%' },
        { id: '3', name: 'Possivel', value: 3, description: 'Evento possível', percentage: '25-50%' },
        { id: '4', name: 'Provavel', value: 4, description: 'Evento provável', percentage: '50-75%' },
        { id: '5', name: 'Quase Certo', value: 5, description: 'Evento muito provável', percentage: '> 75%' }
      ],
      impact: [
        { 
          id: '1', 
          name: 'Insignificante', 
          value: 1, 
          description: 'Impacto mínimo nas operações',
          examples: ['Atraso menor que 1 dia', 'Custo < R$ 1.000']
        },
        { 
          id: '2', 
          name: 'Menor', 
          value: 2, 
          description: 'Impacto limitado nas operações',
          examples: ['Atraso de 1-3 dias', 'Custo R$ 1.000-10.000']
        },
        { 
          id: '3', 
          name: 'Moderado', 
          value: 3, 
          description: 'Impacto significativo nas operações',
          examples: ['Atraso de 1-2 semanas', 'Custo R$ 10.000-100.000']
        },
        { 
          id: '4', 
          name: 'Maior', 
          value: 4, 
          description: 'Impacto severo nas operações',
          examples: ['Atraso de 1 mês', 'Custo R$ 100.000-1M']
        },
        { 
          id: '5', 
          name: 'Catastrofico', 
          value: 5, 
          description: 'Impacto crítico nas operações',
          examples: ['Atraso > 1 mês', 'Custo > R$ 1M']
        }
      ]
    },
    riskLevels: [
      { id: '1', name: 'Muito Baixo', value: 1, color: '#3b82f6', description: 'Risco aceitável' },
      { id: '2', name: 'Baixo', value: 2, color: '#22c55e', description: 'Risco tolerável' },
      { id: '3', name: 'Médio', value: 3, color: '#eab308', description: 'Risco que requer atenção' },
      { id: '4', name: 'Alto', value: 4, color: '#f97316', description: 'Risco que requer ação imediata' },
      { id: '5', name: 'Muito Alto', value: 5, color: '#ef4444', description: 'Risco inaceitável' }
    ],
    matrix: [
      [1, 2, 3, 4, 5],
      [2, 2, 3, 4, 5],
      [3, 3, 3, 4, 5],
      [4, 4, 4, 4, 5],
      [5, 5, 5, 5, 5]
    ],
    settings: {
      matrixSize: '5x5',
      calculationMethod: 'multiplication',
      autoCalculation: true
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editType, setEditType] = useState<'probability' | 'impact' | 'riskLevel' | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadMatrixConfig();
  }, [tenantId]);

  const loadMatrixConfig = async () => {
    try {
      setIsLoading(true);
      // Carregar configuração da matriz de risco da tenant
      // Em produção, isso viria de uma API
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Configuração já está no estado inicial
    } catch (error) {
      console.error('Erro ao carregar configuração da matriz:', error);
      toast.error('Erro ao carregar configuração da matriz de risco');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      setIsLoading(true);
      // Salvar configuração da matriz de risco
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSettingsChange();
      toast.success('Configuração da matriz de risco salva com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      toast.error('Erro ao salvar configuração da matriz de risco');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateRiskLevel = (probability: number, impact: number): number => {
    switch (config.settings.calculationMethod) {
      case 'multiplication':
        return Math.min(probability * impact, 25);
      case 'addition':
        return Math.min(probability + impact, 10);
      case 'custom':
        return config.matrix[probability - 1]?.[impact - 1] || 1;
      default:
        return probability * impact;
    }
  };

  const getRiskLevelForValue = (value: number): RiskLevel => {
    // Mapear valor calculado para nível de risco
    if (value <= 2) return config.riskLevels[0];
    if (value <= 6) return config.riskLevels[1];
    if (value <= 12) return config.riskLevels[2];
    if (value <= 20) return config.riskLevels[3];
    return config.riskLevels[4];
  };

  const openEditDialog = (item: any, type: 'probability' | 'impact' | 'riskLevel') => {
    setEditingItem({ ...item });
    setEditType(type);
    setIsDialogOpen(true);
  };

  const handleSaveItem = () => {
    if (!editingItem || !editType) return;

    setConfig(prev => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [editType]: editType === 'riskLevel' 
          ? prev.riskLevels 
          : prev.dimensions[editType].map(item => 
              item.id === editingItem.id ? editingItem : item
            )
      },
      riskLevels: editType === 'riskLevel'
        ? prev.riskLevels.map(item => 
            item.id === editingItem.id ? editingItem : item
          )
        : prev.riskLevels
    }));

    setIsDialogOpen(false);
    setEditingItem(null);
    setEditType(null);
    toast.success('Item atualizado com sucesso');
  };

  const renderMatrix = () => {
    const size = parseInt(config.settings.matrixSize.charAt(0));
    const probabilityLevels = config.dimensions.probability.slice(0, size);
    const impactLevels = config.dimensions.impact.slice(0, size);

    // Função para obter cor baseada no valor de risco (padronizada com TenantCard)
    const getRiskColor = (riskValue: number, matrixSize: string) => {
      if (matrixSize === '5x5') {
        // Matriz 5x5: Muito Baixo (1-2), Baixo (3-4), Médio (5-8), Alto (9-16), Muito Alto (17-25)
        if (riskValue >= 17) return '#ef4444'; // Muito Alto - Vermelho
        else if (riskValue >= 9) return '#f97316'; // Alto - Laranja
        else if (riskValue >= 5) return '#eab308'; // Médio - Amarelo
        else if (riskValue >= 3) return '#22c55e'; // Baixo - Verde
        else return '#3b82f6'; // Muito Baixo - Azul
      } else {
        // Matriz 4x4: Baixo (1-2), Médio (3-6), Alto (7-9), Muito Alto (10-16)
        if (riskValue >= 10) return '#ef4444'; // Muito Alto - Vermelho
        else if (riskValue >= 7) return '#f97316'; // Alto - Laranja
        else if (riskValue >= 3) return '#eab308'; // Médio - Amarelo
        else return '#22c55e'; // Baixo - Verde
      }
    };

    // Função para obter nome do nível de risco
    const getRiskLevelName = (riskValue: number, matrixSize: string) => {
      if (matrixSize === '5x5') {
        if (riskValue >= 17) return 'Muito Alto';
        else if (riskValue >= 9) return 'Alto';
        else if (riskValue >= 5) return 'Médio';
        else if (riskValue >= 3) return 'Baixo';
        else return 'Muito Baixo';
      } else {
        if (riskValue >= 10) return 'Muito Alto';
        else if (riskValue >= 7) return 'Alto';
        else if (riskValue >= 3) return 'Médio';
        else return 'Baixo';
      }
    };

    return (
      <div className="overflow-x-auto">
        <div className="max-w-4xl mx-auto">
          {/* Matriz Container */}
          <div className="inline-block">
            <div className="flex">
              <div className="flex flex-col justify-center items-center mr-4">
                <div className="text-sm font-medium text-foreground dark:text-foreground transform -rotate-90 whitespace-nowrap">
                  IMPACTO
                </div>
              </div>
              
              <div className="space-y-0">
                {/* Y-axis numbers (Impact) */}
                <div className="flex">
                  <div className="flex flex-col space-y-0 mr-2">
                    {Array.from({ length: size }, (_, i) => (
                      <div key={i} className="h-12 w-12 flex items-center justify-center text-sm font-medium text-foreground dark:text-foreground">
                        {size - i}
                      </div>
                    ))}
                  </div>
                  
                  {/* Grid Matrix */}
                  <div className={`grid grid-rows-${size} gap-0 border-2 border-border shadow-lg rounded-lg overflow-hidden`}>
                    {Array.from({ length: size }, (_, rowIndex) => (
                      <div key={rowIndex} className={`grid grid-cols-${size} gap-0`}>
                        {Array.from({ length: size }, (_, colIndex) => {
                          const probability = colIndex + 1;
                          const impact = size - rowIndex;
                          const riskValue = probability * impact;
                          const backgroundColor = getRiskColor(riskValue, config.settings.matrixSize);
                          const levelName = getRiskLevelName(riskValue, config.settings.matrixSize);
                          
                          return (
                            <div
                              key={colIndex}
                              className="h-12 w-12 border border-white flex flex-col items-center justify-center hover:scale-105 transition-transform cursor-pointer"
                              style={{ backgroundColor }}
                              title={`Probabilidade: ${probability}, Impacto: ${impact}, Risco: ${levelName} (${riskValue})`}
                            >
                              <span className="text-sm font-bold text-white drop-shadow-lg">
                                {riskValue}
                              </span>
                              <span className="text-[10px] text-white/90 font-medium">
                                {levelName.split(' ')[0]}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* X-axis numbers (Probability) */}
                <div className="flex justify-center mt-2">
                  <div className="flex space-x-0 ml-14">
                    {Array.from({ length: size }, (_, i) => (
                      <div key={i} className="h-8 w-12 flex items-center justify-center text-sm font-medium text-foreground dark:text-foreground">
                        {i + 1}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="text-center mt-2">
                  <div className="text-sm font-medium text-foreground dark:text-foreground">PROBABILIDADE</div>
                </div>
              </div>
            </div>
          </div>

          {/* Legenda Padronizada */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-foreground dark:text-foreground mb-3">Legenda dos Níveis de Risco:</h4>
            <div className="flex flex-wrap justify-center gap-3 text-sm">
              {(
                config.settings.matrixSize === '5x5' ? [
                  { level: 'Muito Baixo', color: '#3b82f6', range: '1-2' },
                  { level: 'Baixo', color: '#22c55e', range: '3-4' },
                  { level: 'Médio', color: '#eab308', range: '5-8' },
                  { level: 'Alto', color: '#f97316', range: '9-16' },
                  { level: 'Muito Alto', color: '#ef4444', range: '17-25' }
                ] : [
                  { level: 'Baixo', color: '#22c55e', range: '1-2' },
                  { level: 'Médio', color: '#eab308', range: '3-6' },
                  { level: 'Alto', color: '#f97316', range: '7-9' },
                  { level: 'Muito Alto', color: '#ef4444', range: '10-16' }
                ]
              ).map(({ level, color, range }) => (
                <div key={level} className="flex items-center space-x-2 bg-card dark:bg-card border border-border px-3 py-2 rounded-lg shadow-sm">
                  <div className="w-4 h-4 rounded border border-border" style={{ backgroundColor: color }}></div>
                  <span className="font-medium text-foreground dark:text-foreground">{level}</span>
                  <span className="text-xs text-muted-foreground dark:text-muted-foreground">({range})</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              Matriz {config.settings.matrixSize} - {size * size} combinações possíveis
            </p>
            <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-1">
              {config.settings.matrixSize === '5x5' ? '5 níveis de risco (incluindo Muito Baixo)' : '4 níveis de risco'}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Configuração da Matriz de Risco
              </CardTitle>
              <CardDescription>
                Configure os níveis de probabilidade, impacto e a matriz de risco da organização
              </CardDescription>
            </div>
            <Button onClick={handleSaveConfig} disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar Configuração'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Configurações Gerais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <Label>Tamanho da Matriz</Label>
              <Select
                value={config.settings.matrixSize}
                onValueChange={(value) => setConfig(prev => ({
                  ...prev,
                  settings: { ...prev.settings, matrixSize: value as any }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3x3">3x3 (Simples)</SelectItem>
                  <SelectItem value="4x4">4x4 (Padrão)</SelectItem>
                  <SelectItem value="5x5">5x5 (Detalhada)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Método de Cálculo</Label>
              <Select
                value={config.settings.calculationMethod}
                onValueChange={(value) => setConfig(prev => ({
                  ...prev,
                  settings: { ...prev.settings, calculationMethod: value as any }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiplication">Multiplicação (P × I)</SelectItem>
                  <SelectItem value="addition">Adição (P + I)</SelectItem>
                  <SelectItem value="custom">Matriz Personalizada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-center">
              <Badge variant="outline" className="text-sm">
                <CheckCircle className="h-4 w-4 mr-1" />
                {String(config.dimensions.probability.length)}×{String(config.dimensions.impact.length)} configurada
              </Badge>
            </div>
          </div>

          {/* Matriz de Risco */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Target className="h-5 w-5" />
              Matriz de Risco
            </h3>
            {renderMatrix()}
          </div>
        </CardContent>
      </Card>

      {/* Configuração de Níveis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Níveis de Probabilidade */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Níveis de Probabilidade</CardTitle>
            <CardDescription>Configure os níveis de probabilidade</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {config.dimensions.probability.map(prob => (
                <div key={prob.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{prob.name}</div>
                    <div className="text-xs text-muted-foreground">{prob.description}</div>
                    <Badge variant="outline" className="text-xs mt-1">{prob.percentage}</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(prob, 'probability')}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Níveis de Impacto */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Níveis de Impacto</CardTitle>
            <CardDescription>Configure os níveis de impacto</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {config.dimensions.impact.map(impact => (
                <div key={impact.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{impact.name}</div>
                    <div className="text-xs text-muted-foreground">{impact.description}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Ex: {impact.examples.slice(0, 1).join(', ')}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(impact, 'impact')}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Níveis de Risco */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Níveis de Risco</CardTitle>
            <CardDescription>Configure os níveis de risco resultantes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {config.riskLevels.map(risk => (
                <div key={risk.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: risk.color }}
                      ></div>
                      <div className="font-medium text-sm">{risk.name}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">{risk.description}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(risk, 'riskLevel')}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog de Edição */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              Editar {editType === 'probability' ? 'Probabilidade' : 
                     editType === 'impact' ? 'Impacto' : 'Nível de Risco'}
            </DialogTitle>
            <DialogDescription>
              Atualize as informações do item selecionado.
            </DialogDescription>
          </DialogHeader>

          {editingItem && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={editingItem.name || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                />
              </div>

              {editType === 'probability' && (
                <div className="grid gap-2">
                  <Label htmlFor="percentage">Percentual</Label>
                  <Input
                    id="percentage"
                    value={editingItem.percentage || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, percentage: e.target.value })}
                    placeholder="Ex: 5-25%"
                  />
                </div>
              )}

              {editType === 'riskLevel' && (
                <div className="grid gap-2">
                  <Label htmlFor="color">Cor</Label>
                  <div className="flex gap-2">
                    <Input
                      id="color"
                      type="color"
                      value={editingItem.color || '#000000'}
                      onChange={(e) => setEditingItem({ ...editingItem, color: e.target.value })}
                      className="w-20"
                    />
                    <Input
                      value={editingItem.color || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, color: e.target.value })}
                      placeholder="#000000"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveItem}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};