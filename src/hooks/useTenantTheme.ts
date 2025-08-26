import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ColorPalette {
  primary: string;
  secondary: string;
  tertiary: string;
}

interface TenantThemeConfig {
  palette: ColorPalette;
  dark_mode_palette?: ColorPalette;
  inherit_global: boolean;
  custom_theme_id?: string;
}

export const useTenantTheme = () => {
  const authContext = useAuth();
  
  // Verificar se o contexto está disponível
  if (!authContext) {
    console.warn('useTenantTheme: AuthContext não disponível');
    return {
      tenantTheme: null,
      loading: false,
      loadTenantTheme: () => Promise.resolve(),
      applyTenantColors: () => Promise.resolve(),
      notifyThemeUpdate: () => {}
    };
  }
  
  const { user, isLoading: authLoading } = authContext;
  const [tenantTheme, setTenantTheme] = useState<TenantThemeConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Não executar nada se o auth ainda estiver carregando
  const shouldExecute = !authLoading && user?.tenantId;

  // Função para buscar cores do tema UI Nativa
  const getNativeThemeColors = async (): Promise<ColorPalette> => {
    try {
      console.log('🏠 useTenantTheme: Buscando cores do tema UI Nativa...');
      
      const { data: nativeTheme, error } = await supabase
        .from('global_ui_themes')
        .select('*')
        .or('name.eq.ui_nativa,display_name.ilike.%UI Nativa%')
        .eq('is_native_theme', true)
        .single();
      
      if (error || !nativeTheme) {
        console.warn('⚠️ useTenantTheme: Tema UI Nativa não encontrado, usando cores padrão');
        return {
          primary: '#3b82f6',
          secondary: '#6b7280', 
          tertiary: '#10b981'
        };
      }
      
      console.log('✅ useTenantTheme: Tema UI Nativa encontrado:', nativeTheme.display_name);
      
      // Converter cores HSL para HEX se necessário
      const hslToHex = (hsl: string): string => {
        if (!hsl || hsl.startsWith('#')) return hsl || '#3b82f6';
        
        try {
          const match = hsl.match(/(\d+\.?\d*)\s+(\d+\.?\d*)%\s+(\d+\.?\d*)%/);
          if (!match) return '#3b82f6';
          
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
          return '#3b82f6';
        }
      };
      
      return {
        primary: hslToHex(nativeTheme.primary_color),
        secondary: hslToHex(nativeTheme.secondary_color),
        tertiary: hslToHex(nativeTheme.accent_color)
      };
    } catch (error) {
      console.error('❌ useTenantTheme: Erro ao buscar tema UI Nativa:', error);
      return {
        primary: '#3b82f6',
        secondary: '#6b7280',
        tertiary: '#10b981'
      };
    }
  };

  // Função para aplicar cores do tenant
  const applyTenantColors = useCallback(async (themeConfig: TenantThemeConfig) => {
    const root = document.documentElement;
    
    console.log('🎨 useTenantTheme: Aplicando cores do tenant:', {
      inherit_global: themeConfig.inherit_global,
      palette: themeConfig.palette,
      dark_mode_palette: themeConfig.dark_mode_palette
    });
    
    if (themeConfig.inherit_global) {
      // Se herda global, buscar e aplicar cores do tema UI Nativa
      console.log('🌍 useTenantTheme: Aplicando cores globais (herança ativa)');
      
      try {
        const nativeColors = await getNativeThemeColors();
        console.log('🏠 useTenantTheme: Cores do tema UI Nativa obtidas:', nativeColors);
        
        // Aplicar cores do tema UI Nativa
        const hexToHsl = (hex: string): string => {
          if (!hex || !hex.startsWith('#')) return hex;
          
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
            return hex;
          }
        };
        
        // Aplicar cores com !important
        const applyColorWithImportant = (property: string, value: string) => {
          const hslValue = value.startsWith('#') ? hexToHsl(value) : value;
          root.style.setProperty(property, hslValue, 'important');
        };
        
        applyColorWithImportant('--primary', nativeColors.primary);
        applyColorWithImportant('--secondary', nativeColors.secondary);
        applyColorWithImportant('--accent', nativeColors.tertiary);
        
        // Aplicar variações da cor primária
        const primaryHsl = hexToHsl(nativeColors.primary);
        const [h, s, l] = primaryHsl.split(' ').map(v => parseFloat(v.replace('%', '')));
        
        applyColorWithImportant('--primary-hover', `${h} ${s}% ${Math.max(l - 4, 0)}%`);
        applyColorWithImportant('--primary-glow', `${h} ${Math.min(s + 17, 100)}% ${Math.min(l + 20, 100)}%`);
        applyColorWithImportant('--ring', primaryHsl);
        
        console.log('✅ useTenantTheme: Cores do tema UI Nativa aplicadas com sucesso!');
        
        return;
      } catch (error) {
        console.error('❌ useTenantTheme: Erro ao aplicar cores do tema UI Nativa:', error);
        return;
      }
    }
    
    // Aplicar cores personalizadas do tenant
    const isDarkMode = root.classList.contains('dark');
    const currentPalette = isDarkMode && themeConfig.dark_mode_palette 
      ? themeConfig.dark_mode_palette 
      : themeConfig.palette;
    
    console.log('🎭 useTenantTheme: Aplicando cores personalizadas do tenant:', {
      darkMode: isDarkMode,
      palette: currentPalette
    });
    
    // Converter HEX para HSL se necessário
    const hexToHsl = (hex: string): string => {
      if (!hex || !hex.startsWith('#')) return hex;
      
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
        return hex;
      }
    };
    
    // Aplicar cores com !important para garantir que sobrescrevam
    const applyColorWithImportant = (property: string, value: string) => {
      const hslValue = value.startsWith('#') ? hexToHsl(value) : value;
      root.style.setProperty(property, hslValue, 'important');
    };
    
    // Aplicar cores principais
    applyColorWithImportant('--primary', currentPalette.primary);
    applyColorWithImportant('--secondary', currentPalette.secondary);
    applyColorWithImportant('--accent', currentPalette.tertiary);
    
    // Aplicar variações da cor primária
    const primaryHsl = hexToHsl(currentPalette.primary);
    const [h, s, l] = primaryHsl.split(' ').map(v => parseFloat(v.replace('%', '')));
    
    applyColorWithImportant('--primary-hover', `${h} ${s}% ${Math.max(l - 4, 0)}%`);
    applyColorWithImportant('--primary-glow', `${h} ${Math.min(s + 17, 100)}% ${Math.min(l + 20, 100)}%`);
    applyColorWithImportant('--ring', primaryHsl);
    
    console.log('✅ useTenantTheme: Cores do tenant aplicadas com sucesso!');
    
    // Salvar no localStorage para persistir durante a sessão
    localStorage.setItem('tenant-theme-applied', JSON.stringify({
      tenantId: user?.tenantId,
      themeConfig,
      appliedAt: Date.now()
    }));
  }, [user?.tenantId]);

  // Função para carregar tema do tenant
  const loadTenantTheme = useCallback(async () => {
    if (!user?.tenantId) {
      console.log('⚠️ useTenantTheme: Usuário sem tenantId, não carregando tema');
      return;
    }

    setLoading(true);
    try {
      console.log('🔍 useTenantTheme: Carregando tema do tenant:', user.tenantId);
      
      // Carregar dados do tenant
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .select('settings')
        .eq('id', user.tenantId)
        .single();

      if (tenantError) {
        console.error('❌ useTenantTheme: Erro ao carregar dados do tenant:', tenantError);
        return;
      }

      // Processar configuração de tema do tenant
      const themeConfig = tenantData?.settings?.theme_config;
      
      if (themeConfig) {
        console.log('✅ useTenantTheme: Configuração de tema encontrada:', themeConfig);
        
        const tenantThemeConfig: TenantThemeConfig = {
          palette: themeConfig.palette || { primary: '#3b82f6', secondary: '#6b7280', tertiary: '#10b981' },
          dark_mode_palette: themeConfig.dark_mode_palette,
          inherit_global: themeConfig.inherit_global ?? true,
          custom_theme_id: themeConfig.custom_theme_id
        };
        
        setTenantTheme(tenantThemeConfig);
        
        // Aplicar as cores automaticamente
        await applyTenantColors(tenantThemeConfig);
        
        console.log('🎨 useTenantTheme: Tema do tenant carregado e aplicado com sucesso!');
      } else {
        console.log('ℹ️ useTenantTheme: Nenhuma configuração de tema encontrada, usando herança global');
        
        // Se não há configuração específica, usar herança global
        const defaultConfig: TenantThemeConfig = {
          palette: { primary: '#3b82f6', secondary: '#6b7280', tertiary: '#10b981' },
          inherit_global: true
        };
        
        setTenantTheme(defaultConfig);
        await applyTenantColors(defaultConfig);
      }
    } catch (error) {
      console.error('❌ useTenantTheme: Erro ao carregar tema do tenant:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.tenantId, applyTenantColors]);

  // Carregar tema do tenant quando o usuário fizer login
  useEffect(() => {
    if (shouldExecute) {
      console.log('👤 useTenantTheme: Usuário logado, carregando tema do tenant:', user.tenantId);
      loadTenantTheme();
    }
  }, [shouldExecute]); // Usar shouldExecute para evitar execução desnecessária
  
  // Escutar eventos de atualização de tema do tenant
  useEffect(() => {
    if (!shouldExecute) return;
    
    const handleTenantThemeUpdate = (event: CustomEvent) => {
      console.log('🔄 useTenantTheme: Recebido evento de atualização de tema do tenant:', event.detail);
      
      if (event.detail?.tenantId === user?.tenantId) {
        console.log('🎨 useTenantTheme: Recarregando tema do tenant após atualização');
        loadTenantTheme();
      }
    };
    
    window.addEventListener('tenantThemeUpdated', handleTenantThemeUpdate as EventListener);
    
    return () => {
      window.removeEventListener('tenantThemeUpdated', handleTenantThemeUpdate as EventListener);
    };
  }, [shouldExecute]); // Usar shouldExecute

  // Reaplicar cores quando o modo escuro mudar
  useEffect(() => {
    const handleThemeChange = () => {
      if (tenantTheme) {
        console.log('🌙 useTenantTheme: Modo escuro alterado, reaplicando cores do tenant');
        applyTenantColors(tenantTheme);
      }
    };

    // Escutar mudanças de tema
    window.addEventListener('themeChange', handleThemeChange);
    
    return () => {
      window.removeEventListener('themeChange', handleThemeChange);
    };
  }, [tenantTheme]); // Remover applyTenantColors da dependência
  
  // Verificar periodicamente se as cores ainda estão aplicadas
  useEffect(() => {
    // Limpar interval anterior se existir
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (shouldExecute && tenantTheme) {
      intervalRef.current = setInterval(() => {
        const root = document.documentElement;
        const currentPrimary = getComputedStyle(root).getPropertyValue('--primary').trim();
        
        // Se as cores foram removidas ou alteradas, reaplicar
        if (!currentPrimary || currentPrimary === '') {
          console.log('🔧 useTenantTheme: Cores do tenant perdidas, reaplicando...');
          applyTenantColors(tenantTheme);
        }
      }, 5000); // Verificar a cada 5 segundos
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [shouldExecute, tenantTheme]); // Usar shouldExecute

  // Função para disparar evento de atualização
  const notifyThemeUpdate = useCallback((tenantId: string) => {
    window.dispatchEvent(new CustomEvent('tenantThemeUpdated', {
      detail: { tenantId }
    }));
  }, []);

  return {
    tenantTheme,
    loading,
    loadTenantTheme,
    applyTenantColors,
    notifyThemeUpdate
  };
};