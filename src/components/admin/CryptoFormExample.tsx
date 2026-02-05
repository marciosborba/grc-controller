/**
 * EXEMPLO DE FORMULARIO COM CRIPTOGRAFIA AUTOMATICA
 * 
 * Componente de exemplo que demonstra como integrar o sistema de
 * criptografia por tenant em formularios do GRC Controller.
 */

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Shield,
  User,
  DollarSign,
  FileText,
  Save,
  RefreshCw,
  Lock,
  Unlock,
  AlertTriangle
} from 'lucide-react';

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  document: string;
  salary: string;
  budget: string;
  auditNotes: string;
  findings: string;
  department: string;
  position: string;
  status: string;
}

const CryptoFormExample: React.FC = () => {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    document: '',
    salary: '',
    budget: '',
    auditNotes: '',
    findings: '',
    department: '',
    position: '',
    status: 'active'
  });
  
  const [saving, setSaving] = useState(false);
  
  const hasPermission = user?.isPlatformAdmin || false;
  
  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const saveData = async () => {
    setSaving(true);
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Dados salvos com sucesso!');
    } catch (error: any) {
      toast.error(`Erro ao salvar: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };
  
  const clearForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      document: '',
      salary: '',
      budget: '',
      auditNotes: '',
      findings: '',
      department: '',
      position: '',
      status: 'active'
    });
  };
  
  const fillExampleData = () => {
    setFormData({
      fullName: 'Joao Silva Santos',
      email: 'joao.silva@empresa.com',
      phone: '+55 11 99999-9999',
      document: '123.456.789-00',
      salary: 'R$ 15.000,00',
      budget: 'R$ 500.000,00',
      auditNotes: 'Auditoria realizada conforme ISO 27001.',
      findings: 'Sistema de backup precisa ser melhorado.',
      department: 'Tecnologia da Informacao',
      position: 'Analista de Seguranca',
      status: 'active'
    });
  };
  
  if (!hasPermission) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Shield className="mx-auto h-12 w-12 mb-4" />
            <p>Acesso restrito a administradores da plataforma.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Exemplo de Formulario com Criptografia
          </CardTitle>
          <CardDescription>
            Demonstracao de como integrar criptografia por tenant em formularios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button onClick={fillExampleData} variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Preencher Exemplo
            </Button>
            <Button onClick={clearForm} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Limpar
            </Button>
            <Button onClick={saveData} disabled={saving} size="sm">
              {saving ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Formulario */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dados PII */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-blue-500" />
              Dados Pessoais (PII)
              <Badge variant="outline" className="text-xs">
                <Lock className="h-3 w-3 mr-1" />
                Criptografado
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome Completo</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                placeholder="Digite o nome completo"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="Digite o email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="Digite o telefone"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="document">CPF/CNPJ</Label>
              <Input
                id="document"
                value={formData.document}
                onChange={(e) => updateField('document', e.target.value)}
                placeholder="Digite o documento"
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Dados Financeiros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-green-500" />
              Dados Financeiros
              <Badge variant="outline" className="text-xs">
                <Lock className="h-3 w-3 mr-1" />
                Criptografado
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="salary">Salario</Label>
              <Input
                id="salary"
                value={formData.salary}
                onChange={(e) => updateField('salary', e.target.value)}
                placeholder="Digite o salario"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="budget">Orcamento</Label>
              <Input
                id="budget"
                value={formData.budget}
                onChange={(e) => updateField('budget', e.target.value)}
                placeholder="Digite o orcamento"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department">Departamento</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => updateField('department', e.target.value)}
                placeholder="Digite o departamento"
              />
              <p className="text-xs text-muted-foreground">
                <Unlock className="h-3 w-3 inline mr-1" />
                Nao criptografado
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="position">Cargo</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => updateField('position', e.target.value)}
                placeholder="Digite o cargo"
              />
              <p className="text-xs text-muted-foreground">
                <Unlock className="h-3 w-3 inline mr-1" />
                Nao criptografado
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Dados de Auditoria */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-purple-500" />
            Dados de Auditoria
            <Badge variant="outline" className="text-xs">
              <Lock className="h-3 w-3 mr-1" />
              Criptografado
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="auditNotes">Notas de Auditoria</Label>
            <Textarea
              id="auditNotes"
              value={formData.auditNotes}
              onChange={(e) => updateField('auditNotes', e.target.value)}
              placeholder="Digite as notas de auditoria"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="findings">Achados</Label>
            <Textarea
              id="findings"
              value={formData.findings}
              onChange={(e) => updateField('findings', e.target.value)}
              placeholder="Digite os achados da auditoria"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CryptoFormExample;
