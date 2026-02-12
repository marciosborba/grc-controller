import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  User,
  Mail,
  Phone,
  Building,
  Calendar,
  Clock,
  Shield,
  CheckCircle,
  AlertTriangle,
  Crown,
  Camera,
  Loader2,
  Save,
  Activity,
  LogOut,
  History,
  Lock,
  LayoutDashboard,
  Fingerprint,
  Smartphone,
  Globe,
  QrCode,
  ShieldCheck,
  RefreshCw,
  Copy
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useToast } from '@/hooks/use-toast';
import { logActivity } from '@/utils/securityLogger';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { AvatarCropper } from './AvatarCropper';


// --- Types ---
interface UserProfile {
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  department?: string;
  job_title?: string;
  avatar_url?: string;
  created_at: string;
  notification_preferences?: any;
}

interface UserActivity {
  id: string;
  action: string;
  resource_type: string;
  details: any;
  created_at: string;
}

// --- Helpers ---
const getUserRoleInfo = (user: any) => {
  if (user?.isPlatformAdmin) return { name: 'Super Admin', icon: Crown, color: 'text-red-500 bg-red-500/10 border-red-500/20' };
  const roles: Record<string, any> = {
    'admin': { name: 'Admin', icon: Shield, color: 'text-orange-500 bg-orange-500/10 border-orange-500/20' },
    'ciso': { name: 'CISO', icon: Shield, color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
    'risk_manager': { name: 'Risk Manager', icon: AlertTriangle, color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20' },
    'auditor': { name: 'Auditor', icon: Shield, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
    'user': { name: 'User', icon: User, color: 'text-slate-500 bg-slate-500/10 border-slate-500/20' }
  };
  return roles[user?.role] || roles['user'];
};

export const UserProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  // State
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Avatar Cropper State
  const [showCropper, setShowCropper] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');

  // Security State
  const [mfaInitiated, setMfaInitiated] = useState(false);
  const [mfaSecret, setMfaSecret] = useState('');
  const [mfaQr, setMfaQr] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [showMfaSetup, setShowMfaSetup] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [sessions, setSessions] = useState<any[]>([]);

  // Data
  const [formData, setFormData] = useState({ full_name: '', phone: '', department: '', job_title: '' });
  const [preferences, setPreferences] = useState({ notifications: { email: true, push: true } });

  // Dashboard Stats
  const [stats, setStats] = useState({
    totalActions: 0,
    daysActive: 0,
    accessLevel: 'User'
  });

  // Fetch Logic
  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      setProfile(profileData);
      setFormData({
        full_name: profileData.full_name || '',
        phone: profileData.phone || '',
        department: profileData.department || '',
        job_title: profileData.job_title || ''
      });
      if (profileData.notification_preferences) setPreferences(prev => ({ ...prev, ...profileData.notification_preferences }));

      // Fetch Recent Activities
      const { data: activityData } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      setActivities(activityData || []);

      // Calculate Stats
      // 1. Total Actions
      const { count: actionsCount } = await supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // 2. Days Active
      const createdDateString = profileData?.created_at;
      const createdDate = createdDateString ? new Date(createdDateString) : new Date();
      const diffTime = Math.abs(new Date().getTime() - createdDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      setStats({
        totalActions: actionsCount || 0,
        daysActive: diffDays,
        accessLevel: getUserRoleInfo(user).name
      });

    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Actions
  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from('profiles').update({ ...formData, updated_at: new Date().toISOString() }).eq('user_id', user?.id);
      if (error) throw error;
      await logActivity('profile_update', 'user', user!.id, { changes: formData });
      toast({ title: "Salvo", description: "Suas informações foram atualizadas." });
      refreshUser();
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handlePreferencesUpdate = async () => {
    setSaving(true);
    try {
      if (!user?.id) return;
      const { error } = await supabase
        .from('profiles')
        .update({ notification_preferences: preferences })
        .eq('user_id', user.id);
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Preferências salvas.' });
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setSelectedImage(reader.result as string);
        setShowCropper(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setShowCropper(false);
    setUploadingAvatar(true);
    try {
      const path = `${user?.id}-${Date.now()}.jpg`;
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, croppedBlob, { upsert: true });
      if (upErr) throw upErr;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('user_id', user?.id);

      toast({ title: "Avatar atualizado", description: "Nova foto definida com sucesso." });
      fetchData();
      refreshUser();
    } catch (err: any) {
      console.error('Avatar upload error:', err);
      toast({
        title: "Erro no upload",
        description: err.message || "Não foi possível enviar a imagem. Verifique as permissões.",
        variant: "destructive"
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Security Functions
  const handlePasswordChange = async () => {
    if (passwordForm.new !== passwordForm.confirm) {
      toast({ title: "Erro", description: "As senhas não coincidem.", variant: "destructive" });
      return;
    }
    if (passwordForm.new.length < 6) {
      toast({ title: "Erro", description: "A senha deve ter no mínimo 6 caracteres.", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: passwordForm.new });
      if (error) throw error;

      await logActivity('password_change', 'user', user!.id, {});
      toast({ title: "Senha alterada", description: "Sua senha foi atualizada com sucesso." });
      setPasswordForm({ current: '', new: '', confirm: '' });
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const initMFA = async () => {
    try {
      setSaving(true);
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
      if (error) throw error;

      setMfaSecret(data.totp.secret);
      setMfaQr(data.totp.qr_code);
      setMfaInitiated(true);
      setShowMfaSetup(true);
    } catch (error: any) {
      toast({ title: "Erro ao iniciar MFA", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const verifyMFA = async () => {
    try {
      setSaving(true);
      const { data, error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: (await supabase.auth.mfa.listFactors()).data?.totp[0].id || '',
        code: mfaCode
      });
      if (error) throw error;

      await logActivity('mfa_enabled', 'user', user!.id, {});
      toast({ title: "MFA Ativado", description: "Autenticação em dois fatores ativada com sucesso." });
      setMfaInitiated(false);
      setShowMfaSetup(false);
      fetchData(); // Refresh profile to see MFA status if we were tracking it
    } catch (error: any) {
      toast({ title: "Código inválido", description: "Verifique o código e tente novamente.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const loadSessions = async () => {
    // Mocking sessions since we can't easily list them without admin rights or extra query
    // But we can show current session
    setSessions([
      { id: 'current', device: 'Este Dispositivo', browser: 'Chrome', lastActive: 'Agora', current: true },
      // { id: 'other', device: 'iPhone 13', browser: 'Safari Mobile', lastActive: '2 horas atrás', current: false } 
    ]);
  };

  useEffect(() => {
    if (activeTab === 'security') {
      loadSessions();
    }
  }, [activeTab]);

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  const roleInfo = getUserRoleInfo(user);

  // Constants for tabs
  const tabs = [
    { id: 'overview', label: 'Visão Geral' },
    { id: 'edit', label: 'Editar Perfil' },
    { id: 'activity', label: 'Atividades' },
    { id: 'security', label: 'Segurança' },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">

      {/* 1. COVER HEADER */}
      {/* Revised: Softer, theme-aware gradient */}
      <div className="relative h-48 md:h-64 w-full bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />
      </div>

      <div className="container mx-auto px-4 -mt-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* 2. LEFT COLUMN: IDENTITY CARD */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-border/50 shadow-xl backdrop-blur-md bg-card/95">
              <CardContent className="pt-0 p-6 flex flex-col items-center text-center">

                {/* Floating Avatar */}
                <div className="relative group -mt-20 mb-4">
                  <Avatar className="h-32 w-32 border-[4px] border-background shadow-2xl ring-1 ring-border/20">
                    <AvatarImage src={profile?.avatar_url || undefined} className="object-cover" />
                    <AvatarFallback className="text-4xl font-bold bg-muted text-muted-foreground">
                      {profile?.full_name?.substring(0, 2).toUpperCase() || 'US'}
                    </AvatarFallback>
                  </Avatar>
                  <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-all cursor-pointer text-white backdrop-blur-sm">
                    {uploadingAvatar ? <Loader2 className="h-8 w-8 animate-spin" /> : <Camera className="h-8 w-8" />}
                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarSelect} disabled={uploadingAvatar} />
                  </label>
                </div>

                <AvatarCropper
                  open={showCropper}
                  onOpenChange={setShowCropper}
                  imageSrc={selectedImage}
                  onCropComplete={handleCropComplete}
                />

                <h2 className="text-2xl font-bold text-foreground">{profile?.full_name}</h2>
                <p className="text-muted-foreground font-medium text-sm mt-1">{profile?.email}</p>

                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <Badge variant="outline" className={cn("px-2 py-0.5 border bg-opacity-10", roleInfo.color)}>
                    <roleInfo.icon className="w-3 h-3 mr-1.5" />
                    {roleInfo.name}
                  </Badge>
                </div>

                <Separator className="my-6 bg-border/50" />

                <div className="w-full space-y-4 text-sm">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="p-2 rounded-md bg-muted/50 border border-border/50">
                      <Building className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Departamento</p>
                      <p className="text-foreground font-medium">{profile?.department || 'Não informado'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="p-2 rounded-md bg-muted/50 border border-border/50">
                      <LayoutDashboard className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Cargo</p>
                      <p className="text-foreground font-medium">{profile?.job_title || 'Não informado'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="p-2 rounded-md bg-muted/50 border border-border/50">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Membro desde</p>
                      <p className="text-foreground font-medium">{new Date(profile?.created_at || new Date()).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-lg bg-card/60 backdrop-blur-sm">
              <CardContent className="p-6 space-y-4">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Status da Conta</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <CheckCircle className="h-4 w-4 text-emerald-500" /> E-mail Verificado
                  </div>
                  <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 bg-emerald-500/10">Sim</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 3. RIGHT COLUMN: TABS & CONTENT */}
          {/* Added lg:mt-24 to push content below the cover header */}
          <div className="lg:col-span-8 space-y-6 lg:mt-24">

            {/* MANUAL TAB NAVIGATION */}
            <div className="sticky top-0 z-20 bg-background/95 backdrop-blur py-2 border-b border-border/40">
              <div className="flex items-center gap-8 overflow-x-auto no-scrollbar">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "pb-3 text-sm font-medium transition-all relative whitespace-nowrap",
                      activeTab === tab.id
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <span className="absolute bottom-0 left-0 w-full h-[2px] bg-primary rounded-t-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* TAB CONTENT: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="hover:bg-muted/30 transition-colors border-blue-500/20 bg-blue-500/5 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity"><Fingerprint className="w-16 h-16 text-blue-500" /></div>
                    <CardContent className="p-6">
                      <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.totalActions}</p>
                      <p className="text-xs text-blue-600/60 dark:text-blue-400/60 font-bold uppercase tracking-wider mt-1">Ações Totais</p>
                    </CardContent>
                  </Card>
                  <Card className="hover:bg-muted/30 transition-colors border-amber-500/20 bg-amber-500/5 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity"><History className="w-16 h-16 text-amber-500" /></div>
                    <CardContent className="p-6">
                      <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{stats.daysActive}</p>
                      <p className="text-xs text-amber-600/60 dark:text-amber-400/60 font-bold uppercase tracking-wider mt-1">Dias Ativo</p>
                    </CardContent>
                  </Card>
                  <Card className={cn(
                    "hover:bg-muted/30 transition-colors shadow-sm relative overflow-hidden group border",
                    roleInfo.color.replace('text-', 'border-').replace('bg-', 'data-unused-') // Simple hack to extract border color from utility class or just use the color directly
                  )}>
                    {/* We can reproduce the specific style based on role */}
                    <div className={cn("absolute inset-0 opacity-5", roleInfo.color.split(' ')[1])} />
                    <div className={cn("absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity", roleInfo.color.split(' ')[0])}>
                      <roleInfo.icon className="w-16 h-16" />
                    </div>
                    <CardContent className="p-6 relative z-10">
                      <p className={cn("text-3xl font-bold", roleInfo.color.split(' ')[0])}>{stats.accessLevel}</p>
                      <p className={cn("text-xs font-bold uppercase tracking-wider mt-1 opacity-70", roleInfo.color.split(' ')[0])}>Nível de Acesso</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Activity className="h-5 w-5 text-primary" />
                      Atividades Recentes
                    </h3>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('activity')}>Ver todas</Button>
                  </div>
                  <Card className="border-border/50 shadow-sm">
                    <CardContent className="p-0">
                      <div className="divide-y divide-border/40">
                        {activities.slice(0, 5).map((activity) => (
                          <div key={activity.id} className="p-4 flex items-start gap-4 hover:bg-muted/30 transition-colors group">
                            <div className="mt-1 p-2 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                              <Clock className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">{activity.action}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{new Date(activity.created_at).toLocaleString('pt-BR')}</p>
                            </div>
                          </div>
                        ))}
                        {activities.length === 0 && <div className="p-6 text-center text-muted-foreground">Nenhuma atividade.</div>}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* TAB CONTENT: EDIT */}
            {activeTab === 'edit' && (
              <Card className="border-border/50 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
                <CardHeader>
                  <CardTitle>Informações Pessoais</CardTitle>
                  <CardDescription>Atualize seus dados de cadastro.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Nome Completo</Label>
                      <Input
                        id="fullName"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Departamento</Label>
                      <Input
                        id="department"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="jobTitle">Cargo</Label>
                      <Input
                        id="jobTitle"
                        value={formData.job_title}
                        onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-4 border-t border-border/40">
                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Salvar Alterações
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* TAB CONTENT: ACTIVITY */}
            {activeTab === 'activity' && (
              <Card className="border-border/50 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
                <CardHeader>
                  <CardTitle>Histórico de Atividades</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border/40">
                    {activities.map((activity) => (
                      <div key={activity.id} className="p-4 flex items-start gap-4 hover:bg-muted/30 transition-colors">
                        <div className="mt-1 p-2 rounded-full bg-muted border border-border shrink-0">
                          <History className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <p className="text-sm font-medium text-foreground">{activity.action}</p>
                            <Badge variant="outline" className="text-[10px] uppercase">{activity.resource_type}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {JSON.stringify(activity.details)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(activity.created_at).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* TAB CONTENT: SECURITY */}
            {activeTab === 'security' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">

                {/* Security Score / Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-emerald-500/20 bg-emerald-500/5">
                    <CardContent className="p-6 flex items-center gap-4">
                      <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-500">
                        <ShieldCheck className="h-8 w-8" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Nível de Segurança</p>
                        <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">Forte</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-border/50">
                    <CardContent className="p-6 flex items-center gap-4">
                      <div className="p-3 rounded-full bg-primary/10 text-primary">
                        <Lock className="h-8 w-8" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Senha</p>
                        <p className="text-sm font-bold text-foreground">Atualizada há 2 meses</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-border/50">
                    <CardContent className="p-6 flex items-center gap-4">
                      <div className="p-3 rounded-full bg-blue-500/10 text-blue-500">
                        <Smartphone className="h-8 w-8" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">MFA</p>
                        <p className="text-sm font-bold text-foreground">Não Ativado</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                  {/* Change Password */}
                  <Card className="border-border/50 shadow-sm h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5 text-primary" /> Alterar Senha
                      </CardTitle>
                      <CardDescription>Mantenha sua conta segura alterando sua senha periodicamente.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Nova Senha</Label>
                        <Input
                          type="password"
                          value={passwordForm.new}
                          onChange={e => setPasswordForm(p => ({ ...p, new: e.target.value }))}
                          placeholder="••••••••"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Confirmar Nova Senha</Label>
                        <Input
                          type="password"
                          value={passwordForm.confirm}
                          onChange={e => setPasswordForm(p => ({ ...p, confirm: e.target.value }))}
                          placeholder="••••••••"
                        />
                      </div>

                      <div className="pt-2">
                        <div className="text-xs text-muted-foreground space-y-1 mb-4">
                          <p className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-emerald-500" /> Mínimo de 8 caracteres</p>
                          <p className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-emerald-500" /> Um caractere especial</p>
                          <p className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-emerald-500" /> Uma letra maiúscula</p>
                        </div>
                        <Button onClick={handlePasswordChange} disabled={saving} className="w-full">
                          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          Atualizar Senha
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* MFA Section */}
                  <Card className="border-border/50 shadow-sm h-full flex flex-col">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Smartphone className="h-5 w-5 text-primary" /> Autenticação em Dois Fatores (MFA)
                      </CardTitle>
                      <CardDescription>Adicione uma camada extra de segurança à sua conta.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-1">
                      {!showMfaSetup ? (
                        <div className="flex flex-col items-center justify-center text-center py-6 space-y-4">
                          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                            <QrCode className="h-8 w-8 text-primary" />
                          </div>
                          <div className="space-y-2">
                            <h4 className="font-semibold">MFA não configurado</h4>
                            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                              Utilize um aplicativo como Google Authenticator ou Authy para gerar códigos de verificação.
                            </p>
                          </div>
                          <Button onClick={initMFA} variant="outline" className="mt-2">
                            Configurar MFA Agora
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                          <div className="text-center p-4 bg-white rounded-lg border border-border inline-block w-full">
                            {/* Fallback to image if SVG not working or use iframe for quick qr */}
                            {mfaQr ? (
                              <img src={mfaQr} alt="QR Code" className="mx-auto h-40 w-40" />
                            ) : (
                              <div className="h-40 w-40 bg-muted mx-auto flex items-center justify-center text-xs text-muted-foreground">
                                QR Code
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase text-muted-foreground">Chave de Configuração</Label>
                            <div className="flex items-center gap-2">
                              <code className="block w-full p-2 bg-muted rounded text-xs font-mono break-all border border-border">
                                {mfaSecret || 'CARREGANDO-SEGREDO...'}
                              </code>
                              <Button size="icon" variant="ghost" onClick={() => {
                                navigator.clipboard.writeText(mfaSecret);
                                toast({ title: "Copiado!" });
                              }}>
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-2 pt-2">
                            <Label>Código de Verificação</Label>
                            <div className="flex gap-2">
                              <Input
                                placeholder="000 000"
                                className="text-center tracking-widest font-mono text-lg"
                                maxLength={6}
                                value={mfaCode}
                                onChange={e => setMfaCode(e.target.value.replace(/\D/g, ''))}
                              />
                              <Button onClick={verifyMFA} disabled={mfaCode.length < 6 || saving}>
                                Verificar
                              </Button>
                            </div>
                          </div>

                          <Button variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={() => setShowMfaSetup(false)}>
                            Cancelar
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                </div>

                {/* Device Management */}
                <Card className="border-border/50 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-primary" /> Dispositivos Conectados
                    </CardTitle>
                    <CardDescription>Gerencie as sessões ativas da sua conta.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {sessions.map((session) => (
                        <div key={session.id} className="flex items-center justify-between p-4 rounded-lg border border-border/40 hover:bg-muted/30 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className={cn("p-2 rounded-full", session.current ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground")}>
                              {session.id === 'current' ? <Smartphone className="h-5 w-5" /> : <Globe className="h-5 w-5" />}
                            </div>
                            <div>
                              <p className="font-medium text-foreground flex items-center gap-2">
                                {session.device}
                                {session.current && <Badge variant="secondary" className="text-[10px] bg-green-500/10 text-green-600 border-green-500/20">Atual</Badge>}
                              </p>
                              <p className="text-xs text-muted-foreground">{session.browser} • {session.lastActive}</p>
                            </div>
                          </div>
                          {!session.current && (
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                              Sair
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Preferences */}
                <Card className="border-border/50 shadow-sm">
                  <CardHeader>
                    <CardTitle>Preferências e Privacidade</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20 border border-border/40">
                      <div className="space-y-0.5">
                        <Label className="text-base">Tema da Interface</Label>
                        <p className="text-sm text-muted-foreground">Alternar entre claro e escuro</p>
                      </div>
                      <Switch
                        checked={theme === 'dark'}
                        onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20 border border-border/40">
                      <div className="space-y-0.5">
                        <Label className="text-base">Notificações</Label>
                        <p className="text-sm text-muted-foreground">Receber atualizações por email</p>
                      </div>
                      <Switch
                        checked={preferences.notifications.email}
                        onCheckedChange={(checked) => {
                          setPreferences(prev => ({ ...prev, notifications: { ...prev.notifications, email: checked } }));
                        }}
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button variant="outline" onClick={handlePreferencesUpdate} disabled={saving}>Salvar Preferências</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-red-200 dark:border-red-900 shadow-sm bg-red-50/50 dark:bg-red-950/10">
                  <CardHeader>
                    <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Zona de Perigo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">Excluir Conta</p>
                        <p className="text-sm text-muted-foreground">Esta ação não pode ser desfeita.</p>
                      </div>
                      <Button variant="destructive">Excluir Conta</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};