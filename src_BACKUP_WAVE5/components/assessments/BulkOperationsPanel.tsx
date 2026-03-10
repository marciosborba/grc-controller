import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CheckCircle2,
  XCircle,
  Users,
  Download,
  Upload,
  Copy,
  Trash2,
  AlertTriangle,
  FileText,
  Calendar,
  Tag,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Send,
  Archive,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContextOptimized';

// =====================================================
// BULK OPERATIONS TYPES
// =====================================================

export interface BulkOperation {
  id: string;
  type: 'status_update' | 'assignment' | 'delete' | 'export' | 'duplicate' | 'schedule' | 'archive' | 'notify';
  label: string;
  icon: React.ReactNode;
  description: string;
  danger?: boolean;
  requiresConfirmation?: boolean;
  requiresInput?: boolean;
  category: 'management' | 'workflow' | 'data' | 'communication';
}

export interface BulkOperationProgress {
  total: number;
  completed: number;
  failed: number;
  current?: string;
  errors: Array<{
    id: string;
    error: string;
  }>;
}

export interface BulkOperationConfig {
  // Status Update
  newStatus?: string;
  
  // Assignment
  assigneeIds?: string[];
  dueDate?: Date;
  
  // Export
  format?: 'pdf' | 'excel' | 'csv' | 'json';
  includeDetails?: boolean;
  includeHistory?: boolean;
  
  // Duplicate
  namingPattern?: string;
  copyResponses?: boolean;
  
  // Schedule
  scheduleDate?: Date;
  notifyAssignees?: boolean;
  
  // Archive
  archiveReason?: string;
  retentionPeriod?: number;
  
  // Notification
  message?: string;
  urgency?: 'low' | 'medium' | 'high';
  channels?: string[];
}

interface BulkOperationsPanelProps {
  selectedItems: string[];
  onClearSelection: () => void;
  onOperationComplete: () => void;
  className?: string;
}

// =====================================================
// BULK OPERATIONS PANEL COMPONENT
// =====================================================

