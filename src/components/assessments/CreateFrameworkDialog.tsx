import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreateFrameworkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const CreateFrameworkDialog: React.FC<CreateFrameworkDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('manual');
  const [formData, setFormData] = useState({
    name: '',
    short_name: '',
    category: '',
    description: '',
    version: '1.0',
  });
  const [file, setFile] = useState<File | null>(null);

  const categories = [
    'Segurança da Informação',
    'Gestão de Riscos',
    'Qualidade',
    'Compliance',
    'Privacidade',
    'Operacional',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.short_name || !formData.category) return;

    try {
      setIsLoading(true);
      const { data: userData } = await supabase.auth.getUser();

      const { data: framework, error } = await supabase
        .from('frameworks')
        .insert({
          name: formData.name,
          short_name: formData.short_name,
          category: formData.category,
          description: formData.description || null,
          version: formData.version,
          created_by_user_id: userData.user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      if (activeTab === 'upload' && file) {
        await handleFileUpload(framework.id);
      }

      resetForm();
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar framework.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (frameworkId: string) => {
    if (!file) return;

    try {
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      // Find column indices
      const codeIndex = headers.findIndex(h => h.toLowerCase().includes('codigo'));
      const textIndex = headers.findIndex(h => h.toLowerCase().includes('texto'));
      const domainIndex = headers.findIndex(h => h.toLowerCase().includes('dominio'));
      const referenceIndex = headers.findIndex(h => h.toLowerCase().includes('referencia'));

      const controls = [];
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const columns = line.split(',').map(c => c.trim().replace(/"/g, ''));
        
        if (columns.length >= Math.max(codeIndex, textIndex) + 1) {
          controls.push({
            framework_id: frameworkId,
            control_code: columns[codeIndex] || `CTRL-${i}`,
            control_text: columns[textIndex] || '',
            domain: domainIndex >= 0 ? columns[domainIndex] : null,
            control_reference: referenceIndex >= 0 ? columns[referenceIndex] : null,
          });
        }
      }

      if (controls.length > 0) {
        const { error } = await supabase
          .from('framework_controls')
          .insert(controls);

        if (error) throw error;

        toast({
          title: 'Sucesso',
          description: `${controls.length} controles importados com sucesso.`,
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Erro ao processar arquivo. Verifique o formato.',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      short_name: '',
      category: '',
      description: '',
      version: '1.0',
    });
    setFile(null);
    setActiveTab('manual');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Framework</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual</TabsTrigger>
            <TabsTrigger value="upload">Carregar Planilha</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {/* Common fields for both tabs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Norma ISO/IEC 27001:2022"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="short_name">Nome Curto *</Label>
                <Input
                  id="short_name"
                  value={formData.short_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, short_name: e.target.value }))}
                  placeholder="Ex: ISO 27001"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoria *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="version">Versão</Label>
                <Input
                  id="version"
                  value={formData.version}
                  onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                  placeholder="1.0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição do framework..."
                rows={3}
              />
            </div>

            <TabsContent value="upload" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file">Arquivo de Controles (CSV)</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <label htmlFor="file" className="cursor-pointer">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                      Clique para selecionar um arquivo CSV
                    </p>
                    <p className="text-xs text-gray-500">
                      Formato: Codigo_Controle, Texto_Controle, Dominio, Referencia
                    </p>
                  </label>
                  {file && (
                    <p className="mt-2 text-sm font-medium text-green-600">
                      Arquivo selecionado: {file.name}
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={!formData.name || !formData.short_name || !formData.category || isLoading}
              >
                {isLoading ? 'Criando...' : 'Criar Framework'}
              </Button>
            </DialogFooter>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};