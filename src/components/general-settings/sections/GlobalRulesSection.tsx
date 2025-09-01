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
  BarChart3,
  RefreshCw,
  Building
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
import { manualFixApplyTheme } from '@/utils/fixApplyTheme';
import PDFColorSettings from '../PDFColorSettings';

// Utilitários para conversão de cores
const hslToHex = (hsl: string): string => {
  try {
    const match = hsl.match(/(\d+\.?\d*)\s+(\d+\.?\d*)%\s+(\d+\.?\d*)%/);
    if (!match) return '#000000';
    
    const h = parseFloat(match[1]) / 360;
    const s = parseFloat(match[2]) / 100;
    const l = parseFloat(match[3]) / 100;
    
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    const toHex = (c: number) => {
      const hex = Math.round(c * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  } catch {
    return '#000000';
  }
};

const hexToHsl = (hex: string): string => {
  try {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
        default: h = 0;
      }
      h /= 6;
    }
    
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  } catch {
    return '0 0% 0%';
  }
};

// Componente ColorPicker personalizado
const ColorPicker: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}> = ({ label, value, onChange, placeholder = "0 0% 0%" }) => {
  const [showPicker, setShowPicker] = useState(false);
  
  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const hexValue = event.target.value;
    const hslValue = hexToHsl(hexValue);
    onChange(hslValue);
  };
  
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };
  
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <div className="relative">
          <div 
            className="w-10 h-10 rounded border border-border cursor-pointer hover:border-primary transition-colors"
            style={{ backgroundColor: `hsl(${value})` }}
            onClick={() => setShowPicker(!showPicker)}
            title="Clique para abrir o seletor de cor"
          />
          {showPicker && (
            <div className="absolute z-50 mt-1 p-2 bg-background border border-border rounded-lg shadow-lg">
              <input
                type="color"
                value={hslToHex(value)}
                onChange={handleColorChange}
                className="w-20 h-20 border-0 rounded cursor-pointer"
                title="Seletor de cor"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowPicker(false)}
                className="mt-2 w-full"
              >
                Fechar
              </Button>
            </div>
          )}
        </div>
        <Input
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="flex-1"
          title="Formato HSL: H S% L% (ex: 219 78% 26%)"
        />
      </div>
    </div>
  );
};

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
  display_name: string;
  description?: string;
  is_native_theme: boolean;
  is_system_theme: boolean;
  is_active: boolean;
  is_dark_mode: boolean;
  
  // Cores principais
  primary_color: string;
  primary_foreground: string;
  primary_hover?: string;
  primary_glow?: string;
  
  // Cores secundárias
  secondary_color: string;
  secondary_foreground: string;
  
  // Cores de destaque
  accent_color: string;
  accent_foreground: string;
  
  // Cores de fundo
  background_color: string;
  foreground_color: string;
  card_color: string;
  card_foreground: string;
  
  // Cores de fundo para dark mode
  background_color_dark?: string;
  foreground_color_dark?: string;
  card_color_dark?: string;
  card_foreground_dark?: string;
  
  // Cores de interface
  border_color: string;
  input_color?: string;
  ring_color?: string;
  muted_color?: string;
  muted_foreground?: string;
  popover_color?: string;
  popover_foreground?: string;
  
  // Cores de interface para dark mode
  border_color_dark?: string;
  input_color_dark?: string;
  muted_color_dark?: string;
  muted_foreground_dark?: string;
  popover_color_dark?: string;
  popover_foreground_dark?: string;
  
  // Cores de estado
  success_color: string;
  success_foreground: string;
  success_light?: string;
  warning_color: string;
  warning_foreground: string;
  warning_light?: string;
  danger_color: string;
  danger_foreground: string;
  danger_light?: string;
  destructive_color?: string;
  destructive_foreground?: string;
  
  // Cores de risco
  risk_critical?: string;
  risk_high?: string;
  risk_medium?: string;
  risk_low?: string;
  
  // Cores do sidebar
  sidebar_background?: string;
  sidebar_foreground?: string;
  sidebar_primary?: string;
  sidebar_primary_foreground?: string;
  sidebar_accent?: string;
  sidebar_accent_foreground?: string;
  sidebar_border?: string;
  sidebar_ring?: string;
  
  // Configurações de tipografia e layout
  font_family: string;
  font_size_base: number;
  border_radius: number;
  shadow_intensity: number;
  
  // Metadados
  created_at: string;
}

interface FontConfig {
  id: string;
  name: string;
  family: string;
  display_name: string;
  font_weights: number[]; // Campo do banco de dados
  weights?: number[]; // Campo opcional para compatibilidade
  font_url?: string;
  is_system_font: boolean;
  is_google_font?: boolean;
  is_active: boolean;
  is_preload?: boolean;
  fallback_fonts?: string[];
  font_styles?: string[];
  subsets?: string[];
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

// Dados serão carregados do banco via Supabase
const MOCK_THEMES: ThemeConfig[] = [];

// Dados serão carregados do banco via Supabase
const MOCK_FONTS: FontConfig[] = [];

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
  const [themes, setThemes] = useState<ThemeConfig[]>([]);
  const [activeTheme, setActiveTheme] = useState<ThemeConfig | null>(null);
  const [showThemeDialog, setShowThemeDialog] = useState(false);
  const [editingTheme, setEditingTheme] = useState<ThemeConfig | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [loadingThemes, setLoadingThemes] = useState(true);
  
  // Estados para gestão de tenants
  const [selectedTenant, setSelectedTenant] = useState<string>('global');
  const [availableTenants, setAvailableTenants] = useState<{ id: string; name: string }[]>([]);
  const [loadingTenants, setLoadingTenants] = useState(true);
  const [themeForm, setThemeForm] = useState({
    name: '',
    display_name: '',
    description: '',
    is_dark_mode: false,
    // Cores principais
    primary_color: '220 100% 50%',
    primary_foreground: '210 40% 98%',
    primary_hover: '220 100% 45%',
    primary_glow: '220 100% 75%',
    secondary_color: '272 64% 47%',
    secondary_foreground: '210 40% 98%',
    accent_color: '335 56% 42%',
    accent_foreground: '210 40% 98%',
    // Backgrounds e superfícies
    background_color: '0 0% 100%',
    foreground_color: '225 71% 12%',
    card_color: '0 0% 100%',
    card_foreground: '225 71% 12%',
    // Backgrounds dark mode
    background_color_dark: '222 18% 4%',
    foreground_color_dark: '0 0% 100%',
    card_color_dark: '215 8% 12%',
    card_foreground_dark: '0 0% 100%',
    border_color: '214 32% 91%',
    border_color_dark: '215 10% 22%',
    input_color: '214 32% 91%',
    input_color_dark: '215 10% 22%',
    ring_color: '219 78% 26%',
    muted_color: '210 20% 96%',
    muted_foreground: '215 16% 47%',
    // Cores muted dark mode
    muted_color_dark: '215 12% 16%',
    muted_foreground_dark: '215 20% 65%',
    popover_color: '0 0% 100%',
    popover_foreground: '225 71% 12%',
    // Popover dark mode
    popover_color_dark: '222 13% 11%',
    popover_foreground_dark: '0 0% 100%',
    // Cores de estado
    success_color: '142 76% 36%',
    success_foreground: '210 40% 98%',
    success_light: '142 76% 94%',
    warning_color: '38 92% 50%',
    warning_foreground: '225 71% 12%',
    warning_light: '38 92% 94%',
    danger_color: '0 84% 60%',
    danger_foreground: '210 40% 98%',
    danger_light: '0 84% 94%',
    destructive_color: '0 84% 60%',
    destructive_foreground: '210 40% 98%',
    // Cores de risco GRC
    risk_critical: '0 84% 60%',
    risk_high: '24 95% 53%',
    risk_medium: '38 92% 50%',
    risk_low: '142 76% 36%',
    // Cores do sidebar
    sidebar_background: '0 0% 98%',
    sidebar_foreground: '240 5.3% 26.1%',
    sidebar_primary: '240 5.9% 10%',
    sidebar_primary_foreground: '0 0% 98%',
    sidebar_accent: '240 4.8% 95.9%',
    sidebar_accent_foreground: '240 5.9% 10%',
    sidebar_border: '220 13% 91%',
    sidebar_ring: '217.2 91.2% 59.8%',
    // Tipografia e layout
    font_family: 'Inter',
    font_size_base: 14,
    border_radius: 8,
    shadow_intensity: 0.1,
    // Metadados
    version: '1.0'
  });
  
  // Estados para Fontes
  const [fonts, setFonts] = useState<FontConfig[]>([]);
  const [showFontDialog, setShowFontDialog] = useState(false);
  const [customFontUrl, setCustomFontUrl] = useState('');
  const [loadingFonts, setLoadingFonts] = useState(true);
  
  // Estados para Configurações da Plataforma
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings[]>([]);
  const [showSettingDialog, setShowSettingDialog] = useState(false);

  // ============================================================================
  // EFEITOS PARA CARREGAR DADOS DO BANCO
  // ============================================================================
  
  useEffect(() => {
    // Só carregar temas quando o componente estiver realmente visível
    // Adicionar delay para evitar interferir com carregamento inicial
    const timer = setTimeout(() => {
      loadThemes();
      loadFonts();
      loadTenants(); // Carregar tenants para configuração por tenant
    }, 1000); // 1 segundo de delay para não interferir com carregamento inicial

    return () => clearTimeout(timer);
  }, []);

  // Efeito para aplicar tema na inicialização - REATIVADO com preservação do dark mode
  useEffect(() => {
    if (activeTheme && !activeTheme.is_native_theme) {
      console.log('Tema customizado detectado:', activeTheme.name);
      console.log('🎨 Aplicando tema automaticamente com preservação do dark mode');
      applyThemeColors(activeTheme);
    } else if (activeTheme?.is_native_theme) {
      console.log('✅ Tema UI Nativa ativo - preservando cores CSS originais e dark mode nativo');
      // Para tema nativo, aplicar cores mas preservar dark mode
      applyThemeColors(activeTheme);
    }
  }, [activeTheme]);

  // Popular formulário quando um tema é selecionado para edição
  useEffect(() => {
    if (editingTheme) {
      console.log('🎨 Populando formulário com dados do tema:', editingTheme.name);
      setThemeForm({
        name: editingTheme.name || '',
        display_name: editingTheme.display_name || '',
        description: editingTheme.description || '',
        is_dark_mode: editingTheme.is_dark_mode || false,
        // Cores principais
        primary_color: editingTheme.primary_color || '220 100% 50%',
        primary_foreground: editingTheme.primary_foreground || '210 40% 98%',
        primary_hover: editingTheme.primary_hover || '220 100% 45%',
        primary_glow: editingTheme.primary_glow || '220 100% 75%',
        secondary_color: editingTheme.secondary_color || '272 64% 47%',
        secondary_foreground: editingTheme.secondary_foreground || '210 40% 98%',
        accent_color: editingTheme.accent_color || '335 56% 42%',
        accent_foreground: editingTheme.accent_foreground || '210 40% 98%',
        // Backgrounds e superfícies
        background_color: editingTheme.background_color || '0 0% 100%',
        foreground_color: editingTheme.foreground_color || '225 71% 12%',
        card_color: editingTheme.card_color || '0 0% 100%',
        card_foreground: editingTheme.card_foreground || '225 71% 12%',
        border_color: editingTheme.border_color || '214 32% 91%',
        border_color_dark: editingTheme.border_color_dark || '215 10% 22%',
        input_color: editingTheme.input_color || '214 32% 91%',
        input_color_dark: editingTheme.input_color_dark || '215 10% 22%',
        ring_color: editingTheme.ring_color || '219 78% 26%',
        muted_color: editingTheme.muted_color || '210 20% 96%',
        muted_foreground: editingTheme.muted_foreground || '215 16% 47%',
        popover_color: editingTheme.popover_color || '0 0% 100%',
        popover_foreground: editingTheme.popover_foreground || '225 71% 12%',
        // Cores de estado
        success_color: editingTheme.success_color || '142 76% 36%',
        success_foreground: editingTheme.success_foreground || '210 40% 98%',
        success_light: editingTheme.success_light || '142 76% 94%',
        warning_color: editingTheme.warning_color || '38 92% 50%',
        warning_foreground: editingTheme.warning_foreground || '225 71% 12%',
        warning_light: editingTheme.warning_light || '38 92% 94%',
        danger_color: editingTheme.danger_color || '0 84% 60%',
        danger_foreground: editingTheme.danger_foreground || '210 40% 98%',
        danger_light: editingTheme.danger_light || '0 84% 94%',
        destructive_color: editingTheme.destructive_color || '0 84% 60%',
        destructive_foreground: editingTheme.destructive_foreground || '210 40% 98%',
        // Cores de risco GRC
        risk_critical: editingTheme.risk_critical || '0 84% 60%',
        risk_high: editingTheme.risk_high || '24 95% 53%',
        risk_medium: editingTheme.risk_medium || '38 92% 50%',
        risk_low: editingTheme.risk_low || '142 76% 36%',
        // Cores do sidebar
        sidebar_background: editingTheme.sidebar_background || '0 0% 98%',
        sidebar_foreground: editingTheme.sidebar_foreground || '240 5.3% 26.1%',
        sidebar_primary: editingTheme.sidebar_primary || '240 5.9% 10%',
        sidebar_primary_foreground: editingTheme.sidebar_primary_foreground || '0 0% 98%',
        sidebar_accent: editingTheme.sidebar_accent || '240 4.8% 95.9%',
        sidebar_accent_foreground: editingTheme.sidebar_accent_foreground || '240 5.9% 10%',
        sidebar_border: editingTheme.sidebar_border || '220 13% 91%',
        sidebar_ring: editingTheme.sidebar_ring || '217.2 91.2% 59.8%',
        // Tipografia e layout
        font_family: editingTheme.font_family || 'Inter',
        font_size_base: editingTheme.font_size_base || 14,
        border_radius: editingTheme.border_radius || 8,
        shadow_intensity: editingTheme.shadow_intensity || 0.1,
        // Metadados
        version: editingTheme.version || '1.0'
      });
    }
  }, [editingTheme]);

  const loadTenants = async () => {
    try {
      setLoadingTenants(true);
      console.log('🏢 Carregando tenants disponíveis...');
      
      const { data: tenantsData, error } = await supabase
        .from('tenants')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      
      setAvailableTenants(tenantsData || []);
      console.log(`✅ ${tenantsData?.length || 0} tenants carregados`);
    } catch (error) {
      console.error('Erro ao carregar tenants:', error);
      toast({
        title: 'Erro ao carregar tenants',
        description: 'Não foi possível carregar a lista de tenants.',
        variant: 'destructive'
      });
    } finally {
      setLoadingTenants(false);
    }
  };

