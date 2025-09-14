import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, User, Target, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Atividade {
  id: string;
  codigo: string;
  titulo: string;
  descricao: string;
  data_inicio_planejada: string;
  data_fim_planejada: string;
  data_inicio_real?: string;
  data_fim_real?: string;
  percentual_conclusao: number;
  status: 'nao_iniciado' | 'em_andamento' | 'pausado' | 'concluido' | 'cancelado';
  tipo: 'tarefa' | 'marco' | 'fase' | 'entrega';
  critica: boolean;
  responsavel?: {
    nome: string;
    email: string;
  };
  iniciativa?: {
    codigo: string;
    titulo: string;
  };
  dependencias?: string[];
}

interface TimelineProps {
  width: number;
  height: number;
  startDate: Date;
  endDate: Date;
  atividades: Atividade[];
  zoomLevel: number;
  onDateRangeChange: (start: Date, end: Date) => void;
}

const CORES_STATUS = {
  nao_iniciado: '#94a3b8',
  em_andamento: '#3b82f6',
  pausado: '#f59e0b',
  concluido: '#10b981',
  cancelado: '#ef4444'
};

const CORES_TIPO = {
  tarefa: '#6366f1',
  marco: '#8b5cf6',
  fase: '#06b6d4',
  entrega: '#f97316'
};

