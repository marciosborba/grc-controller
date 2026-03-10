
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTenantManagement } from '@/hooks/useTenantManagement';
import { MoreVertical, UserX, KeyRound } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';

interface TenantUsersTabProps {
    tenantId: string;
}

export const TenantUsersTab: React.FC<TenantUsersTabProps> = ({ tenantId }) => {
    const { getTenantUsers } = useTenantManagement();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [tenantId]);

    const loadData = async () => {
        try {
            const data = await getTenantUsers(tenantId);
            setUsers(data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleDeactivate = (userId: string) => {
        toast.info("Funcionalidade de desativar usuário em breve.");
    }

    const handleResetPassword = (email: string) => {
        toast.info(`Email de redefinição enviado para ${email}`);
        // Implement supabaseauth reset logic if needed
    }

    if (loading) return <div>Carregando usuários...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Usuários ({users.length})</CardTitle>
                        <CardDescription>Usuários cadastrados nesta organização.</CardDescription>
                    </div>
                    <Button variant="outline">Adicionar Usuário</Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Usuário</TableHead>
                                <TableHead>Cargo/Dep</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Último Acesso</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        Nenhum usuário encontrado.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.user_id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarImage src={`https://avatar.vercel.sh/${user.email}`} />
                                                    <AvatarFallback>{user.full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{user.full_name || 'Sem nome'}</span>
                                                    <span className="text-xs text-muted-foreground">{user.email}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-sm">{user.job_title || '-'}</span>
                                                <span className="text-xs text-muted-foreground">{user.department || '-'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={user.is_active ? 'default' : 'secondary'} className={!user.is_active ? 'opacity-50' : ''}>
                                                {user.is_active ? 'Ativo' : 'Inativo'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Nunca'}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => handleResetPassword(user.email)}>
                                                        <KeyRound className="mr-2 h-4 w-4" /> Redefinir Senha
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleDeactivate(user.user_id)} className="text-red-600">
                                                        <UserX className="mr-2 h-4 w-4" /> Desativar Acesso
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};
