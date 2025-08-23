
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider as NextThemeProvider, useTheme as useNextTheme } from 'next-themes';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { useCustomTheme } from '@/hooks/useTheme';

interface ColorPalette {
  primary: string;
  secondary: string;
  tertiary: string;
}

interface ThemePreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  colorPalette: ColorPalette;
  notifications?: {
    email?: boolean;
    push?: boolean;
    security?: boolean;
    updates?: boolean;
  };
  privacy?: {
    showEmail?: boolean;
    showActivity?: boolean;
  };
}

interface ThemeContextType {
  preferences: ThemePreferences;
  setPreferences: React.Dispatch<React.SetStateAction<ThemePreferences>>;
  savePreferences: () => Promise<void>;
  saving: boolean;
  theme: string | undefined;
  setTheme: (theme: string) => void;
  systemTheme: string | undefined;
  resolvedTheme: string | undefined;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const ThemeContextInner: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { theme, setTheme, systemTheme, resolvedTheme } = useNextTheme();
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [preferences, setPreferences] = useState<ThemePreferences>({
    theme: 'system',
    language: 'pt-BR',
    colorPalette: {
      primary: '#0e2954',
      secondary: '#7e22ce',
      tertiary: '#be185d',
    },
    notifications: {
      email: true,
      push: true,
      security: true,
      updates: true,
    },
    privacy: {
      showEmail: false,
      showActivity: false,
    },
  });

  // Ensure component is mounted before accessing theme
  useEffect(() => {
    setMounted(true);
  }, []);

  // Apply custom theme colors with priority: tenant theme > user preferences > global theme > default
  useEffect(() => {
    if (mounted && user) {
      // Wait a bit for next-themes to establish the theme
      const timer = setTimeout(() => {
        // PRIORIDADE 1: Verificar se há tema do tenant aplicado
        const tenantThemeApplied = localStorage.getItem('tenant-theme-applied');
        
        if (tenantThemeApplied) {
          try {
            const parsed = JSON.parse(tenantThemeApplied);
            if (parsed.tenantId === user.tenantId && (Date.now() - parsed.appliedAt) < 60000) {
              console.log('🏢 ThemeContext: Tema do tenant já aplicado, não sobrescrever');
              return;
            }
          } catch (e) {
            console.warn('ThemeContext: Erro ao parsear tenant theme', e);
          }
        }
        
        // PRIORIDADE 2: Check if user has saved preferences in localStorage
        const savedTheme = localStorage.getItem('grc-theme-preferences');
        
        if (savedTheme) {
          try {
            const parsed = JSON.parse(savedTheme);
            if (parsed.colorPalette) {
              // Apply colors from user preferences only if no tenant theme
              console.log('👤 ThemeContext: Aplicando preferências do usuário (sem tema do tenant)');
              applyCustomColors(parsed.colorPalette);
            }
          } catch (e) {
            console.warn('ThemeContext: Erro ao parsear preferences', e);
            // Se falhar ao parsear, aplicar tema global
            loadAndApplyGlobalTheme();
          }
        } else {
          // PRIORIDADE 3: NÃO aplicar tema global automaticamente para evitar conflito
          console.log('🎨 ThemeContext: Nenhuma preferência encontrada - deixando TenantThemeLoader e GlobalRulesSection gerenciar');
          // loadAndApplyGlobalTheme(); // DESABILITADO para evitar conflito
        }
      }, 1500); // Increased delay to allow TenantThemeLoader to apply themes first
      
      return () => clearTimeout(timer);
    }
  }, [mounted, user]); // Remove preferences.colorPalette dependency to avoid infinite loop
  
  // Listen for theme changes from GlobalRulesSection
  useEffect(() => {
    const handleGlobalThemeChange = (event: CustomEvent) => {
      console.log('🌍 ThemeContext: Recebido evento de mudança de tema global:', event.detail);
      console.log('⚠️ ThemeContext: Deixando GlobalRulesSection gerenciar aplicação de tema');
      console.log('💡 ThemeContext: Evitando conflito de aplicação dupla');
      
      // NÃO aplicar tema automaticamente - GlobalRulesSection já gerencia isso
    };
    
    const handleApplyGlobalTheme = (event: CustomEvent) => {
      console.log('🎨 ThemeContext: Recebido pedido para aplicar tema global:', event.detail);
      
      // Aplicar tema global quando solicitado pelo tenant
      setTimeout(() => {
        loadAndApplyGlobalTheme();
      }, 100);
    };
    
    window.addEventListener('globalThemeChanged', handleGlobalThemeChange as EventListener);
    window.addEventListener('applyGlobalTheme', handleApplyGlobalTheme as EventListener);
    
    return () => {
      window.removeEventListener('globalThemeChanged', handleGlobalThemeChange as EventListener);
      window.removeEventListener('applyGlobalTheme', handleApplyGlobalTheme as EventListener);
    };
  }, []);
  
