import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2, Copy, Plus, Key } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const ApiTokensSection = () => {
    const [tokens, setTokens] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [newTokenName, setNewTokenName] = useState('');
    const [generatedToken, setGeneratedToken] = useState<string | null>(null);

    useEffect(() => {
        loadTokens();
    }, []);

    const loadTokens = async () => {
        setLoading(true);
        // Mock data for now, as table might not exist yet
        // In real impl: const { data } = await supabase.from('api_tokens').select('*');
        setTokens([
            { id: '1', name: 'CI/CD Pipeline', last_used_at: new Date().toISOString(), created_at: new Date().toISOString(), is_active: true }
        ]);
        setLoading(false);
    };

    const createToken = () => {
        if (!newTokenName) return;

        // Mock generation
        const mockToken = 'grc_' + Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);
        setGeneratedToken(mockToken);

        setTokens([...tokens, {
            id: Math.random().toString(),
            name: newTokenName,
            last_used_at: null,
            created_at: new Date().toISOString(),
            is_active: true
        }]);

        setNewTokenName('');
        toast.success("Token criado com sucesso!");
    };

    const deleteToken = (id: string) => {
        setTokens(tokens.filter(t => t.id !== id));
        toast.success("Token revogado.");
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Key className="h-5 w-5 text-purple-600" />
                        Tokens de Acesso Pessoal (API)
                    </CardTitle>
                    <CardDescription>
                        Gerencie tokens para acessar a API do GRC Controller programaticamente.
                    </CardDescription>
                </CardHeader>
                <CardContent>

                    {generatedToken && (
                        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg animate-in slide-in-from-top-2">
                            <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Novo Token Gerado</h4>
                            <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
                                Copie este token agora. Você não poderá vê-lo novamente.
                            </p>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 p-2 bg-background border rounded font-mono text-sm break-all">
                                    {generatedToken}
                                </code>
                                <Button variant="outline" size="icon" onClick={() => {
                                    navigator.clipboard.writeText(generatedToken);
                                    toast.success("Copiado!");
                                }}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4 mb-6">
                        <div className="flex-1">
                            <Label htmlFor="tokenName" className="sr-only">Nome do Token</Label>
                            <Input
                                id="tokenName"
                                placeholder="Ex: Integração Jenkins"
                                value={newTokenName}
                                onChange={e => setNewTokenName(e.target.value)}
                            />
                        </div>
                        <Button onClick={createToken} disabled={!newTokenName}>
                            <Plus className="h-4 w-4 mr-2" />
                            Gerar Novo Token
                        </Button>
                    </div>

                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Criado em</TableHead>
                                    <TableHead>Último Uso</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tokens.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            Nenhum token ativo.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    tokens.map(token => (
                                        <TableRow key={token.id}>
                                            <TableCell className="font-medium">{token.name}</TableCell>
                                            <TableCell>
                                                <Badge variant={token.is_active ? 'default' : 'secondary'} className={token.is_active ? 'bg-green-500 hover:bg-green-600' : ''}>
                                                    {token.is_active ? 'Ativo' : 'Revogado'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{new Date(token.created_at).toLocaleDateString()}</TableCell>
                                            <TableCell>{token.last_used_at ? new Date(token.last_used_at).toLocaleDateString() : 'Nunca'}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => deleteToken(token.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
