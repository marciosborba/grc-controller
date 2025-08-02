import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, Upload } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';

interface NewControl {
  id: string;
  control_code: string;
  control_text: string;
  domain: string;
  control_reference: string;
}

const CreateFrameworkPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [isLoading, setIsLoading] = useState(false);
  const [framework, setFramework] = useState({
    name: '',
    short_name: '',
    category: '',
    version: '1.0',
    description: ''
  });
  const [controls, setControls] = useState<NewControl[]>([]);
  const [newControl, setNewControl] = useState({
    control_code: '',
    control_text: '',
    domain: '',
    control_reference: ''
  });

  const addControl = () => {
    if (!newControl.control_code || !newControl.control_text || !newControl.domain) {
      toast({
        title: 'Erro',
        description: 'Preencha pelo menos código, texto e domínio do controle.',
        variant: 'destructive',
      });
      return;
    }

    const control: NewControl = {
      id: Date.now().toString(),
      ...newControl
    };

    setControls(prev => [...prev, control]);
    setNewControl({ control_code: '', control_text: '', domain: '', control_reference: '' });

    toast({
      title: 'Sucesso',
      description: 'Controle adicionado à lista.',
    });
  };

  const removeControl = (id: string) => {
    setControls(prev => prev.filter(c => c.id !== id));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];

      // Skip header row
      const rows = jsonData.slice(1);
      const uploadedControls: NewControl[] = [];

      rows.forEach((row, index) => {
        if (row.length >= 3 && row[0] && row[1] && row[2]) {
          uploadedControls.push({
            id: `upload-${index}`,
            control_code: row[0],
            control_text: row[1],
            domain: row[2],
            control_reference: row[3] || ''
          });
        }
      });

      setControls(uploadedControls);
      toast({
        title: 'Sucesso',
        description: `${uploadedControls.length} controles carregados do arquivo.`,
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Erro ao processar arquivo. Verifique o formato.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createFramework = async () => {
    if (!framework.name || !framework.short_name || !framework.category) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios do framework.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      
      const { data: frameworkData, error: frameworkError } = await supabase
        .from('frameworks')
        .insert({
          name: framework.name,
          short_name: framework.short_name,
          category: framework.category,
          version: framework.version,
          description: framework.description,
          created_by_user_id: userData.user?.id
        })
        .select()
        .single();

      if (frameworkError) throw frameworkError;

      // Add controls if any
      if (controls.length > 0) {
        const controlsData = controls.map(control => ({
          framework_id: frameworkData.id,
          control_code: control.control_code,
          control_text: control.control_text,
          domain: control.domain,
          control_reference: control.control_reference || null
        }));

        const { error: controlsError } = await supabase
          .from('framework_controls')
          .insert(controlsData);

        if (controlsError) throw controlsError;
      }

      toast({
        title: 'Sucesso',
        description: `Framework criado com ${controls.length} controles.`,
      });

      navigate('/assessments/frameworks');
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Erro ao criar framework.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/assessments/frameworks')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Criar Novo Framework</h1>
          <p className="text-muted-foreground">
            Configure as informações do framework e adicione os controles
          </p>
        </div>
        <Button
          onClick={createFramework}
          disabled={isLoading || !framework.name || !framework.short_name || !framework.category}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isLoading ? 'Salvando...' : 'Salvar Framework'}
        </Button>
      </div>

      {/* Framework Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Framework</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
            <div>
              <label className="text-sm font-medium">Nome *</label>
              <Input
                value={framework.name}
                onChange={(e) => setFramework(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: ISO 27001:2022"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Nome Curto *</label>
              <Input
                value={framework.short_name}
                onChange={(e) => setFramework(prev => ({ ...prev, short_name: e.target.value }))}
                placeholder="Ex: ISO27001"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Categoria *</label>
              <Input
                value={framework.category}
                onChange={(e) => setFramework(prev => ({ ...prev, category: e.target.value }))}
                placeholder="Ex: Segurança da Informação"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Versão</label>
              <Input
                value={framework.version}
                onChange={(e) => setFramework(prev => ({ ...prev, version: e.target.value }))}
                placeholder="Ex: 1.0"
                disabled={isLoading}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Descrição</label>
            <Textarea
              value={framework.description}
              onChange={(e) => setFramework(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva o framework e seu propósito..."
              rows={3}
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Controls Section */}
      <Card>
        <CardHeader>
          <CardTitle>Controles do Framework ({controls.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual">Entrada Manual</TabsTrigger>
              <TabsTrigger value="upload">Upload de Arquivo</TabsTrigger>
            </TabsList>
            
            <TabsContent value="manual" className="space-y-4">
              <div className="grid gap-4 p-4 border rounded-lg">
                <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
                  <div>
                    <label className="text-sm font-medium">Código do Controle *</label>
                    <Input
                      value={newControl.control_code}
                      onChange={(e) => setNewControl(prev => ({ ...prev, control_code: e.target.value }))}
                      placeholder="Ex: A.5.1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Domínio *</label>
                    <Input
                      value={newControl.domain}
                      onChange={(e) => setNewControl(prev => ({ ...prev, domain: e.target.value }))}
                      placeholder="Ex: Políticas de Segurança"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Texto do Controle *</label>
                  <Textarea
                    value={newControl.control_text}
                    onChange={(e) => setNewControl(prev => ({ ...prev, control_text: e.target.value }))}
                    placeholder="Descreva o objetivo e requisitos do controle..."
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Referência</label>
                  <Input
                    value={newControl.control_reference}
                    onChange={(e) => setNewControl(prev => ({ ...prev, control_reference: e.target.value }))}
                    placeholder="Ex: ISO 27001:2022"
                  />
                </div>
                <Button
                  onClick={addControl}
                  disabled={!newControl.control_code || !newControl.control_text || !newControl.domain}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar Controle
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="upload" className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="text-center space-y-4">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">Upload de Arquivo Excel/CSV</h3>
                    <p className="text-sm text-muted-foreground">
                      Formato: Codigo_Controle, Texto_Controle, Dominio, Referencia
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileUpload}
                    className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Controls Table */}
          {controls.length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium mb-4">Controles Adicionados</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Controle</TableHead>
                    <TableHead>Domínio</TableHead>
                    <TableHead>Referência</TableHead>
                    <TableHead className="w-[50px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {controls.map((control) => (
                    <TableRow key={control.id}>
                      <TableCell className="font-medium">
                        {control.control_code}
                      </TableCell>
                      <TableCell className="max-w-md">
                        <div className="text-sm">
                          {control.control_text.length > 100 
                            ? `${control.control_text.substring(0, 100)}...`
                            : control.control_text
                          }
                        </div>
                      </TableCell>
                      <TableCell>{control.domain}</TableCell>
                      <TableCell>{control.control_reference || '-'}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeControl(control.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateFrameworkPage;