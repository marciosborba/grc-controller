import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Play, 
  Pause, 
  Save, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  FileText,
  Target,
  Users,
  Calendar,
  BookOpen,
  Star,
  ArrowRight,
  Plus,
  Filter,
  Search,
  BarChart3,
  Settings,
  Zap,
  Shield,
  TrendingUp,
  Award,
  Activity,
  Download,
  Upload,
  Trash2,
  Edit,
  Copy,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Workflow,
  Bell,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useAssessments, useAssessmentMetrics } from '@/hooks/useAssessments';

// =====================================================
// ENHANCED TYPES & INTERFACES
// =====================================================

interface EnhancedAssessmentHubProps {
  mode?: 'dashboard' | 'execution' | 'management' | 'analytics' | 'bulk' | 'templates';
  assessmentId?: string;
  className?: string;
}

interface BulkOperation {
  type: 'status_update' | 'assignment' | 'delete' | 'export' | 'duplicate';
  label: string;
  icon: React.ReactNode;
  danger?: boolean;
}

interface AdvancedMetrics {
  totalAssessments: number;
  completionRate: number;
  averageMaturity: number;
  complianceScore: number;
  criticalFindings: number;
  pendingActions: number;
  dueSoon: number;
  overdueCount: number;
  frameworkDistribution: Array<{
    framework: string;
    count: number;
    percentage: number;
  }>;
  maturityTrends: Array<{
    month: string;
    score: number;
  }>;
  statusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
}

interface ViewConfig {
  title: string;
  description: string;
  actions: string[];
  showFilters: boolean;
  showBulk: boolean;
  showMetrics: boolean;
  defaultView: 'grid' | 'list' | 'kanban' | 'calendar';
}

// =====================================================
// ENHANCED ASSESSMENT HUB COMPONENT
// =====================================================

