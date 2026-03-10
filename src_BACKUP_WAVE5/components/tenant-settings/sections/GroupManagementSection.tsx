
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Users,
    Plus,
    Trash2,
    Search,
    UserPlus,
    X
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Group {
    id: string;
    name: string;
    description: string;
    created_at: string;
    member_count?: number;
}

interface GroupMember {
    id: string; // group_members.id
    user_id: string;
    role: string;
    profile: {
        full_name: string;
        email: string;
    };
}

interface User {
    id: string;
    profile: {
        user_id: string;
        full_name: string;
        email: string;
    };
}

interface GroupManagementSectionProps {
    tenantId: string;
}

export const GroupManagementSection: React.FC<GroupManagementSectionProps> = ({
    tenantId
}) => {
    const [groups, setGroups] = useState<Group[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [isManageMembersOpen, setIsManageMembersOpen] = useState(false);
    const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
    const [availableUsers, setAvailableUsers] = useState<User[]>([]);
    const [selecteduserIdToAdd, setSelectedUserIdToAdd] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });

    useEffect(() => {
        loadGroups();
    }, [tenantId]);

    const loadGroups = async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('groups')
                .select('*, group_members(count)')
                .eq('tenant_id', tenantId)
                .order('name');

            if (error) throw error;

            const groupsWithCount = data.map(g => ({
                ...g,
                member_count: g.group_members?.[0]?.count || 0
            }));

            setGroups(groupsWithCount);
        } catch (error) {
            console.error('Error loading groups:', error);
            toast.error('Erro ao carregar grupos');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateGroup = async () => {
        if (!formData.name.trim()) {
            toast.error('Nome do grupo é obrigatório');
            return;
        }

        try {
            setIsCreating(true);
            const { data, error } = await supabase
                .from('groups')
                .insert([{
                    tenant_id: tenantId,
                    name: formData.name,
                    description: formData.description
                }])
                .select()
                .single();

            if (error) throw error;

            toast.success('Grupo criado com sucesso');
            setIsCreateDialogOpen(false);
            setFormData({ name: '', description: '' });
            loadGroups();
        } catch (error) {
            console.error('Error creating group:', error);
            toast.error('Erro ao criar grupo');
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteGroup = async (groupId: string) => {
        if (!confirm('Tem certeza que deseja excluir este grupo?')) return;

        try {
            const { error } = await supabase
                .from('groups')
                .delete()
                .eq('id', groupId);

            if (error) throw error;

            toast.success('Grupo excluído');
            loadGroups();
        } catch (error) {
            console.error('Error deleting group:', error);
            toast.error('Erro ao excluir grupo');
        }
    };

    const openManageMembers = async (group: Group) => {
        setSelectedGroup(group);
        setIsManageMembersOpen(true);
        await Promise.all([
            loadGroupMembers(group.id),
            loadAvailableUsers(group.id)
        ]);
    };

    const loadGroupMembers = async (groupId: string) => {
        const { data, error } = await supabase
            .from('group_members')
            .select('*, profile:profiles(full_name, email)') // Assuming user_id maps to profiles.user_id if linked, or we might need to join on id
            // Wait, group_members.user_id refers to... 
            // In add_groups_tables.sql: user_id UUID NOT NULL
            // In profiles table: user_id (auth id) and id (profile uuid).
            // Let's assume group_members.user_id stores the PROFILE ID or AUTH ID?
            // "References profiles(user_id) conceptually"
            // If I store AUTH ID, I can join with profiles on user_id.
            // Let's check how I plan to store it. I'll store AUTH UD.
            // So fetch should join profiles on user_id.
            // Supabase join syntax: profiles!group_members_user_id_fkey ... wait, there is no explicit FK.
            // If there is no explicit FK, supabase client might not auto-join.
            // I might need to fetch manually.
            // Let's see if I can fetch profiles directly.
            .eq('group_id', groupId);

        // Since I didn't create a FK in SQL (just a comment), I can't join easily with simple syntax unless I defined it.
        // But typically profiles has `user_id` which is unique.
        // Alternative: Store PROFILE.ID in group_members.user_id? 
        // UserManagement uses profiles.
        // Let's store PROFILE.USER_ID (Auth ID) to be safe with Auth.

        if (error) {
            console.error('Error loading members:', error);
            return;
        }

        // Manual join if needed
        const memberUserIds = data.map(m => m.user_id);
        if (memberUserIds.length > 0) {
            const { data: profiles } = await supabase.from('profiles').select('user_id, full_name, email').in('user_id', memberUserIds);

            const membersWithProfiles = data.map(m => ({
                ...m,
                profile: profiles?.find(p => p.user_id === m.user_id) || { full_name: 'Unknown', email: 'Unknown' }
            }));
            setGroupMembers(membersWithProfiles);
        } else {
            setGroupMembers([]);
        }
    };

    const loadAvailableUsers = async (groupId: string) => {
        // Load all profiles in tenant
        const { data: profiles } = await supabase.from('profiles').select('user_id, full_name, email').eq('tenant_id', tenantId);
        if (profiles) {
            // Exclude existing members
            // This requires us to know existing members first. 
            // But effectively we can just filter out in UI or here.
            // Let's fetch existing members for this group first (already done in openManageMembers in parallel, might race)
            // Actually, let's just fetch all and filter in render or set state.

            // Better:
            const { data: existingMembers } = await supabase.from('group_members').select('user_id').eq('group_id', groupId);
            const existingIds = new Set(existingMembers?.map(m => m.user_id) || []);

            const available = profiles.filter(p => p.user_id && !existingIds.has(p.user_id)).map(p => ({
                id: p.user_id, // Store auth user_id
                profile: p
            }));
            setAvailableUsers(available);
        }
    };

    const handleAddMember = async () => {
        if (!selectedGroup || !selecteduserIdToAdd) return;

        try {
            const { error } = await supabase.from('group_members').insert({
                group_id: selectedGroup.id,
                user_id: selecteduserIdToAdd,
                role: 'member'
            });

            if (error) throw error;

            toast.success('Membro adicionado');
            setSelectedUserIdToAdd('');
            loadGroupMembers(selectedGroup.id);
            loadAvailableUsers(selectedGroup.id);
            loadGroups(); // Update count
        } catch (error) {
            console.error('Error adding member:', error);
            toast.error('Erro ao adicionar membro');
        }
    };

    const handleRemoveMember = async (memberId: string, memberUserId: string) => {
        try {
            const { error } = await supabase.from('group_members').delete().eq('id', memberId);
            if (error) throw error;

            if (selectedGroup) {
                loadGroupMembers(selectedGroup.id);
                loadAvailableUsers(selectedGroup.id);
                loadGroups(); // Update count
            }
            toast.success('Membro removido');
        } catch (error) {
            console.error('Error removing member:', error);
            toast.error('Erro ao remover membro');
        }
    };

    const filteredGroups = groups.filter(group =>
        group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Gerenciamento de Grupos
                            </CardTitle>
                            <CardDescription>
                                Crie grupos para atribuir vulnerabilidades a equipes específicas
                            </CardDescription>
                        </div>

                        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Novo Grupo
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Criar Novo Grupo</DialogTitle>
                                    <DialogDescription>
                                        Defina o nome e descrição do grupo/equipe.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nome do Grupo</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                            placeholder="Ex: Desenvolvimento, Segurança, Infraestrutura"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Descrição</Label>
                                        <Textarea
                                            id="description"
                                            value={formData.description}
                                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                            placeholder="Descrição das responsabilidades deste grupo"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancelar</Button>
                                    <Button onClick={handleCreateGroup} disabled={isCreating}>
                                        {isCreating ? 'Criando...' : 'Criar Grupo'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-2 mb-4">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar grupos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-sm"
                        />
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Descrição</TableHead>
                                    <TableHead>Membros</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredGroups.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                            Nenhum grupo encontrado
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredGroups.map((group) => (
                                        <TableRow key={group.id}>
                                            <TableCell className="font-medium">{group.name}</TableCell>
                                            <TableCell>{group.description}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80" onClick={() => openManageMembers(group)}>
                                                    {group.member_count} membros
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="sm" onClick={() => openManageMembers(group)}>
                                                        <UserPlus className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => handleDeleteGroup(group.id)}>
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isManageMembersOpen} onOpenChange={setIsManageMembersOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Gerenciar Membros: {selectedGroup?.name}</DialogTitle>
                        <DialogDescription>
                            Adicione ou remova usuários deste grupo.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex gap-4 items-end mb-6">
                        <div className="flex-1 space-y-2">
                            <Label>Adicionar Usuário</Label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={selecteduserIdToAdd}
                                onChange={(e) => setSelectedUserIdToAdd(e.target.value)}
                            >
                                <option value="">Selecione um usuário...</option>
                                {availableUsers.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.profile.full_name} ({user.profile.email})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <Button onClick={handleAddMember} disabled={!selecteduserIdToAdd}>
                            Adicionar
                        </Button>
                    </div>

                    <div className="rounded-md border max-h-[400px] overflow-y-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {groupMembers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                                            Nenhum membro neste grupo
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    groupMembers.map(member => (
                                        <TableRow key={member.id}>
                                            <TableCell>{member.profile?.full_name}</TableCell>
                                            <TableCell>{member.profile?.email}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" onClick={() => handleRemoveMember(member.id, member.user_id)}>
                                                    <X className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
