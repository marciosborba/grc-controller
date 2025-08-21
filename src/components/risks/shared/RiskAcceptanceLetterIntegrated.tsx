import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  FileText,
  Download,
  Send,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  User,
  Calendar,
  Shield,
  AlertTriangle,
  Signature,
  Lock,
  Unlock,
  Star,
  Archive,
  Plus,
  Search,
  Filter,
  Brain,
  Zap,
  Users,
  Building,
  Globe,
  Mail,
  Phone,
  MapPin,
  FileCheck,
  Printer,
  Share2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RiskAcceptanceLetterData {
  name: string;
  description: string;
  level: string;
  category: string;
  justification: string;
}

interface RiskAcceptanceLetterIntegratedProps {
  riskData: RiskAcceptanceLetterData;
  onGenerate: (letterData: any) => void;
}

export const RiskAcceptanceLetterIntegrated: React.FC<RiskAcceptanceLetterIntegratedProps> = ({
  riskData,
  onGenerate
}) => {
  const [formData, setFormData] = useState({
    approver: '',
    approverTitle: '',
    reviewDate: '',
    expirationDate: '',
    executiveSummary: '',
    acceptanceRationale: '',
    mitigatingFactors: '',
    residualRisk: '',
    monitoringPlan: ''
  });
  
  const { toast } = useToast();

  const handleGenerate = () => {
    if (!formData.approver || !formData.approverTitle) {
      toast({
        title: '⚠️ Campos Obrigatórios',
        description: 'Preencha o aprovador e cargo antes de gerar a carta.',
        variant: 'destructive'
      });
      return;
    }

    const letterData = {
      id: `letter-${Date.now()}`,
      letterNumber: `RAL-2024-${String(Date.now()).slice(-3)}`,
      riskName: riskData.name,
      title: `Carta de Aceitação de Risco - ${riskData.name}`,
      executiveSummary: formData.executiveSummary || `Esta carta formaliza a aceitação do risco "${riskData.name}" conforme análise realizada.`,
      riskDescription: riskData.description,
      justification: riskData.justification,
      acceptanceRationale: formData.acceptanceRationale || 'Aceitação baseada na análise de custo-benefício e controles implementados.',
      mitigatingFactors: formData.mitigatingFactors.split('\n').filter(f => f.trim()),
      residualRisk: formData.residualRisk || 'Baixo, considerando os controles implementados',
      monitoringPlan: formData.monitoringPlan || 'Monitoramento contínuo através de indicadores específicos.',
      reviewDate: formData.reviewDate,
      expirationDate: formData.expirationDate,
      approver: formData.approver,
      approverTitle: formData.approverTitle,
      status: 'draft',
      createdBy: 'Alex Risk',
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      version: 1,
      alexRiskGenerated: true,
      riskCategory: riskData.category,
      riskLevel: riskData.level
    };

    onGenerate(letterData);
    
    toast({
      title: '✅ Carta Gerada',
      description: 'Carta de aceitação de risco gerada com sucesso!',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-6 w-6 text-yellow-600" />
            <span>Carta de Aceitação de Risco</span>
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
              Alex Risk
            </Badge>
          </CardTitle>
          <p className="text-muted-foreground">
            Documento formal para aceitação do risco: <strong>{riskData.name}</strong>
          </p>
        </CardHeader>
      </Card>

      {/* Informações do Risco */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informações do Risco</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nome do Risco</label>
              <p className="font-medium">{riskData.name}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Categoria</label>
              <p className="font-medium">{riskData.category}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nível</label>
              <Badge variant="outline" className="font-medium">
                {riskData.level}
              </Badge>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">Descrição</label>
            <p className="text-sm mt-1">{riskData.description}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">Justificativa para Aceitação</label>
            <p className="text-sm mt-1">{riskData.justification}</p>
          </div>
        </CardContent>
      </Card>

      {/* Formulário da Carta */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Detalhes da Carta de Aceitação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Aprovador *</label>
              <Input
                value={formData.approver}
                onChange={(e) => setFormData(prev => ({ ...prev, approver: e.target.value }))}
                placeholder="Nome do aprovador"
                className="mt-1"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Cargo do Aprovador *</label>
              <Input
                value={formData.approverTitle}
                onChange={(e) => setFormData(prev => ({ ...prev, approverTitle: e.target.value }))}
                placeholder="Cargo/função do aprovador"
                className="mt-1"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Data de Revisão</label>
              <Input
                type="date"
                value={formData.reviewDate}
                onChange={(e) => setFormData(prev => ({ ...prev, reviewDate: e.target.value }))}
                className="mt-1"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Data de Expiração</label>
              <Input
                type="date"
                value={formData.expirationDate}
                onChange={(e) => setFormData(prev => ({ ...prev, expirationDate: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">Sumário Executivo</label>
            <Textarea
              value={formData.executiveSummary}
              onChange={(e) => setFormData(prev => ({ ...prev, executiveSummary: e.target.value }))}
              placeholder="Resumo executivo da aceitação do risco..."
              rows={3}
              className="mt-1"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Rationale de Aceitação</label>
            <Textarea
              value={formData.acceptanceRationale}
              onChange={(e) => setFormData(prev => ({ ...prev, acceptanceRationale: e.target.value }))}
              placeholder="Explicação detalhada do motivo da aceitação..."
              rows={3}
              className="mt-1"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Fatores Mitigadores</label>
            <Textarea
              value={formData.mitigatingFactors}
              onChange={(e) => setFormData(prev => ({ ...prev, mitigatingFactors: e.target.value }))}
              placeholder="Liste os fatores que mitigam o risco (um por linha)..."
              rows={4}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Digite um fator por linha
            </p>
          </div>
          
          <div>
            <label className="text-sm font-medium">Risco Residual</label>
            <Textarea
              value={formData.residualRisk}
              onChange={(e) => setFormData(prev => ({ ...prev, residualRisk: e.target.value }))}
              placeholder="Descrição do risco residual após controles..."
              rows={2}
              className="mt-1"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Plano de Monitoramento</label>
            <Textarea
              value={formData.monitoringPlan}
              onChange={(e) => setFormData(prev => ({ ...prev, monitoringPlan: e.target.value }))}
              placeholder="Como o risco será monitorado..."
              rows={3}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Preview da Carta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-6 rounded-lg border">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold">CARTA DE ACEITAÇÃO DE RISCO</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Documento gerado automaticamente pelo Alex Risk
              </p>
            </div>
            
            <div className="space-y-4 text-sm">
              <div>
                <strong>Risco:</strong> {riskData.name}
              </div>
              <div>
                <strong>Categoria:</strong> {riskData.category}
              </div>
              <div>
                <strong>Nível:</strong> {riskData.level}
              </div>
              <div>
                <strong>Aprovador:</strong> {formData.approver || '[A ser preenchido]'} - {formData.approverTitle || '[Cargo a ser preenchido]'}
              </div>
              {formData.reviewDate && (
                <div>
                  <strong>Data de Revisão:</strong> {new Date(formData.reviewDate).toLocaleDateString('pt-BR')}
                </div>
              )}
              {formData.expirationDate && (
                <div>
                  <strong>Data de Expiração:</strong> {new Date(formData.expirationDate).toLocaleDateString('pt-BR')}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex space-x-3">
        <Button 
          onClick={handleGenerate}
          className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white"
          disabled={!formData.approver || !formData.approverTitle}
        >
          <FileText className="h-4 w-4 mr-2" />
          Gerar Carta de Aceitação
        </Button>
        
        <Button variant="outline" className="flex-1">
          <Eye className="h-4 w-4 mr-2" />
          Visualizar Completa
        </Button>
      </div>
    </div>
  );
};