import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Palette, 
  Save, 
  RefreshCw, 
  Eye,
  AlertCircle,
  CheckCircle,
  Star,
  Lock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface PDFColorSettingsProps {
  isNativeTheme?: boolean;
}

export const PDFColorSettings: React.FC<PDFColorSettingsProps> = ({ isNativeTheme = false }) => {
  const { user } = useAuth();
  const [pdfColor, setPdfColor] = useState('#2962FF');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasSettings, setHasSettings] = useState(false);
  const [tableExists, setTableExists] = useState(true);

  // Verificar se o usuário é administrador
  const isAdmin = user?.isPlatformAdmin || user?.role === 'admin';

  // Carregar cor atual do PDF
  useEffect(() => {
    loadPDFColor();
  }, [user?.tenantId]);

  const loadPDFColor = async () => {
    if (!user?.tenantId) return;

    setIsLoading(true);
    try {
      console.log('🎨 Carregando cor do PDF para tenant:', user.tenantId);
      
      const { data: settings, error } = await supabase
        .from('company_settings')
        .select('pdf_primary_color')
        .eq('tenant_id', user.tenantId)
        .maybeSingle();

      if (error) {
        console.warn('⚠️ Erro ao carregar configurações:', error);
        if (error.code === '42P01') {
          console.log('📋 Tabela company_settings não existe. Usando cor padrão.');
          setTableExists(false);
          // Não mostrar toast aqui, vamos mostrar um alerta visual permanente
        }
        return;
      }

      if (settings) {
        setPdfColor(settings.pdf_primary_color || '#2962FF');
        setHasSettings(true);
        console.log('✅ Cor do PDF carregada:', settings.pdf_primary_color);
      } else {
        console.log('📝 Nenhuma configuração encontrada. Usando cor padrão.');
        setHasSettings(false);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar cor do PDF:', error);
      toast.error('Erro ao carregar configurações do PDF');
    } finally {
      setIsLoading(false);
    }
  };

  const savePDFColor = async () => {
    if (!isAdmin) {
      toast.error('Apenas administradores podem alterar a cor do PDF');
      return;
    }

    if (!user?.tenantId) {
      toast.error('Usuário não está associado a um tenant');
      return;
    }

    // Validar formato da cor
    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    if (!hexRegex.test(pdfColor)) {
      toast.error('Formato de cor inválido. Use formato hexadecimal (ex: #2962FF)');
      return;
    }

    setIsSaving(true);
    try {
      console.log('💾 Salvando cor do PDF:', pdfColor);

      if (hasSettings) {
        // Atualizar configuração existente
        const { error } = await supabase
          .from('company_settings')
          .update({ 
            pdf_primary_color: pdfColor,
            updated_at: new Date().toISOString()
          })
          .eq('tenant_id', user.tenantId);

        if (error) throw error;
        console.log('✅ Cor do PDF atualizada');
      } else {
        // Criar nova configuração
        const { error } = await supabase
          .from('company_settings')
          .insert({
            tenant_id: user.tenantId,
            pdf_primary_color: pdfColor,
            company_name: user.tenant?.name || 'Empresa',
            email: user.tenant?.contact_email || user.email || 'contato@empresa.com.br'
          });

        if (error) throw error;
        console.log('✅ Nova configuração criada com cor do PDF');
        setHasSettings(true);
      }

      toast.success('Cor do PDF salva com sucesso!');
      
      // Registrar atividade
      try {
        await supabase
          .from('activity_logs')
          .insert({
            action: 'pdf_color_updated',
            resource_type: 'company_settings',
            resource_id: user.tenantId,
            details: {
              new_color: pdfColor,
              tenant_id: user.tenantId,
              updated_at: new Date().toISOString()
            }
          });
      } catch (logError) {
        console.warn('⚠️ Erro ao registrar log:', logError);
      }

    } catch (error) {
      console.error('❌ Erro ao salvar cor do PDF:', error);
      
      if (error?.code === '42P01') {
        toast.error('Tabela company_settings não existe. Execute o SQL de criação primeiro.', {
          description: 'Acesse o Supabase Dashboard e execute o arquivo create-company-settings.sql'
        });
      } else if (error?.code === '23503') {
        toast.error('Tenant não encontrado. Verifique se o usuário está associado a um tenant válido.');
      } else if (error?.message) {
        toast.error(`Erro ao salvar: ${error.message}`);
      } else {
        toast.error('Erro desconhecido ao salvar configuração. Verifique se a tabela company_settings existe.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefault = () => {
    if (!isAdmin) {
      toast.error('Apenas administradores podem alterar a cor do PDF');
      return;
    }
    setPdfColor('#2962FF');
    toast.success('Cor resetada para o padrão');
  };

  const previewColor = () => {
    toast.success(`Cor selecionada: ${pdfColor}`, {
      description: 'Esta cor será aplicada nos PDFs gerados'
    });
  };

  // Função para validar cor em tempo real
  const isValidHexColor = (color: string): boolean => {
    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    return hexRegex.test(color);
  };

  // Função para lidar com mudanças no input de texto
  const handleColorInputChange = (value: string) => {
    if (!isAdmin) return;
    
    // Garantir que sempre comece com #
    let formattedValue = value;
    if (!formattedValue.startsWith('#')) {
      formattedValue = '#' + formattedValue;
    }
    
    // Limitar a 7 caracteres (#RRGGBB)
    formattedValue = formattedValue.slice(0, 7).toUpperCase();
    
    setPdfColor(formattedValue);
  };

  return (
    <Card className={`${isNativeTheme ? 'border-green-600/30 bg-green-600/5' : ''}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="h-4 w-4 text-blue-600" />
          Configuração de PDF
          {isNativeTheme && (
            <Badge variant="outline" className="bg-green-600/10 text-green-600 border-green-600/30">
              <Star className="h-3 w-3 mr-1" />
              UI Nativa
            </Badge>
          )}
        </CardTitle>
        <CardDescription className="text-xs">
          Configure a cor primária usada nos PDFs gerados pelo sistema
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Alerta quando tabela não existe */}
        {!tableExists && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700 mb-2">
              <AlertCircle className="h-5 w-5" />
              <span className="font-semibold">Tabela de Configurações Não Encontrada</span>
            </div>
            <p className="text-red-600 text-sm mb-3">
              A tabela <code className="bg-red-100 px-1 rounded">company_settings</code> não existe no banco de dados. 
              É necessário criar a tabela antes de usar esta funcionalidade.
            </p>
            <div className="text-xs text-red-600 space-y-1">
              <p><strong>Como resolver:</strong></p>
              <p>1. Acesse: <code className="bg-red-100 px-1 rounded">https://supabase.com/dashboard/project/myxvxponlmulnjstbjwd</code></p>
              <p>2. Vá para <strong>SQL Editor</strong></p>
              <p>3. Execute o conteúdo do arquivo <code className="bg-red-100 px-1 rounded">create-company-settings.sql</code></p>
            </div>
          </div>
        )}
        
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Carregando configurações...
          </div>
        ) : (
          <>
            {/* Status da configuração */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                {hasSettings ? (
                  <>
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span className="text-green-600">Configuração encontrada</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3 text-orange-600" />
                    <span className="text-orange-600">Primeira configuração</span>
                  </>
                )}
              </div>
              
              {/* Indicador de permissão */}
              <div className="flex items-center gap-2 text-xs">
                {isAdmin ? (
                  <>
                    <CheckCircle className="h-3 w-3 text-blue-600" />
                    <span className="text-blue-600">Administrador</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-3 w-3 text-gray-500" />
                    <span className="text-gray-500">Somente leitura</span>
                  </>
                )}
              </div>
            </div>

            <Separator />

            {/* Seletor de cor */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Cor Primária do PDF
              </Label>
              
              <div className="flex gap-2">
                {/* Color Picker Visual */}
                <div className="relative">
                  <input
                    type="color"
                    value={pdfColor}
                    onChange={(e) => isAdmin && tableExists && setPdfColor(e.target.value.toUpperCase())}
                    disabled={!isAdmin || !tableExists}
                    className={`w-10 h-10 rounded border-2 border-border cursor-pointer transition-all duration-200 ${
                      !isAdmin 
                        ? 'cursor-not-allowed opacity-50' 
                        : 'hover:border-primary hover:scale-105 active:scale-95'
                    }`}
                    style={{
                      WebkitAppearance: 'none',
                      MozAppearance: 'none',
                      appearance: 'none',
                      padding: '0',
                      border: 'none',
                      outline: 'none'
                    }}
                    title={isAdmin ? 'Clique para escolher uma cor' : 'Apenas administradores podem alterar'}
                  />
                  {/* Overlay para melhor visual quando desabilitado */}
                  {!isAdmin && (
                    <div className="absolute inset-0 bg-gray-200/50 rounded pointer-events-none" />
                  )}
                </div>
                
                {/* Input de texto para valor hexadecimal */}
                <Input
                  value={pdfColor}
                  onChange={(e) => tableExists && handleColorInputChange(e.target.value)}
                  placeholder="#2962FF"
                  className={`flex-1 font-mono ${
                    !isAdmin || !tableExists
                      ? 'bg-muted cursor-not-allowed' 
                      : isValidHexColor(pdfColor) 
                        ? 'border-green-300 focus:border-green-500' 
                        : 'border-red-300 focus:border-red-500'
                  }`}
                  maxLength={7}
                  disabled={!isAdmin || !tableExists}
                  readOnly={!isAdmin || !tableExists}
                />
                
                {/* Botão de preview */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={previewColor}
                  title="Visualizar cor"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  Use formato hexadecimal (ex: #2962FF). Esta cor será aplicada em cabeçalhos, 
                  destaques e elementos visuais dos PDFs.
                </p>
                
                {/* Indicador de validação */}
                {isAdmin && (
                  <div className="flex items-center gap-2 text-xs">
                    {isValidHexColor(pdfColor) ? (
                      <>
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span className="text-green-600">Cor válida</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3 text-red-600" />
                        <span className="text-red-600">Formato inválido (use #RRGGBB)</span>
                      </>
                    )}
                  </div>
                )}
                
                {!isAdmin && (
                  <span className="block text-orange-600 font-medium text-xs">
                    ⚠️ Apenas administradores podem editar esta configuração
                  </span>
                )}
              </div>
              
              {/* Cores predefinidas */}
              {isAdmin && (
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Cores Sugeridas:</Label>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { color: '#2962FF', name: 'Azul Padrão' },
                      { color: '#4CAF50', name: 'Verde' },
                      { color: '#FF6B35', name: 'Laranja' },
                      { color: '#9C27B0', name: 'Roxo' },
                      { color: '#F44336', name: 'Vermelho' },
                      { color: '#607D8B', name: 'Cinza Azulado' },
                      { color: '#795548', name: 'Marrom' },
                      { color: '#009688', name: 'Verde Água' }
                    ].map((preset) => (
                      <button
                        key={preset.color}
                        type="button"
                        onClick={() => setPdfColor(preset.color)}
                        className="w-6 h-6 rounded border-2 border-border hover:border-primary transition-colors cursor-pointer"
                        style={{ backgroundColor: preset.color }}
                        title={`${preset.name} (${preset.color})`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Ações */}
            <div className="flex items-center gap-2">
              <Button
                onClick={savePDFColor}
                disabled={isSaving || !isAdmin || !isValidHexColor(pdfColor) || !tableExists}
                className="flex-1"
                size="sm"
                title={
                  !tableExists
                    ? 'Tabela company_settings não existe'
                    : !isAdmin 
                      ? 'Apenas administradores podem salvar' 
                      : !isValidHexColor(pdfColor)
                        ? 'Cor inválida - use formato #RRGGBB'
                        : 'Salvar cor do PDF'
                }
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    Salvando...
                  </>
                ) : (
                  <>
                    {!isAdmin && <Lock className="h-4 w-4 mr-2" />}
                    <Save className="h-4 w-4 mr-2" />
                    {hasSettings ? 'Atualizar' : 'Salvar'}
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={resetToDefault}
                size="sm"
                disabled={!isAdmin || !tableExists}
                title={!tableExists ? 'Tabela company_settings não existe' : !isAdmin ? 'Apenas administradores podem resetar' : 'Resetar para cor padrão'}
              >
                {!isAdmin && <Lock className="h-4 w-4 mr-1" />}
                Padrão
              </Button>
            </div>

            {/* Informações adicionais */}
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• A cor será aplicada em todos os PDFs gerados</p>
              <p>• Cartas de aceitação de risco usarão esta cor</p>
              <p>• Relatórios e documentos oficiais serão afetados</p>
              
              {!isAdmin && (
                <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2 text-orange-700">
                    <Lock className="h-4 w-4" />
                    <span className="font-medium">Acesso Restrito</span>
                  </div>
                  <p className="text-orange-600 mt-1">
                    Apenas administradores podem configurar a cor do PDF. 
                    Entre em contato com um administrador para fazer alterações.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PDFColorSettings;