  const loadThemes = async () => {
    try {
      setLoadingThemes(true);
      console.log('🔄 Carregando temas...');
      
      // Carregar todos os temas
      const { data: themesData, error } = await supabase
        .from('global_ui_themes')
        .select('*')
        .order('is_native_theme', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;

      setThemes(themesData || []);
      console.log('📊 Temas carregados:', themesData?.length || 0);
      
      // Buscar tema ativo usando múltiplas estratégias
      let activeTheme = null;
      
      // 1. Verificar global_ui_settings primeiro (mais confiável)
      try {
        const { data: settingsData, error: settingsError } = await supabase
          .from('global_ui_settings')
          .select('active_theme_id, global_ui_themes(*)')
          .is('tenant_id', null)
          .single();
        
        if (!settingsError && settingsData?.global_ui_themes) {
          activeTheme = settingsData.global_ui_themes;
          console.log('🎨 Tema ativo encontrado via global_ui_settings:', activeTheme.display_name || activeTheme.name);
        }
      } catch (settingsError) {
        console.log('🔍 Não foi possível carregar via global_ui_settings:', settingsError);
      }
      
      // 2. Se não encontrou, verificar is_active = true
      if (!activeTheme) {
        activeTheme = themesData?.find(t => t.is_active);
        if (activeTheme) {
          console.log('🎨 Tema ativo encontrado via is_active:', activeTheme.display_name || activeTheme.name);
        }
      }
      
      // 3. Se ainda não encontrou, usar tema nativo
      if (!activeTheme) {
        activeTheme = themesData?.find(t => t.is_native_theme);
        if (activeTheme) {
          console.log('🎨 Usando tema nativo como fallback:', activeTheme.display_name || activeTheme.name);
        }
      }
      
      if (activeTheme) {
        setActiveTheme(activeTheme);
        console.log('📊 Detalhes do tema ativo:', {
          id: activeTheme.id,
          name: activeTheme.name,
          display_name: activeTheme.display_name,
          is_active: activeTheme.is_active,
          is_native_theme: activeTheme.is_native_theme,
          primary_color: activeTheme.primary_color
        });
        
        // Verificar se deve aplicar automaticamente
        const lastThemeChange = localStorage.getItem('lastThemeChangeTime');
        const timeSinceLastChange = lastThemeChange ? Date.now() - parseInt(lastThemeChange) : Infinity;
        
        // Só aplicar automaticamente se:
        // 1. Não houve mudança recente (> 5 segundos) OU
        // 2. É o primeiro carregamento da página
        if (timeSinceLastChange > 5000 || !lastThemeChange) {
          console.log('🎨 Aplicando tema automaticamente...');
          setTimeout(() => {
            applyThemeColors(activeTheme);
          }, 100);
        } else {
          console.log('⏱️ Aguardando para evitar conflito (mudança recente)');
        }
      } else {
        console.log('⚠️ Nenhum tema encontrado!');
        console.log('📊 Temas disponíveis:', themesData?.map(t => ({
          id: t.id,
          name: t.name,
          is_active: t.is_active,
          is_native_theme: t.is_native_theme
        })));
      }
    } catch (error) {
      console.error('Erro ao carregar temas:', error);
      toast.error('Erro ao carregar temas');
    } finally {
      setLoadingThemes(false);
    }
  };

  const loadFonts = async () => {
    try {
      setLoadingFonts(true);
      const { data: fontsData, error } = await supabase
        .from('custom_fonts')
        .select('*')
        .order('is_active', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Processar dados das fontes para garantir compatibilidade
      const processedFonts = (fontsData || []).map(font => {
        let fontWeights = [400]; // peso padrão
        
        try {
          if (Array.isArray(font.font_weights)) {
            fontWeights = font.font_weights;
          } else if (typeof font.font_weights === 'string') {
            fontWeights = JSON.parse(font.font_weights);
          } else if (font.font_weights) {
            fontWeights = Array.isArray(font.font_weights) ? font.font_weights : [400];
          }
        } catch (error) {
          console.warn('Erro ao processar font_weights para fonte', font.name, error);
          fontWeights = [400];
        }

        return {
          ...font,
          font_weights: fontWeights,
          weights: fontWeights // compatibilidade
        };
      });

      setFonts(processedFonts);
    } catch (error) {
      console.error('Erro ao carregar fontes:', error);
      toast.error('Erro ao carregar fontes');
    } finally {
      setLoadingFonts(false);
    }
  };

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
  
  const applyThemeColors = (theme: ThemeConfig) => {
    const root = document.documentElement;
    
    // Detectar se dark mode está ativo
    const isDarkMode = root.classList.contains('dark');
    
    console.log('🎨 === APLICANDO CORES DO TEMA ===');
    console.log('💡 Dark mode ativo:', isDarkMode);
    console.log('🏷️ Tema:', theme.display_name || theme.name);
    console.log('🎭 É tema nativo:', theme.is_native_theme);
    console.log('🌙 Tema tem suporte dark mode:', theme.is_dark_mode);
    
    // Aplicar cores com !important para garantir que sejam aplicadas
    const applyColorWithImportant = (property: string, value: string) => {
      root.style.setProperty(property, value, 'important');
    };
    
    // Para tema nativo, sempre aplicar respeitando o modo atual
    if (theme.is_native_theme) {
      console.log('🏠 Aplicando tema nativo - respeitando modo atual');
      
      // Aplicar cores base sem modificar dark/light mode
      applyColorWithImportant('--primary', theme.primary_color);
      applyColorWithImportant('--primary-foreground', theme.primary_foreground);
      applyColorWithImportant('--primary-hover', theme.primary_hover || theme.primary_color);
      applyColorWithImportant('--primary-glow', theme.primary_glow || theme.primary_color);
      
      applyColorWithImportant('--secondary', theme.secondary_color);
      applyColorWithImportant('--secondary-foreground', theme.secondary_foreground);
      
      applyColorWithImportant('--accent', theme.accent_color);
      applyColorWithImportant('--accent-foreground', theme.accent_foreground);
      
      // Para tema nativo, aplicar cores baseadas no modo atual (dark/light)
      if (isDarkMode) {
        // Usar cores dark mode se disponíveis
        if (theme.background_color_dark) applyColorWithImportant('--background', theme.background_color_dark);
        if (theme.foreground_color_dark) applyColorWithImportant('--foreground', theme.foreground_color_dark);
        if (theme.card_color_dark) applyColorWithImportant('--card', theme.card_color_dark);
        if (theme.card_foreground_dark) applyColorWithImportant('--card-foreground', theme.card_foreground_dark);
        if (theme.border_color_dark) applyColorWithImportant('--border', theme.border_color_dark);
        if (theme.input_color_dark) applyColorWithImportant('--input', theme.input_color_dark);
        if (theme.muted_color_dark) applyColorWithImportant('--muted', theme.muted_color_dark);
        if (theme.muted_foreground_dark) applyColorWithImportant('--muted-foreground', theme.muted_foreground_dark);
        if (theme.popover_color_dark) applyColorWithImportant('--popover', theme.popover_color_dark);
        if (theme.popover_foreground_dark) applyColorWithImportant('--popover-foreground', theme.popover_foreground_dark);
      } else {
        // Usar cores light mode
        applyColorWithImportant('--background', theme.background_color);
        applyColorWithImportant('--foreground', theme.foreground_color);
        applyColorWithImportant('--card', theme.card_color);
        applyColorWithImportant('--card-foreground', theme.card_foreground);
        applyColorWithImportant('--border', theme.border_color);
        if (theme.input_color) applyColorWithImportant('--input', theme.input_color);
        if (theme.muted_color) applyColorWithImportant('--muted', theme.muted_color);
        if (theme.muted_foreground) applyColorWithImportant('--muted-foreground', theme.muted_foreground);
        if (theme.popover_color) applyColorWithImportant('--popover', theme.popover_color);
        if (theme.popover_foreground) applyColorWithImportant('--popover-foreground', theme.popover_foreground);
      }
      
      // Aplicar ring para tema nativo
      applyColorWithImportant('--ring', theme.ring_color || theme.primary_color);
      
      // IMPORTANTE: Aplicar configurações de layout também para temas nativos
      root.style.setProperty('--radius', `${(theme.border_radius / 16)}rem`); // Converter px para rem
      console.log('🔧 Aplicando border_radius para tema nativo:', theme.border_radius, 'px =', `${(theme.border_radius / 16)}rem`);
      
      console.log('✅ Tema nativo aplicado - cores e layout preservados');
      
      // Notify ThemeContext about the theme change
      window.dispatchEvent(new CustomEvent('globalThemeChanged', {
        detail: { theme: theme.name, isNative: true }
      }));
      
      return;
    }
    
    // Para temas customizados, aplicar todas as cores
    console.log('🎭 Aplicando tema customizado com cores específicas');
    console.log('🎨 Cores do tema:', {
      primary: theme.primary_color,
      secondary: theme.secondary_color,
      accent: theme.accent_color,
      background: theme.background_color,
      border: theme.border_color
    });
    
    // Cores principais
    applyColorWithImportant('--primary', theme.primary_color);
    applyColorWithImportant('--primary-foreground', theme.primary_foreground);
    applyColorWithImportant('--primary-hover', theme.primary_hover || theme.primary_color);
    applyColorWithImportant('--primary-glow', theme.primary_glow || theme.primary_color);
    
    // Cores secundárias
    applyColorWithImportant('--secondary', theme.secondary_color);
    applyColorWithImportant('--secondary-foreground', theme.secondary_foreground);
    
    // Cores de destaque
    applyColorWithImportant('--accent', theme.accent_color);
    applyColorWithImportant('--accent-foreground', theme.accent_foreground);
    
    // Cores de fundo (importantes para temas customizados)
    root.style.setProperty('--background', theme.background_color);
    root.style.setProperty('--foreground', theme.foreground_color);
    root.style.setProperty('--card', theme.card_color);
    root.style.setProperty('--card-foreground', theme.card_foreground);
    
    // Cores de interface
    root.style.setProperty('--border', theme.border_color);
    root.style.setProperty('--input', theme.input_color || theme.border_color);
    root.style.setProperty('--ring', theme.ring_color || theme.primary_color);
    root.style.setProperty('--muted', theme.muted_color || theme.secondary_color);
    root.style.setProperty('--muted-foreground', theme.muted_foreground || theme.secondary_foreground);
    root.style.setProperty('--popover', theme.popover_color || theme.card_color);
    root.style.setProperty('--popover-foreground', theme.popover_foreground || theme.card_foreground);
    
    // Cores de estado
    root.style.setProperty('--success', theme.success_color);
    root.style.setProperty('--success-foreground', theme.success_foreground);
    root.style.setProperty('--success-light', theme.success_light || theme.success_color);
    root.style.setProperty('--warning', theme.warning_color);
    root.style.setProperty('--warning-foreground', theme.warning_foreground);
    root.style.setProperty('--warning-light', theme.warning_light || theme.warning_color);
    root.style.setProperty('--danger', theme.danger_color);
    root.style.setProperty('--danger-foreground', theme.danger_foreground);
    root.style.setProperty('--danger-light', theme.danger_light || theme.danger_color);
    root.style.setProperty('--destructive', theme.destructive_color || theme.danger_color);
    root.style.setProperty('--destructive-foreground', theme.destructive_foreground || theme.danger_foreground);
    
    // Cores de risco
    root.style.setProperty('--risk-critical', theme.risk_critical || theme.danger_color);
    root.style.setProperty('--risk-high', theme.risk_high || '24 95% 53%');
    root.style.setProperty('--risk-medium', theme.risk_medium || theme.warning_color);
    root.style.setProperty('--risk-low', theme.risk_low || theme.success_color);
    
    // Cores do sidebar
    root.style.setProperty('--sidebar-background', theme.sidebar_background || theme.background_color);
    root.style.setProperty('--sidebar-foreground', theme.sidebar_foreground || theme.foreground_color);
    root.style.setProperty('--sidebar-primary', theme.sidebar_primary || theme.primary_color);
    root.style.setProperty('--sidebar-primary-foreground', theme.sidebar_primary_foreground || theme.primary_foreground);
    root.style.setProperty('--sidebar-accent', theme.sidebar_accent || theme.secondary_color);
    root.style.setProperty('--sidebar-accent-foreground', theme.sidebar_accent_foreground || theme.secondary_foreground);
    root.style.setProperty('--sidebar-border', theme.sidebar_border || theme.border_color);
    root.style.setProperty('--sidebar-ring', theme.sidebar_ring || theme.ring_color || theme.primary_color);
    
    // Configurações de layout
    root.style.setProperty('--radius', `${(theme.border_radius / 16)}rem`); // Converter px para rem
    
    // Verificar se as cores foram aplicadas e preservar dark mode
    setTimeout(() => {
      const newPrimary = getComputedStyle(root).getPropertyValue('--primary').trim();
      console.log('Cor primária após aplicação:', newPrimary);
      console.log('Aplicação bem-sucedida:', newPrimary === theme.primary_color);
      
      // Verificar se dark mode ainda funciona
      if (isDarkMode !== root.classList.contains('dark')) {
        console.warn('⚠️  Dark mode foi alterado durante aplicação do tema!');
        // Restaurar dark mode se necessário
        if (isDarkMode) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
      
      console.log('✅ Tema aplicado com preservação do dark mode:', theme.display_name || theme.name);
      
      // Notify ThemeContext about the theme change
      window.dispatchEvent(new CustomEvent('globalThemeChanged', {
        detail: { theme: theme.name, isNative: theme.is_native_theme }
      }));
    }, 100);
  };


  
  const handleCreateTheme = () => {
    setEditingTheme(null);
    setThemeForm({
      name: '',
      display_name: '',
      description: '',
      is_dark_mode: false,
      primary_color: '219 78% 26%',
      primary_foreground: '210 40% 98%',
      secondary_color: '210 20% 96%',
      secondary_foreground: '225 71% 12%',
      accent_color: '142 76% 36%',
      accent_foreground: '210 40% 98%',
      background_color: '0 0% 100%',
      foreground_color: '225 71% 12%',
      card_color: '0 0% 100%',
      card_foreground: '225 71% 12%',
      // Dark mode backgrounds
      background_color_dark: '222 18% 4%',
      foreground_color_dark: '0 0% 100%',
      card_color_dark: '215 8% 12%',
      card_foreground_dark: '0 0% 100%',
      border_color: '214 32% 91%',
      success_color: '142 76% 36%',
      success_foreground: '210 40% 98%',
      warning_color: '38 92% 50%',
      warning_foreground: '225 71% 12%',
      danger_color: '0 84% 60%',
      danger_foreground: '210 40% 98%',
      font_family: 'Inter',
      font_size_base: 14,
      border_radius: 8,
      shadow_intensity: 0.1
    });
    setShowThemeDialog(true);
  };

  const handleEditTheme = (theme: ThemeConfig) => {
    setEditingTheme(theme);
    setThemeForm({
      name: theme.name,
      display_name: theme.display_name,
      description: theme.description || '',
      is_dark_mode: theme.is_dark_mode,
      primary_color: theme.primary_color,
      primary_foreground: theme.primary_foreground,
      secondary_color: theme.secondary_color,
      secondary_foreground: theme.secondary_foreground,
      accent_color: theme.accent_color,
      accent_foreground: theme.accent_foreground,
      background_color: theme.background_color,
      foreground_color: theme.foreground_color,
      card_color: theme.card_color,
      card_foreground: theme.card_foreground,
      // Dark mode colors
      background_color_dark: theme.background_color_dark || '222 18% 4%',
      foreground_color_dark: theme.foreground_color_dark || '0 0% 100%',
      card_color_dark: theme.card_color_dark || '215 8% 12%',
      card_foreground_dark: theme.card_foreground_dark || '0 0% 100%',
      border_color: theme.border_color,
      success_color: theme.success_color,
      success_foreground: theme.success_foreground,
      warning_color: theme.warning_color,
      warning_foreground: theme.warning_foreground,
      danger_color: theme.danger_color,
      danger_foreground: theme.danger_foreground,
      font_family: theme.font_family,
      font_size_base: theme.font_size_base,
      border_radius: theme.border_radius,
      shadow_intensity: theme.shadow_intensity
    });
    setShowThemeDialog(true);
  };

  const handleSaveTheme = async () => {
    try {
      setIsLoading(true);
      console.log('🎨 Iniciando salvamento de tema...');
      console.log('📋 Dados do formulário:', {
        name: themeForm.name,
        display_name: themeForm.display_name,
        editingTheme: editingTheme?.id
      });
      
      // Validações básicas
      if (!themeForm.name.trim()) {
        console.error('❌ Validação falhou: Nome do tema é obrigatório');
        toast.error('Nome do tema é obrigatório');
        return;
      }
      
      if (!themeForm.display_name.trim()) {
        console.error('❌ Validação falhou: Nome de exibição é obrigatório');
        toast.error('Nome de exibição é obrigatório');
        return;
      }
      
      // Validar formato HSL das cores principais
      const hslRegex = /^\d+\.?\d*\s+\d+\.?\d*%\s+\d+\.?\d*%$/;
      const coreColors = [
        { field: 'primary_color', label: 'Cor Primária' },
        { field: 'background_color', label: 'Background' },
        { field: 'foreground_color', label: 'Texto Principal' }
      ];
      
      for (const color of coreColors) {
        const colorValue = themeForm[color.field] as string;
        if (!colorValue || !hslRegex.test(colorValue)) {
          console.error(`❌ Validação falhou: Formato inválido para ${color.label}:`, colorValue);
          toast.error(`Formato inválido para ${color.label}. Use: H S% L% (ex: 219 78% 26%)`);
          return;
        }
      }
      
      console.log('✅ Validações passaram');
      
      // Preparar dados para salvamento (sem campos inexistentes)
      const themeData = {
        name: themeForm.name.trim(),
        display_name: themeForm.display_name.trim(),
        description: themeForm.description.trim(),
        is_dark_mode: themeForm.is_dark_mode,
        
        // Cores principais
        primary_color: themeForm.primary_color,
        primary_foreground: themeForm.primary_foreground,
        primary_hover: themeForm.primary_hover,
        primary_glow: themeForm.primary_glow,
        secondary_color: themeForm.secondary_color,
        secondary_foreground: themeForm.secondary_foreground,
        accent_color: themeForm.accent_color,
        accent_foreground: themeForm.accent_foreground,
        
        // Backgrounds e superfícies
        background_color: themeForm.background_color,
        foreground_color: themeForm.foreground_color,
        card_color: themeForm.card_color,
        card_foreground: themeForm.card_foreground,
        // Dark mode backgrounds
        background_color_dark: themeForm.background_color_dark,
        foreground_color_dark: themeForm.foreground_color_dark,
        card_color_dark: themeForm.card_color_dark,
        card_foreground_dark: themeForm.card_foreground_dark,
        border_color: themeForm.border_color,
        input_color: themeForm.input_color,
        ring_color: themeForm.ring_color,
        muted_color: themeForm.muted_color,
        muted_foreground: themeForm.muted_foreground,
        // Dark mode muted colors
        muted_color_dark: themeForm.muted_color_dark,
        muted_foreground_dark: themeForm.muted_foreground_dark,
        popover_color: themeForm.popover_color,
        popover_foreground: themeForm.popover_foreground,
        // Dark mode popover colors
        popover_color_dark: themeForm.popover_color_dark,
        popover_foreground_dark: themeForm.popover_foreground_dark,
        
        // Cores de estado
        success_color: themeForm.success_color,
        success_foreground: themeForm.success_foreground,
        success_light: themeForm.success_light,
        warning_color: themeForm.warning_color,
        warning_foreground: themeForm.warning_foreground,
        warning_light: themeForm.warning_light,
        danger_color: themeForm.danger_color,
        danger_foreground: themeForm.danger_foreground,
        danger_light: themeForm.danger_light,
        destructive_color: themeForm.destructive_color,
        destructive_foreground: themeForm.destructive_foreground,
        
        // Cores de risco GRC
        risk_critical: themeForm.risk_critical,
        risk_high: themeForm.risk_high,
        risk_medium: themeForm.risk_medium,
        risk_low: themeForm.risk_low,
        
        // Cores do sidebar
        sidebar_background: themeForm.sidebar_background,
        sidebar_foreground: themeForm.sidebar_foreground,
        sidebar_primary: themeForm.sidebar_primary,
        sidebar_primary_foreground: themeForm.sidebar_primary_foreground,
        sidebar_accent: themeForm.sidebar_accent,
        sidebar_accent_foreground: themeForm.sidebar_accent_foreground,
        sidebar_border: themeForm.sidebar_border,
        sidebar_ring: themeForm.sidebar_ring,
        
        // Tipografia e layout
        font_family: themeForm.font_family,
        font_size_base: Math.max(12, Math.min(20, themeForm.font_size_base)),
        border_radius: Math.max(0, Math.min(20, themeForm.border_radius)),
        shadow_intensity: Math.max(0, Math.min(1, themeForm.shadow_intensity)),
        
        // Metadados
        version: themeForm.version || '1.0',
        updated_at: new Date().toISOString()
      };
      
      console.log('📝 Dados preparados para salvamento');
      console.log('🔍 Verificando autenticação...');
      
      // Verificar se o usuário está autenticado
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('❌ Erro de autenticação:', authError);
        toast.error('Erro de autenticação. Faça login novamente.');
        return;
      }
      
      if (!currentUser) {
        console.error('❌ Usuário não autenticado');
        toast.error('Você precisa estar logado para salvar temas.');
        return;
      }
      
      console.log('✅ Usuário autenticado:', currentUser.email);
      
      if (editingTheme) {
        console.log('🔄 Atualizando tema existente:', editingTheme.id);
        
        // Atualizar tema existente
        const { data: updateResult, error: updateError } = await supabase
          .from('global_ui_themes')
          .update(themeData)
          .eq('id', editingTheme.id)
          .select();

        if (updateError) {
          console.error('❌ Erro na atualização:', updateError);
          console.error('📋 Detalhes do erro:', JSON.stringify(updateError, null, 2));
          
          // Tratamento específico de erros
          if (updateError.code === 'PGRST301') {
            toast.error('Você não tem permissão para editar este tema.');
          } else if (updateError.code === '23505') {
            toast.error('Já existe um tema com este nome.');
          } else {
            toast.error(`Erro ao atualizar tema: ${updateError.message}`);
          }
          return;
        }
        
        console.log('✅ Tema atualizado com sucesso:', updateResult);
        toast.success(`Tema "${themeForm.display_name}" atualizado com sucesso!`);
      } else {
        console.log('➕ Criando novo tema');
        
        // Criar novo tema
        const { data: createResult, error: createError } = await supabase
          .from('global_ui_themes')
          .insert({
            ...themeData,
            is_native_theme: false,
            is_system_theme: false,
            is_active: false,
            created_by: currentUser.id
          })
          .select();

        if (createError) {
          console.error('❌ Erro na criação:', createError);
          console.error('📋 Detalhes do erro:', JSON.stringify(createError, null, 2));
          
          // Tratamento específico de erros
          if (createError.code === 'PGRST301') {
            toast.error('Você não tem permissão para criar temas.');
          } else if (createError.code === '23505') {
            toast.error('Já existe um tema com este nome.');
          } else {
            toast.error(`Erro ao criar tema: ${createError.message}`);
          }
          return;
        }
        
        console.log('✅ Tema criado com sucesso:', createResult);
        toast.success(`Tema "${themeForm.display_name}" criado com sucesso!`);
      }
      
      // Recarregar temas
      console.log('🔄 Recarregando lista de temas...');
      await loadThemes();
      
      // Fechar dialog
      setShowThemeDialog(false);
      setEditingTheme(null);
      
      console.log('🎉 Processo de salvamento concluído com sucesso!');
      
    } catch (error) {
      console.error('❌ Erro geral no salvamento:', error);
      console.error('📋 Stack trace:', error.stack);
      
      // Tratamento de erros gerais
      if (error.message.includes('network')) {
        toast.error('Erro de conexão. Verifique sua internet.');
      } else if (error.message.includes('permission')) {
        toast.error('Você não tem permissão para esta operação.');
      } else {
        toast.error('Erro inesperado ao salvar tema. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
      console.log('🏁 Finalizando processo de salvamento');
    }
  };

  const handleDeleteTheme = async (themeId: string, themeName: string) => {
    if (confirm(`Tem certeza que deseja excluir o tema "${themeName}"? Esta ação irá limpar todas as configurações relacionadas e não pode ser desfeita.`)) {
      try {
        // 1. Primeiro, verificar se o tema existe e se não é um tema do sistema
        const { data: themeData, error: themeError } = await supabase
          .from('global_ui_themes')
          .select('is_system_theme, name')
          .eq('id', themeId)
          .single();

        if (themeError) {
          throw new Error(`Erro ao verificar tema: ${themeError.message}`);
        }

        if (themeData.is_system_theme) {
          toast.error('Não é possível excluir temas do sistema');
          return;
        }

        // 2. Obter um tema alternativo para substituir as referências
        const { data: alternativeTheme, error: altError } = await supabase
          .from('global_ui_themes')
          .select('id')
          .neq('id', themeId)
          .eq('is_system_theme', true)
          .limit(1)
          .single();

        if (altError || !alternativeTheme) {
          throw new Error('Não foi possível encontrar um tema alternativo para substituir as referências');
        }

        // 3. Atualizar referências em global_ui_settings
        const { error: settingsError } = await supabase
          .from('global_ui_settings')
          .update({ active_theme_id: alternativeTheme.id })
          .eq('active_theme_id', themeId);

        if (settingsError) {
          throw new Error(`Erro ao atualizar configurações: ${settingsError.message}`);
        }

        // 4. Limpar cache relacionado
        const { error: cacheError } = await supabase
          .from('ui_theme_cache')
          .delete()
          .eq('theme_id', themeId);

        if (cacheError) {
          console.warn('Aviso ao limpar cache:', cacheError.message);
        }

        // 5. Limpar componentes relacionados
        const { error: componentError } = await supabase
          .from('ui_component_themes')
          .delete()
          .eq('theme_id', themeId);

        if (componentError) {
          console.warn('Aviso ao limpar componentes:', componentError.message);
        }

        // 6. Limpar histórico relacionado (opcional - manter para auditoria)
        const { error: historyError } = await supabase
          .from('theme_change_history')
          .delete()
          .or(`previous_theme_id.eq.${themeId},new_theme_id.eq.${themeId}`);

        if (historyError) {
          console.warn('Aviso ao limpar histórico:', historyError.message);
        }

        // 7. Finalmente, excluir o tema
        const { error: deleteError } = await supabase
          .from('global_ui_themes')
          .delete()
          .eq('id', themeId);

        if (deleteError) {
          throw new Error(`Erro ao excluir tema: ${deleteError.message}`);
        }

        toast.success('Tema excluído com sucesso! Todas as referências foram atualizadas.');
        await loadThemes();
      } catch (error) {
        console.error('Erro ao excluir tema:', error);
        toast.error(`Erro ao excluir tema: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    }
  };

  const handleDuplicateTheme = async (theme: ThemeConfig) => {
    try {
      setIsLoading(true);
      
      // Gerar nome único para o tema duplicado
      const baseName = theme.name.replace(/_copy_\d+$/, ''); // Remove sufixos existentes
      const baseDisplayName = theme.display_name.replace(/ \(Cópia( \d+)?\)$/, ''); // Remove sufixos existentes
      
      // Verificar quantas cópias já existem
      const { data: existingThemes, error: countError } = await supabase
        .from('global_ui_themes')
        .select('name, display_name')
        .or(`name.like.${baseName}_copy_%,name.eq.${baseName}_copy`);

      if (countError) throw countError;

      const copyNumber = existingThemes ? existingThemes.length + 1 : 1;
      const newName = `${baseName}_copy_${copyNumber}`;
      const newDisplayName = `${baseDisplayName} (Cópia ${copyNumber})`;

      // Criar tema duplicado
      const { error } = await supabase
        .from('global_ui_themes')
        .insert({
          name: newName,
          display_name: newDisplayName,
          description: `Cópia de: ${theme.description || theme.display_name}`,
          is_native_theme: false, // Cópias nunca são nativas
          is_system_theme: false, // Cópias nunca são de sistema
          is_active: false, // Cópias começam inativas
          is_dark_mode: theme.is_dark_mode,
          
          // Cores principais
          primary_color: theme.primary_color,
          primary_foreground: theme.primary_foreground,
          primary_hover: theme.primary_hover || theme.primary_color,
          primary_glow: theme.primary_glow || theme.primary_color,
          
          // Cores secundárias
          secondary_color: theme.secondary_color,
          secondary_foreground: theme.secondary_foreground,
          
          // Cores de destaque
          accent_color: theme.accent_color,
          accent_foreground: theme.accent_foreground,
          
          // Cores de fundo
          background_color: theme.background_color,
          foreground_color: theme.foreground_color,
          card_color: theme.card_color,
          card_foreground: theme.card_foreground,
          
          // Cores de interface
          border_color: theme.border_color,
          input_color: theme.input_color || theme.border_color,
          ring_color: theme.ring_color || theme.primary_color,
          muted_color: theme.muted_color || theme.secondary_color,
          muted_foreground: theme.muted_foreground || theme.secondary_foreground,
          popover_color: theme.popover_color || theme.card_color,
          popover_foreground: theme.popover_foreground || theme.card_foreground,
          
          // Cores de estado
          success_color: theme.success_color,
          success_foreground: theme.success_foreground,
          success_light: theme.success_light || theme.success_color,
          warning_color: theme.warning_color,
          warning_foreground: theme.warning_foreground,
          warning_light: theme.warning_light || theme.warning_color,
          danger_color: theme.danger_color,
          danger_foreground: theme.danger_foreground,
          danger_light: theme.danger_light || theme.danger_color,
          destructive_color: theme.destructive_color || theme.danger_color,
          destructive_foreground: theme.destructive_foreground || theme.danger_foreground,
          
          // Cores de risco
          risk_critical: theme.risk_critical || theme.danger_color,
          risk_high: theme.risk_high || '24 95% 53%',
          risk_medium: theme.risk_medium || theme.warning_color,
          risk_low: theme.risk_low || theme.success_color,
          
          // Cores do sidebar
          sidebar_background: theme.sidebar_background || theme.background_color,
          sidebar_foreground: theme.sidebar_foreground || theme.foreground_color,
          sidebar_primary: theme.sidebar_primary || theme.primary_color,
          sidebar_primary_foreground: theme.sidebar_primary_foreground || theme.primary_foreground,
          sidebar_accent: theme.sidebar_accent || theme.secondary_color,
          sidebar_accent_foreground: theme.sidebar_accent_foreground || theme.secondary_foreground,
          sidebar_border: theme.sidebar_border || theme.border_color,
          sidebar_ring: theme.sidebar_ring || theme.primary_color,
          
          // Configurações de layout
          font_family: theme.font_family || 'Inter',
          font_size_base: theme.font_size_base || 14,
          border_radius: theme.border_radius || 8,
          shadow_intensity: theme.shadow_intensity || 0.1,
          
          // Metadados
          created_by: user?.id
        });

      if (error) throw error;
      
      toast.success(`Tema "${newDisplayName}" criado com sucesso!`);
      await loadThemes();
    } catch (error) {
      console.error('Erro ao duplicar tema:', error);
      toast.error('Erro ao duplicar tema');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleApplyTheme = async (theme: ThemeConfig) => {
    try {
      setIsLoading(true);
      
      console.log('🎨 Aplicando tema:', theme.display_name || theme.name);
      console.log('📋 Detalhes do tema:', {
        id: theme.id,
        isNative: theme.is_native_theme,
        isDarkMode: theme.is_dark_mode,
        currentSystemDarkMode: document.documentElement.classList.contains('dark')
      });
      
      // Para o tema nativo, preservar as cores originais sem alterar modo escuro/claro
      if (theme.is_native_theme) {
        console.log('🏠 Aplicando tema nativo - preservando cores originais');
        
        // Aplicar tema no banco de dados
        console.log('💾 Aplicando tema nativo no banco de dados:', {
          theme_uuid: theme.id,
          theme_name: theme.display_name || theme.name,
          tenant_uuid: null
        });
        
        const { data: applyResult, error } = await supabase.rpc('apply_theme', {
          theme_uuid: theme.id,
          tenant_uuid: null
        });
        
        console.log('📊 Resultado da aplicação do tema nativo:', { data: applyResult, error });
        
        if (error) {
          console.error('❌ Erro ao aplicar tema nativo no banco:', error);
          throw error;
        }
        
        // Marcar timestamp da aplicação do tema
        window.localStorage.setItem('lastThemeChangeTime', Date.now().toString());
        console.log('🕰️ Marcando timestamp da aplicação do tema nativo:', Date.now());
        
        // Para tema nativo, aplicar cores mas respeitar modo dark/light atual do sistema
        applyThemeColors(theme);
        
        toast.success('Tema UI Nativa aplicado com sucesso!');
      } else {
        console.log('🎭 Aplicando tema customizado');
        
        try {
          // Para temas customizados, implementar hierarquia de preferências
          let shouldApplyThemeDarkMode = document.documentElement.classList.contains('dark'); // padrão: manter atual
          
          try {
            // 1. Verificar preferências do usuário
            const { data: userProfile, error: profileError } = await supabase
              .from('profiles')
              .select('notification_preferences')
              .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
              .single();
            
            if (profileError) {
              console.warn('⚠️ Erro ao buscar preferências do usuário:', profileError);
            } else {
              console.log('👤 Perfil do usuário:', userProfile?.notification_preferences);
              
              // Verificar preferência de tema do usuário em notification_preferences
              const userThemePreference = userProfile?.notification_preferences?.theme;
              
              if (userThemePreference && ['dark', 'light'].includes(userThemePreference)) {
                // Usuário tem preferência específica
                shouldApplyThemeDarkMode = userThemePreference === 'dark';
                console.log('🎯 Usando preferência do usuário:', shouldApplyThemeDarkMode ? 'dark' : 'light');
              } else {
                // 2. Verificar configurações globais se usuário não tem preferência
                const { data: globalSettings, error: globalError } = await supabase
                  .from('global_ui_settings')
                  .select('*')
                  .is('tenant_id', null)
                  .single();
                
                if (globalError) {
                  console.warn('⚠️ Erro ao buscar configurações globais:', globalError);
                } else {
                  console.log('🌐 Configurações globais:', globalSettings);
                  
                  if (globalSettings?.default_dark_mode !== null && globalSettings?.default_dark_mode !== undefined) {
                    // Usar configuração global
                    shouldApplyThemeDarkMode = globalSettings.default_dark_mode;
                    console.log('🌍 Usando configuração global:', shouldApplyThemeDarkMode ? 'dark' : 'light');
                  } else {
                    console.log('💻 Mantendo modo atual do sistema:', shouldApplyThemeDarkMode ? 'dark' : 'light');
                  }
                }
              }
            }
          } catch (prefError) {
            console.warn('⚠️ Erro ao processar preferências, usando modo atual:', prefError);
            shouldApplyThemeDarkMode = document.documentElement.classList.contains('dark');
          }
          
          // Aplicar tema no banco de dados
          console.log('💾 Aplicando tema no banco de dados:', {
            theme_uuid: theme.id,
            theme_name: theme.display_name || theme.name,
            tenant_uuid: null
          });
          
          const { data: applyResult, error } = await supabase.rpc('apply_theme', {
            theme_uuid: theme.id,
            tenant_uuid: null
          });
          
          console.log('📊 Resultado da aplicação no banco:', { data: applyResult, error });
          
          // Verificar se o tema foi realmente marcado como ativo
          setTimeout(async () => {
            console.log('🔍 Verificando se tema foi marcado como ativo...');
            const { data: checkTheme, error: checkError } = await supabase
              .from('global_ui_themes')
              .select('id, name, display_name, is_active')
              .eq('id', theme.id)
              .single();
            
            console.log('📊 Tema após aplicação:', { data: checkTheme, error: checkError });
            
            // Verificar todos os temas ativos
            const { data: allActiveThemes, error: allError } = await supabase
              .from('global_ui_themes')
              .select('id, name, display_name, is_active')
              .eq('is_active', true);
            
            console.log('📊 Todos os temas ativos:', { data: allActiveThemes, error: allError });
            
            // Se o tema não foi marcado como ativo, forçar a atualização
            if (checkTheme && !checkTheme.is_active) {
              console.log('⚠️ Tema não foi marcado como ativo, forçando atualização...');
              
              // Desativar todos os temas primeiro
              await supabase
                .from('global_ui_themes')
                .update({ is_active: false })
                .neq('id', '00000000-0000-0000-0000-000000000000');
              
              // Ativar o tema desejado
              const { error: forceError } = await supabase
                .from('global_ui_themes')
                .update({ is_active: true })
                .eq('id', theme.id);
              
              if (forceError) {
                console.error('❌ Erro ao forçar ativação do tema:', forceError);
              } else {
                console.log('✅ Tema forçado como ativo com sucesso');
              }
            }
          }, 500);
          
          if (error) {
            console.error('❌ Erro na função apply_theme:', error);
            throw error;
          }
          
          // Aplicar modo dark/light baseado na hierarquia
          if (shouldApplyThemeDarkMode) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          
          // Marcar timestamp da aplicação do tema
          window.localStorage.setItem('lastThemeChangeTime', Date.now().toString());
          console.log('🕰️ Marcando timestamp da aplicação do tema:', Date.now());
          
          // Aplicar cores do tema
          applyThemeColors(theme);
          
          toast.success(`Tema "${theme.display_name || theme.name}" aplicado com sucesso!`);
        } catch (customThemeError) {
          console.error('Erro específico no tema customizado:', customThemeError);
          
          // Fallback: aplicar tema sem hierarquia de preferências
          console.log('🔄 Aplicando tema no modo fallback:', {
            theme_uuid: theme.id,
            theme_name: theme.display_name || theme.name
          });
          
          const { data: fallbackResult, error } = await supabase.rpc('apply_theme', {
            theme_uuid: theme.id,
            tenant_uuid: null
          });
          
          console.log('📊 Resultado do fallback:', { data: fallbackResult, error });
          
          if (error) {
            console.error('❌ Erro no fallback apply_theme:', error);
            throw error;
          }
          
          applyThemeColors(theme);
          toast.success(`Tema "${theme.display_name || theme.name}" aplicado (modo simplificado)!`);
        }
      }

      // Atualizar estado local
      console.log('🔄 Atualizando estado local...');
      setActiveTheme(theme);
      setThemes(prev => prev.map(t => ({ ...t, is_active: t.id === theme.id })));
      
      // Forçar recarregamento dos temas para garantir sincronização
      setTimeout(async () => {
        console.log('🔄 Recarregando temas para confirmar aplicação...');
        await loadThemes();
      }, 1000);
      
    } catch (error) {
      console.error('Erro ao aplicar tema:', error);
      toast.error('Erro ao aplicar tema');
    } finally {
      setIsLoading(false);
    }
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
  
  // Verificar se o usuário é platform admin ou admin do sistema
  const isAdmin = user?.isPlatformAdmin || user?.role === 'admin';

  if (!isAdmin) {
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
          Administrador
        </Badge>
      </div>

      {/* Alert de Informação */}
      <Alert className="!border-blue-200 !bg-blue-50 !text-blue-900 dark:!border-blue-800 dark:!bg-blue-950/30 dark:!text-blue-100">
        <Info className="h-4 w-4 !text-blue-600 dark:!text-blue-400" />
        <AlertTitle className="!text-blue-900 dark:!text-blue-100">Centro de Administração Global</AlertTitle>
        <AlertDescription className="!text-blue-800 dark:!text-blue-200">
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
              <h3 className="text-lg font-semibold">Configuração de Temas da Plataforma</h3>
              <p className="text-sm text-muted-foreground">
                Configure temas globais e específicos por tenant. Como admin da plataforma, você controla todas as cores e aparência.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Importar Tema
              </Button>
              <Button onClick={handleCreateTheme}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Tema
              </Button>
            </div>
          </div>

          {/* Tenant Selection for Theme Configuration */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Configuração por Tenant
              </CardTitle>
              <CardDescription className="text-blue-700 dark:text-blue-300">
                Como admin da plataforma, você pode configurar temas específicos para cada tenant ou usar o tema global.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Selecionar Tenant</Label>
                  <Select value={selectedTenant} onValueChange={setSelectedTenant}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um tenant ou use global" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="global">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Tema Global (Todos os Tenants)
                        </div>
                      </SelectItem>
                      {availableTenants.map(tenant => (
                        <SelectItem key={tenant.id} value={tenant.id}>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            {tenant.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Status da Configuração</Label>
                  <div className="flex items-center gap-2">
                    {selectedTenant === 'global' ? (
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        <Globe className="h-3 w-3 mr-1" />
                        Configuração Global
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        <Building className="h-3 w-3 mr-1" />
                        Tenant Específico
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {selectedTenant === 'global' 
                      ? 'Mudanças afetarão todos os tenants sem tema específico'
                      : 'Mudanças afetarão apenas este tenant'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview do Tema Ativo */}
          {activeTheme && (
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Tema Ativo: {activeTheme.display_name || activeTheme.name}
                  {activeTheme.is_native_theme && (
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                      <Star className="h-3 w-3 mr-1" />
                      UI Nativa
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {activeTheme.description || 'Este é o tema atualmente aplicado em toda a plataforma'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Seção: Cores Principais */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-primary" />
                    <h4 className="font-semibold">Paleta de Cores Principal</h4>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Primária</Label>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-10 h-10 rounded-lg border-2 shadow-sm"
                          style={{ backgroundColor: `hsl(${activeTheme.primary_color})` }}
                        />
                        <div className="flex-1">
                          <span className="text-xs font-mono block">{activeTheme.primary_color}</span>
                          <span className="text-[10px] text-muted-foreground">HSL</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Secundária</Label>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-10 h-10 rounded-lg border-2 shadow-sm"
                          style={{ backgroundColor: `hsl(${activeTheme.secondary_color})` }}
                        />
                        <div className="flex-1">
                          <span className="text-xs font-mono block">{activeTheme.secondary_color}</span>
                          <span className="text-[10px] text-muted-foreground">HSL</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Destaque</Label>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-10 h-10 rounded-lg border-2 shadow-sm"
                          style={{ backgroundColor: `hsl(${activeTheme.accent_color})` }}
                        />
                        <div className="flex-1">
                          <span className="text-xs font-mono block">{activeTheme.accent_color}</span>
                          <span className="text-[10px] text-muted-foreground">HSL</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Sucesso</Label>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-10 h-10 rounded-lg border-2 shadow-sm"
                          style={{ backgroundColor: `hsl(${activeTheme.success_color || '142 76% 36%'})` }}
                        />
                        <div className="flex-1">
                          <span className="text-xs font-mono block">{activeTheme.success_color || '142 76% 36%'}</span>
                          <span className="text-[10px] text-muted-foreground">HSL</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seção: Cores de Status */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <h4 className="font-semibold">Cores de Status & Risco</h4>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Crítico</Label>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-8 h-8 rounded border-2"
                          style={{ backgroundColor: `hsl(${activeTheme.risk_critical || '0 84% 60%'})` }}
                        />
                        <span className="text-xs font-mono">{activeTheme.risk_critical || '0 84% 60%'}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Alto</Label>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-8 h-8 rounded border-2"
                          style={{ backgroundColor: `hsl(${activeTheme.risk_high || '24 95% 53%'})` }}
                        />
                        <span className="text-xs font-mono">{activeTheme.risk_high || '24 95% 53%'}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Médio</Label>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-8 h-8 rounded border-2"
                          style={{ backgroundColor: `hsl(${activeTheme.risk_medium || '38 92% 50%'})` }}
                        />
                        <span className="text-xs font-mono">{activeTheme.risk_medium || '38 92% 50%'}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Baixo</Label>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-8 h-8 rounded border-2"
                          style={{ backgroundColor: `hsl(${activeTheme.risk_low || '142 76% 36%'})` }}
                        />
                        <span className="text-xs font-mono">{activeTheme.risk_low || '142 76% 36%'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seção: Backgrounds e Superfícies */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-blue-500" />
                    <h4 className="font-semibold">Backgrounds & Superfícies</h4>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Background Principal</Label>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-10 h-10 rounded-lg border-2 shadow-sm"
                          style={{ backgroundColor: `hsl(${activeTheme.background_color})` }}
                        />
                        <div className="flex-1">
                          <span className="text-xs font-mono block">{activeTheme.background_color}</span>
                          <span className="text-[10px] text-muted-foreground">Body</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Cards</Label>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-10 h-10 rounded-lg border-2 shadow-sm"
                          style={{ backgroundColor: `hsl(${activeTheme.card_color})` }}
                        />
                        <div className="flex-1">
                          <span className="text-xs font-mono block">{activeTheme.card_color}</span>
                          <span className="text-[10px] text-muted-foreground">Cards</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Sidebar</Label>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-10 h-10 rounded-lg border-2 shadow-sm"
                          style={{ backgroundColor: `hsl(${activeTheme.sidebar_background || '0 0% 98%'})` }}
                        />
                        <div className="flex-1">
                          <span className="text-xs font-mono block">{activeTheme.sidebar_background || '0 0% 98%'}</span>
                          <span className="text-[10px] text-muted-foreground">Navigation</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seção: Bordas e Contornos */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 rounded border-current"></div>
                    <h4 className="font-semibold">Bordas e Contornos</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Light Mode */}
                    <div className="space-y-3">
                      <h5 className="font-medium text-sm flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-400 border border-yellow-600"></div>
                        Light Mode
                      </h5>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label className="text-xs font-medium">Bordas Gerais</Label>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-8 h-8 rounded border-2"
                              style={{ 
                                backgroundColor: `hsl(${activeTheme.background_color})`,
                                borderColor: `hsl(${activeTheme.border_color})` 
                              }}
                            />
                            <div className="flex-1">
                              <span className="text-xs font-mono block">{activeTheme.border_color}</span>
                              <span className="text-[10px] text-muted-foreground">Elements</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-medium">Inputs</Label>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-8 h-8 rounded border"
                              style={{ 
                                backgroundColor: `hsl(${activeTheme.background_color})`,
                                borderColor: `hsl(${activeTheme.input_color || activeTheme.border_color})` 
                              }}
                            />
                            <div className="flex-1">
                              <span className="text-xs font-mono block">{activeTheme.input_color || activeTheme.border_color}</span>
                              <span className="text-[10px] text-muted-foreground">Forms</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dark Mode */}
                    <div className="space-y-3">
                      <h5 className="font-medium text-sm flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-700 border border-gray-500"></div>
                        Dark Mode
                      </h5>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label className="text-xs font-medium">Bordas Gerais</Label>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-8 h-8 rounded border-2"
                              style={{ 
                                backgroundColor: 'hsl(215 8% 12%)',
                                borderColor: `hsl(${activeTheme.border_color_dark || '215 10% 22%'})` 
                              }}
                            />
                            <div className="flex-1">
                              <span className="text-xs font-mono block">{activeTheme.border_color_dark || '215 10% 22%'}</span>
                              <span className="text-[10px] text-muted-foreground">Elements</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-medium">Inputs</Label>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-8 h-8 rounded border"
                              style={{ 
                                backgroundColor: 'hsl(215 12% 16%)',
                                borderColor: `hsl(${activeTheme.input_color_dark || '215 10% 22%'})` 
                              }}
                            />
                            <div className="flex-1">
                              <span className="text-xs font-mono block">{activeTheme.input_color_dark || '215 10% 22%'}</span>
                              <span className="text-[10px] text-muted-foreground">Forms</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seção: Tipografia e Layout */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Type className="h-4 w-4 text-purple-500" />
                    <h4 className="font-semibold">Tipografia & Layout</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Família da Fonte</Label>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm font-medium" style={{ fontFamily: activeTheme.font_family || 'Inter' }}>
                          {activeTheme.font_family || 'Inter'}
                        </span>
                        <p className="text-xs text-muted-foreground mt-1" style={{ fontFamily: activeTheme.font_family || 'Inter' }}>
                          Exemplo de texto da aplicação
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Border Radius</Label>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-8 h-8 bg-primary/20 border-2 border-primary/50"
                            style={{ borderRadius: `${activeTheme.border_radius || 8}px` }}
                          />
                          <span className="text-sm font-mono">{activeTheme.border_radius || 8}px</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Tamanho Base</Label>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm font-mono">{activeTheme.font_size_base || 14}px</span>
                        <p className="text-xs text-muted-foreground mt-1">Texto padrão</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seção: Modo Dark */}
                {activeTheme.is_native_theme && (
                  <div className="space-y-4 p-4 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4 text-indigo-500" />
                      <h4 className="font-semibold">Modo Escuro Automático</h4>
                      <Badge variant="outline" className="text-xs">
                        Suporte Nativo
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-medium">Background (Dark)</Label>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-10 h-10 rounded-lg border-2 shadow-sm"
                            style={{ backgroundColor: 'hsl(222 14% 7%)' }}
                          />
                          <div className="flex-1">
                            <span className="text-xs font-mono block">222 14% 7%</span>
                            <span className="text-[10px] text-muted-foreground">Dark Body</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-medium">Cards (Dark)</Label>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-10 h-10 rounded-lg border-2 shadow-sm"
                            style={{ backgroundColor: 'hsl(215 8% 12%)' }}
                          />
                          <div className="flex-1">
                            <span className="text-xs font-mono block">215 8% 12%</span>
                            <span className="text-[10px] text-muted-foreground">Dark Cards</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Seção: Ações */}
                <div className="flex flex-wrap items-center gap-3 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleExportTheme(activeTheme)}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Exportar Tema
                  </Button>
                  {activeTheme.is_native_theme && (
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => setEditingTheme(activeTheme)}
                      className="flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Customizar
                    </Button>
                  )}
                  <div className="flex items-center gap-2 ml-auto">
                    <Label className="text-sm">Versão:</Label>
                    <Badge variant="secondary" className="text-xs">
                      v{activeTheme.version || '1.0'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Configuração de PDF para Tema UI Nativa */}
          {activeTheme?.is_native_theme && (
            <PDFColorSettings isNativeTheme={true} />
          )}

          {loadingThemes && (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              <span>Carregando temas...</span>
            </div>
          )}

          {/* Lista de Temas */}
          {!loadingThemes && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {themes.map((theme) => (
                <Card key={theme.id} className={cn(
                  "relative group hover:shadow-lg transition-shadow",
                  theme.is_active && "ring-2 ring-green-600",
                  theme.is_native_theme && "border-green-600/30 bg-green-600/5"
                )}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{theme.display_name || theme.name}</CardTitle>
                        {theme.is_native_theme && (
                          <Badge variant="outline" className="bg-green-600/10 text-green-600 border-green-600/30">
                            <Star className="h-3 w-3 mr-1" />
                            Nativa
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {theme.is_active && theme.is_native_theme ? (
                          <Badge className="text-xs bg-green-600 text-white hover:bg-green-700">
                            <Check className="h-3 w-3 mr-1" />
                            Ativo
                          </Badge>
                        ) : theme.is_active && (
                          <Badge className="text-xs bg-primary">
                            <Check className="h-3 w-3 mr-1" />
                            Ativo
                          </Badge>
                        )}
                        {theme.is_dark_mode && (
                          <Badge variant="outline" className="text-xs">
                            Escuro
                          </Badge>
                        )}
                        {theme.is_system_theme && (
                          <Badge variant="outline" className="text-xs">
                            Sistema
                          </Badge>
                        )}
                      </div>
                    </div>
                    {theme.description && (
                      <p className="text-xs text-muted-foreground mt-1">{theme.description}</p>
                    )}
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
                        theme.danger_color
                      ].map((color, index) => (
                        <div
                          key={index}
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: `hsl(${color})` }}
                        />
                      ))}
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      Fonte: {theme.font_family} • Tamanho: {theme.font_size_base}px • Raio: {theme.border_radius}px
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {!theme.is_active && (
                        <Button 
                          size="sm" 
                          onClick={() => handleApplyTheme(theme)}
                          className={cn(
                            "flex-1",
                            theme.is_native_theme && "bg-green-600 hover:bg-green-700 text-white"
                          )}
                          disabled={isLoading}
                        >
                          <Brush className="h-3 w-3 mr-1" />
                          Aplicar
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEditTheme(theme)}
                        title="Editar tema"
                        className={theme.is_native_theme ? "text-green-600 hover:text-green-700 hover:border-green-300" : ""}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDuplicateTheme(theme)}
                        disabled={isLoading}
                        title="Duplicar tema"
                        className={theme.is_native_theme ? "text-green-600 hover:text-green-700 hover:border-green-300" : "text-blue-600 hover:text-blue-700 hover:border-blue-300"}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleExportTheme(theme)}
                        title="Exportar tema"
                        className={theme.is_native_theme ? "text-green-600 hover:text-green-700 hover:border-green-300" : ""}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                      {!theme.is_system_theme && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteTheme(theme.id, theme.display_name || theme.name)}
                          className="text-red-600 hover:text-red-700 hover:border-red-300"
                          title="Excluir tema"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {themes.length === 0 && (
                <div className="col-span-2 text-center py-8 text-muted-foreground">
                  <Palette className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum tema encontrado</p>
                </div>
              )}
            </div>
          )}
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

          {loadingFonts && (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              <span>Carregando fontes...</span>
            </div>
          )}

          {!loadingFonts && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {fonts.map((font) => (
              <Card key={font.id} className={cn(
                "relative group hover:shadow-lg transition-shadow",
                font.is_active && "ring-2 ring-primary"
              )}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base" style={{ fontFamily: font.family }}>
                      {font.display_name || font.name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {font.is_active && (
                        <Badge className="text-xs">
                          <Check className="h-3 w-3 mr-1" />
                          Ativa
                        </Badge>
                      )}
                      {font.is_system_font && (
                        <Badge variant="outline" className="text-xs">
                          Sistema
                        </Badge>
                      )}
                      {font.is_google_font && (
                        <Badge variant="outline" className="text-xs">
                          Google
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
                      {(font.font_weights || font.weights || []).map((weight) => (
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
              
              {fonts.length === 0 && (
                <div className="col-span-3 text-center py-8 text-muted-foreground">
                  <Type className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma fonte encontrada</p>
                </div>
              )}
            </div>
          )}
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

      {/* ============================================================================ */}
      {/* DIALOG: CRIAR/EDITAR TEMA */}
      {/* ============================================================================ */}
      <Dialog open={showThemeDialog} onOpenChange={setShowThemeDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              {editingTheme ? 'Editar Tema' : 'Criar Novo Tema'}
              {editingTheme?.is_native_theme && (
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                  <Star className="h-3 w-3 mr-1" />
                  UI Nativa
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              Configure todas as cores, fontes e propriedades visuais do tema
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Informações Básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome do Tema (ID)</Label>
                <Input
                  value={themeForm.name}
                  onChange={(e) => setThemeForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="ex: corporate_blue"
                  disabled={editingTheme?.is_system_theme}
                />
              </div>
              <div className="space-y-2">
                <Label>Nome de Exibição</Label>
                <Input
                  value={themeForm.display_name}
                  onChange={(e) => setThemeForm(prev => ({ ...prev, display_name: e.target.value }))}
                  placeholder="ex: Azul Corporativo"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={themeForm.description}
                onChange={(e) => setThemeForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva este tema..."
                rows={2}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_dark_mode"
                checked={themeForm.is_dark_mode}
                onCheckedChange={(checked) => setThemeForm(prev => ({ ...prev, is_dark_mode: !!checked }))}
              />
              <Label htmlFor="is_dark_mode">Tema escuro</Label>
            </div>

            {/* Cores Principais */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Cores Principais</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ColorPicker
                  label="Cor Primária"
                  value={themeForm.primary_color}
                  onChange={(value) => setThemeForm(prev => ({ ...prev, primary_color: value }))}
                  placeholder="219 78% 26%"
                />
                <ColorPicker
                  label="Texto da Cor Primária"
                  value={themeForm.primary_foreground}
                  onChange={(value) => setThemeForm(prev => ({ ...prev, primary_foreground: value }))}
                  placeholder="210 40% 98%"
                />
                <ColorPicker
                  label="Cor Secundária"
                  value={themeForm.secondary_color}
                  onChange={(value) => setThemeForm(prev => ({ ...prev, secondary_color: value }))}
                  placeholder="210 20% 96%"
                />
                <ColorPicker
                  label="Texto da Cor Secundária"
                  value={themeForm.secondary_foreground}
                  onChange={(value) => setThemeForm(prev => ({ ...prev, secondary_foreground: value }))}
                  placeholder="225 71% 12%"
                />
                <ColorPicker
                  label="Cor de Destaque"
                  value={themeForm.accent_color}
                  onChange={(value) => setThemeForm(prev => ({ ...prev, accent_color: value }))}
                  placeholder="142 76% 36%"
                />
                <ColorPicker
                  label="Texto da Cor de Destaque"
                  value={themeForm.accent_foreground}
                  onChange={(value) => setThemeForm(prev => ({ ...prev, accent_foreground: value }))}
                  placeholder="210 40% 98%"
                />
              </div>
            </div>

            {/* Cores de Fundo */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Cores de Fundo e Superfície</Label>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Light Mode */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-yellow-400 border-2 border-yellow-600"></div>
                    Light Mode
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    <ColorPicker
                      label="Fundo Principal"
                      value={themeForm.background_color}
                      onChange={(value) => setThemeForm(prev => ({ ...prev, background_color: value }))}
                      placeholder="0 0% 100%"
                    />
                    <ColorPicker
                      label="Texto Principal"
                      value={themeForm.foreground_color}
                      onChange={(value) => setThemeForm(prev => ({ ...prev, foreground_color: value }))}
                      placeholder="225 71% 12%"
                    />
                    <ColorPicker
                      label="Fundo dos Cards"
                      value={themeForm.card_color}
                      onChange={(value) => setThemeForm(prev => ({ ...prev, card_color: value }))}
                      placeholder="0 0% 100%"
                    />
                    <ColorPicker
                      label="Texto dos Cards"
                      value={themeForm.card_foreground}
                      onChange={(value) => setThemeForm(prev => ({ ...prev, card_foreground: value }))}
                      placeholder="225 71% 12%"
                    />
                  </div>
                </div>
                {/* Dark Mode */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-gray-800 border-2 border-gray-600"></div>
                    Dark Mode
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    <ColorPicker
                      label="Fundo Principal (Dark)"
                      value={themeForm.background_color_dark}
                      onChange={(value) => setThemeForm(prev => ({ ...prev, background_color_dark: value }))}
                      placeholder="222 18% 4%"
                    />
                    <ColorPicker
                      label="Texto Principal (Dark)"
                      value={themeForm.foreground_color_dark}
                      onChange={(value) => setThemeForm(prev => ({ ...prev, foreground_color_dark: value }))}
                      placeholder="0 0% 100%"
                    />
                    <ColorPicker
                      label="Fundo dos Cards (Dark)"
                      value={themeForm.card_color_dark}
                      onChange={(value) => setThemeForm(prev => ({ ...prev, card_color_dark: value }))}
                      placeholder="215 8% 12%"
                    />
                    <ColorPicker
                      label="Texto dos Cards (Dark)"
                      value={themeForm.card_foreground_dark}
                      onChange={(value) => setThemeForm(prev => ({ ...prev, card_foreground_dark: value }))}
                      placeholder="0 0% 100%"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bordas e Contornos */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 rounded border-current"></div>
                <Label className="text-base font-semibold">Bordas e Contornos</Label>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Light Mode */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-yellow-400 border-2 border-yellow-600"></div>
                    Light Mode
                  </h4>
                  <div className="space-y-4">
                    <ColorPicker
                      label="Bordas Gerais"
                      value={themeForm.border_color}
                      onChange={(value) => setThemeForm(prev => ({ ...prev, border_color: value }))}
                      placeholder="214 32% 91%"
                    />
                    <ColorPicker
                      label="Inputs e Formulários"
                      value={themeForm.input_color}
                      onChange={(value) => setThemeForm(prev => ({ ...prev, input_color: value }))}
                      placeholder="214 32% 91%"
                    />
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      <div className="flex items-center gap-2 mb-2">
                        <div 
                          className="w-8 h-8 rounded border-2"
                          style={{ 
                            backgroundColor: 'white',
                            borderColor: `hsl(${themeForm.border_color})` 
                          }}
                        ></div>
                        <span className="text-sm">Preview</span>
                      </div>
                      <input 
                        type="text" 
                        placeholder="Exemplo de input" 
                        className="w-full p-2 rounded text-sm"
                        style={{ 
                          borderColor: `hsl(${themeForm.input_color})`,
                          borderWidth: '1px',
                          borderStyle: 'solid'
                        }}
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                {/* Dark Mode */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-gray-800 border-2 border-gray-600"></div>
                    Dark Mode
                  </h4>
                  <div className="space-y-4">
                    <ColorPicker
                      label="Bordas Gerais (Dark)"
                      value={themeForm.border_color_dark}
                      onChange={(value) => setThemeForm(prev => ({ ...prev, border_color_dark: value }))}
                      placeholder="215 10% 22%"
                    />
                    <ColorPicker
                      label="Inputs e Formulários (Dark)"
                      value={themeForm.input_color_dark}
                      onChange={(value) => setThemeForm(prev => ({ ...prev, input_color_dark: value }))}
                      placeholder="215 10% 22%"
                    />
                    <div className="p-3 bg-gray-900 rounded-lg border border-gray-700">
                      <div className="flex items-center gap-2 mb-2">
                        <div 
                          className="w-8 h-8 rounded border-2"
                          style={{ 
                            backgroundColor: 'hsl(215 8% 12%)',
                            borderColor: `hsl(${themeForm.border_color_dark})` 
                          }}
                        ></div>
                        <span className="text-sm text-white">Preview</span>
                      </div>
                      <input 
                        type="text" 
                        placeholder="Exemplo de input" 
                        className="w-full p-2 rounded text-sm bg-gray-800 text-white"
                        style={{ 
                          borderColor: `hsl(${themeForm.input_color_dark})`,
                          borderWidth: '1px',
                          borderStyle: 'solid'
                        }}
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cores de Estado */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Cores de Estado</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ColorPicker
                  label="Sucesso"
                  value={themeForm.success_color}
                  onChange={(value) => setThemeForm(prev => ({ ...prev, success_color: value }))}
                  placeholder="142 76% 36%"
                />
                <ColorPicker
                  label="Texto do Sucesso"
                  value={themeForm.success_foreground}
                  onChange={(value) => setThemeForm(prev => ({ ...prev, success_foreground: value }))}
                  placeholder="210 40% 98%"
                />
                <ColorPicker
                  label="Aviso"
                  value={themeForm.warning_color}
                  onChange={(value) => setThemeForm(prev => ({ ...prev, warning_color: value }))}
                  placeholder="38 92% 50%"
                />
                <ColorPicker
                  label="Texto do Aviso"
                  value={themeForm.warning_foreground}
                  onChange={(value) => setThemeForm(prev => ({ ...prev, warning_foreground: value }))}
                  placeholder="225 71% 12%"
                />
                <ColorPicker
                  label="Perigo"
                  value={themeForm.danger_color}
                  onChange={(value) => setThemeForm(prev => ({ ...prev, danger_color: value }))}
                  placeholder="0 84% 60%"
                />
                <ColorPicker
                  label="Texto do Perigo"
                  value={themeForm.danger_foreground}
                  onChange={(value) => setThemeForm(prev => ({ ...prev, danger_foreground: value }))}
                  placeholder="210 40% 98%"
                />
              </div>
            </div>

            {/* Cores de Risco - GRC Específico */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <Label className="text-base font-semibold">Cores de Risco GRC</Label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <ColorPicker
                  label="Risco Crítico"
                  value={themeForm.risk_critical || '0 84% 60%'}
                  onChange={(value) => setThemeForm(prev => ({ ...prev, risk_critical: value }))}
                  placeholder="0 84% 60%"
                />
                <ColorPicker
                  label="Risco Alto"
                  value={themeForm.risk_high || '24 95% 53%'}
                  onChange={(value) => setThemeForm(prev => ({ ...prev, risk_high: value }))}
                  placeholder="24 95% 53%"
                />
                <ColorPicker
                  label="Risco Médio"
                  value={themeForm.risk_medium || '38 92% 50%'}
                  onChange={(value) => setThemeForm(prev => ({ ...prev, risk_medium: value }))}
                  placeholder="38 92% 50%"
                />
                <ColorPicker
                  label="Risco Baixo"
                  value={themeForm.risk_low || '142 76% 36%'}
                  onChange={(value) => setThemeForm(prev => ({ ...prev, risk_low: value }))}
                  placeholder="142 76% 36%"
                />
              </div>
            </div>

            {/* Cores do Sidebar */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-blue-500" />
                <Label className="text-base font-semibold">Cores do Sidebar</Label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ColorPicker
                  label="Fundo do Sidebar"
                  value={themeForm.sidebar_background || '0 0% 98%'}
                  onChange={(value) => setThemeForm(prev => ({ ...prev, sidebar_background: value }))}
                  placeholder="0 0% 98%"
                />
                <ColorPicker
                  label="Texto do Sidebar"
                  value={themeForm.sidebar_foreground || '240 5.3% 26.1%'}
                  onChange={(value) => setThemeForm(prev => ({ ...prev, sidebar_foreground: value }))}
                  placeholder="240 5.3% 26.1%"
                />
                <ColorPicker
                  label="Item Ativo Sidebar"
                  value={themeForm.sidebar_primary || '240 5.9% 10%'}
                  onChange={(value) => setThemeForm(prev => ({ ...prev, sidebar_primary: value }))}
                  placeholder="240 5.9% 10%"
                />
                <ColorPicker
                  label="Bordas do Sidebar"
                  value={themeForm.sidebar_border || '220 13% 91%'}
                  onChange={(value) => setThemeForm(prev => ({ ...prev, sidebar_border: value }))}
                  placeholder="220 13% 91%"
                />
              </div>
            </div>

            {/* Preview e Comparação Dark/Light Mode */}
            {editingTheme?.is_native_theme && (
              <div className="space-y-4 p-4 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 rounded-lg border">
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-indigo-500" />
                  <Label className="text-base font-semibold">Preview Dark/Light Mode</Label>
                  <Badge variant="outline" className="text-xs">
                    UI Nativa
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Light Mode Preview */}
                  <div className="space-y-3">
                    <h5 className="font-medium text-sm flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-yellow-400 border-2 border-yellow-600"></div>
                      Light Mode
                    </h5>
                    <div className="p-4 rounded-lg border-2" style={{ backgroundColor: `hsl(${themeForm.background_color || '0 0% 100%'})` }}>
                      <div className="space-y-2">
                        <div 
                          className="p-3 rounded-md border shadow-sm"
                          style={{ 
                            backgroundColor: `hsl(${themeForm.card_color || '0 0% 100%'})`,
                            borderColor: `hsl(${themeForm.border_color || '214 32% 91%'})`
                          }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div 
                              className="w-3 h-3 rounded"
                              style={{ backgroundColor: `hsl(${themeForm.primary_color || '220 100% 50%'})` }}
                            ></div>
                            <span 
                              className="text-sm font-medium"
                              style={{ color: `hsl(${themeForm.foreground_color || '225 71% 12%'})` }}
                            >
                              Exemplo de Card
                            </span>
                          </div>
                          <p 
                            className="text-xs"
                            style={{ color: `hsl(${themeForm.foreground_color || '225 71% 12%'})` }}
                          >
                            Este é um preview do tema light mode.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dark Mode Preview */}
                  <div className="space-y-3">
                    <h5 className="font-medium text-sm flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-gray-800 border-2 border-gray-600"></div>
                      Dark Mode
                    </h5>
                    <div className="p-4 rounded-lg border-2" style={{ backgroundColor: 'hsl(222 14% 7%)' }}>
                      <div className="space-y-2">
                        <div 
                          className="p-3 rounded-md border shadow-sm"
                          style={{ 
                            backgroundColor: 'hsl(215 8% 12%)',
                            borderColor: 'hsl(215 10% 22%)'
                          }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div 
                              className="w-3 h-3 rounded"
                              style={{ backgroundColor: `hsl(${themeForm.primary_color || '220 100% 50%'})` }}
                            ></div>
                            <span className="text-sm font-medium text-white">
                              Exemplo de Card
                            </span>
                          </div>
                          <p className="text-xs text-gray-300">
                            Este é um preview do tema dark mode.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Configurações de Tipografia e Layout */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Type className="h-4 w-4 text-purple-500" />
                <Label className="text-base font-semibold">Tipografia e Layout</Label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Família da Fonte</Label>
                  <Select value={themeForm.font_family} onValueChange={(value) => setThemeForm(prev => ({ ...prev, font_family: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter">Inter</SelectItem>
                      <SelectItem value="Roboto">Roboto</SelectItem>
                      <SelectItem value="Open Sans">Open Sans</SelectItem>
                      <SelectItem value="Lato">Lato</SelectItem>
                      <SelectItem value="system-ui">System UI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tamanho Base da Fonte (px)</Label>
                  <Input
                    type="number"
                    value={themeForm.font_size_base}
                    onChange={(e) => setThemeForm(prev => ({ ...prev, font_size_base: parseInt(e.target.value) || 14 }))}
                    min="12"
                    max="20"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Raio das Bordas (px)</Label>
                  <Input
                    type="number"
                    value={themeForm.border_radius}
                    onChange={(e) => setThemeForm(prev => ({ ...prev, border_radius: parseInt(e.target.value) || 8 }))}
                    min="0"
                    max="20"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Intensidade da Sombra</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={themeForm.shadow_intensity}
                    onChange={(e) => setThemeForm(prev => ({ ...prev, shadow_intensity: parseFloat(e.target.value) || 0.1 }))}
                    min="0"
                    max="1"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowThemeDialog(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSaveTheme} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Salvando...' : (editingTheme ? 'Atualizar Tema' : 'Criar Tema')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GlobalRulesSection;