  // Helper function to apply custom colors considering dark mode
  const applyCustomColors = (colorPalette: ColorPalette) => {
    const primaryHSL = hexToHSL(colorPalette.primary);
    const secondaryHSL = hexToHSL(colorPalette.secondary);
    const tertiaryHSL = hexToHSL(colorPalette.tertiary);
    
    const root = document.documentElement;
    const isDarkMode = root.classList.contains('dark');
    
    console.log('🎨 ThemeContext: Aplicando cores personalizadas', {
      darkMode: isDarkMode,
      originalColors: {
        primary: colorPalette.primary,
        secondary: colorPalette.secondary,
        tertiary: colorPalette.tertiary
      }
    });
    
    // Only apply primary colors, let CSS handle background/foreground for dark mode
    root.style.setProperty('--primary', `${primaryHSL[0]} ${primaryHSL[1]}% ${primaryHSL[2]}%`, 'important');
    root.style.setProperty('--secondary', `${secondaryHSL[0]} ${secondaryHSL[1]}% ${secondaryHSL[2]}%`, 'important');
    root.style.setProperty('--accent', `${tertiaryHSL[0]} ${tertiaryHSL[1]}% ${tertiaryHSL[2]}%`, 'important');
    root.style.setProperty('--primary-hover', `${primaryHSL[0]} ${primaryHSL[1]}% ${Math.max(primaryHSL[2] - 4, 0)}%`, 'important');
    root.style.setProperty('--primary-glow', `${primaryHSL[0]} ${Math.min(primaryHSL[1] + 17, 100)}% ${Math.min(primaryHSL[2] + 20, 100)}%`, 'important');
    
    // DO NOT override background, foreground, border, or muted colors
    // These are handled by the CSS dark mode rules
    
    console.log('✅ ThemeContext: Cores aplicadas sem interferir no dark mode', {
      darkMode: isDarkMode,
      appliedColors: {
        primary: `${primaryHSL[0]} ${primaryHSL[1]}% ${primaryHSL[2]}%`,
        secondary: `${secondaryHSL[0]} ${secondaryHSL[1]}% ${secondaryHSL[2]}%`,
        accent: `${tertiaryHSL[0]} ${tertiaryHSL[1]}% ${tertiaryHSL[2]}%`
      }
    });
  };