const BulkOperationsPanel: React.FC<BulkOperationsPanelProps> = ({
  selectedItems,
  onClearSelection,
  onOperationComplete,
  className = ''
}) => {
  const { user } = useAuth();
  
  // State Management
  const [selectedOperation, setSelectedOperation] = useState<BulkOperation | null>(null);
  const [operationConfig, setOperationConfig] = useState<BulkOperationConfig>({});
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionProgress, setExecutionProgress] = useState<BulkOperationProgress | null>(null);
  const [showProgressDialog, setShowProgressDialog] = useState(false);

  // Available Operations
  const bulkOperations: BulkOperation[] = [
    // Management Operations
    {
      id: 'status_update',
      type: 'status_update',
      label: 'Update Status',
      icon: <CheckCircle2 className="h-4 w-4" />,
      description: 'Change the status of selected assessments',
      category: 'management',
      requiresInput: true
    },
    {
      id: 'assignment',
      type: 'assignment',
      label: 'Assign Users',
      icon: <Users className="h-4 w-4" />,
      description: 'Assign selected assessments to users',
      category: 'management',
      requiresInput: true
    },
    {
      id: 'schedule',
      type: 'schedule',
      label: 'Schedule',
      icon: <Calendar className="h-4 w-4" />,
      description: 'Schedule execution dates for assessments',
      category: 'management',
      requiresInput: true
    },
    
    // Workflow Operations
    {
      id: 'archive',
      type: 'archive',
      label: 'Archive',
      icon: <Archive className="h-4 w-4" />,
      description: 'Archive completed or outdated assessments',
      category: 'workflow',
      requiresConfirmation: true,
      requiresInput: true
    },
    {
      id: 'duplicate',
      type: 'duplicate',
      label: 'Duplicate',
      icon: <Copy className="h-4 w-4" />,
      description: 'Create copies of selected assessments',
      category: 'workflow',
      requiresInput: true
    },
    
    // Data Operations
    {
      id: 'export',
      type: 'export',
      label: 'Export',
      icon: <Download className="h-4 w-4" />,
      description: 'Export assessment data in various formats',
      category: 'data',
      requiresInput: true
    },
    {
      id: 'delete',
      type: 'delete',
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      description: 'Permanently delete selected assessments',
      category: 'data',
      danger: true,
      requiresConfirmation: true
    },
    
    // Communication Operations
    {
      id: 'notify',
      type: 'notify',
      label: 'Send Notification',
      icon: <Send className="h-4 w-4" />,
      description: 'Send notifications to stakeholders',
      category: 'communication',
      requiresInput: true
    }
  ];

  // Group operations by category
  const operationsByCategory = bulkOperations.reduce((acc, operation) => {
    if (!acc[operation.category]) {
      acc[operation.category] = [];
    }
    acc[operation.category].push(operation);
    return acc;
  }, {} as Record<string, BulkOperation[]>);

  // Handle Operation Click
  const handleOperationClick = useCallback((operation: BulkOperation) => {
    setSelectedOperation(operation);
    setOperationConfig({});
    
    if (operation.requiresInput || operation.requiresConfirmation) {
      setShowConfigDialog(true);
    } else {
      executeOperation(operation, {});
    }
  }, []);

  // Execute Operation
  const executeOperation = useCallback(async (operation: BulkOperation, config: BulkOperationConfig) => {
    setIsExecuting(true);
    setExecutionProgress({
      total: selectedItems.length,
      completed: 0,
      failed: 0,
      errors: []
    });
    setShowProgressDialog(true);
    setShowConfigDialog(false);

    try {
      switch (operation.type) {
        case 'status_update':
          await executeStatusUpdate(config);
          break;
        case 'assignment':
          await executeAssignment(config);
          break;
        case 'delete':
          await executeDelete(config);
          break;
        case 'export':
          await executeExport(config);
          break;
        case 'duplicate':
          await executeDuplicate(config);
          break;
        case 'schedule':
          await executeSchedule(config);
          break;
        case 'archive':
          await executeArchive(config);
          break;
        case 'notify':
          await executeNotification(config);
          break;
        default:
          throw new Error(`Unsupported operation: ${operation.type}`);
      }

      toast.success(`${operation.label} completed successfully`);
      onOperationComplete();
      onClearSelection();
      
    } catch (error) {
      console.error(`Bulk operation failed:`, error);
      toast.error(`${operation.label} failed: ${error}`);
    } finally {
      setIsExecuting(false);
      setTimeout(() => setShowProgressDialog(false), 2000);
    }
  }, [selectedItems, onOperationComplete, onClearSelection]);

  // Individual Operation Implementations
  const executeStatusUpdate = async (config: BulkOperationConfig) => {
    for (let i = 0; i < selectedItems.length; i++) {
      const itemId = selectedItems[i];
      
      setExecutionProgress(prev => prev ? {
        ...prev,
        completed: i,
        current: `Updating assessment ${itemId}...`
      } : null);

      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // In real implementation:
        // await updateAssessmentStatus(itemId, config.newStatus);
        
        setExecutionProgress(prev => prev ? {
          ...prev,
          completed: i + 1
        } : null);
        
      } catch (error) {
        setExecutionProgress(prev => prev ? {
          ...prev,
          failed: prev.failed + 1,
          errors: [...prev.errors, { id: itemId, error: String(error) }]
        } : null);
      }
    }
  };

  const executeAssignment = async (config: BulkOperationConfig) => {
    for (let i = 0; i < selectedItems.length; i++) {
      const itemId = selectedItems[i];
      
      setExecutionProgress(prev => prev ? {
        ...prev,
        completed: i,
        current: `Assigning assessment ${itemId}...`
      } : null);

      try {
        await new Promise(resolve => setTimeout(resolve, 300));
        // Implementation: await assignAssessment(itemId, config.assigneeIds, config.dueDate);
        
        setExecutionProgress(prev => prev ? {
          ...prev,
          completed: i + 1
        } : null);
        
      } catch (error) {
        setExecutionProgress(prev => prev ? {
          ...prev,
          failed: prev.failed + 1,
          errors: [...prev.errors, { id: itemId, error: String(error) }]
        } : null);
      }
    }
  };

  const executeDelete = async (config: BulkOperationConfig) => {
    for (let i = 0; i < selectedItems.length; i++) {
      const itemId = selectedItems[i];
      
      setExecutionProgress(prev => prev ? {
        ...prev,
        completed: i,
        current: `Deleting assessment ${itemId}...`
      } : null);

      try {
        await new Promise(resolve => setTimeout(resolve, 400));
        // Implementation: await deleteAssessment(itemId);
        
        setExecutionProgress(prev => prev ? {
          ...prev,
          completed: i + 1
        } : null);
        
      } catch (error) {
        setExecutionProgress(prev => prev ? {
          ...prev,
          failed: prev.failed + 1,
          errors: [...prev.errors, { id: itemId, error: String(error) }]
        } : null);
      }
    }
  };

  const executeExport = async (config: BulkOperationConfig) => {
    setExecutionProgress(prev => prev ? {
      ...prev,
      current: 'Generating export file...'
    } : null);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate file download
      const blob = new Blob(['Exported assessment data'], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `assessments_export.${config.format || 'csv'}`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      setExecutionProgress(prev => prev ? {
        ...prev,
        completed: selectedItems.length
      } : null);
      
    } catch (error) {
      setExecutionProgress(prev => prev ? {
        ...prev,
        failed: selectedItems.length,
        errors: [{ id: 'export', error: String(error) }]
      } : null);
    }
  };

  const executeDuplicate = async (config: BulkOperationConfig) => {
    for (let i = 0; i < selectedItems.length; i++) {
      const itemId = selectedItems[i];
      
      setExecutionProgress(prev => prev ? {
        ...prev,
        completed: i,
        current: `Duplicating assessment ${itemId}...`
      } : null);

      try {
        await new Promise(resolve => setTimeout(resolve, 600));
        // Implementation: await duplicateAssessment(itemId, config);
        
        setExecutionProgress(prev => prev ? {
          ...prev,
          completed: i + 1
        } : null);
        
      } catch (error) {
        setExecutionProgress(prev => prev ? {
          ...prev,
          failed: prev.failed + 1,
          errors: [...prev.errors, { id: itemId, error: String(error) }]
        } : null);
      }
    }
  };

  const executeSchedule = async (config: BulkOperationConfig) => {
    for (let i = 0; i < selectedItems.length; i++) {
      const itemId = selectedItems[i];
      
      setExecutionProgress(prev => prev ? {
        ...prev,
        completed: i,
        current: `Scheduling assessment ${itemId}...`
      } : null);

      try {
        await new Promise(resolve => setTimeout(resolve, 200));
        // Implementation: await scheduleAssessment(itemId, config.scheduleDate);
        
        setExecutionProgress(prev => prev ? {
          ...prev,
          completed: i + 1
        } : null);
        
      } catch (error) {
        setExecutionProgress(prev => prev ? {
          ...prev,
          failed: prev.failed + 1,
          errors: [...prev.errors, { id: itemId, error: String(error) }]
        } : null);
      }
    }
  };

  const executeArchive = async (config: BulkOperationConfig) => {
    for (let i = 0; i < selectedItems.length; i++) {
      const itemId = selectedItems[i];
      
      setExecutionProgress(prev => prev ? {
        ...prev,
        completed: i,
        current: `Archiving assessment ${itemId}...`
      } : null);

      try {
        await new Promise(resolve => setTimeout(resolve, 350));
        // Implementation: await archiveAssessment(itemId, config);
        
        setExecutionProgress(prev => prev ? {
          ...prev,
          completed: i + 1
        } : null);
        
      } catch (error) {
        setExecutionProgress(prev => prev ? {
          ...prev,
          failed: prev.failed + 1,
          errors: [...prev.errors, { id: itemId, error: String(error) }]
        } : null);
      }
    }
  };

  const executeNotification = async (config: BulkOperationConfig) => {
    setExecutionProgress(prev => prev ? {
      ...prev,
      current: 'Sending notifications...'
    } : null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Implementation: await sendBulkNotifications(selectedItems, config);
      
      setExecutionProgress(prev => prev ? {
        ...prev,
        completed: selectedItems.length
      } : null);
      
    } catch (error) {
      setExecutionProgress(prev => prev ? {
        ...prev,
        failed: selectedItems.length,
        errors: [{ id: 'notification', error: String(error) }]
      } : null);
    }
  };

  // Render Configuration Dialog
  const renderConfigDialog = () => {
    if (!selectedOperation) return null;

    return (
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {selectedOperation.icon}
              <span>{selectedOperation.label}</span>
            </DialogTitle>
            <DialogDescription>
              {selectedOperation.description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedOperation.type === 'status_update' && (
              <div>
                <Label htmlFor="status">New Status</Label>
                <Select value={operationConfig.newStatus || ''} onValueChange={(value) => 
                  setOperationConfig(prev => ({ ...prev, newStatus: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planejado">Planned</SelectItem>
                    <SelectItem value="iniciado">Started</SelectItem>
                    <SelectItem value="em_andamento">In Progress</SelectItem>
                    <SelectItem value="em_revisao">Under Review</SelectItem>
                    <SelectItem value="concluido">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedOperation.type === 'export' && (
              <>
                <div>
                  <Label htmlFor="format">Export Format</Label>
                  <Select value={operationConfig.format || 'csv'} onValueChange={(value) => 
                    setOperationConfig(prev => ({ ...prev, format: value as any }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="includeDetails"
                      checked={operationConfig.includeDetails || false}
                      onCheckedChange={(checked) => 
                        setOperationConfig(prev => ({ ...prev, includeDetails: !!checked }))
                      }
                    />
                    <Label htmlFor="includeDetails">Include detailed responses</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="includeHistory"
                      checked={operationConfig.includeHistory || false}
                      onCheckedChange={(checked) => 
                        setOperationConfig(prev => ({ ...prev, includeHistory: !!checked }))
                      }
                    />
                    <Label htmlFor="includeHistory">Include history</Label>
                  </div>
                </div>
              </>
            )}

            {selectedOperation.type === 'duplicate' && (
              <>
                <div>
                  <Label htmlFor="namingPattern">Naming Pattern</Label>
                  <Input
                    id="namingPattern"
                    placeholder="e.g., [Original Name] - Copy"
                    value={operationConfig.namingPattern || ''}
                    onChange={(e) => 
                      setOperationConfig(prev => ({ ...prev, namingPattern: e.target.value }))
                    }
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="copyResponses"
                    checked={operationConfig.copyResponses || false}
                    onCheckedChange={(checked) => 
                      setOperationConfig(prev => ({ ...prev, copyResponses: !!checked }))
                    }
                  />
                  <Label htmlFor="copyResponses">Copy existing responses</Label>
                </div>
              </>
            )}

            {selectedOperation.type === 'archive' && (
              <div>
                <Label htmlFor="archiveReason">Archive Reason</Label>
                <Input
                  id="archiveReason"
                  placeholder="Reason for archiving..."
                  value={operationConfig.archiveReason || ''}
                  onChange={(e) => 
                    setOperationConfig(prev => ({ ...prev, archiveReason: e.target.value }))
                  }
                />
              </div>
            )}

            {selectedOperation.type === 'notify' && (
              <>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Input
                    id="message"
                    placeholder="Notification message..."
                    value={operationConfig.message || ''}
                    onChange={(e) => 
                      setOperationConfig(prev => ({ ...prev, message: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="urgency">Urgency</Label>
                  <Select value={operationConfig.urgency || 'medium'} onValueChange={(value) => 
                    setOperationConfig(prev => ({ ...prev, urgency: value as any }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {selectedOperation.requiresConfirmation && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This action cannot be undone. Please confirm you want to proceed.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant={selectedOperation.danger ? "destructive" : "default"}
              onClick={() => executeOperation(selectedOperation, operationConfig)}
            >
              {selectedOperation.label}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  // Render Progress Dialog
  const renderProgressDialog = () => {
    if (!executionProgress) return null;

    const progressPercentage = (executionProgress.completed / executionProgress.total) * 100;

    return (
      <Dialog open={showProgressDialog} onOpenChange={() => {}}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Operation in Progress</DialogTitle>
            <DialogDescription>
              {selectedOperation?.label} - {executionProgress.completed} of {executionProgress.total} completed
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Progress value={progressPercentage} className="w-full" />
            
            {executionProgress.current && (
              <p className="text-sm text-gray-600">{executionProgress.current}</p>
            )}

            <div className="flex justify-between text-sm">
              <span className="text-green-600">
                <CheckCircle2 className="h-4 w-4 inline mr-1" />
                {executionProgress.completed} completed
              </span>
              {executionProgress.failed > 0 && (
                <span className="text-red-600">
                  <XCircle className="h-4 w-4 inline mr-1" />
                  {executionProgress.failed} failed
                </span>
              )}
            </div>

            {executionProgress.errors.length > 0 && (
              <div className="max-h-32 overflow-y-auto">
                <Label className="text-sm font-medium text-red-600">Errors:</Label>
                {executionProgress.errors.map((error, index) => (
                  <p key={index} className="text-xs text-red-500">
                    {error.id}: {error.error}
                  </p>
                ))}
              </div>
            )}
          </div>

          {!isExecuting && (
            <DialogFooter>
              <Button onClick={() => setShowProgressDialog(false)}>
                Close
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    );
  };

  if (selectedItems.length === 0) {
    return null;
  }

  return (
    <>
      <Card className={`border-blue-200 bg-blue-50 ${className}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {selectedItems.length} selected
                </Badge>
                <span className="text-sm text-gray-600">
                  Choose an operation to perform on selected assessments
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="text-gray-500 hover:text-gray-700"
            >
              Clear Selection
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-4">
            {Object.entries(operationsByCategory).map(([category, operations]) => (
              <div key={category}>
                <Label className="text-sm font-medium text-gray-700 capitalize mb-2 block">
                  {category} Operations
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
                  {operations.map((operation) => (
                    <Button
                      key={operation.id}
                      variant={operation.danger ? "destructive" : "outline"}
                      size="sm"
                      onClick={() => handleOperationClick(operation)}
                      className="flex items-center space-x-1 text-xs"
                      title={operation.description}
                    >
                      {operation.icon}
                      <span className="hidden sm:inline">{operation.label}</span>
                    </Button>
                  ))}
                </div>
                {category !== 'communication' && <Separator className="mt-3" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {renderConfigDialog()}
      {renderProgressDialog()}
    </>
  );
};

export default BulkOperationsPanel;