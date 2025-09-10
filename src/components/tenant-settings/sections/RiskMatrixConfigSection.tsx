import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
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
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';

interface RiskLevel {
  id: string;
  name: string;
  value: number;
  color: string;
  description: string;
  minValue: number;
  maxValue: number;
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
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Usar tenant ID do usuário como fallback
  const currentTenantId = tenantId || user?.tenantId;
  
  console.log('🎯 RiskMatrixConfigSection inicializado:', {
    tenantId,
    userTenantId: user?.tenantId,
    currentTenantId,
    timestamp: new Date().toISOString()
  });
  
  // Funções auxiliares para ajustar arrays
  const adjustArrayToSize = (currentArray: any[], newSize: number, type: 'probability' | 'impact') => {
    const defaultLabels = {
      probability: ['Raro', 'Improvavel', 'Possivel', 'Provavel', 'Quase Certo'],
      impact: ['Insignificante', 'Menor', 'Moderado', 'Maior', 'Catastrofico']
    };
    
    const defaultDescriptions = {
      probability: [
        'Evento muito improvável',
        'Evento improvável', 
        'Evento possível',
        'Evento provável',
        'Evento muito provável'
      ],
      impact: [
        'Impacto mínimo nas operações',
        'Impacto limitado nas operações',
        'Impacto significativo nas operações', 
        'Impacto severo nas operações',
        'Impacto crítico nas operações'
      ]
    };
    
    const defaultPercentages = ['< 5%', '5-25%', '25-50%', '50-75%', '> 75%'];
    const defaultExamples = [
      ['Atraso menor que 1 dia', 'Custo < R$ 1.000'],
      ['Atraso de 1-3 dias', 'Custo R$ 1.000-10.000'],
      ['Atraso de 1-2 semanas', 'Custo R$ 10.000-100.000'],
      ['Atraso de 1 mês', 'Custo R$ 100.000-1M'],
      ['Atraso > 1 mês', 'Custo > R$ 1M']
    ];
    
    const result = [];
    
    for (let i = 0; i < newSize; i++) {
      if (currentArray[i]) {
        // Manter item existente
        result.push({
          ...currentArray[i],
          value: i + 1
        });
      } else {
        // Criar novo item com valores padrão
        const newItem = {
          id: String(i + 1),
          name: defaultLabels[type][i],
          value: i + 1,
          description: defaultDescriptions[type][i]
        };
        
        if (type === 'probability') {
          newItem.percentage = defaultPercentages[i];
        } else {
          newItem.examples = defaultExamples[i];
        }
        
        result.push(newItem);
      }
    }
    
    console.log(`🔄 Array ${type} ajustado para tamanho ${newSize}:`, result);
    return result;
  };
  
