import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
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
  Palette,
  Globe,
  Moon,
  Sun
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { logActivity } from '@/utils/securityLogger';
import { ColorSelector } from './ColorSelector';
import { useThemeContext } from '@/contexts/ThemeContext';

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
  const { preferences, setPreferences } = useThemeContext();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  
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

      // Debug: Log the profile data from database
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
  }, [user?.id, setPreferences]);

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
  }, [user?.id]);

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
        tenant_id: currentProfile.tenant_id, // Preserve existing tenant_id
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
          tenant_id: currentProfile.tenant_id, // Preserve existing tenant_id
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
      'login_success': 'bg-green-100 text-green-800',
      'logout': 'bg-blue-100 text-blue-800',
      'profile_updated': 'bg-yellow-100 text-yellow-800',
      'preferences_updated': 'bg-purple-100 text-purple-800',
      'password_changed': 'bg-orange-100 text-orange-800',
      'email_updated': 'bg-indigo-100 text-indigo-800',
      'login': 'bg-green-100 text-green-800',
      'update': 'bg-yellow-100 text-yellow-800',
      'create': 'bg-purple-100 text-purple-800',
      'delete': 'bg-red-100 text-red-800',
      'view': 'bg-gray-100 text-gray-800',
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
    return 'bg-gray-100 text-gray-800';
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
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-2">
            <User className="h-8 w-8 text-primary" />
            <span>Meu Perfil</span>
          </h1>
          <p className="text-muted-foreground">
            Gerencie suas informações pessoais, preferências e atividades
          </p>
        </div>
      </div>

      {/* Profile Summary Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xl font-bold text-primary">
                {profile.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{profile.full_name}</h2>
              <p className="text-muted-foreground">{profile.email}</p>
              <p className="text-sm text-muted-foreground">{profile.job_title}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Último acesso:</p>
              <p className="text-sm font-medium">
                {profile.last_login_at 
                  ? formatDateTime(profile.last_login_at)
                  : 'Nunca'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Informações Pessoais</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Preferências</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Minhas Atividades</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Informações Pessoais</CardTitle>
                <Button
                  variant={editingProfile ? "outline" : "default"}
                  onClick={() => setEditingProfile(!editingProfile)}
                >
                  {editingProfile ? 'Cancelar' : 'Editar'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nome Completo</Label>
                  {editingProfile ? (
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    />
                  ) : (
                    <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-md">
                      <User className="h-4 w-4" />
                      <span>{profile.full_name}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  {editingProfile ? (
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  ) : (
                    <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-md">
                      <Mail className="h-4 w-4" />
                      <span>{profile.email}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  {editingProfile ? (
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  ) : (
                    <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-md">
                      <Phone className="h-4 w-4" />
                      <span>{profile.phone || 'Não informado'}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="job_title">Cargo</Label>
                  {editingProfile ? (
                    <Input
                      id="job_title"
                      value={formData.job_title}
                      onChange={(e) => setFormData(prev => ({ ...prev, job_title: e.target.value }))}
                    />
                  ) : (
                    <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-md">
                      <Building className="h-4 w-4" />
                      <span>{profile.job_title || 'Não informado'}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Departamento</Label>
                  {editingProfile ? (
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    />
                  ) : (
                    <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-md">
                      <MapPin className="h-4 w-4" />
                      <span>{profile.department || 'Não informado'}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Membro desde</Label>
                  <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-md">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(profile.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>

              {editingProfile && (
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setEditingProfile(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleProfileUpdate}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Salvar Alterações
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <div className="space-y-6">
            {/* Theme Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Palette className="h-5 w-5" />
                  <span>Aparência</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Tema</Label>
                  <Select
                    value={preferences.theme}
                    onValueChange={(value: 'light' | 'dark' | 'system') =>
                      setPreferences(prev => ({ ...prev, theme: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center space-x-2">
                          <Sun className="h-4 w-4" />
                          <span>Claro</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center space-x-2">
                          <Moon className="h-4 w-4" />
                          <span>Escuro</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="system">
                        <div className="flex items-center space-x-2">
                          <Settings className="h-4 w-4" />
                          <span>Sistema</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Idioma</Label>
                  <Select
                    value={preferences.language}
                    onValueChange={(value) =>
                      setPreferences(prev => ({ ...prev, language: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">
                        <div className="flex items-center space-x-2">
                          <Globe className="h-4 w-4" />
                          <span>Português (Brasil)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="en-US">
                        <div className="flex items-center space-x-2">
                          <Globe className="h-4 w-4" />
                          <span>English (US)</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <ColorSelector
              palette={preferences.colorPalette}
              onPaletteChange={(newPalette) =>
                setPreferences((prev) => ({ ...prev, colorPalette: newPalette }))
              }
              onGeneratePalette={() => {
                const randomColor = () => '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
                setPreferences((prev) => ({
                  ...prev,
                  colorPalette: {
                    primary: randomColor(),
                    secondary: randomColor(),
                    tertiary: randomColor(),
                  },
                }));
              }}
            />

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notificações</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificações por Email</Label>
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

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificações Push</Label>
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

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Alertas de Segurança</Label>
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

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Atualizações do Sistema</Label>
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
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Privacidade</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Mostrar Email no Perfil</Label>
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

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Atividade Pública</Label>
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
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handlePreferencesUpdate} disabled={saving}>
                {saving ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Preferências
                  </>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Minhas Atividades Recentes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <Table className="text-sm">
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
                      <TableRow key={activity.id}>
                        <TableCell className="text-xs">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span className="whitespace-nowrap">
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
                            className={`text-xs px-2 py-1 ${getActionBadgeColor(activity.action)}`}
                          >
                            {activity.action}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs px-2 py-1">
                            {activity.resource_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs font-mono">
                          {activity.ip_address || 'N/A'}
                        </TableCell>
                        <TableCell className="text-xs">
                          <div className="max-w-[200px]" title={activity.details ? JSON.stringify(activity.details, null, 2) : 'N/A'}>
                            {activity.details ? (
                              <div className="space-y-1">
                                {activity.action === 'profile_updated' && activity.details.changes ? (
                                  <div>
                                    <span className="font-medium">Alterações:</span>
                                    {Object.entries(activity.details.changes as Record<string, {from: string, to: string}>).map(([field, change]) => (
                                      <div key={field} className="text-xs">
                                        <span className="capitalize">{field.replace('_', ' ')}: </span>
                                        <span className="line-through text-red-600">{change.from || '(vazio)'}</span>
                                        <span> → </span>
                                        <span className="text-green-600">{change.to || '(vazio)'}</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : activity.action === 'preferences_updated' && activity.details.preferences ? (
                                  <div>
                                    <span className="font-medium">Preferências atualizadas</span>
                                  </div>
                                ) : activity.action.includes('login') ? (
                                  <div>
                                    <span className="font-medium">
                                      {activity.action === 'login_success' ? 'Login realizado' : 'Logout realizado'}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="truncate">
                                    {JSON.stringify(activity.details).substring(0, 60)}
                                  </div>
                                )}
                              </div>
                            ) : 'N/A'}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {activities.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma atividade encontrada</p>
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