  const loadAndApplyGlobalTheme = async () => {
    try {
      // Verificar se cores foram aplicadas recentemente pelo GlobalRulesSection
      const lastThemeChange = window.localStorage.getItem('lastThemeChangeTime');
      const now = Date.now();
      
      // Permitir aplicação se for solicitada por tenant (bypass do timeout)
      const tenantThemeApplied = window.localStorage.getItem('tenant-theme-applied');
      const isTenantRequest = tenantThemeApplied && (now - JSON.parse(tenantThemeApplied).appliedAt) < 1000;
      
      if (!isTenantRequest && lastThemeChange && (now - parseInt(lastThemeChange)) < 5000) {
        console.log('⚠️ ThemeContext: Tema foi aplicado recentemente, evitando sobrescrever');
        console.log('🕰️ ThemeContext: Ultimo tema aplicado há', now - parseInt(lastThemeChange), 'ms');
        return;
      }
      
      // Aguardar um pouco mais para garantir que o banco foi atualizado
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('🌐 ThemeContext: Buscando tema global ativo...');
      console.log('🔍 ThemeContext: Query: SELECT * FROM global_ui_themes WHERE is_active = true');
      
      const { data: activeTheme, error } = await supabase
        .from('global_ui_themes')
        .select('*')
        .eq('is_active', true)
        .single();
        
      console.log('📊 ThemeContext: Resultado da query:', { data: activeTheme, error });

      if (error) {
        console.log('🎨 ThemeContext: Nenhum tema global ativo encontrado - mantendo UI Nativa');
        return;
      }

      if (activeTheme && activeTheme.primary_color) {
        console.log('🎨 ThemeContext: Tema global encontrado:', activeTheme.name);
        console.log('🎨 ThemeContext: Cores do tema:', {
          primary: activeTheme.primary_color,
          secondary: activeTheme.secondary_color,
          accent: activeTheme.accent_color,
          background: activeTheme.background_color
        });
        
        const root = document.documentElement;
        
        // Apply all theme colors with !important to ensure they override any existing styles
        root.style.setProperty('--primary', activeTheme.primary_color, 'important');
        root.style.setProperty('--primary-foreground', activeTheme.primary_foreground, 'important');
        root.style.setProperty('--primary-hover', activeTheme.primary_hover || activeTheme.primary_color, 'important');
        root.style.setProperty('--primary-glow', activeTheme.primary_glow || activeTheme.primary_color, 'important');
        
        root.style.setProperty('--secondary', activeTheme.secondary_color, 'important');
        root.style.setProperty('--secondary-foreground', activeTheme.secondary_foreground, 'important');
        
        root.style.setProperty('--accent', activeTheme.accent_color, 'important');
        root.style.setProperty('--accent-foreground', activeTheme.accent_foreground, 'important');
        
        // Apply background colors based on theme type and current mode
        if (!activeTheme.is_native_theme) {
          // For custom themes, apply all colors
          if (activeTheme.background_color) root.style.setProperty('--background', activeTheme.background_color, 'important');
          if (activeTheme.foreground_color) root.style.setProperty('--foreground', activeTheme.foreground_color, 'important');
          if (activeTheme.card_color) root.style.setProperty('--card', activeTheme.card_color, 'important');
          if (activeTheme.card_foreground) root.style.setProperty('--card-foreground', activeTheme.card_foreground, 'important');
        } else {
          // For native themes, apply colors based on current dark/light mode
          const isDarkMode = root.classList.contains('dark');
          if (isDarkMode) {
            // Apply dark mode colors if available
            if (activeTheme.background_color_dark) root.style.setProperty('--background', activeTheme.background_color_dark, 'important');
            if (activeTheme.foreground_color_dark) root.style.setProperty('--foreground', activeTheme.foreground_color_dark, 'important');
            if (activeTheme.card_color_dark) root.style.setProperty('--card', activeTheme.card_color_dark, 'important');
            if (activeTheme.card_foreground_dark) root.style.setProperty('--card-foreground', activeTheme.card_foreground_dark, 'important');
          } else {
            // Apply light mode colors
            if (activeTheme.background_color) root.style.setProperty('--background', activeTheme.background_color, 'important');
            if (activeTheme.foreground_color) root.style.setProperty('--foreground', activeTheme.foreground_color, 'important');
            if (activeTheme.card_color) root.style.setProperty('--card', activeTheme.card_color, 'important');
            if (activeTheme.card_foreground) root.style.setProperty('--card-foreground', activeTheme.card_foreground, 'important');
          }
        }
        
        // Apply structural colors based on theme type and current mode
        if (!activeTheme.is_native_theme) {
          // For custom themes, apply all structural colors
          root.style.setProperty('--border', activeTheme.border_color, 'important');
          root.style.setProperty('--input', activeTheme.input_color || activeTheme.border_color, 'important');
          root.style.setProperty('--muted', activeTheme.muted_color || activeTheme.secondary_color, 'important');
          root.style.setProperty('--muted-foreground', activeTheme.muted_foreground || activeTheme.secondary_foreground, 'important');
        } else {
          // For native themes, apply structural colors based on current dark/light mode
          const isDarkMode = root.classList.contains('dark');
          if (isDarkMode) {
            // Apply dark mode structural colors if available
            if (activeTheme.border_color_dark) root.style.setProperty('--border', activeTheme.border_color_dark, 'important');
            if (activeTheme.input_color_dark) root.style.setProperty('--input', activeTheme.input_color_dark, 'important');
            if (activeTheme.muted_color_dark) root.style.setProperty('--muted', activeTheme.muted_color_dark, 'important');
            if (activeTheme.muted_foreground_dark) root.style.setProperty('--muted-foreground', activeTheme.muted_foreground_dark, 'important');
          } else {
            // Apply light mode structural colors
            if (activeTheme.border_color) root.style.setProperty('--border', activeTheme.border_color, 'important');
            if (activeTheme.input_color) root.style.setProperty('--input', activeTheme.input_color, 'important');
            if (activeTheme.muted_color) root.style.setProperty('--muted', activeTheme.muted_color, 'important');
            if (activeTheme.muted_foreground) root.style.setProperty('--muted-foreground', activeTheme.muted_foreground, 'important');
          }
        }
        root.style.setProperty('--ring', activeTheme.ring_color || activeTheme.primary_color, 'important');
        
        console.log('✅ ThemeContext: Tema global aplicado com todas as cores:', {
          theme: activeTheme.name,
          isNative: activeTheme.is_native_theme,
          appliedColors: {
            primary: activeTheme.primary_color,
            secondary: activeTheme.secondary_color,
            accent: activeTheme.accent_color,
            background: activeTheme.background_color
          }
        });
        
        // Limpar cache de tema do tenant se aplicando global
        localStorage.removeItem('tenant-theme-applied');
      } else {
        console.log('🎨 ThemeContext: Tema global sem cores definidas - mantendo UI Nativa');
        // Limpar cache de tema do tenant se não há tema global
        localStorage.removeItem('tenant-theme-applied');
      }
    } catch (error) {
      console.error('ThemeContext: Erro ao carregar tema global:', error);
      // Limpar cache de tema do tenant em caso de erro
      localStorage.removeItem('tenant-theme-applied');
    }
  };

