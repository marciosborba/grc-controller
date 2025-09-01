import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
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
  User,
  Mail,
  Phone,
  Building,
  MapPin,
  Calendar,
  Clock,
  Settings,
  Activity,
  Bell,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Shield,
  Globe,
  Moon,
  Sun,
  Crown,
  CheckCircle,
  AlertTriangle,
  Info,
  Sparkles,
  Zap,
  Lock,
  Unlock,
  Star,
  Edit,
  X,
  Palette
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { logActivity } from '@/utils/securityLogger';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface UserProfile {
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  department?: string;
  job_title?: string;
  avatar_url?: string;
  language?: string;
  notification_preferences?: Record<string, unknown>;
  created_at: string;
  last_login_at?: string;
}

interface UserActivity {
  id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details: Record<string, unknown>;
  created_at: string;
  ip_address?: string;
}

export const UserProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  
  // Preferences state (moved from simplified ThemeContext)
  const [preferences, setPreferences] = useState({
    theme: 'system',
    language: 'pt',
    colorPalette: {
      primary: '#3b82f6',
      secondary: '#7e22ce',
      tertiary: '#be185d'
    },
    notifications: {
      email: true,
      push: true,
      security: true,
      updates: true
    },
    privacy: {
      showEmail: false,
      showActivity: true
    }
  });
  
  // Form states
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    department: '',
    job_title: '',
  });

  const fetchProfile = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      console.log('Profile data from database:', profileData);

      setProfile(profileData);
      setFormData({
        full_name: profileData.full_name || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        department: profileData.department || '',
        job_title: profileData.job_title || '',
      });

      // Load preferences from profile
      if (profileData.notification_preferences) {
        const prefs = profileData.notification_preferences as any;
        setPreferences(prev => ({
          ...prev,
          ...prefs,
          notifications: {
            ...prev.notifications,
            ...prefs.notifications,
          },
          privacy: {
            ...prev.privacy,
            ...prefs.privacy,
          },
        }));
      }

    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar perfil do usuário',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, setPreferences, toast]);

  const fetchUserActivities = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const { data: activitiesData, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setActivities(activitiesData || []);
    } catch (error) {
      console.error('Error fetching user activities:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar atividades do usuário',
        variant: 'destructive'
      });
    }
  }, [user?.id, toast]);

  const handleProfileUpdate = async () => {
    if (!user?.id || !profile) return;
    
    // Basic validation
    if (!formData.full_name.trim()) {
      toast({
        title: 'Erro',
        description: 'Nome completo é obrigatório',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.email.trim()) {
      toast({
        title: 'Erro',
        description: 'Email é obrigatório',
        variant: 'destructive'
      });
      return;
    }
    
    setSaving(true);
    try {
      // Get the current profile to preserve tenant_id and other fields
      const { data: currentProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        console.error('Error fetching current profile:', fetchError);
        throw new Error(`Erro ao buscar dados do perfil atual: ${fetchError.message}`);
      }

      const updateData = {
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone?.trim() || null,
        department: formData.department?.trim() || null,
        job_title: formData.job_title?.trim() || null,
        tenant_id: currentProfile.tenant_id,
      };

      console.log('Updating profile with data:', updateData);

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', user.id);

      if (error) throw error;

      // Log the profile update activity with details of what changed
      const changes: Record<string, { from: string; to: string }> = {};
      
      if (formData.full_name !== profile.full_name) {
        changes.full_name = { from: profile.full_name || '', to: formData.full_name };
      }
      if (formData.email !== profile.email) {
        changes.email = { from: profile.email || '', to: formData.email };
      }
      if (formData.phone !== (profile.phone || '')) {
        changes.phone = { from: profile.phone || '', to: formData.phone || '' };
      }
      if (formData.department !== (profile.department || '')) {
        changes.department = { from: profile.department || '', to: formData.department || '' };
      }
      if (formData.job_title !== (profile.job_title || '')) {
        changes.job_title = { from: profile.job_title || '', to: formData.job_title || '' };
      }

      // Log the activity with detailed changes
      await logActivity(
        'profile_updated',
        'user',
        user.id,
        {
          user_id: user.id,
          changes: changes,
          timestamp: new Date().toISOString()
        }
      );

      // Update auth.users email if changed
      if (formData.email !== profile.email) {
        const { error: authError } = await supabase.auth.updateUser({
          email: formData.email
        });
        
        if (authError) {
          toast({
            title: 'Atenção',
            description: 'Perfil atualizado, mas verifique seu novo email para confirmar a alteração',
            variant: 'default'
          });
        }
      }

      toast({
        title: 'Sucesso',
        description: 'Perfil atualizado com sucesso',
      });

      // Refresh all data to reflect changes
      await Promise.all([
        fetchProfile(),
        fetchUserActivities()
      ]);
      
      console.log('Profile update completed');
      setEditingProfile(false);

    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao atualizar perfil',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePreferencesUpdate = async () => {
    if (!user?.id) return;
    
    setSaving(true);
    try {
      // Get the current profile to preserve tenant_id and other fields
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
          notification_preferences: preferences,
          language: preferences.language,
          tenant_id: currentProfile.tenant_id,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      // Log preferences update activity
      await logActivity(
        'preferences_updated',
        'user',
        user.id,
        {
          user_id: user.id,
          preferences: preferences,
          timestamp: new Date().toISOString()
        }
      );

      await fetchUserActivities(); // Refresh activities to show the new log
      
      toast({
        title: 'Sucesso',
        description: 'Preferências atualizadas com sucesso',
      });

    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao atualizar preferências',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const getActionBadgeColor = (action: string) => {
    const colors = {
      'login_success': 'bg-green-100 text-green-800 border-green-200',
      'logout': 'bg-blue-100 text-blue-800 border-blue-200',
      'profile_updated': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'preferences_updated': 'bg-purple-100 text-purple-800 border-purple-200',
      'password_changed': 'bg-orange-100 text-orange-800 border-orange-200',
      'email_updated': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'login': 'bg-green-100 text-green-800 border-green-200',
      'update': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'create': 'bg-purple-100 text-purple-800 border-purple-200',
      'delete': 'bg-red-100 text-red-800 border-red-200',
      'view': 'bg-gray-100 text-gray-800 border-gray-200',
    };
    
    // Check exact match first
    if (colors[action]) {
      return colors[action];
    }
    
    // Then check partial matches
    for (const [key, color] of Object.entries(colors)) {
      if (action.toLowerCase().includes(key)) {
        return color;
      }
    }
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  useEffect(() => {
    fetchProfile();
    fetchUserActivities();
  }, [fetchProfile, fetchUserActivities]);

  if (loading || !profile) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <span className="text-lg text-muted-foreground">Carregando perfil...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header melhorado seguindo padrão da aplicação */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <span>Meu Perfil</span>
          </h1>
          <p className="text-muted-foreground">
            Gerencie suas informações pessoais, preferências de sistema e monitore suas atividades
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            <Crown className="h-3 w-3 mr-1" />
            {user?.role || 'Usuário'}
          </Badge>
          {profile.last_login_at && (
            <Badge variant="secondary">
              <Clock className="h-3 w-3 mr-1" />
              Último acesso: {new Date(profile.last_login_at).toLocaleDateString('pt-BR')}
            </Badge>
          )}
        </div>
      </div>

      {/* Alert informativo */}
      <Alert className="border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-100">
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-blue-900 dark:text-blue-100">Centro de Configurações Pessoais</AlertTitle>
        <AlertDescription className="text-blue-800 dark:text-blue-200">
          Personalize sua experiência na plataforma. Todas as alterações são salvas automaticamente e aplicadas imediatamente.
        </AlertDescription>
      </Alert>

      {/* Profile Summary Card melhorado */}
      <Card className="border-2 border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-primary" />
            Resumo do Perfil
          </CardTitle>
          <CardDescription>
            Informações principais do seu perfil na plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-6">
            <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border-2 border-primary/20">
              <span className="text-2xl font-bold text-primary">
                {profile.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
              </span>
            </div>
            <div className="flex-1 space-y-2">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">{profile.full_name}</h2>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {profile.email}
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                {profile.job_title && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Building className="h-4 w-4" />
                    <span>{profile.job_title}</span>
                  </div>
                )}
                {profile.department && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{profile.department}</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Membro desde {new Date(profile.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </div>
            <div className="text-right space-y-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Ativo
              </Badge>
              {profile.last_login_at && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Último acesso:</span><br />
                  {formatDateTime(profile.last_login_at)}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-12">
          <TabsTrigger value="profile" className="flex items-center gap-2 h-10">
            <User className="h-4 w-4" />
            <span>Informações Pessoais</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2 h-10">
            <Settings className="h-4 w-4" />
            <span>Preferências</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2 h-10">
            <Activity className="h-4 w-4" />
            <span>Atividades</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Informações Pessoais
                  </CardTitle>
                  <CardDescription>
                    Gerencie suas informações básicas de perfil
                  </CardDescription>
                </div>
                <Button
                  variant={editingProfile ? "outline" : "default"}
                  onClick={() => setEditingProfile(!editingProfile)}
                  className="flex items-center gap-2"
                >
                  {editingProfile ? (
                    <>
                      <X className="h-4 w-4" />
                      Cancelar
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4" />
                      Editar
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="full_name" className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Nome Completo *
                  </Label>
                  {editingProfile ? (
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                      className="h-11"
                      placeholder="Digite seu nome completo"
                    />
                  ) : (
                    <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg border">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{profile.full_name}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email *
                  </Label>
                  {editingProfile ? (
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="h-11"
                      placeholder="Digite seu email"
                    />
                  ) : (
                    <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg border">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{profile.email}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Telefone
                  </Label>
                  {editingProfile ? (
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="h-11"
                      placeholder="Digite seu telefone"
                    />
                  ) : (
                    <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg border">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{profile.phone || 'Não informado'}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="job_title" className="text-sm font-medium flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Cargo
                  </Label>
                  {editingProfile ? (
                    <Input
                      id="job_title"
                      value={formData.job_title}
                      onChange={(e) => setFormData(prev => ({ ...prev, job_title: e.target.value }))}
                      className="h-11"
                      placeholder="Digite seu cargo"
                    />
                  ) : (
                    <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg border">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{profile.job_title || 'Não informado'}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="department" className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Departamento
                  </Label>
                  {editingProfile ? (
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                      className="h-11"
                      placeholder="Digite seu departamento"
                    />
                  ) : (
                    <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg border">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{profile.department || 'Não informado'}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Membro desde
                  </Label>
                  <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg border">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{new Date(profile.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>

              {editingProfile && (
                <>
                  <Separator />
                  <div className="flex justify-end space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setEditingProfile(false)}
                      className="flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleProfileUpdate}
                      disabled={saving}
                      className="flex items-center gap-2"
                    >
                      {saving ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Salvar Alterações
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          {/* Theme Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                Aparência & Tema
              </CardTitle>
              <CardDescription>
                Personalize a aparência da interface de acordo com suas preferências
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    Tema da Interface
                  </Label>
                  <Select
                    value={theme || 'system'}
                    onValueChange={(value: 'light' | 'dark' | 'system') => {
                      setTheme(value);
                      setPreferences(prev => ({ ...prev, theme: value }));
                    }}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center gap-2">
                          <Sun className="h-4 w-4" />
                          <span>Claro</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center gap-2">
                          <Moon className="h-4 w-4" />
                          <span>Escuro</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="system">
                        <div className="flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          <span>Automático (Sistema)</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Idioma da Interface
                  </Label>
                  <Select
                    value={preferences.language}
                    onValueChange={(value) =>
                      setPreferences(prev => ({ ...prev, language: value }))
                    }
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <span>Português (Brasil)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="en-US">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <span>English (US)</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Theme Mode Toggle - Only dark/light mode allowed for users */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Moon className="h-5 w-5 text-primary" />
                Modo do Tema
              </CardTitle>
              <CardDescription>
                Escolha entre modo claro ou escuro. As cores são definidas pelo administrador da plataforma.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                    <span className="font-medium">
                      {theme === 'dark' ? 'Modo Escuro' : theme === 'light' ? 'Modo Claro' : 'Modo Sistema'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {theme === 'dark' 
                      ? 'Interface com fundo escuro para reduzir fadiga ocular'
                      : theme === 'light' 
                      ? 'Interface com fundo claro padrão'
                      : 'Segue as configurações do seu dispositivo'
                    }
                  </p>
                </div>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4" />
                        Claro
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4" />
                        Escuro
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Sistema
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Notificações
              </CardTitle>
              <CardDescription>
                Configure como e quando você deseja receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Notificações por Email
                    </Label>
                    <p className="text-sm text-muted-foreground">Receber notificações importantes por email</p>
                  </div>
                  <Switch
                    checked={preferences.notifications?.email}
                    onCheckedChange={(checked) =>
                      setPreferences(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, email: checked }
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      Notificações Push
                    </Label>
                    <p className="text-sm text-muted-foreground">Receber notificações no navegador</p>
                  </div>
                  <Switch
                    checked={preferences.notifications?.push}
                    onCheckedChange={(checked) =>
                      setPreferences(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, push: checked }
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Alertas de Segurança
                    </Label>
                    <p className="text-sm text-muted-foreground">Notificações sobre eventos de segurança</p>
                  </div>
                  <Switch
                    checked={preferences.notifications?.security}
                    onCheckedChange={(checked) =>
                      setPreferences(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, security: checked }
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Atualizações do Sistema
                    </Label>
                    <p className="text-sm text-muted-foreground">Novidades e atualizações da plataforma</p>
                  </div>
                  <Switch
                    checked={preferences.notifications?.updates}
                    onCheckedChange={(checked) =>
                      setPreferences(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, updates: checked }
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Privacidade & Segurança
              </CardTitle>
              <CardDescription>
                Controle a visibilidade das suas informações e atividades
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Mostrar Email no Perfil
                    </Label>
                    <p className="text-sm text-muted-foreground">Permitir que outros usuários vejam seu email</p>
                  </div>
                  <Switch
                    checked={preferences.privacy?.showEmail}
                    onCheckedChange={(checked) =>
                      setPreferences(prev => ({
                        ...prev,
                        privacy: { ...prev.privacy, showEmail: checked }
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Atividade Pública
                    </Label>
                    <p className="text-sm text-muted-foreground">Permitir que outros vejam suas atividades recentes</p>
                  </div>
                  <Switch
                    checked={preferences.privacy?.showActivity}
                    onCheckedChange={(checked) =>
                      setPreferences(prev => ({
                        ...prev,
                        privacy: { ...prev.privacy, showActivity: checked }
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button 
              onClick={handlePreferencesUpdate} 
              disabled={saving}
              className="flex items-center gap-2"
            >
              {saving ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Salvar Preferências
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Histórico de Atividades
              </CardTitle>
              <CardDescription>
                Acompanhe suas ações e atividades recentes na plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                {activities.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[140px]">Data/Hora</TableHead>
                        <TableHead className="w-[120px]">Ação</TableHead>
                        <TableHead className="w-[100px]">Recurso</TableHead>
                        <TableHead className="w-[100px]">IP Address</TableHead>
                        <TableHead>Detalhes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activities.map((activity) => (
                        <TableRow key={activity.id} className="hover:bg-muted/50">
                          <TableCell className="text-xs">
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="whitespace-nowrap font-mono">
                                {new Date(activity.created_at).toLocaleDateString('pt-BR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={cn("text-xs px-2 py-1 border", getActionBadgeColor(activity.action))}
                            >
                              {activity.action}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs px-2 py-1">
                              {activity.resource_type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs font-mono text-muted-foreground">
                            {activity.ip_address || 'N/A'}
                          </TableCell>
                          <TableCell className="text-xs">
                            <div className="max-w-[300px]" title={activity.details ? JSON.stringify(activity.details, null, 2) : 'N/A'}>
                              {activity.details ? (
                                <div className="space-y-1">
                                  {activity.action === 'profile_updated' && activity.details.changes ? (
                                    <div className="space-y-1">
                                      <span className="font-medium text-foreground">Alterações realizadas:</span>
                                      {Object.entries(activity.details.changes as Record<string, {from: string, to: string}>).map(([field, change]) => (
                                        <div key={field} className="text-xs pl-2 border-l-2 border-muted">
                                          <span className="capitalize font-medium">{field.replace('_', ' ')}: </span>
                                          <span className="line-through text-red-600 dark:text-red-400">{change.from || '(vazio)'}</span>
                                          <span className="mx-1">→</span>
                                          <span className="text-green-600 dark:text-green-400">{change.to || '(vazio)'}</span>
                                        </div>
                                      ))}
                                    </div>
                                  ) : activity.action === 'preferences_updated' && activity.details.preferences ? (
                                    <div className="flex items-center gap-1">
                                      <Settings className="h-3 w-3" />
                                      <span className="font-medium">Preferências atualizadas</span>
                                    </div>
                                  ) : activity.action.includes('login') ? (
                                    <div className="flex items-center gap-1">
                                      {activity.action === 'login_success' ? (
                                        <CheckCircle className="h-3 w-3 text-green-600" />
                                      ) : (
                                        <RefreshCw className="h-3 w-3 text-blue-600" />
                                      )}
                                      <span className="font-medium">
                                        {activity.action === 'login_success' ? 'Login realizado' : 'Logout realizado'}
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="truncate text-muted-foreground">
                                      {JSON.stringify(activity.details).substring(0, 80)}...
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">Sem detalhes</span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12">
                    <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">Nenhuma atividade encontrada</h3>
                    <p className="text-sm text-muted-foreground">Suas atividades aparecerão aqui conforme você usar a plataforma</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};