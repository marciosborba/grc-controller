import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Bell,
  Clock,
  Users,
  Mail,
  MessageSquare,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Play,
  Pause,
  Settings,
  Plus,
  Edit,
  Trash2,
  Send,
  Eye,
  Filter,
  ArrowRight,
  Zap,
  Target,
  Workflow,
  Timer,
  UserCheck,
  FileText,
  Star,
  ShieldAlert
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContextOptimized';

// =====================================================
// NOTIFICATION & WORKFLOW TYPES
// =====================================================

export interface NotificationRule {
  id: string;
  name: string;
  description: string;
  trigger: NotificationTrigger;
  conditions: NotificationCondition[];
  actions: NotificationAction[];
  isActive: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
  lastTriggered?: Date;
  triggerCount: number;
}

export interface NotificationTrigger {
  type: 'assessment_created' | 'assessment_due' | 'assessment_overdue' | 'assessment_completed' | 
        'status_changed' | 'finding_added' | 'action_plan_due' | 'user_assigned' | 'schedule_reminder';
  parameters?: Record<string, any>;
}

export interface NotificationCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
}

export interface NotificationAction {
  type: 'email' | 'in_app' | 'sms' | 'webhook' | 'auto_assign' | 'auto_escalate';
  parameters: Record<string, any>;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'approval' | 'assignment' | 'notification' | 'automation' | 'condition';
  assignee?: string[];
  dueInDays?: number;
  conditions?: NotificationCondition[];
  actions: NotificationAction[];
  nextSteps: string[];
  isRequired: boolean;
}

export interface AssessmentWorkflow {
  id: string;
  name: string;
  description: string;
  frameworkTypes?: string[];
  assessmentTypes?: string[];
  steps: WorkflowStep[];
  isActive: boolean;
  createdAt: Date;
  usageCount: number;
}

interface NotificationWorkflowEngineProps {
  className?: string;
}

// =====================================================
// NOTIFICATION & WORKFLOW ENGINE COMPONENT
// =====================================================

