import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  Filter,
  Download,
  Calendar,
  User,
  MessageSquare,
  Activity,
  Brain,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AILog {
  id: string;
  user_id: string;
  session_id: string;
  message_type: 'user' | 'assistant';
  content: string;
  ai_type: string;
  context: any;
  response_time?: number;
  error_message?: string;
  created_at: string;
  profiles?: {
    full_name: string;
    email?: string;
  };
}

interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  profiles?: {
    full_name: string;
    email?: string;
  };
}

export const SystemLogsPage: React.FC = () => {
  const { toast } = useToast();
  const [aiLogs, setAILogs] = useState<AILog[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [aiTypeFilter, setAITypeFilter] = useState('all');
  const [messageTypeFilter, setMessageTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('7d');

  const fetchAILogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('ai_chat_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);

      // Apply filters
      if (aiTypeFilter !== 'all') {
        query = query.eq('ai_type', aiTypeFilter);
      }

      if (messageTypeFilter !== 'all') {
        query = query.eq('message_type', messageTypeFilter);
      }

      // Date filter
      if (dateFilter !== 'all') {
        const days = parseInt(dateFilter.replace('d', ''));
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        query = query.gte('created_at', cutoffDate.toISOString());
      }

      const { data: logsData, error } = await query;

      if (error) throw error;

      // Get user profiles separately
      const userIds = [...new Set(logsData?.map(log => log.user_id) || [])];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', userIds);

      // Combine data
      let filteredData = (logsData || []).map(log => ({
        ...log,
        profiles: profilesData?.find(p => p.user_id === log.user_id)
      }));

      // Search filter
      if (searchTerm) {
        filteredData = filteredData.filter(log => 
          log.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setAILogs(filteredData as AILog[]);
    } catch (error) {
      console.error('Error fetching AI logs:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar logs da IA',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);

      // Date filter
      if (dateFilter !== 'all') {
        const days = parseInt(dateFilter.replace('d', ''));
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        query = query.gte('created_at', cutoffDate.toISOString());
      }

      const { data: logsData, error } = await query;

      if (error) throw error;

      // Get user profiles separately
      const userIds = [...new Set(logsData?.map(log => log.user_id).filter(Boolean) || [])];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', userIds);

      // Combine data
      let filteredData = (logsData || []).map(log => ({
        ...log,
        profiles: profilesData?.find(p => p.user_id === log.user_id)
      }));

      // Search filter
      if (searchTerm) {
        filteredData = filteredData.filter(log => 
          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.resource_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setActivityLogs(filteredData as ActivityLog[]);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar logs de atividade',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAILogs();
    fetchActivityLogs();
  }, [searchTerm, aiTypeFilter, messageTypeFilter, dateFilter]);

  const exportLogs = async (type: 'ai' | 'activity') => {
    try {
      const data = type === 'ai' ? aiLogs : activityLogs;
      const csv = convertToCSV(data);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${type}_logs_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: 'Sucesso',
        description: 'Logs exportados com sucesso',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao exportar logs',
        variant: 'destructive'
      });
    }
  };

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]).filter(key => key !== 'profiles');
    headers.push('user_name');
    
    const csvContent = [
      headers.join(','),
      ...data.map(row => {
        const values = headers.map(header => {
          if (header === 'user_name') {
            return `"${row.profiles?.full_name || 'N/A'}"`;
          }
          const value = row[header];
          if (typeof value === 'object' && value !== null) {
            return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          }
          return `"${String(value || '').replace(/"/g, '""')}"`;
        });
        return values.join(',');
      })
    ].join('\n');
    
    return csvContent;
  };

  const getAITypeBadgeColor = (type: string) => {
    const colors = {
      general: 'bg-blue-100 text-blue-800',
      assessment: 'bg-purple-100 text-purple-800',
      risk: 'bg-red-100 text-red-800',
      audit: 'bg-green-100 text-green-800',
      policy: 'bg-indigo-100 text-indigo-800',
      compliance: 'bg-orange-100 text-orange-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const formatResponseTime = (time?: number) => {
    if (!time) return 'N/A';
    if (time < 1000) return `${time}ms`;
    return `${(time / 1000).toFixed(2)}s`;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Logs do Sistema</h1>
          <p className="text-muted-foreground">
            Monitore todas as atividades e interações com IA do sistema
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtros</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Último dia</SelectItem>
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
                <SelectItem value="90d">Últimos 90 dias</SelectItem>
                <SelectItem value="all">Todos</SelectItem>
              </SelectContent>
            </Select>

            <Select value={aiTypeFilter} onValueChange={setAITypeFilter}>
              <SelectTrigger>
                <Brain className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Tipo de IA" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="general">Geral</SelectItem>
                <SelectItem value="assessment">Assessment</SelectItem>
                <SelectItem value="risk">Risco</SelectItem>
                <SelectItem value="audit">Auditoria</SelectItem>
                <SelectItem value="policy">Políticas</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
              </SelectContent>
            </Select>

            <Select value={messageTypeFilter} onValueChange={setMessageTypeFilter}>
              <SelectTrigger>
                <MessageSquare className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Tipo de mensagem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="user">Usuário</SelectItem>
                <SelectItem value="assistant">Assistente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="ai-logs" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ai-logs" className="flex items-center space-x-2">
            <Brain className="h-4 w-4" />
            <span>Logs de IA ({aiLogs.length})</span>
          </TabsTrigger>
          <TabsTrigger value="activity-logs" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Logs de Atividade ({activityLogs.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai-logs">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Logs de Interações com IA</CardTitle>
                <Button onClick={() => exportLogs('ai')} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Tipo IA</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Conteúdo</TableHead>
                      <TableHead>Tempo Resposta</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {aiLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-sm">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(log.created_at).toLocaleString()}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span className="font-medium">
                              {log.profiles?.full_name || 'Usuário não identificado'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getAITypeBadgeColor(log.ai_type)}>
                            {log.ai_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={log.message_type === 'user' ? 'default' : 'secondary'}>
                            {log.message_type === 'user' ? 'Usuário' : 'Assistente'}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-md">
                          <div className="truncate text-sm">
                            {log.content.length > 100 
                              ? `${log.content.substring(0, 100)}...`
                              : log.content
                            }
                          </div>
                        </TableCell>
                        <TableCell>
                          {log.message_type === 'assistant' && (
                            <span className="text-sm">
                              {formatResponseTime(log.response_time)}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {log.error_message ? (
                            <Badge variant="destructive">Erro</Badge>
                          ) : (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              Sucesso
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity-logs">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Logs de Atividade do Sistema</CardTitle>
                <Button onClick={() => exportLogs('activity')} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Ação</TableHead>
                      <TableHead>Recurso</TableHead>
                      <TableHead>ID do Recurso</TableHead>
                      <TableHead>IP</TableHead>
                      <TableHead>Detalhes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activityLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-sm">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(log.created_at).toLocaleString()}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span className="font-medium">
                              {log.profiles?.full_name || 'Sistema'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.action}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{log.resource_type}</Badge>
                        </TableCell>
                        <TableCell className="text-sm font-mono">
                          {log.resource_id?.substring(0, 8) || 'N/A'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {log.ip_address || 'N/A'}
                        </TableCell>
                        <TableCell className="max-w-md">
                          <div className="truncate text-sm">
                            {log.details ? JSON.stringify(log.details).substring(0, 100) : 'N/A'}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};