  const adjustRiskLevelsToSize = (currentLevels: RiskLevel[], matrixSize: '3x3' | '4x4' | '5x5') => {
    const riskLevelConfigs = {
      '3x3': [
        { id: '1', name: 'Baixo', value: 1, color: '#22c55e', description: 'Risco aceitável', minValue: 1, maxValue: 2 },
        { id: '2', name: 'Médio', value: 2, color: '#eab308', description: 'Risco que requer atenção', minValue: 3, maxValue: 4 },
        { id: '3', name: 'Alto', value: 3, color: '#ef4444', description: 'Risco inaceitável', minValue: 5, maxValue: 9 }
      ],
      '4x4': [
        { id: '1', name: 'Baixo', value: 1, color: '#22c55e', description: 'Risco aceitável', minValue: 1, maxValue: 2 },
        { id: '2', name: 'Médio', value: 2, color: '#eab308', description: 'Risco que requer atenção', minValue: 3, maxValue: 6 },
        { id: '3', name: 'Alto', value: 3, color: '#f97316', description: 'Risco que requer ação imediata', minValue: 7, maxValue: 9 },
        { id: '4', name: 'Muito Alto', value: 4, color: '#ef4444', description: 'Risco inaceitável', minValue: 10, maxValue: 16 }
      ],
      '5x5': [
        { id: '1', name: 'Muito Baixo', value: 1, color: '#3b82f6', description: 'Risco aceitável', minValue: 1, maxValue: 2 },
        { id: '2', name: 'Baixo', value: 2, color: '#22c55e', description: 'Risco tolerável', minValue: 3, maxValue: 4 },
        { id: '3', name: 'Médio', value: 3, color: '#eab308', description: 'Risco que requer atenção', minValue: 5, maxValue: 8 },
        { id: '4', name: 'Alto', value: 4, color: '#f97316', description: 'Risco que requer ação imediata', minValue: 9, maxValue: 16 },
        { id: '5', name: 'Muito Alto', value: 5, color: '#ef4444', description: 'Risco inaceitável', minValue: 17, maxValue: 25 }
      ]
    };
    
    const newLevels = riskLevelConfigs[matrixSize];
    console.log(`🎨 Níveis de risco ajustados para ${matrixSize}:`, newLevels);
    return newLevels;
  };
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
      { id: '1', name: 'Muito Baixo', value: 1, color: '#3b82f6', description: 'Risco aceitável', minValue: 1, maxValue: 2 },
      { id: '2', name: 'Baixo', value: 2, color: '#22c55e', description: 'Risco tolerável', minValue: 3, maxValue: 4 },
      { id: '3', name: 'Médio', value: 3, color: '#eab308', description: 'Risco que requer atenção', minValue: 5, maxValue: 8 },
      { id: '4', name: 'Alto', value: 4, color: '#f97316', description: 'Risco que requer ação imediata', minValue: 9, maxValue: 16 },
      { id: '5', name: 'Muito Alto', value: 5, color: '#ef4444', description: 'Risco inaceitável', minValue: 17, maxValue: 25 }
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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (currentTenantId) {
      loadMatrixConfig();
    }
  }, [currentTenantId]);

  const loadMatrixConfig = async () => {
    if (!currentTenantId) {
      console.warn('⚠️ Nenhum tenant ID disponível para carregar configuração');
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('📥 Carregando configuração da matriz de risco para tenant:', currentTenantId);
      
      const { data, error } = await supabase
        .from('tenants')
        .select('settings')
        .eq('id', currentTenantId)
        .single();

      if (error) {
        console.error('❌ Erro ao carregar configuração:', error);
        toast.error('Erro ao carregar configuração da matriz de risco');
        return;
      }

      console.log('📊 Dados carregados:', data);
      
      if (data?.settings?.risk_matrix) {
        const savedMatrix = data.settings.risk_matrix;
        console.log('✅ Configuração da matriz encontrada:', savedMatrix);
        
        // Atualizar configuração com dados salvos
        setConfig(prev => ({
          ...prev,
          settings: {
            ...prev.settings,
            matrixSize: savedMatrix.type || '5x5',
            calculationMethod: savedMatrix.calculation_method || 'multiplication'
          },
          dimensions: {
            probability: savedMatrix.likelihood_labels ? 
              savedMatrix.likelihood_labels.map((label: string, index: number) => ({
                id: String(index + 1),
                name: label,
                value: index + 1,
                description: prev.dimensions.probability[index]?.description || '',
                percentage: prev.dimensions.probability[index]?.percentage || ''
              })) : prev.dimensions.probability,
            impact: savedMatrix.impact_labels ? 
              savedMatrix.impact_labels.map((label: string, index: number) => ({
                id: String(index + 1),
                name: label,
                value: index + 1,
                description: prev.dimensions.impact[index]?.description || '',
                examples: prev.dimensions.impact[index]?.examples || []
              })) : prev.dimensions.impact
          },
          // Carregar níveis de risco personalizados se existirem
          riskLevels: savedMatrix.risk_levels_custom ? 
            savedMatrix.risk_levels_custom.map((level: any) => ({
              id: level.id,
              name: level.name,
              color: level.color,
              description: level.description,
              minValue: level.minValue,
              maxValue: level.maxValue,
              value: level.value
            })) : adjustRiskLevelsToSize(prev.riskLevels, savedMatrix.type || '5x5')
        }));
        
        toast.success('Configuração da matriz carregada com sucesso!');
      } else {
        console.log('ℹ️ Nenhuma configuração salva encontrada, usando padrões');
      }
    } catch (error) {
      console.error('💥 Erro inesperado ao carregar configuração:', error);
      toast.error('Erro ao carregar configuração da matriz de risco');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    if (!currentTenantId) {
      toast.error('Tenant ID não encontrado');
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('💾 Salvando configuração da matriz de risco:', {
        tenantId: currentTenantId,
        config
      });
      
      // Converter configuração para formato do banco
      const matrixConfig = {
        type: config.settings.matrixSize,
        calculation_method: config.settings.calculationMethod,
        impact_labels: config.dimensions.impact.map(item => item.name),
        likelihood_labels: config.dimensions.probability.map(item => item.name),
        // Salvar níveis de risco personalizados
        risk_levels_custom: config.riskLevels.map(level => ({
          id: level.id,
          name: level.name,
          color: level.color,
          description: level.description,
          minValue: level.minValue,
          maxValue: level.maxValue,
          value: level.value
        })),
        // Manter formato legado para compatibilidade
        risk_levels: {
          low: [1, 2],
          medium: [3, 4, 5, 6],
          high: [7, 8, 9, 10, 12],
          critical: [11, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25]
        }
      };
      
      // Buscar configurações atuais
      const { data: currentData, error: fetchError } = await supabase
        .from('tenants')
        .select('settings')
        .eq('id', currentTenantId)
        .single();

      if (fetchError) {
        console.error('❌ Erro ao buscar configurações atuais:', fetchError);
        throw fetchError;
      }

      // Mesclar com configurações existentes
      const updatedSettings = {
        ...currentData?.settings,
        risk_matrix: matrixConfig
      };
      
      console.log('📤 Enviando configuração atualizada:', updatedSettings);
      
      // Salvar no banco
      const { error: updateError } = await supabase
        .from('tenants')
        .update({ 
          settings: updatedSettings,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentTenantId);

      if (updateError) {
        console.error('❌ Erro ao salvar configuração:', updateError);
        throw updateError;
      }

      console.log('✅ Configuração salva com sucesso!');
      
      // Invalidar cache para sincronizar com outras implementações
      await queryClient.invalidateQueries({ queryKey: ['tenant-settings'] });
      await queryClient.invalidateQueries({ queryKey: ['tenants'] });
      
      setHasUnsavedChanges(false);
      onSettingsChange();
      toast.success('Configuração da matriz de risco salva com sucesso!');
      
      // Verificar se foi salvo corretamente
      setTimeout(async () => {
        const { data: verificationData } = await supabase
          .from('tenants')
          .select('settings')
          .eq('id', currentTenantId)
          .single();
          
        console.log('🔍 Verificação pós-salvamento:', {
          saved: verificationData?.settings?.risk_matrix,
          expected: matrixConfig
        });
      }, 1000);
      
    } catch (error) {
      console.error('💥 Erro ao salvar configuração:', error);
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
    
    console.log('💾 Salvando item editado:', {
      editType,
      editingItem,
      timestamp: new Date().toISOString()
    });
    
    // Validação para níveis de risco
    if (editType === 'riskLevel') {
      // Verificar se min <= max
      if (editingItem.minValue > editingItem.maxValue) {
        toast.error('O valor mínimo deve ser menor ou igual ao valor máximo');
        return;
      }
      
      // Verificar sobreposição com outros níveis
      const otherLevels = config.riskLevels.filter(level => level.id !== editingItem.id);
      const hasOverlap = otherLevels.some(level => {
        return (
          (editingItem.minValue >= level.minValue && editingItem.minValue <= level.maxValue) ||
          (editingItem.maxValue >= level.minValue && editingItem.maxValue <= level.maxValue) ||
          (editingItem.minValue <= level.minValue && editingItem.maxValue >= level.maxValue)
        );
      });
      
      if (hasOverlap) {
        toast.error('A faixa de valores não pode sobrepor com outros níveis de risco');
        return;
      }
    }

    const newConfig = {
      ...config,
      dimensions: {
        ...config.dimensions,
        [editType]: editType === 'riskLevel' 
          ? config.riskLevels 
          : config.dimensions[editType].map(item => 
              item.id === editingItem.id ? editingItem : item
            )
      },
      riskLevels: editType === 'riskLevel'
        ? config.riskLevels.map(item => 
            item.id === editingItem.id ? editingItem : item
          )
        : config.riskLevels
    };
    
    console.log('🔄 Nova configuração após edição:', {
      oldRiskLevels: config.riskLevels,
      newRiskLevels: newConfig.riskLevels,
      editedItem: editingItem
    });
    
    setConfig(newConfig);
    setHasUnsavedChanges(true);

    setIsDialogOpen(false);
    setEditingItem(null);
    setEditType(null);
    toast.success('Item atualizado com sucesso - Lembre-se de clicar em "Salvar Configuração" para persistir no banco!');
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

    // Função para obter nível de risco baseado nas faixas configuradas
    const getRiskLevelForValue = (riskValue: number) => {
      // Encontrar o nível de risco que contém o valor
      for (const level of config.riskLevels) {
        if (riskValue >= level.minValue && riskValue <= level.maxValue) {
          return level;
        }
      }
      // Fallback para o último nível se não encontrar
      return config.riskLevels[config.riskLevels.length - 1];
    };
    
    // Função para obter nome do nível de risco
    const getRiskLevelName = (riskValue: number) => {
      return getRiskLevelForValue(riskValue).name;
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
                          
                          // Usar método de cálculo configurado
                          let riskValue;
                          switch (config.settings.calculationMethod) {
                            case 'multiplication':
                              riskValue = probability * impact;
                              break;
                            case 'addition':
                              riskValue = probability + impact;
                              break;
                            case 'custom':
                              riskValue = config.matrix[probability - 1]?.[impact - 1] || (probability * impact);
                              break;
                            default:
                              riskValue = probability * impact;
                          }
                          
                          // Debug do cálculo (apenas para primeira célula)
                          if (rowIndex === 0 && colIndex === 0) {
                            console.log('🧮 Debug do cálculo de risco:', {
                              method: config.settings.calculationMethod,
                              probability,
                              impact,
                              riskValue,
                              formula: config.settings.calculationMethod === 'multiplication' ? `${probability} × ${impact} = ${riskValue}` :
                                      config.settings.calculationMethod === 'addition' ? `${probability} + ${impact} = ${riskValue}` :
                                      'Matriz personalizada'
                            });
                          }
                          
                          const riskLevel = getRiskLevelForValue(riskValue);
                          const backgroundColor = riskLevel.color;
                          const levelName = riskLevel.name;
                          
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

          {/* Legenda Dinâmica */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-foreground dark:text-foreground mb-3">Legenda dos Níveis de Risco:</h4>
            <div className="flex flex-wrap justify-center gap-3 text-sm">
              {config.riskLevels.map((level) => {
                // Usar as faixas configuradas
                const range = level.minValue === level.maxValue 
                  ? String(level.minValue)
                  : `${level.minValue}-${level.maxValue}`;
                
                return (
                  <div key={level.id} className="flex items-center space-x-2 bg-card dark:bg-card border border-border px-3 py-2 rounded-lg shadow-sm">
                    <div className="w-4 h-4 rounded border border-border" style={{ backgroundColor: level.color }}></div>
                    <span className="font-medium text-foreground dark:text-foreground">{level.name}</span>
                    <span className="text-xs text-muted-foreground dark:text-muted-foreground">({range})</span>
                  </div>
                );
              })}
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
            <div className="flex items-center gap-2">
              {hasUnsavedChanges && (
                <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">Alterações não salvas</span>
                </div>
              )}
              <Button onClick={handleSaveConfig} disabled={isLoading} variant={hasUnsavedChanges ? "default" : "outline"}>
                {isLoading ? 'Salvando...' : 'Salvar Configuração'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Configurações Gerais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <Label>Tamanho da Matriz</Label>
              <Select
                value={config.settings.matrixSize}
                onValueChange={(value) => {
                  console.log('📏 Tamanho da matriz alterado:', {
                    from: config.settings.matrixSize,
                    to: value
                  });
                  
                  const newSize = parseInt(value.charAt(0));
                  
                  setConfig(prev => {
                    // Ajustar arrays de acordo com o novo tamanho
                    const adjustedProbability = adjustArrayToSize(prev.dimensions.probability, newSize, 'probability');
                    const adjustedImpact = adjustArrayToSize(prev.dimensions.impact, newSize, 'impact');
                    const adjustedRiskLevels = adjustRiskLevelsToSize(prev.riskLevels, value as '3x3' | '4x4' | '5x5');
                    
                    setHasUnsavedChanges(true);
                    return {
                      ...prev,
                      settings: { ...prev.settings, matrixSize: value as any },
                      dimensions: {
                        probability: adjustedProbability,
                        impact: adjustedImpact
                      },
                      riskLevels: adjustedRiskLevels
                    };
                  });
                }}
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
                onValueChange={(value) => {
                  console.log('🧮 Método de cálculo alterado:', {
                    from: config.settings.calculationMethod,
                    to: value
                  });
                  setConfig(prev => {
                    setHasUnsavedChanges(true);
                    return {
                      ...prev,
                      settings: { ...prev.settings, calculationMethod: value as any }
                    };
                  });
                }}
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
              <p className="text-xs text-muted-foreground">
                Atual: <strong>{config.settings.calculationMethod}</strong>
              </p>
            </div>

            <div className="flex items-center justify-center">
              <Badge variant="outline" className="text-sm">
                <CheckCircle className="h-4 w-4 mr-1" />
                {String(config.dimensions.probability.length)}×{String(config.dimensions.impact.length)} configurada
                <br />
                <span className="text-xs text-muted-foreground">
                  {config.riskLevels.length} níveis de risco
                </span>
              </Badge>
            </div>
          </div>

          {/* Matriz de Risco */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Target className="h-5 w-5" />
                Matriz de Risco
              </h3>
              <div className="text-sm text-muted-foreground">
                Método: <strong>{config.settings.calculationMethod}</strong>
              </div>
            </div>
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
            <CardDescription>Configure os níveis de probabilidade ({config.dimensions.probability.length} níveis)</CardDescription>
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
            <CardDescription>Configure os níveis de impacto ({config.dimensions.impact.length} níveis)</CardDescription>
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
            <CardDescription>Configure os níveis de risco resultantes ({config.riskLevels.length} níveis)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {config.riskLevels.map(risk => {
                const range = risk.minValue === risk.maxValue 
                  ? String(risk.minValue)
                  : `${risk.minValue}-${risk.maxValue}`;
                  
                return (
                  <div key={risk.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: risk.color }}
                        ></div>
                        <div className="font-medium text-sm">{risk.name}</div>
                        <Badge variant="outline" className="text-xs">
                          {range}
                        </Badge>
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
                );
              })}
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
                <>
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
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="minValue">Valor Mínimo</Label>
                      <Input
                        id="minValue"
                        type="number"
                        min="1"
                        value={editingItem.minValue || 1}
                        onChange={(e) => setEditingItem({ 
                          ...editingItem, 
                          minValue: parseInt(e.target.value) || 1 
                        })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="maxValue">Valor Máximo</Label>
                      <Input
                        id="maxValue"
                        type="number"
                        min={editingItem.minValue || 1}
                        value={editingItem.maxValue || 1}
                        onChange={(e) => setEditingItem({ 
                          ...editingItem, 
                          maxValue: parseInt(e.target.value) || 1 
                        })}
                      />
                    </div>
                  </div>
                  
                  <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                      Faixa Configurada:
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      {editingItem.minValue === editingItem.maxValue 
                        ? `Valor ${editingItem.minValue}`
                        : `Valores de ${editingItem.minValue || 1} a ${editingItem.maxValue || 1}`
                      }
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                      ⚠️ As faixas não podem se sobrepor com outros níveis
                    </div>
                  </div>
                </>
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