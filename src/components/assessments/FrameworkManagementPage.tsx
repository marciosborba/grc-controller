import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Upload, Download, Edit3, Trash2, ArrowLeft } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { useAssessments } from '@/hooks/useAssessments';
import { useToast } from '@/hooks/use-toast';

export const FrameworkManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { frameworks, isLoading } = useAssessments();
  const isMobile = useIsMobile();
  
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFrameworks = frameworks.filter(framework =>
    framework.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    framework.short_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    framework.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownloadTemplate = () => {
    // Create a simple Excel template structure
    const csvContent = `Codigo_Controle,Texto_Controle,Dominio,Referencia
A.5.1,"Política de Segurança da Informação","Políticas de Segurança",
A.5.2,"Revisão da Política de Segurança","Políticas de Segurança",
A.8.1,"Inventário de Ativos","Gestão de Ativos",`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'template_controles.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast({
      title: "Sucesso",
      description: "Template baixado com sucesso.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'items-center'} gap-4`}>
        <Button
          variant="ghost"
          onClick={() => navigate('/assessments')}
          className="flex items-center gap-2 self-start"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div className="flex-1">
          <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold tracking-tight`}>
            Gestão de Frameworks
          </h1>
          <p className="text-muted-foreground">
            Gerencie a biblioteca de frameworks e controles de conformidade
          </p>
        </div>
        <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'gap-2'}`}>
          <Button
            variant="outline"
            onClick={handleDownloadTemplate}
            className="flex items-center gap-2"
            size={isMobile ? "sm" : "default"}
          >
            <Download className="h-4 w-4" />
            {!isMobile && 'Baixar Template'}
          </Button>
          <Button
            onClick={() => navigate('/assessments/frameworks/create')}
            className="flex items-center gap-2"
            size={isMobile ? "sm" : "default"}
          >
            <Plus className="h-4 w-4" />
            {isMobile ? 'Novo' : 'Novo Framework'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-3'}`}>
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Frameworks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{frameworks.length}</div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(frameworks.map(f => f.category)).size}
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Controles Totais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Em breve</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <Input
          placeholder="Buscar frameworks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Frameworks Table */}
      <Card className="overflow-hidden">
        <CardContent className={isMobile ? "p-2" : "p-0"}>
          <div className={isMobile ? "overflow-x-auto" : ""}>
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                {!isMobile && <TableHead>Nome Curto</TableHead>}
                {!isMobile && <TableHead>Categoria</TableHead>}
                {!isMobile && <TableHead>Versão</TableHead>}
                {!isMobile && <TableHead>Criado em</TableHead>}
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Carregando frameworks...
                  </TableCell>
                </TableRow>
              ) : filteredFrameworks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    {searchTerm ? 'Nenhum framework encontrado.' : 'Nenhum framework criado ainda.'}
                    <div className="mt-2">
                      <Button
                        variant="outline"
                        onClick={() => navigate('/assessments/frameworks/create')}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Criar primeiro framework
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredFrameworks.map((framework) => (
                  <TableRow key={framework.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{framework.name}</div>
                        {framework.description && (
                          <div className="text-sm text-muted-foreground">
                            {framework.description.length > 60 
                              ? `${framework.description.substring(0, 60)}...`
                              : framework.description
                            }
                          </div>
                        )}
                        {isMobile && (
                          <div className="mt-1 space-y-1">
                            <Badge variant="secondary" className="mr-1 text-xs">
                              {framework.short_name}
                            </Badge>
                            <Badge variant="outline" className="mr-1 text-xs">
                              {framework.category}
                            </Badge>
                            <div className="text-xs text-muted-foreground">
                              v{framework.version} • {new Date(framework.created_at).toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    {!isMobile && (
                      <TableCell>
                        <Badge variant="secondary">{framework.short_name}</Badge>
                      </TableCell>
                    )}
                    {!isMobile && (
                      <TableCell>
                        <Badge variant="outline">{framework.category}</Badge>
                      </TableCell>
                    )}
                    {!isMobile && <TableCell>{framework.version}</TableCell>}
                    {!isMobile && (
                      <TableCell>
                        {new Date(framework.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/assessments/frameworks/${framework.id}`)}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // TODO: Implement delete framework
                            toast({
                              title: "Em desenvolvimento",
                              description: "Funcionalidade de exclusão em breve.",
                            });
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};