const NotificationWorkflowEngine: React.FC<NotificationWorkflowEngineProps> = ({ 
  className = '' 
}) => {
  const { user } = useAuth();
  
  // State Management
  const [activeTab, setActiveTab] = useState<'notifications' | 'workflows' | 'history'>('notifications');
  const [notificationRules, setNotificationRules] = useState<NotificationRule[]>([]);
  const [workflows, setWorkflows] = useState<AssessmentWorkflow[]>([]);
  const [showCreateRuleDialog, setShowCreateRuleDialog] = useState(false);
  const [showCreateWorkflowDialog, setShowCreateWorkflowDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<NotificationRule | null>(null);
  const [editingWorkflow, setEditingWorkflow] = useState<AssessmentWorkflow | null>(null);

  // Form States
  const [newRule, setNewRule] = useState<Partial<NotificationRule>>({
    name: '',
    description: '',
    priority: 'medium',
    isActive: true,
    trigger: { type: 'assessment_due' },
    conditions: [],
    actions: []
  });

  const [newWorkflow, setNewWorkflow] = useState<Partial<AssessmentWorkflow>>({
    name: '',
    description: '',
    isActive: true,
    steps: []
  });

  // Sample Data (would be loaded from API)
  useEffect(() => {
    // Load existing notification rules
    setNotificationRules([
      {
        id: '1',
        name: 'Assessment Due Reminder',
        description: 'Notify assignees when assessment is due in 7 days',
        trigger: { type: 'assessment_due', parameters: { daysBefore: 7 } },
        conditions: [
          { field: 'status', operator: 'not_equals', value: 'concluido' }
        ],
        actions: [
          { 
            type: 'email', 
            parameters: { 
              template: 'assessment_due_reminder',
              recipients: ['assignee', 'manager'] 
            } 
          },
          { 
            type: 'in_app', 
            parameters: { 
              message: 'Assessment due in 7 days',
              urgency: 'medium' 
            } 
          }
        ],
        isActive: true,
        priority: 'medium',
        createdAt: new Date('2024-01-15'),
        lastTriggered: new Date('2024-02-20'),
        triggerCount: 45
      },
      {
        id: '2',
        name: 'Critical Finding Alert',
        description: 'Immediate notification for critical findings',
        trigger: { type: 'finding_added' },
        conditions: [
          { field: 'finding_criticality', operator: 'equals', value: 'critical' }
        ],
        actions: [
          { 
            type: 'email', 
            parameters: { 
              template: 'critical_finding_alert',
              recipients: ['ciso', 'manager', 'auditor'] 
            } 
          },
          { 
            type: 'auto_escalate', 
            parameters: { 
              escalateTo: 'ciso',
              escalateInHours: 2 
            } 
          }
        ],
        isActive: true,
        priority: 'critical',
        createdAt: new Date('2024-01-10'),
        lastTriggered: new Date('2024-02-18'),
        triggerCount: 12
      }
    ]);

    // Load existing workflows
    setWorkflows([
      {
        id: '1',
        name: 'Standard Assessment Workflow',
        description: 'Default workflow for all assessments',
        frameworkTypes: ['ISO27001', 'NIST', 'SOX'],
        steps: [
          {
            id: 'step1',
            name: 'Initial Assignment',
            type: 'assignment',
            assignee: ['assessor'],
            dueInDays: 3,
            actions: [
              { 
                type: 'email', 
                parameters: { 
                  template: 'assessment_assigned',
                  recipients: ['assignee'] 
                } 
              }
            ],
            nextSteps: ['step2'],
            isRequired: true
          },
          {
            id: 'step2',
            name: 'Assessment Execution',
            type: 'automation',
            dueInDays: 14,
            actions: [
              { 
                type: 'notification', 
                parameters: { 
                  message: 'Assessment ready for execution',
                  recipients: ['assignee'] 
                } 
              }
            ],
            nextSteps: ['step3'],
            isRequired: true
          },
          {
            id: 'step3',
            name: 'Review & Approval',
            type: 'approval',
            assignee: ['auditor', 'manager'],
            dueInDays: 5,
            actions: [
              { 
                type: 'email', 
                parameters: { 
                  template: 'review_required',
                  recipients: ['auditor', 'manager'] 
                } 
              }
            ],
            nextSteps: [],
            isRequired: true
          }
        ],
        isActive: true,
        createdAt: new Date('2024-01-05'),
        usageCount: 127
      }
    ]);
  }, []);

  // Event Handlers
  const handleCreateRule = useCallback(async () => {
    try {
      const rule: NotificationRule = {
        ...newRule as NotificationRule,
        id: Date.now().toString(),
        createdAt: new Date(),
        triggerCount: 0
      };
      
      setNotificationRules(prev => [...prev, rule]);
      setNewRule({
        name: '',
        description: '',
        priority: 'medium',
        isActive: true,
        trigger: { type: 'assessment_due' },
        conditions: [],
        actions: []
      });
      setShowCreateRuleDialog(false);
      toast.success('Notification rule created successfully');
    } catch (error) {
      toast.error('Failed to create notification rule');
    }
  }, [newRule]);

  const handleCreateWorkflow = useCallback(async () => {
    try {
      const workflow: AssessmentWorkflow = {
        ...newWorkflow as AssessmentWorkflow,
        id: Date.now().toString(),
        createdAt: new Date(),
        usageCount: 0
      };
      
      setWorkflows(prev => [...prev, workflow]);
      setNewWorkflow({
        name: '',
        description: '',
        isActive: true,
        steps: []
      });
      setShowCreateWorkflowDialog(false);
      toast.success('Workflow created successfully');
    } catch (error) {
      toast.error('Failed to create workflow');
    }
  }, [newWorkflow]);

  const toggleRuleStatus = useCallback((ruleId: string) => {
    setNotificationRules(prev => 
      prev.map(rule => 
        rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule
      )
    );
  }, []);

  const toggleWorkflowStatus = useCallback((workflowId: string) => {
    setWorkflows(prev => 
      prev.map(workflow => 
        workflow.id === workflowId ? { ...workflow, isActive: !workflow.isActive } : workflow
      )
    );
  }, []);

  // Render Notification Rules Tab
  const renderNotificationRules = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Notification Rules</h2>
          <p className="text-gray-600">Configure automated notifications and alerts</p>
        </div>
        <Button onClick={() => setShowCreateRuleDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Rule
        </Button>
      </div>

      {/* Rules List */}
      <div className="grid gap-4">
        {notificationRules.map((rule) => (
          <Card key={rule.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <CardTitle className="text-lg">{rule.name}</CardTitle>
                    <Badge variant={
                      rule.priority === 'critical' ? 'destructive' :
                      rule.priority === 'high' ? 'default' :
                      rule.priority === 'medium' ? 'secondary' : 'outline'
                    }>
                      {rule.priority}
                    </Badge>
                    <Switch
                      checked={rule.isActive}
                      onCheckedChange={() => toggleRuleStatus(rule.id)}
                    />
                  </div>
                  <p className="text-sm text-gray-600">{rule.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <Label className="font-medium">Trigger</Label>
                  <p className="text-gray-600 capitalize">
                    {rule.trigger.type.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <Label className="font-medium">Actions</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {rule.actions.map((action, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {action.type}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="font-medium">Usage</Label>
                  <div className="text-gray-600">
                    <p>Triggered {rule.triggerCount} times</p>
                    {rule.lastTriggered && (
                      <p className="text-xs">
                        Last: {rule.lastTriggered.toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // Render Workflows Tab
  const renderWorkflows = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Assessment Workflows</h2>
          <p className="text-gray-600">Define automated workflows for assessment processes</p>
        </div>
        <Button onClick={() => setShowCreateWorkflowDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Workflow
        </Button>
      </div>

      {/* Workflows List */}
      <div className="grid gap-4">
        {workflows.map((workflow) => (
          <Card key={workflow.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <CardTitle className="text-lg">{workflow.name}</CardTitle>
                    <Badge variant={workflow.isActive ? 'default' : 'secondary'}>
                      {workflow.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Switch
                      checked={workflow.isActive}
                      onCheckedChange={() => toggleWorkflowStatus(workflow.id)}
                    />
                  </div>
                  <p className="text-sm text-gray-600">{workflow.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                {/* Workflow Steps */}
                <div>
                  <Label className="font-medium mb-2 block">Workflow Steps</Label>
                  <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                    {workflow.steps.map((step, index) => (
                      <div key={step.id} className="flex items-center space-x-2 min-w-max">
                        <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                          <div className={`p-1 rounded ${
                            step.type === 'approval' ? 'bg-blue-100 text-blue-600' :
                            step.type === 'assignment' ? 'bg-green-100 text-green-600' :
                            step.type === 'notification' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-purple-100 text-purple-600'
                          }`}>
                            {step.type === 'approval' && <UserCheck className="h-3 w-3" />}
                            {step.type === 'assignment' && <Users className="h-3 w-3" />}
                            {step.type === 'notification' && <Bell className="h-3 w-3" />}
                            {step.type === 'automation' && <Zap className="h-3 w-3" />}
                          </div>
                          <div className="text-xs">
                            <p className="font-medium">{step.name}</p>
                            {step.dueInDays && (
                              <p className="text-gray-500">{step.dueInDays} days</p>
                            )}
                          </div>
                        </div>
                        {index < workflow.steps.length - 1 && (
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <Label className="font-medium">Framework Types</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {workflow.frameworkTypes?.map((type, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {type}
                        </Badge>
                      )) || <span className="text-gray-500">All types</span>}
                    </div>
                  </div>
                  <div>
                    <Label className="font-medium">Steps</Label>
                    <p className="text-gray-600">{workflow.steps.length} steps</p>
                  </div>
                  <div>
                    <Label className="font-medium">Usage</Label>
                    <p className="text-gray-600">Used {workflow.usageCount} times</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // Render History Tab
  const renderHistory = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Notification History</h2>
        <p className="text-gray-600">View recent notifications and workflow executions</p>
      </div>

      <Card>
        <CardContent className="p-6 text-center">
          <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Notification History</h3>
          <p className="text-gray-600">This feature will show recent notification deliveries and workflow executions</p>
        </CardContent>
      </Card>
    </div>
  );

  // Render Create Rule Dialog
  const renderCreateRuleDialog = () => (
    <Dialog open={showCreateRuleDialog} onOpenChange={setShowCreateRuleDialog}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Notification Rule</DialogTitle>
          <DialogDescription>
            Configure automated notifications for assessment events
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ruleName">Rule Name</Label>
              <Input
                id="ruleName"
                value={newRule.name || ''}
                onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter rule name"
              />
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select 
                value={newRule.priority || 'medium'} 
                onValueChange={(value) => setNewRule(prev => ({ ...prev, priority: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={newRule.description || ''}
              onChange={(e) => setNewRule(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this rule does"
            />
          </div>

          <div>
            <Label htmlFor="trigger">Trigger Event</Label>
            <Select 
              value={newRule.trigger?.type || 'assessment_due'} 
              onValueChange={(value) => setNewRule(prev => ({ 
                ...prev, 
                trigger: { type: value as any } 
              }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="assessment_created">Assessment Created</SelectItem>
                <SelectItem value="assessment_due">Assessment Due</SelectItem>
                <SelectItem value="assessment_overdue">Assessment Overdue</SelectItem>
                <SelectItem value="assessment_completed">Assessment Completed</SelectItem>
                <SelectItem value="status_changed">Status Changed</SelectItem>
                <SelectItem value="finding_added">Finding Added</SelectItem>
                <SelectItem value="user_assigned">User Assigned</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="isActive"
              checked={newRule.isActive || false}
              onCheckedChange={(checked) => setNewRule(prev => ({ ...prev, isActive: !!checked }))}
            />
            <Label htmlFor="isActive">Enable this rule immediately</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setShowCreateRuleDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateRule}>
            Create Rule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className={`p-6 ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Notification & Workflow Engine</h1>
        <p className="text-gray-600 mt-2">Automate notifications and manage assessment workflows</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bell className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{notificationRules.length}</p>
                <p className="text-sm text-gray-600">Active Rules</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Workflow className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{workflows.length}</p>
                <p className="text-sm text-gray-600">Workflows</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Send className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">57</p>
                <p className="text-sm text-gray-600">Sent Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Activity className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">98%</p>
                <p className="text-sm text-gray-600">Delivery Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <div className="space-y-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'notifications', label: 'Notification Rules', icon: Bell },
              { id: 'workflows', label: 'Workflows', icon: Workflow },
              { id: 'history', label: 'History', icon: Clock }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'notifications' && renderNotificationRules()}
        {activeTab === 'workflows' && renderWorkflows()}
        {activeTab === 'history' && renderHistory()}
      </div>

      {/* Dialogs */}
      {renderCreateRuleDialog()}
    </div>
  );
};

export default NotificationWorkflowEngine;