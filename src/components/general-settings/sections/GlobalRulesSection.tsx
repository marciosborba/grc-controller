// ============================================================================
// SEÇÃO: REGRAS GLOBAIS DA PLATAFORMA
// ============================================================================
// Componente avançado para administração global da plataforma
// Acessível apenas para Platform Admins

import React, { useState, useEffect } from 'react';
import { 
  Crown, 
  Users, 
  Palette, 
  Type, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Eye,
  EyeOff,
  Shield,
  Zap,
  Brush,
  Monitor,
  Smartphone,
  Tablet,
  Download,
  Upload,
  RefreshCw,
  Check,
  AlertTriangle,
  Info,
  Sparkles,
  Layers,
  Code,
  Globe,
  Database,
  Lock,
  Unlock,
  Star,
  Target,
  Sliders,
  Paintbrush,
  Image,
  FileText,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface CustomRole {
  id: string;
  name: string;
  display_name: string;
  description: string;
  permissions: string[];
  color: string;
  icon: string;
  is_system: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ThemeConfig {
  id: string;
  name: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  surface_color: string;
  text_color: string;
  border_color: string;
  success_color: string;
  warning_color: string;
  error_color: string;
  info_color: string;
  font_family: string;
  font_size_base: number;
  border_radius: number;
  shadow_intensity: number;
  is_active: boolean;
  is_dark_mode: boolean;
  created_at: string;
}

interface FontConfig {
  id: string;
  name: string;
  family: string;
  weights: number[];
  url?: string;
  is_system: boolean;
  is_active: boolean;
}

interface PlatformSettings {
  id: string;
  setting_key: string;
  setting_value: any;
  setting_type: 'string' | 'number' | 'boolean' | 'json';
  category: string;
  description: string;
  is_public: boolean;
  updated_at: string;
}

// ============================================================================
// DADOS MOCK PARA DEMONSTRAÇÃO
// ============================================================================

const MOCK_ROLES: CustomRole[] = [
  {
    id: '1',
    name: 'super_admin',
    display_name: 'Super Administrador',
    description: 'Acesso total à plataforma com poderes de configuração global',
    permissions: ['*'],
    color: '#ef4444',
    icon: 'Crown',
    is_system: true,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'compliance_manager',
    display_name: 'Gerente de Compliance',
    description: 'Gerencia políticas de compliance e auditoria',
    permissions: ['compliance.read', 'compliance.write', 'audit.read', 'reports.export'],
    color: '#3b82f6',
    icon: 'Shield',
    is_system: false,
    is_active: true,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: '3',
    name: 'security_analyst',
    display_name: 'Analista de Segurança',
    description: 'Monitora e analisa incidentes de segurança',
    permissions: ['security.read', 'incidents.read', 'incidents.write', 'vulnerabilities.read'],
    color: '#f59e0b',
    icon: 'Zap',
    is_system: false,
    is_active: true,
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z'
  }
];

const MOCK_THEMES: ThemeConfig[] = [
  {
    id: '1',
    name: 'Corporate Blue',
    primary_color: '#3b82f6',
    secondary_color: '#64748b',
    accent_color: '#06b6d4',
    background_color: '#ffffff',
    surface_color: '#f8fafc',
    text_color: '#1e293b',
    border_color: '#e2e8f0',
    success_color: '#10b981',
    warning_color: '#f59e0b',
    error_color: '#ef4444',
    info_color: '#3b82f6',
    font_family: 'Inter',
    font_size_base: 14,
    border_radius: 8,
    shadow_intensity: 0.1,
    is_active: true,
    is_dark_mode: false,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Dark Professional',
    primary_color: '#6366f1',
    secondary_color: '#8b5cf6',
    accent_color: '#06b6d4',
    background_color: '#0f172a',
    surface_color: '#1e293b',
    text_color: '#f1f5f9',
    border_color: '#334155',
    success_color: '#10b981',
    warning_color: '#f59e0b',
    error_color: '#ef4444',
    info_color: '#3b82f6',
    font_family: 'Inter',
    font_size_base: 14,
    border_radius: 12,
    shadow_intensity: 0.25,
    is_active: false,
    is_dark_mode: true,
    created_at: '2024-01-01T00:00:00Z'
  }
];

const MOCK_FONTS: FontConfig[] = [
  {
    id: '1',
    name: 'Inter',
    family: 'Inter, sans-serif',
    weights: [300, 400, 500, 600, 700],
    url: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    is_system: false,
    is_active: true
  },
  {
    id: '2',
    name: 'Roboto',
    family: 'Roboto, sans-serif',
    weights: [300, 400, 500, 700],
    url: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap',
    is_system: false,
    is_active: false
  },
  {
    id: '3',
    name: 'System UI',
    family: 'system-ui, -apple-system, sans-serif',
    weights: [400, 500, 600, 700],
    is_system: true,
    is_active: false
  }
];

const AVAILABLE_PERMISSIONS = [
  { id: 'users.read', name: 'Visualizar Usuários', category: 'Usuários' },
  { id: 'users.write', name: 'Gerenciar Usuários', category: 'Usuários' },
  { id: 'users.delete', name: 'Excluir Usuários', category: 'Usuários' },
  { id: 'tenants.read', name: 'Visualizar Tenants', category: 'Tenants' },
  { id: 'tenants.write', name: 'Gerenciar Tenants', category: 'Tenants' },
  { id: 'compliance.read', name: 'Visualizar Compliance', category: 'Compliance' },
  { id: 'compliance.write', name: 'Gerenciar Compliance', category: 'Compliance' },
  { id: 'security.read', name: 'Visualizar Segurança', category: 'Segurança' },
  { id: 'security.write', name: 'Gerenciar Segurança', category: 'Segurança' },
  { id: 'incidents.read', name: 'Visualizar Incidentes', category: 'Incidentes' },
  { id: 'incidents.write', name: 'Gerenciar Incidentes', category: 'Incidentes' },
  { id: 'reports.read', name: 'Visualizar Relatórios', category: 'Relatórios' },
  { id: 'reports.export', name: 'Exportar Relatórios', category: 'Relatórios' },
  { id: 'audit.read', name: 'Visualizar Auditoria', category: 'Auditoria' },
  { id: 'logs.read', name: 'Visualizar Logs', category: 'Logs' },
  { id: 'settings.read', name: 'Visualizar Configurações', category: 'Configurações' },
  { id: 'settings.write', name: 'Gerenciar Configurações', category: 'Configurações' }
];

const PREDEFINED_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
  '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#64748b'
];

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const GlobalRulesSection: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('roles');
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados para Roles
  const [roles, setRoles] = useState<CustomRole[]>(MOCK_ROLES);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [editingRole, setEditingRole] = useState<CustomRole | null>(null);
  const [roleForm, setRoleForm] = useState({
    name: '',
    display_name: '',
    description: '',
    permissions: [] as string[],
    color: '#3b82f6',
    icon: 'Users'
  });
  
  // Estados para Temas
  const [themes, setThemes] = useState<ThemeConfig[]>(MOCK_THEMES);
  const [activeTheme, setActiveTheme] = useState<ThemeConfig>(MOCK_THEMES[0]);
  const [showThemeDialog, setShowThemeDialog] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  // Estados para Fontes
  const [fonts, setFonts] = useState<FontConfig[]>(MOCK_FONTS);
  const [showFontDialog, setShowFontDialog] = useState(false);
  const [customFontUrl, setCustomFontUrl] = useState('');
  
  // Estados para Configurações da Plataforma
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings[]>([]);
  const [showSettingDialog, setShowSettingDialog] = useState(false);

  // ============================================================================
  // FUNÇÕES PARA GERENCIAMENTO DE ROLES
  // ============================================================================
  
  const handleCreateRole = () => {
    setEditingRole(null);
    setRoleForm({
      name: '',
      display_name: '',
      description: '',
      permissions: [],
      color: '#3b82f6',
      icon: 'Users'
    });
    setShowRoleDialog(true);
  };
  
  const handleEditRole = (role: CustomRole) => {
    setEditingRole(role);
    setRoleForm({
      name: role.name,
      display_name: role.display_name,
      description: role.description,
      permissions: role.permissions,
      color: role.color,
      icon: role.icon
    });
    setShowRoleDialog(true);
  };
  
  const handleSaveRole = async () => {
    setIsLoading(true);
    try {
      if (editingRole) {
        // Atualizar role existente
        setRoles(prev => prev.map(r => 
          r.id === editingRole.id 
            ? { ...r, ...roleForm, updated_at: new Date().toISOString() }
            : r
        ));
        toast.success('Role atualizada com sucesso!');
      } else {
        // Criar nova role
        const newRole: CustomRole = {
          id: Date.now().toString(),
          ...roleForm,
          is_system: false,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setRoles(prev => [...prev, newRole]);
        toast.success('Role criada com sucesso!');
      }
      setShowRoleDialog(false);
    } catch (error) {
      toast.error('Erro ao salvar role');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteRole = async (roleId: string) => {
    if (confirm('Tem certeza que deseja excluir esta role?')) {
      setRoles(prev => prev.filter(r => r.id !== roleId));
      toast.success('Role excluída com sucesso!');
    }
  };
  
  const toggleRolePermission = (permission: string) => {
    setRoleForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  // ============================================================================
  // FUNÇÕES PARA GERENCIAMENTO DE TEMAS
  // ============================================================================
  
  const handleApplyTheme = (theme: ThemeConfig) => {
    setActiveTheme(theme);
    setThemes(prev => prev.map(t => ({ ...t, is_active: t.id === theme.id })));
    
    // Aplicar CSS customizado
    const root = document.documentElement;
    root.style.setProperty('--primary', theme.primary_color);
    root.style.setProperty('--secondary', theme.secondary_color);
    root.style.setProperty('--accent', theme.accent_color);
    root.style.setProperty('--background', theme.background_color);
    root.style.setProperty('--surface', theme.surface_color);
    root.style.setProperty('--text', theme.text_color);
    root.style.setProperty('--border', theme.border_color);
    root.style.setProperty('--font-family', theme.font_family);
    root.style.setProperty('--font-size-base', `${theme.font_size_base}px`);
    root.style.setProperty('--border-radius', `${theme.border_radius}px`);
    
    toast.success(`Tema "${theme.name}" aplicado com sucesso!`);
  };
  
  const handleExportTheme = (theme: ThemeConfig) => {
    const dataStr = JSON.stringify(theme, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `theme-${theme.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Tema exportado com sucesso!');
  };

  // ============================================================================
  // RENDERIZAÇÃO DOS COMPONENTES
  // ============================================================================
  
  if (!user?.isPlatformAdmin) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Acesso Negado</AlertTitle>
        <AlertDescription>
          Esta seção é acessível apenas para Administradores da Plataforma.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Crown className="h-6 w-6 text-yellow-500" />
            Regras Globais da Plataforma
          </h2>
          <p className="text-muted-foreground mt-1">
            Configurações avançadas e administração global do sistema
          </p>
        </div>
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          <Crown className="h-3 w-3 mr-1" />
          Platform Admin
        </Badge>
      </div>

      {/* Alert de Informação */}
      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-4 w-4" />
        <AlertTitle>Centro de Administração Global</AlertTitle>
        <AlertDescription>
          Gerencie roles personalizadas, configure a aparência da plataforma e defina regras globais. 
          Todas as alterações afetam toda a plataforma.
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Roles & Permissões
          </TabsTrigger>
          <TabsTrigger value="themes" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Temas & Cores
          </TabsTrigger>
          <TabsTrigger value="fonts" className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            Fontes
          </TabsTrigger>
          <TabsTrigger value="platform" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        {/* ============================================================================ */}
        {/* TAB: ROLES & PERMISSÕES */}
        {/* ============================================================================ */}
        <TabsContent value="roles" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Gerenciamento de Roles</h3>
              <p className="text-sm text-muted-foreground">
                Crie e gerencie roles personalizadas com permissões específicas
              </p>
            </div>
            <Button onClick={handleCreateRole} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova Role
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((role) => (
              <Card key={role.id} className="relative group hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                        style={{ backgroundColor: role.color }}
                      >
                        <Users className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{role.display_name}</CardTitle>
                        <p className="text-xs text-muted-foreground">{role.name}</p>
                      </div>
                    </div>
                    {role.is_system && (
                      <Badge variant="outline" className="text-xs">
                        Sistema
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{role.description}</p>
                  
                  <div>
                    <p className="text-xs font-medium mb-2">Permissões ({role.permissions.length}):</p>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 3).map((permission) => (
                        <Badge key={permission} variant="secondary" className="text-xs">
                          {permission === '*' ? 'Todas' : permission.split('.')[0]}
                        </Badge>
                      ))}
                      {role.permissions.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{role.permissions.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 pt-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleEditRole(role)}
                      className="flex-1"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                    {!role.is_system && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDeleteRole(role.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ============================================================================ */}
        {/* TAB: TEMAS & CORES */}
        {/* ============================================================================ */}
        <TabsContent value="themes" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Configuração de Temas</h3>
              <p className="text-sm text-muted-foreground">
                Personalize a aparência visual da plataforma
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Importar Tema
              </Button>
              <Button onClick={() => setShowThemeDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Tema
              </Button>
            </div>
          </div>

          {/* Preview do Tema Ativo */}
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Tema Ativo: {activeTheme.name}
              </CardTitle>
              <CardDescription>
                Este é o tema atualmente aplicado em toda a plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Primária</Label>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: activeTheme.primary_color }}
                    />
                    <span className="text-xs font-mono">{activeTheme.primary_color}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Secundária</Label>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: activeTheme.secondary_color }}
                    />
                    <span className="text-xs font-mono">{activeTheme.secondary_color}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Destaque</Label>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: activeTheme.accent_color }}
                    />
                    <span className="text-xs font-mono">{activeTheme.accent_color}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Fundo</Label>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: activeTheme.background_color }}
                    />
                    <span className="text-xs font-mono">{activeTheme.background_color}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleExportTheme(activeTheme)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Modo Escuro:</Label>
                  <Switch checked={activeTheme.is_dark_mode} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Temas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {themes.map((theme) => (
              <Card key={theme.id} className={cn(
                "relative group hover:shadow-lg transition-shadow",
                theme.is_active && "ring-2 ring-primary"
              )}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{theme.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      {theme.is_active && (
                        <Badge className="text-xs">
                          <Check className="h-3 w-3 mr-1" />
                          Ativo
                        </Badge>
                      )}
                      {theme.is_dark_mode && (
                        <Badge variant="outline" className="text-xs">
                          Escuro
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Paleta de Cores */}
                  <div className="flex gap-1">
                    {[
                      theme.primary_color,
                      theme.secondary_color,
                      theme.accent_color,
                      theme.success_color,
                      theme.warning_color,
                      theme.error_color
                    ].map((color, index) => (
                      <div
                        key={index}
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Fonte: {theme.font_family} • Tamanho: {theme.font_size_base}px
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!theme.is_active && (
                      <Button 
                        size="sm" 
                        onClick={() => handleApplyTheme(theme)}
                        className="flex-1"
                      >
                        <Brush className="h-3 w-3 mr-1" />
                        Aplicar
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleExportTheme(theme)}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ============================================================================ */}
        {/* TAB: FONTES */}
        {/* ============================================================================ */}
        <TabsContent value="fonts" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Gerenciamento de Fontes</h3>
              <p className="text-sm text-muted-foreground">
                Configure as fontes utilizadas na interface da plataforma
              </p>
            </div>
            <Button onClick={() => setShowFontDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Fonte
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fonts.map((font) => (
              <Card key={font.id} className={cn(
                "relative group hover:shadow-lg transition-shadow",
                font.is_active && "ring-2 ring-primary"
              )}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base" style={{ fontFamily: font.family }}>
                      {font.name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {font.is_active && (
                        <Badge className="text-xs">
                          <Check className="h-3 w-3 mr-1" />
                          Ativa
                        </Badge>
                      )}
                      {font.is_system && (
                        <Badge variant="outline" className="text-xs">
                          Sistema
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <p className="text-sm" style={{ fontFamily: font.family }}>
                      The quick brown fox jumps over the lazy dog
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Família: {font.family}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {font.weights.map((weight) => (
                        <Badge key={weight} variant="outline" className="text-xs">
                          {weight}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {!font.is_active && (
                    <Button size="sm" className="w-full">
                      <Type className="h-3 w-3 mr-1" />
                      Ativar Fonte
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ============================================================================ */}
        {/* TAB: CONFIGURAÇÕES DA PLATAFORMA */}
        {/* ============================================================================ */}
        <TabsContent value="platform" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Configurações da Plataforma</h3>
              <p className="text-sm text-muted-foreground">
                Configurações avançadas e regras globais do sistema
              </p>
            </div>
            <Button onClick={() => setShowSettingDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Configuração
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Configurações de Segurança */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Segurança
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Autenticação de Dois Fatores Obrigatória</Label>
                    <p className="text-xs text-muted-foreground">Forçar 2FA para todos os usuários</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Sessões Simultâneas</Label>
                    <p className="text-xs text-muted-foreground">Permitir múltiplas sessões por usuário</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="space-y-2">
                  <Label>Tempo de Expiração da Sessão (minutos)</Label>
                  <Input type="number" defaultValue="480" className="w-full" />
                </div>
              </CardContent>
            </Card>

            {/* Configurações de Sistema */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Modo de Manutenção</Label>
                    <p className="text-xs text-muted-foreground">Bloquear acesso para manutenção</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Logs Detalhados</Label>
                    <p className="text-xs text-muted-foreground">Registrar logs detalhados do sistema</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="space-y-2">
                  <Label>Limite de Tentativas de Login</Label>
                  <Input type="number" defaultValue="5" className="w-full" />
                </div>
              </CardContent>
            </Card>

            {/* Configurações de Interface */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Interface
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Modo Escuro por Padrão</Label>
                    <p className="text-xs text-muted-foreground">Aplicar tema escuro para novos usuários</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Animações da Interface</Label>
                    <p className="text-xs text-muted-foreground">Habilitar animações e transições</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="space-y-2">
                  <Label>Idioma Padrão</Label>
                  <Select defaultValue="pt-BR">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="es-ES">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Configurações de Notificações */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Notificações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificações Push</Label>
                    <p className="text-xs text-muted-foreground">Enviar notificações push para usuários</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificações por Email</Label>
                    <p className="text-xs text-muted-foreground">Enviar notificações por email</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="space-y-2">
                  <Label>Frequência de Relatórios</Label>
                  <Select defaultValue="weekly">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diário</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* ============================================================================ */}
      {/* DIALOG: CRIAR/EDITAR ROLE */}
      {/* ============================================================================ */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {editingRole ? 'Editar Role' : 'Criar Nova Role'}
            </DialogTitle>
            <DialogDescription>
              Configure as permissões e propriedades da role
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Informações Básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome da Role</Label>
                <Input
                  value={roleForm.name}
                  onChange={(e) => setRoleForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="ex: security_analyst"
                />
              </div>
              <div className="space-y-2">
                <Label>Nome de Exibição</Label>
                <Input
                  value={roleForm.display_name}
                  onChange={(e) => setRoleForm(prev => ({ ...prev, display_name: e.target.value }))}
                  placeholder="ex: Analista de Segurança"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={roleForm.description}
                onChange={(e) => setRoleForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva as responsabilidades desta role..."
                rows={3}
              />
            </div>

            {/* Cor e Ícone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cor</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={roleForm.color}
                    onChange={(e) => setRoleForm(prev => ({ ...prev, color: e.target.value }))}
                    className="w-16 h-10"
                  />
                  <div className="flex flex-wrap gap-1">
                    {PREDEFINED_COLORS.slice(0, 8).map((color) => (
                      <button
                        key={color}
                        className="w-6 h-6 rounded border-2 border-white shadow-sm"
                        style={{ backgroundColor: color }}
                        onClick={() => setRoleForm(prev => ({ ...prev, color }))}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Ícone</Label>
                <Select value={roleForm.icon} onValueChange={(value) => setRoleForm(prev => ({ ...prev, icon: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Users">👥 Users</SelectItem>
                    <SelectItem value="Shield">🛡️ Shield</SelectItem>
                    <SelectItem value="Zap">⚡ Zap</SelectItem>
                    <SelectItem value="Star">⭐ Star</SelectItem>
                    <SelectItem value="Crown">👑 Crown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Permissões */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Permissões</Label>
              <div className="grid grid-cols-1 gap-4">
                {Object.entries(
                  AVAILABLE_PERMISSIONS.reduce((acc, perm) => {
                    if (!acc[perm.category]) acc[perm.category] = [];
                    acc[perm.category].push(perm);
                    return acc;
                  }, {} as Record<string, typeof AVAILABLE_PERMISSIONS>)
                ).map(([category, permissions]) => (
                  <div key={category} className="space-y-2">
                    <Label className="text-sm font-medium">{category}</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {permissions.map((permission) => (
                        <div key={permission.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={permission.id}
                            checked={roleForm.permissions.includes(permission.id)}
                            onCheckedChange={() => toggleRolePermission(permission.id)}
                          />
                          <Label htmlFor={permission.id} className="text-sm">
                            {permission.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSaveRole} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Salvando...' : 'Salvar Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GlobalRulesSection;