const TimelineChart: React.FC<TimelineProps> = ({
  width,
  height,
  startDate,
  endDate,
  atividades,
  zoomLevel,
  onDateRangeChange
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredActivity, setHoveredActivity] = useState<Atividade | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const dayWidth = (width - 150) / totalDays * zoomLevel; // 150px para labels
  const barHeight = 24;
  const rowHeight = 40;

  const getDatePosition = (date: Date) => {
    const daysDiff = Math.ceil((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return 150 + (daysDiff * dayWidth);
  };

  const getBarWidth = (startDate: Date, endDate: Date) => {
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(days * dayWidth, 4); // Mínimo 4px
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (rect) {
      setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'marco': return '♦';
      case 'fase': return '■';
      case 'entrega': return '▼';
      default: return '●';
    }
  };

  // Gerar escala de tempo
  const generateTimeScale = () => {
    const scales = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const x = getDatePosition(current);
      if (x >= 150 && x <= width) {
        scales.push(
          <g key={current.toISOString()}>
            <line x1={x} y1={30} x2={x} y2={height} stroke="#e5e7eb" strokeWidth="1" />
            <text x={x} y={25} textAnchor="middle" fontSize="10" fill="#6b7280">
              {current.getDate() === 1 ? current.toLocaleDateString('pt-BR', { month: 'short' }) : current.getDate()}
            </text>
          </g>
        );
      }
      current.setDate(current.getDate() + 7); // Semanal
    }
    
    return scales;
  };

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="border border-gray-200 rounded"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredActivity(null)}
      >
        {/* Background */}
        <rect width={width} height={height} fill="white" />
        
        {/* Header */}
        <rect x={0} y={0} width={width} height={30} fill="#f8fafc" />
        
        {/* Escala de tempo */}
        {generateTimeScale()}
        
        {/* Linha atual (hoje) */}
        {(() => {
          const today = new Date();
          const todayX = getDatePosition(today);
          if (todayX >= 150 && todayX <= width) {
            return (
              <line x1={todayX} y1={30} x2={todayX} y2={height} stroke="#ef4444" strokeWidth="2" strokeDasharray="5,5" />
            );
          }
        })()}
        
        {/* Atividades */}
        {atividades.map((atividade, index) => {
          const y = 50 + (index * rowHeight);
          const startX = getDatePosition(new Date(atividade.data_inicio_planejada));
          const endX = getDatePosition(new Date(atividade.data_fim_planejada));
          const barWidth = endX - startX;
          
          // Barra de progresso
          const progressWidth = (barWidth * atividade.percentual_conclusao) / 100;
          
          // Verificar se está atrasado
          const isLate = new Date(atividade.data_fim_planejada) < new Date() && atividade.status !== 'concluido';
          
          return (
            <g key={atividade.id}>
              {/* Label da atividade */}
              <text x={140} y={y + barHeight/2 + 4} textAnchor="end" fontSize="11" fill="#374151" className="font-medium">
                {atividade.codigo}
              </text>
              
              {/* Barra planejada */}
              <rect
                x={startX}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={isLate ? '#fecaca' : '#e5e7eb'}
                stroke={CORES_TIPO[atividade.tipo]}
                strokeWidth="1"
                rx="4"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredActivity(atividade)}
              />
              
              {/* Barra de progresso */}
              {atividade.percentual_conclusao > 0 && (
                <rect
                  x={startX}
                  y={y}
                  width={progressWidth}
                  height={barHeight}
                  fill={CORES_STATUS[atividade.status]}
                  rx="4"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredActivity(atividade)}
                />
              )}
              
              {/* Ícone do tipo */}
              <text
                x={startX - 10}
                y={y + barHeight/2 + 4}
                textAnchor="middle"
                fontSize="12"
                fill={CORES_TIPO[atividade.tipo]}
              >
                {getTipoIcon(atividade.tipo)}
              </text>
              
              {/* Indicador de atividade crítica */}
              {atividade.critica && (
                <rect
                  x={startX - 2}
                  y={y - 2}
                  width={barWidth + 4}
                  height={barHeight + 4}
                  fill="none"
                  stroke="#dc2626"
                  strokeWidth="2"
                  rx="6"
                  strokeDasharray="3,3"
                />
              )}
              
              {/* Data real (se diferente da planejada) */}
              {atividade.data_inicio_real && atividade.data_fim_real && (
                <rect
                  x={getDatePosition(new Date(atividade.data_inicio_real))}
                  y={y + barHeight + 2}
                  width={getBarWidth(new Date(atividade.data_inicio_real), new Date(atividade.data_fim_real))}
                  height={4}
                  fill="#10b981"
                  rx="2"
                />
              )}
            </g>
          );
        })}
      </svg>
      
      {/* Tooltip */}
      {hoveredActivity && (
        <div
          className="absolute bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10 max-w-sm"
          style={{
            left: mousePosition.x + 10,
            top: mousePosition.y - 10,
            transform: mousePosition.x + 250 > width ? 'translateX(-100%)' : 'none'
          }}
        >
          <div className="space-y-2">
            <div className="font-semibold text-sm">{hoveredActivity.codigo}</div>
            <div className="text-sm text-gray-600">{hoveredActivity.titulo}</div>
            <div className="flex items-center gap-2 text-xs">
              <Badge variant={hoveredActivity.status === 'concluido' ? 'success' : 'default'}>
                {hoveredActivity.status.replace('_', ' ')}
              </Badge>
              <Badge variant="outline">{hoveredActivity.tipo}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
              <div>
                <strong>Início:</strong> {formatDate(hoveredActivity.data_inicio_planejada)}
              </div>
              <div>
                <strong>Fim:</strong> {formatDate(hoveredActivity.data_fim_planejada)}
              </div>
              <div>
                <strong>Progresso:</strong> {hoveredActivity.percentual_conclusao}%
              </div>
              <div>
                <strong>Responsável:</strong> {hoveredActivity.responsavel?.nome}
              </div>
            </div>
            {hoveredActivity.critica && (
              <div className="text-xs text-red-600 font-medium">🎯 Atividade Crítica</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export function TimelineVisualizacao() {
  const { user } = useAuth();
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroIniciativa, setFiltroIniciativa] = useState<string>('all');
  const [filtroStatus, setFiltroStatus] = useState<string>('all');
  const [filtroTipo, setFiltroTipo] = useState<string>('all');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), 0, 1), // 1º de janeiro do ano atual
    end: new Date(new Date().getFullYear(), 11, 31)  // 31 de dezembro do ano atual
  });

  const [iniciativas, setIniciativas] = useState<any[]>([]);

  useEffect(() => {
    loadAtividades();
    loadIniciativas();
  }, []);

  const loadAtividades = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cronograma_atividades')
        .select(`
          *,
          responsavel:profiles!cronograma_atividades_responsavel_id_fkey(nome, email),
          iniciativa:iniciativas_estrategicas!cronograma_atividades_iniciativa_id_fkey(codigo, titulo)
        `)
        .order('data_inicio_planejada');

      if (error) throw error;
      setAtividades(data || []);
    } catch (error) {
      console.error('Erro ao carregar atividades:', error);
      toast.error('Erro ao carregar cronograma');
    } finally {
      setLoading(false);
    }
  };

  const loadIniciativas = async () => {
    try {
      const { data, error } = await supabase
        .from('iniciativas_estrategicas')
        .select('id, codigo, titulo')
        .order('codigo');

      if (error) throw error;
      setIniciativas(data || []);
    } catch (error) {
      console.error('Erro ao carregar iniciativas:', error);
    }
  };

  const atividadesFiltradas = atividades.filter(atividade => {
    const matchesIniciativa = filtroIniciativa === 'all' || atividade.iniciativa_id === filtroIniciativa;
    const matchesStatus = filtroStatus === 'all' || atividade.status === filtroStatus;
    const matchesTipo = filtroTipo === 'all' || atividade.tipo === filtroTipo;
    return matchesIniciativa && matchesStatus && matchesTipo;
  });

  const exportTimeline = () => {
    // Implementar exportação para PDF/PNG
    toast.success('Funcionalidade de exportação em desenvolvimento');
  };

  const adjustDateRange = (direction: 'prev' | 'next') => {
    const monthsToMove = 1;
    const newStart = new Date(dateRange.start);
    const newEnd = new Date(dateRange.end);
    
    if (direction === 'prev') {
      newStart.setMonth(newStart.getMonth() - monthsToMove);
      newEnd.setMonth(newEnd.getMonth() - monthsToMove);
    } else {
      newStart.setMonth(newStart.getMonth() + monthsToMove);
      newEnd.setMonth(newEnd.getMonth() + monthsToMove);
    }
    
    setDateRange({ start: newStart, end: newEnd });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando cronograma...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Timeline do Cronograma</h1>
          <p className="text-muted-foreground">
            Visualização interativa do cronograma de atividades estratégicas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportTimeline}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Controles */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros e Controles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Iniciativa</label>
              <Select value={filtroIniciativa} onValueChange={setFiltroIniciativa}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Iniciativas</SelectItem>
                  {iniciativas.map((iniciativa) => (
                    <SelectItem key={iniciativa.id} value={iniciativa.id}>
                      {iniciativa.codigo} - {iniciativa.titulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="nao_iniciado">Não Iniciado</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="pausado">Pausado</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo</label>
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  <SelectItem value="tarefa">Tarefas</SelectItem>
                  <SelectItem value="marco">Marcos</SelectItem>
                  <SelectItem value="fase">Fases</SelectItem>
                  <SelectItem value="entrega">Entregas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Zoom: {Math.round(zoomLevel * 100)}%</label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Slider
                  value={[zoomLevel]}
                  onValueChange={([value]) => setZoomLevel(value)}
                  min={0.5}
                  max={3}
                  step={0.25}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.25))}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustDateRange('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <span className="text-sm font-medium">
                {dateRange.start.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })} - {' '}
                {dateRange.end.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustDateRange('next')}
              >
                Próximo
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              {atividadesFiltradas.length} atividade{atividadesFiltradas.length !== 1 ? 's' : ''} {atividadesFiltradas.length !== atividades.length && `de ${atividades.length}`}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legenda */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Legenda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium mb-2">Status</h4>
              <div className="space-y-1">
                {Object.entries(CORES_STATUS).map(([status, cor]) => (
                  <div key={status} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: cor }}></div>
                    <span className="text-sm capitalize">{status.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Tipos</h4>
              <div className="space-y-1">
                {Object.entries(CORES_TIPO).map(([tipo, cor]) => (
                  <div key={tipo} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border" style={{ borderColor: cor }}>
                      <span className="text-xs" style={{ color: cor }}>
                        {tipo === 'marco' ? '♦' : tipo === 'fase' ? '■' : tipo === 'entrega' ? '▼' : '●'}
                      </span>
                    </div>
                    <span className="text-sm capitalize">{tipo}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Elementos</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-red-500 border-dashed border border-red-500"></div>
                  <span className="text-sm">Linha atual (hoje)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-red-600 border-dashed rounded"></div>
                  <span className="text-sm">Atividade crítica</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-green-500 rounded"></div>
                  <span className="text-sm">Progresso real</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Cronograma Visual
          </CardTitle>
          <CardDescription>
            Visualização em Gantt das atividades do planejamento estratégico
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <TimelineChart
              width={Math.max(1200, atividadesFiltradas.length * 100)}
              height={Math.max(300, 80 + (atividadesFiltradas.length * 40))}
              startDate={dateRange.start}
              endDate={dateRange.end}
              atividades={atividadesFiltradas}
              zoomLevel={zoomLevel}
              onDateRangeChange={(start, end) => setDateRange({ start, end })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{atividadesFiltradas.length}</p>
                <p className="text-sm text-muted-foreground">Total de Atividades</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {Math.round(atividadesFiltradas.reduce((acc, act) => acc + act.percentual_conclusao, 0) / atividadesFiltradas.length || 0)}%
                </p>
                <p className="text-sm text-muted-foreground">Progresso Médio</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">
                  {atividadesFiltradas.filter(a => a.critica).length}
                </p>
                <p className="text-sm text-muted-foreground">Atividades Críticas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">
                  {new Set(atividadesFiltradas.map(a => a.responsavel_id)).size}
                </p>
                <p className="text-sm text-muted-foreground">Responsáveis Envolvidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}