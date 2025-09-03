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
  Building,
  TestTube,
  FileCheck,
  ClipboardList,
  KeyRound
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
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth} from '@/contexts/AuthContextOptimized';
import { cn } from '@/lib/utils';
import { manualFixApplyTheme } from '@/utils/fixApplyTheme';

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
// MOCK_ROLES removido - sistema agora usa 100% dados do banco de dados

// Dados serão carregados do banco via Supabase
const MOCK_THEMES: ThemeConfig[] = [];

// Dados serão carregados do banco via Supabase
const MOCK_FONTS: FontConfig[] = [];

const AVAILABLE_PERMISSIONS = [
  // Assessments
  { id: 'assessment.read', name: 'Visualizar Assessments', category: 'Assessments' },
  { id: 'assessment.write', name: 'Gerenciar Assessments', category: 'Assessments' },
  
  // Auditoria
  { id: 'audit.read', name: 'Visualizar Auditoria', category: 'Auditoria' },
  { id: 'audit.write', name: 'Gerenciar Auditoria', category: 'Auditoria' },
  
  // Compliance
  { id: 'compliance.read', name: 'Visualizar Compliance', category: 'Compliance' },
  { id: 'compliance.write', name: 'Gerenciar Compliance', category: 'Compliance' },
  
  // Gestão de Riscos
  { id: 'risk.read', name: 'Visualizar Riscos', category: 'Riscos' },
  { id: 'risk.write', name: 'Gerenciar Riscos', category: 'Riscos' },
  
  // Incidentes
  { id: 'incident.read', name: 'Visualizar Incidentes', category: 'Incidentes' },
  { id: 'incident.write', name: 'Gerenciar Incidentes', category: 'Incidentes' },
  
  // Privacidade e LGPD
  { id: 'privacy.read', name: 'Visualizar Privacidade', category: 'Privacidade' },
  { id: 'privacy.write', name: 'Gerenciar Privacidade', category: 'Privacidade' },
  
  // Vendor Risk
  { id: 'vendor.read', name: 'Visualizar Vendor Risk', category: 'Vendor Risk' },
  { id: 'vendor.write', name: 'Gerenciar Vendor Risk', category: 'Vendor Risk' },
  
  // Relatórios
  { id: 'report.read', name: 'Visualizar Relatórios', category: 'Relatórios' },
  { id: 'report.write', name: 'Gerenciar Relatórios', category: 'Relatórios' },
  { id: 'report.export', name: 'Exportar Relatórios', category: 'Relatórios' },
  
  // Plataforma Adm
  { id: 'users.read', name: 'Visualizar Usuários', category: 'Plataforma Adm' },
  { id: 'users.write', name: 'Gerenciar Usuários', category: 'Plataforma Adm' },
  { id: 'users.delete', name: 'Excluir Usuários', category: 'Plataforma Adm' },
  { id: 'admin', name: 'Administrador', category: 'Plataforma Adm' },
  { id: 'tenants.read', name: 'Visualizar Tenants', category: 'Plataforma Adm' },
  { id: 'tenants.write', name: 'Gerenciar Tenants', category: 'Plataforma Adm' },
  { id: 'security.read', name: 'Visualizar Segurança', category: 'Plataforma Adm' },
  { id: 'security.write', name: 'Gerenciar Segurança', category: 'Plataforma Adm' },
  { id: 'vulnerabilities.read', name: 'Visualizar Vulnerabilidades', category: 'Plataforma Adm' },
  { id: 'logs.read', name: 'Visualizar Logs', category: 'Plataforma Adm' },
  { id: 'logs.write', name: 'Gerenciar Logs', category: 'Plataforma Adm' },
  { id: 'settings.read', name: 'Visualizar Configurações', category: 'Plataforma Adm' },
  { id: 'settings.write', name: 'Gerenciar Configurações', category: 'Plataforma Adm' },
  { id: 'all', name: 'Todas as Permissões', category: 'Plataforma Adm' },
  { id: 'platform_admin', name: 'Administrador da Plataforma', category: 'Plataforma Adm' }
];



// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const GlobalRulesSection: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('roles');
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados para Roles
  const [roles, setRoles] = useState<CustomRole[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true); // Iniciar como true
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
    // Carregar dados imediatamente
    loadRoles(); // Carregar roles do banco de dados primeiro
    
    // Carregar outros dados com delay menor
    const timer = setTimeout(() => {
      loadThemes();
      loadFonts();
      loadTenants(); // Carregar tenants para configuração por tenant
    }, 500); // Delay menor para outros dados

    return () => clearTimeout(timer);
  }, []);

  // Efeito para aplicar tema na inicialização - REATIVADO com preservação do dark mode
  useEffect(() => {
    if (activeTheme && !activeTheme.is_native_theme) {
      console.log('Tema customizado detectado:', activeTheme.name);
      console.log('🎨 Aplicando tema automaticamente com preservação do dark mode');
      // applyThemeColors(activeTheme); // DESABILITADO
    } else if (activeTheme?.is_native_theme) {
      console.log('✅ Tema nativo ativo - preservando cores CSS originais e dark mode nativo');
      // Para tema nativo, aplicar cores mas preservar dark mode
      // applyThemeColors(activeTheme); // DESABILITADO
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
            // applyThemeColors(activeTheme); // DESABILITADO
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
      toast({
        title: 'Erro',
        description: 'Erro ao carregar temas',
        variant: 'destructive'
      });
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
      toast({
        title: 'Erro',
        description: 'Erro ao carregar fontes',
        variant: 'destructive'
      });
    } finally {
      setLoadingFonts(false);
    }
  };

  // ============================================================================
  // FUNÇÕES PARA GERENCIAMENTO DE ROLES
  // ============================================================================
  
  const loadRoles = async () => {
    try {
      setLoadingRoles(true);
      console.log('💾 [GLOBAL RULES] Carregando roles do banco de dados...');
      
      const { data: customRoles, error } = await supabase
        .from('custom_roles')
        .select('*')
        .eq('is_active', true)
        .order('is_system', { ascending: false })
        .order('created_at', { ascending: true });

      console.log('🔍 [DEBUG] Query result:', { data: customRoles, error });

      if (error) {
        console.error('❌ Erro ao carregar roles:', error);
        toast({
          title: 'Erro',
          description: `Erro ao carregar roles: ${error.message}`,
          variant: 'destructive'
        });
        return;
      }

      console.log(`✅ [GLOBAL RULES] ${customRoles?.length || 0} roles carregadas do banco`);
      console.log('📊 [GLOBAL RULES] Roles do banco:', customRoles);
      
      // Converter para formato CustomRole
      const convertedRoles: CustomRole[] = (customRoles || []).map(role => ({
        id: role.id,
        name: role.name,
        display_name: role.display_name,
        description: role.description || '',
        permissions: role.permissions || [],
        color: role.color,
        icon: role.icon || 'Users',
        is_system: role.is_system || false,
        is_active: role.is_active || true,
        created_at: role.created_at || new Date().toISOString(),
        updated_at: role.updated_at || new Date().toISOString()
      }));
      
      console.log('🔄 [DEBUG] Converted roles:', convertedRoles);
      
      // Usar apenas roles do banco de dados
      setRoles(convertedRoles);
      console.log(`🎯 [GLOBAL RULES] ${convertedRoles.length} roles definidas no estado`);
      
      if (convertedRoles.length > 0) {
        toast({
          title: 'Sucesso',
          description: `${convertedRoles.length} roles carregadas do banco de dados`
        });
      } else {
        console.log('⚠️ [WARNING] Nenhuma role encontrada no banco');
      }
      
    } catch (error) {
      console.error('❌ Erro inesperado ao carregar roles:', error);
      toast({
        title: 'Erro',
        description: 'Erro inesperado ao carregar roles',
        variant: 'destructive'
      });
    } finally {
      setLoadingRoles(false);
    }
  };
  
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
    // Verificar se é uma role do sistema
    if (role.is_system) {
      toast({
        title: 'Informação',
        description: 'Roles do sistema não podem ser editadas. Elas são gerenciadas automaticamente pela plataforma.',
        variant: 'default'
      });
      return;
    }
    
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
      // Verificar se é uma role do sistema
      if (editingRole && editingRole.is_system) {
        toast({
          title: 'Erro',
          description: 'Roles do sistema não podem ser editadas',
          variant: 'destructive'
        });
        setIsLoading(false);
        return;
      }
      
      if (editingRole) {
        // Atualizar role existente no banco
        const { error } = await supabase
          .from('custom_roles')
          .update({
            name: roleForm.name,
            display_name: roleForm.display_name,
            description: roleForm.description,
            permissions: roleForm.permissions,
            color: roleForm.color,
            icon: roleForm.icon,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingRole.id);

        if (error) {
          console.error('Erro ao atualizar role:', error);
          toast({
            title: 'Erro',
            description: 'Erro ao atualizar role no banco de dados',
            variant: 'destructive'
          });
          return;
        }

        // Atualizar estado local
        setRoles(prev => prev.map(r => 
          r.id === editingRole.id 
            ? { ...r, ...roleForm, updated_at: new Date().toISOString() }
            : r
        ));
        toast({
          title: 'Sucesso',
          description: 'Role atualizada com sucesso!'
        });
      } else {
        // Criar nova role no banco
        const { data, error } = await supabase
          .from('custom_roles')
          .insert({
            name: roleForm.name,
            display_name: roleForm.display_name,
            description: roleForm.description,
            permissions: roleForm.permissions,
            color: roleForm.color,
            icon: roleForm.icon,
            is_system: false,
            is_active: true
          })
          .select()
          .single();

        if (error) {
          console.error('Erro ao criar role:', error);
          toast({
            title: 'Erro',
            description: 'Erro ao criar role no banco de dados',
            variant: 'destructive'
          });
          return;
        }

        // Adicionar ao estado local
        const newRole: CustomRole = {
          id: data.id,
          name: data.name,
          display_name: data.display_name,
          description: data.description || '',
          permissions: data.permissions || [],
          color: data.color,
          icon: data.icon || 'Users',
          is_system: false,
          is_active: true,
          created_at: data.created_at,
          updated_at: data.updated_at
        };
        setRoles(prev => [...prev, newRole]);
        toast({
          title: 'Sucesso',
          description: 'Role criada com sucesso!'
        });
      }
      setShowRoleDialog(false);
      
      // Notificar outros componentes sobre a atualização
      window.dispatchEvent(new CustomEvent('rolesUpdated'));
      
    } catch (error) {
      console.error('Erro inesperado ao salvar role:', error);
      toast({
        title: 'Erro',
        description: 'Erro inesperado ao salvar role',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteRole = async (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return;
    
    if (role.is_system) {
      toast({
        title: 'Erro',
        description: 'Não é possível excluir roles do sistema',
        variant: 'destructive'
      });
      return;
    }
    
    if (confirm(`Tem certeza que deseja excluir a role "${role.display_name}"?`)) {
      try {
        // Deletar do banco
        const { error } = await supabase
          .from('custom_roles')
          .delete()
          .eq('id', roleId);

        if (error) {
          console.error('Erro ao deletar role:', error);
          toast({
            title: 'Erro',
            description: 'Erro ao deletar role do banco de dados',
            variant: 'destructive'
          });
          return;
        }

        // Remover do estado local
        setRoles(prev => prev.filter(r => r.id !== roleId));
        toast({
          title: 'Sucesso',
          description: 'Role excluída com sucesso!'
        });
        
        // Notificar outros componentes sobre a atualização
        window.dispatchEvent(new CustomEvent('rolesUpdated'));
        
      } catch (error) {
        console.error('Erro inesperado ao deletar role:', error);
        toast({
          title: 'Erro',
          description: 'Erro inesperado ao deletar role',
          variant: 'destructive'
        });
      }
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

  // ============================================================================
  // FUNÇÕES PLACEHOLDER PARA TEMAS
  // ============================================================================
  
  const handleExportTheme = (theme: ThemeConfig) => {
    console.log('Exportando tema:', theme.name);
    // TODO: Implementar exportação de tema
    toast({
      title: 'Info',
      description: 'Funcionalidade de exportação será implementada em breve'
    });
  };

  const handleSaveTheme = () => {
    console.log('Salvando tema...');
    // TODO: Implementar salvamento de tema
    toast({
      title: 'Info',
      description: 'Funcionalidade de salvamento será implementada em breve'
    });
    setShowThemeDialog(false);
  };

  const handleApplyTheme = (theme: ThemeConfig) => {
    console.log('Aplicando tema:', theme.name);
    // TODO: Implementar aplicação de tema
    toast({
      title: 'Info',
      description: 'Funcionalidade de aplicação será implementada em breve'
    });
  };

  const handleEditTheme = (theme: ThemeConfig) => {
    console.log('Editando tema:', theme.name);
    setEditingTheme(theme);
    setShowThemeDialog(true);
  };

  const handleDuplicateTheme = (theme: ThemeConfig) => {
    console.log('Duplicando tema:', theme.name);
    // TODO: Implementar duplicação de tema
    toast({
      title: 'Info',
      description: 'Funcionalidade de duplicação será implementada em breve'
    });
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Roles & Permissões
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
            <div className="flex items-center gap-2">
              <Button onClick={() => loadRoles()} variant="outline" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Atualizar
              </Button>
              <Button onClick={handleCreateRole} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nova Role
              </Button>
            </div>
          </div>

          {/* Card de Integração com Teste de Roles */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 dark:from-blue-950/30 dark:to-indigo-950/30 dark:border-blue-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TestTube className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <CardTitle className="text-base text-blue-900 dark:text-blue-100">Teste de Roles em Tempo Real</CardTitle>
                </div>
                <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700">
                  Integrado
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  As roles criadas aqui são automaticamente sincronizadas com o sistema de teste de roles no sidebar.
                  Platform Admins podem testar qualquer role em tempo real.
                </p>
                <div className="flex items-center gap-4 text-xs text-blue-700 dark:text-blue-300">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Sincronização automática</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Teste em tempo real</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Permissões dinâmicas</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {loadingRoles ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Carregando roles do banco de dados...</p>
              </div>
            </div>
          ) : roles.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma role encontrada</h3>
                <p className="text-muted-foreground mb-4">
                  Não há roles cadastradas no banco de dados.
                </p>
                <Button onClick={handleCreateRole} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Criar primeira role
                </Button>
              </div>
            </div>
          ) : (
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
                      disabled={role.is_system}
                      className="flex-1"
                      title={role.is_system ? 'Roles do sistema não podem ser editadas' : ''}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      {role.is_system ? 'Sistema' : 'Editar'}
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
                Configure fontes personalizadas para a plataforma
              </p>
            </div>
            <Button onClick={() => setShowFontDialog(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova Fonte
            </Button>
          </div>

          {loadingFonts ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Carregando fontes...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {fonts.map((font) => (
                <Card key={font.id} className="relative group hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Type className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base" style={{ fontFamily: font.family }}>
                            {font.display_name}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground">{font.family}</p>
                        </div>
                      </div>
                      {font.is_active && (
                        <Badge variant="default" className="text-xs">
                          Ativa
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm" style={{ fontFamily: font.family }}>
                      The quick brown fox jumps over the lazy dog
                    </div>
                    
                    <div>
                      <p className="text-xs font-medium mb-2">Pesos disponíveis:</p>
                      <div className="flex flex-wrap gap-1">
                        {font.font_weights.slice(0, 4).map((weight) => (
                          <Badge key={weight} variant="secondary" className="text-xs">
                            {weight}
                          </Badge>
                        ))}
                        {font.font_weights.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{font.font_weights.length - 4}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 pt-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                      {!font.is_system_font && (
                        <Button 
                          size="sm" 
                          variant="outline" 
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
          )}
        </TabsContent>





          {loadingThemes && (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              <span>Carregando temas...</span>
            </div>
          )}



        {/* ============================================================================ */}
        {/* TAB: FONTES */}
        {/* ============================================================================ */}

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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                style={{ backgroundColor: roleForm.color }}
              >
                <Users className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xl font-bold">
                  {editingRole ? 'Editar Role' : 'Criar Nova Role'}
                </div>
                <div className="text-sm text-muted-foreground font-normal">
                  {editingRole ? `Modificando: ${editingRole.display_name}` : 'Configure as permissões e propriedades da nova role'}
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="basic" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Informações Básicas
                </TabsTrigger>
                <TabsTrigger value="permissions" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Permissões ({roleForm.permissions.length})
                </TabsTrigger>
              </TabsList>

              {/* Tab: Informações Básicas */}
              <TabsContent value="basic" className="space-y-6 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Detalhes da Role
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Nome da Role *</Label>
                        <Input
                          value={roleForm.name}
                          onChange={(e) => setRoleForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="ex: security_analyst"
                          className="h-10"
                        />
                        <p className="text-xs text-muted-foreground">Nome único usado internamente (sem espaços)</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Nome de Exibição *</Label>
                        <Input
                          value={roleForm.display_name}
                          onChange={(e) => setRoleForm(prev => ({ ...prev, display_name: e.target.value }))}
                          placeholder="ex: Analista de Segurança"
                          className="h-10"
                        />
                        <p className="text-xs text-muted-foreground">Nome amigável exibido na interface</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Descrição</Label>
                      <Textarea
                        value={roleForm.description}
                        onChange={(e) => setRoleForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Descreva as responsabilidades e escopo desta role..."
                        rows={3}
                        className="resize-none"
                      />
                      <p className="text-xs text-muted-foreground">Explique o propósito e responsabilidades desta role</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Palette className="h-5 w-5" />
                      Aparência
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Cor</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="color"
                            value={roleForm.color}
                            onChange={(e) => setRoleForm(prev => ({ ...prev, color: e.target.value }))}
                            className="w-12 h-9 p-1 border"
                          />
                          <Input
                            value={roleForm.color}
                            onChange={(e) => setRoleForm(prev => ({ ...prev, color: e.target.value }))}
                            placeholder="#3b82f6"
                            className="h-9 font-mono text-sm"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Ícone</Label>
                        <Select value={roleForm.icon} onValueChange={(value) => setRoleForm(prev => ({ ...prev, icon: value }))}>
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Users">👥 Usuários</SelectItem>
                            <SelectItem value="Shield">🛡️ Escudo</SelectItem>
                            <SelectItem value="Zap">⚡ Raio</SelectItem>
                            <SelectItem value="Star">⭐ Estrela</SelectItem>
                            <SelectItem value="Crown">👑 Coroa</SelectItem>
                            <SelectItem value="Eye">👁️ Olho</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Preview</Label>
                        <div className="p-3 border rounded-lg bg-muted/30">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-7 h-7 rounded-md flex items-center justify-center text-white shadow-sm"
                              style={{ backgroundColor: roleForm.color }}
                            >
                              <Users className="h-3.5 w-3.5" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-sm truncate">{roleForm.display_name || 'Nome da Role'}</div>
                              <div className="text-xs text-muted-foreground truncate">{roleForm.name || 'nome_da_role'}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab: Permissões */}
              <TabsContent value="permissions" className="space-y-4 mt-0">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">Permissões da Role</h3>
                    <p className="text-sm text-muted-foreground">
                      Selecione as permissões que esta role deve ter. {roleForm.permissions.length} permissões selecionadas.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setRoleForm(prev => ({ ...prev, permissions: [] }))}
                    >
                      Limpar Todas
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setRoleForm(prev => ({ ...prev, permissions: AVAILABLE_PERMISSIONS.map(p => p.id) }))}
                    >
                      Selecionar Todas
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {Object.entries(
                    AVAILABLE_PERMISSIONS.reduce((acc, perm) => {
                      if (!acc[perm.category]) acc[perm.category] = [];
                      acc[perm.category].push(perm);
                      return acc;
                    }, {} as Record<string, typeof AVAILABLE_PERMISSIONS>)
                  ).map(([category, permissions]) => {
                    const selectedInCategory = permissions.filter(p => roleForm.permissions.includes(p.id)).length;
                    const totalInCategory = permissions.length;
                    
                    return (
                      <Card key={category} className="h-fit">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base flex items-center gap-2">
                              {category === 'Assessments' && <ClipboardList className="h-4 w-4" />}
                              {category === 'Auditoria' && <Eye className="h-4 w-4" />}
                              {category === 'Compliance' && <FileCheck className="h-4 w-4" />}
                              {category === 'Riscos' && <AlertTriangle className="h-4 w-4" />}
                              {category === 'Incidentes' && <Zap className="h-4 w-4" />}
                              {category === 'Privacidade' && <KeyRound className="h-4 w-4" />}
                              {category === 'Vendor Risk' && <Users className="h-4 w-4" />}
                              {category === 'Relatórios' && <BarChart3 className="h-4 w-4" />}
                              {category === 'Plataforma Adm' && <Crown className="h-4 w-4" />}
                              {!['Assessments', 'Auditoria', 'Compliance', 'Riscos', 'Incidentes', 'Privacidade', 'Vendor Risk', 'Relatórios', 'Plataforma Adm'].includes(category) && <FileCheck className="h-4 w-4" />}
                              {category}
                            </CardTitle>
                            <Badge variant={selectedInCategory > 0 ? 'default' : 'secondary'} className="text-xs">
                              {selectedInCategory}/{totalInCategory}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {permissions.map((permission) => (
                            <div key={permission.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                              <Checkbox
                                id={permission.id}
                                checked={roleForm.permissions.includes(permission.id)}
                                onCheckedChange={() => toggleRolePermission(permission.id)}
                                className="mt-0.5"
                              />
                              <div className="flex-1 min-w-0">
                                <Label htmlFor={permission.id} className="text-sm font-medium cursor-pointer">
                                  {permission.name}
                                </Label>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {permission.id}
                                </p>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter className="pt-4 border-t">
            <div className="flex items-center justify-between w-full">
              <div className="text-sm text-muted-foreground">
                {roleForm.permissions.length} permissões selecionadas
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button onClick={handleSaveRole} disabled={isLoading || !roleForm.name || !roleForm.display_name}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Salvando...' : (editingRole ? 'Atualizar Role' : 'Criar Role')}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================================ */}

    </div>
  );
};

export default GlobalRulesSection;