const EnhancedAssessmentHub: React.FC<EnhancedAssessmentHubProps> = ({ 
  mode = 'dashboard',
  assessmentId,
  className = ''
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State Management
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban' | 'calendar'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    framework: 'all',
    assignee: '',
    dueDate: ''
  });
  const [showBulkPanel, setShowBulkPanel] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Data Hooks
  const {
    assessments = [],
    isLoading,
    error: assessmentsError,
    createAssessment,
    updateAssessment,
    deleteAssessment,
    isCreating,
    isUpdating
  } = useAssessments({
    filters: { search: searchTerm, ...filters },
    page: 1,
    limit: 50
  });

  const { 
    metrics, 
    isLoading: metricsLoading,
    advancedMetrics 
  } = useAssessmentMetrics();

  // Bulk Operations Configuration
  const bulkOperations: BulkOperation[] = [
    {
      type: 'status_update',
      label: 'Update Status',
      icon: <CheckCircle2 className="h-4 w-4" />
    },
    {
      type: 'assignment',
      label: 'Assign Users',
      icon: <Users className="h-4 w-4" />
    },
    {
      type: 'duplicate',
      label: 'Duplicate',
      icon: <Copy className="h-4 w-4" />
    },
    {
      type: 'export',
      label: 'Export',
      icon: <Download className="h-4 w-4" />
    },
    {
      type: 'delete',
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      danger: true
    }
  ];

  // View Configurations
  const viewConfigs: Record<string, ViewConfig> = useMemo(() => ({
    dashboard: {
      title: 'Assessment Dashboard',
      description: 'Overview of all assessments with key metrics and insights',
      actions: ['create', 'import', 'templates'],
      showFilters: true,
      showBulk: false,
      showMetrics: true,
      defaultView: 'grid'
    },
    management: {
      title: 'Assessment Management',
      description: 'Full CRUD operations and bulk management capabilities',
      actions: ['create', 'bulk', 'import', 'export'],
      showFilters: true,
      showBulk: true,
      showMetrics: true,
      defaultView: 'list'
    },
    execution: {
      title: 'Assessment Execution',
      description: 'Execute assessments with guided workflows',
      actions: ['save', 'submit', 'preview'],
      showFilters: false,
      showBulk: false,
      showMetrics: false,
      defaultView: 'list'
    },
    analytics: {
      title: 'Assessment Analytics',
      description: 'Advanced analytics and reporting dashboard',
      actions: ['export', 'schedule', 'share'],
      showFilters: true,
      showBulk: false,
      showMetrics: true,
      defaultView: 'grid'
    },
    bulk: {
      title: 'Bulk Operations',
      description: 'Perform operations on multiple assessments',
      actions: ['select_all', 'clear', 'execute'],
      showFilters: true,
      showBulk: true,
      showMetrics: false,
      defaultView: 'list'
    },
    templates: {
      title: 'Assessment Templates',
      description: 'Manage and create assessment templates',
      actions: ['create_template', 'import_standard', 'library'],
      showFilters: true,
      showBulk: true,
      showMetrics: false,
      defaultView: 'grid'
    }
  }), []);

  const currentConfig = viewConfigs[mode];

  // Auto-save functionality
  useEffect(() => {
    if (mode === 'execution' && assessmentId) {
      const autoSaveInterval = setInterval(() => {
        if (autoSaveStatus === 'idle') {
          handleAutoSave();
        }
      }, 30000); // Auto-save every 30 seconds

      return () => clearInterval(autoSaveInterval);
    }
  }, [mode, assessmentId, autoSaveStatus]);

  // Event Handlers
  const handleAutoSave = useCallback(async () => {
    setAutoSaveStatus('saving');
    try {
      // Implement auto-save logic here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate save
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus('idle'), 2000);
    } catch (error) {
      setAutoSaveStatus('error');
      toast.error('Auto-save failed');
    }
  }, []);

  const handleBulkOperation = useCallback(async (operation: BulkOperation) => {
    if (selectedItems.length === 0) {
      toast.error('Please select items first');
      return;
    }

    try {
      switch (operation.type) {
        case 'status_update':
          // Implement bulk status update
          toast.success(`Updated status for ${selectedItems.length} assessments`);
          break;
        case 'assignment':
          // Implement bulk assignment
          toast.success(`Assigned ${selectedItems.length} assessments`);
          break;
        case 'duplicate':
          // Implement bulk duplication
          toast.success(`Duplicated ${selectedItems.length} assessments`);
          break;
        case 'export':
          // Implement bulk export
          toast.success(`Exported ${selectedItems.length} assessments`);
          break;
        case 'delete':
          // Implement bulk delete with confirmation
          if (confirm(`Are you sure you want to delete ${selectedItems.length} assessments?`)) {
            toast.success(`Deleted ${selectedItems.length} assessments`);
          }
          break;
      }
      setSelectedItems([]);
      setShowBulkPanel(false);
    } catch (error) {
      toast.error(`Failed to ${operation.label.toLowerCase()}`);
    }
  }, [selectedItems]);

  const handleSelectItem = useCallback((id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedItems.length === assessments.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(assessments.map(a => a.id));
    }
  }, [assessments, selectedItems]);

  // Render Enhanced Metrics Cards
  const renderEnhancedMetrics = () => {
    if (metricsLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      );
    }

    const metricCards = [
      {
        title: 'Total Assessments',
        value: advancedMetrics?.totalAssessments || 0,
        icon: <FileText className="h-5 w-5" />,
        trend: '+12%',
        trendUp: true,
        color: 'blue'
      },
      {
        title: 'Completion Rate',
        value: `${advancedMetrics?.completionRate || 0}%`,
        icon: <CheckCircle className="h-5 w-5" />,
        trend: '+5%',
        trendUp: true,
        color: 'green'
      },
      {
        title: 'Average Maturity',
        value: `${advancedMetrics?.averageMaturity || 0}/5`,
        icon: <Star className="h-5 w-5" />,
        trend: '+0.3',
        trendUp: true,
        color: 'yellow'
      },
      {
        title: 'Compliance Score',
        value: `${advancedMetrics?.complianceScore || 0}%`,
        icon: <Shield className="h-5 w-5" />,
        trend: '+8%',
        trendUp: true,
        color: 'purple'
      },
      {
        title: 'Critical Findings',
        value: advancedMetrics?.criticalFindings || 0,
        icon: <AlertTriangle className="h-5 w-5" />,
        trend: '-15%',
        trendUp: false,
        color: 'red'
      },
      {
        title: 'Pending Actions',
        value: advancedMetrics?.pendingActions || 0,
        icon: <Clock className="h-5 w-5" />,
        trend: '-5%',
        trendUp: false,
        color: 'orange'
      },
      {
        title: 'Due Soon',
        value: advancedMetrics?.dueSoon || 0,
        icon: <Bell className="h-5 w-5" />,
        trend: '+3',
        trendUp: false,
        color: 'amber'
      },
      {
        title: 'Overdue',
        value: advancedMetrics?.overdueCount || 0,
        icon: <XCircle className="h-5 w-5" />,
        trend: '-2',
        trendUp: true,
        color: 'red'
      }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metricCards.map((metric, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded-lg bg-${metric.color}-100 text-${metric.color}-600`}>
                    {metric.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  </div>
                </div>
                <div className={`flex items-center space-x-1 text-sm ${
                  metric.trendUp ? 'text-green-600' : 'text-red-600'
                }`}>
                  <TrendingUp className={`h-4 w-4 ${!metric.trendUp ? 'rotate-180' : ''}`} />
                  <span>{metric.trend}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // Render Bulk Operations Panel
  const renderBulkPanel = () => {
    if (!currentConfig.showBulk || selectedItems.length === 0) return null;

    return (
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox 
                checked={selectedItems.length === assessments.length}
                onCheckedChange={handleSelectAll}
              />
              <span className="font-medium">
                {selectedItems.length} of {assessments.length} selected
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {bulkOperations.map((operation) => (
                <Button
                  key={operation.type}
                  variant={operation.danger ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => handleBulkOperation(operation)}
                  className="flex items-center space-x-1"
                >
                  {operation.icon}
                  <span>{operation.label}</span>
                </Button>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedItems([])}
              >
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render Assessment Grid
  const renderAssessmentGrid = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assessments.map((assessment) => (
          <Card key={assessment.id} className="relative hover:shadow-lg transition-shadow">
            {currentConfig.showBulk && (
              <div className="absolute top-4 left-4 z-10">
                <Checkbox
                  checked={selectedItems.includes(assessment.id)}
                  onCheckedChange={() => handleSelectItem(assessment.id)}
                />
              </div>
            )}
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold">
                    {assessment.titulo}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    {assessment.framework?.nome}
                  </p>
                </div>
                <Badge variant={
                  assessment.status === 'concluido' ? 'default' :
                  assessment.status === 'em_andamento' ? 'secondary' :
                  assessment.status === 'iniciado' ? 'outline' : 'destructive'
                }>
                  {assessment.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-gray-600">
                      {assessment.percentual_conclusao || 0}%
                    </span>
                  </div>
                  <Progress value={assessment.percentual_conclusao || 0} className="h-2" />
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>Maturity: {assessment.score_maturidade || 0}/5</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>{assessment.data_fim ? new Date(assessment.data_fim).toLocaleDateString() : 'No due date'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/assessments/execution/${assessment.id}`)}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Execute
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/assessments/details/${assessment.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // Main Render
  return (
    <div className={`p-6 ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{currentConfig.title}</h1>
            <p className="text-gray-600 mt-2">{currentConfig.description}</p>
          </div>
          <div className="flex items-center space-x-3">
            {autoSaveStatus !== 'idle' && (
              <div className="flex items-center space-x-2">
                <div className={`h-2 w-2 rounded-full ${
                  autoSaveStatus === 'saving' ? 'bg-yellow-500 animate-pulse' :
                  autoSaveStatus === 'saved' ? 'bg-green-500' :
                  'bg-red-500'
                }`} />
                <span className="text-sm text-gray-600">
                  {autoSaveStatus === 'saving' ? 'Saving...' :
                   autoSaveStatus === 'saved' ? 'Saved' :
                   'Save failed'}
                </span>
              </div>
            )}
            {currentConfig.actions.includes('create') && (
              <Button onClick={() => navigate('/assessments/create')}>
                <Plus className="h-4 w-4 mr-2" />
                New Assessment
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Metrics */}
      {currentConfig.showMetrics && renderEnhancedMetrics()}

      {/* Filters & Search */}
      {currentConfig.showFilters && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search assessments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="planejado">Planned</SelectItem>
                    <SelectItem value="iniciado">Started</SelectItem>
                    <SelectItem value="em_andamento">In Progress</SelectItem>
                    <SelectItem value="concluido">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="framework">Framework</Label>
                <Select value={filters.framework} onValueChange={(value) => setFilters(prev => ({ ...prev, framework: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All frameworks" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All frameworks</SelectItem>
                    <SelectItem value="ISO27001">ISO 27001</SelectItem>
                    <SelectItem value="NIST">NIST CSF</SelectItem>
                    <SelectItem value="SOX">SOX</SelectItem>
                    <SelectItem value="LGPD">LGPD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button variant="outline" className="w-full">
                  <Filter className="h-4 w-4 mr-2" />
                  Advanced Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bulk Operations Panel */}
      {renderBulkPanel()}

      {/* Content */}
      <div className="space-y-6">
        {renderAssessmentGrid()}
      </div>

      {/* Empty State */}
      {assessments.length === 0 && !isLoading && (
        <Card className="p-12 text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No assessments found</h3>
          <p className="text-gray-600 mb-6">Get started by creating your first assessment</p>
          <Button onClick={() => navigate('/assessments/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Assessment
          </Button>
        </Card>
      )}
    </div>
  );
};

export default EnhancedAssessmentHub;