  // Helper function for HEX to HSL conversion
  const hexToHSL = (hex: string): [number, number, number] => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex.substring(1, 3), 16);
      g = parseInt(hex.substring(3, 5), 16);
      b = parseInt(hex.substring(5, 7), 16);
    }

    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return [h * 360, s * 100, l * 100];
  };

  const savePreferences = async () => {
    if (!user?.id) return;
    
    setSaving(true);
    try {
      const { data: currentProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        console.error('Error fetching current profile:', fetchError);
        throw new Error(`Erro ao buscar dados do perfil atual: ${fetchError.message}`);
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          notification_preferences: {
            ...preferences,
            theme: theme || 'system',
          },
          language: preferences.language,
          tenant_id: currentProfile.tenant_id,
        })
        .eq('user_id', user.id);

      if (error) throw error;

    } catch (error) {
      console.error('Error saving preferences:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const fetchThemePreferences = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('notification_preferences, language')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching theme preferences:', error);
        } else if (data) {
          const prefs = data.notification_preferences as any;
          
          // Set theme from saved preferences
          if (prefs?.theme && prefs.theme !== theme) {
            setTheme(prefs.theme);
          }
          
          setPreferences(prev => ({
            ...prev,
            theme: prefs?.theme || 'system',
            language: data.language || 'pt-BR',
            ...(prefs || {}),
            colorPalette: prefs?.colorPalette || prev.colorPalette,
            notifications: {
              ...prev.notifications,
              ...(prefs?.notifications || {}),
            },
            privacy: {
              ...prev.privacy,
              ...(prefs?.privacy || {}),
            },
          }));
        }
      }
    };

    fetchThemePreferences();
  }, [user]);

  // Sync theme changes with preferences
  useEffect(() => {
    if (theme && theme !== preferences.theme) {
      setPreferences(prev => ({ ...prev, theme: theme as 'light' | 'dark' | 'system' }));
    }
  }, [theme]);

  // Ensure theme is properly applied without interfering with next-themes
  useEffect(() => {
    if (mounted && resolvedTheme) {
      // Let next-themes handle the class application naturally
      // Just dispatch event for components that need to know about theme changes
      window.dispatchEvent(new CustomEvent('themeChange', {
        detail: { theme: resolvedTheme }
      }));
      
      console.log('🌙 ThemeContext: Tema resolvido aplicado:', resolvedTheme);
      
      // Reapply custom colors when theme changes to ensure they persist
      const timer = setTimeout(() => {
        const savedTheme = localStorage.getItem('grc-theme-preferences');
        if (savedTheme) {
          try {
            const parsed = JSON.parse(savedTheme);
            if (parsed.colorPalette) {
              applyCustomColors(parsed.colorPalette);
              console.log('🔄 ThemeContext: Cores customizadas reaplicadas após mudança de tema');
            }
          } catch (e) {
            console.warn('ThemeContext: Erro ao reaplicar cores customizadas', e);
          }
        }
      }, 50); // Small delay to ensure theme class is applied
      
      return () => clearTimeout(timer);
    }
  }, [mounted, resolvedTheme]);

  const value = useMemo(() => ({ 
    preferences, 
    setPreferences, 
    savePreferences, 
    saving,
    theme,
    setTheme,
    systemTheme,
    resolvedTheme
  }), [preferences, saving, theme, setTheme, systemTheme, resolvedTheme]);

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="grc-theme"
      themes={['light', 'dark', 'system']}
    >
      <ThemeContextInner>
        {children}
      </ThemeContextInner>
    </NextThemeProvider>
  );
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};
