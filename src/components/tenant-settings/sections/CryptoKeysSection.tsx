import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Key, Upload } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TenantKey {
  key_id: string;
  status: 'active' | 'retired' | 'compromised';
  created_at: string;
  rotated_at: string | null;
  next_rotation: string | null;
  algorithm: string;
}

export function CryptoKeysSection() {
  const [keys, setKeys] = useState<TenantKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [rotating, setRotating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [customKey, setCustomKey] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchKeys = async () => {
    try {
      const { data, error } = await supabase.rpc('get_tenant_key_status');
      if (error) throw error;
      setKeys(data || []);
    } catch (error) {
      console.error('Error fetching keys:', error);
      toast.error('Failed to load encryption keys');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleRotateKey = async () => {
    if (!confirm('Are you sure you want to rotate the encryption key? This requires re-encrypting sensitive data and may take some time.')) return;

    setRotating(true);
    try {
      // Use the new RPC with null to auto-generate
      const { error } = await supabase.rpc('set_tenant_custom_key', {
        p_tenant_id: (await supabase.auth.getSession()).data.session?.user.id, // This might be wrong if RPC uses auth.uid(), let's check RPC def usually infers from context if security definer
        // Wait, the RPC set_tenant_custom_key(p_tenant_id, p_key_material)
        // Usually we pass parameters. But p_tenant_id should probably be inferred from auth if not passed?
        // My definition: set_tenant_custom_key(p_tenant_id uuid, p_key_material text)
        // We need to pass p_tenant_id.
        // BUT, frontend shouldn't guess tenant_id ideally.
        // Let's rely on the fact that we are authenticated.
        // Actually, let's fix the RPC call to pass the correct params.
        // However, obtaining tenant_id in component might need a context or specific call.
        // Let's check how other components get tenant_id.
        // Assuming we can pass the current user's tenant_id.
        // For now, I'll assume the RPC handles permission checks, but I must pass the argument.
        // To be safe, I'm going to pass the tenant_id from the profile if available, OR
        // ideally the RPC should leverage `auth.uid()` to find the tenant.
        // The RPC I wrote takes `p_tenant_id`.
        // Let's create a wrapper or assume the frontend has access to it.
        // For this task, I'll try to fetch the user's tenant first?
        // Actually, supabase.rpc usually matches update/insert RLS?
        // I will fetch the user's profile to get tenant_id first.
        p_key_material: null
      });
      // WAIT: The RPC expects p_tenant_id.
      // I need to fetch it.
    } catch (error) {
      // handled below
    }
    // ... rewriting to include tenant fetching logic inside the handler ...
  };

  // Re-writing the functions to be complete and correct
  const executeKeyRotation = async (customKeyMaterial: string | null) => {
    setRotating(true);
    try {
      // Get current user's tenant
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('user_id', user.id)
        .single();

      if (!profile?.tenant_id) throw new Error('Tenant not found');

      const { error } = await supabase.rpc('set_tenant_custom_key', {
        p_tenant_id: profile.tenant_id,
        p_key_material: customKeyMaterial
      });

      if (error) throw error;

      toast.success(customKeyMaterial ? 'Custom key imported successfully' : 'Encryption key rotated successfully');
      setCustomKey('');
      setIsDialogOpen(false);
      await fetchKeys();
    } catch (error) {
      console.error('Error rotating key:', error);
      toast.error('Failed to rotate encryption key');
    } finally {
      setRotating(false);
      setImporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Key className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Encryption Keys
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm mt-1">
              Manage your tenant's encryption keys. Regular rotation is recommended for security.
            </CardDescription>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 text-xs">
                  <Upload className="h-3.5 w-3.5" />
                  Import Key
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-[450px]">
                <DialogHeader>
                  <DialogTitle className="text-sm sm:text-base">Import Custom Key (BYOK)</DialogTitle>
                  <DialogDescription className="text-xs">
                    Provide a custom AES-256 key (Base64 encoded) to use for encryption.
                    <br />
                    <span className="text-destructive font-bold">Warning: ensuring you have a backup of this key is your responsibility.</span>
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="key" className="text-sm">Key (Base64)</Label>
                    <Input
                      id="key"
                      value={customKey}
                      onChange={(e) => setCustomKey(e.target.value)}
                      placeholder="e.g. aS3...=="
                      type="password"
                    />
                  </div>
                </div>
                <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button onClick={() => executeKeyRotation(customKey)} disabled={!customKey || rotating}>
                    {rotating ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                    Save Custom Key
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button
              onClick={() => {
                if (confirm('Are you sure? This will generate a new random key.')) {
                  executeKeyRotation(null);
                }
              }}
              disabled={rotating || loading}
              variant="outline"
              size="sm"
              className="gap-2 text-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${rotating && !isDialogOpen ? 'animate-spin' : ''}`} />
              Rotate Key
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4 text-muted-foreground">Loading keys...</div>
        ) : keys.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No encryption keys found. Click "Rotate Key" to generate your first key.
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Algorithm</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Rotated At</TableHead>
                  <TableHead>Next Rotation</TableHead>
                  <TableHead>Key ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((key) => (
                  <TableRow key={key.key_id}>
                    <TableCell>
                      <Badge variant={key.status === 'active' ? 'default' : 'secondary'}>
                        {key.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{key.algorithm}</TableCell>
                    <TableCell>{new Date(key.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{key.rotated_at ? new Date(key.rotated_at).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>
                      {key.next_rotation ? (
                        <span className={new Date(key.next_rotation) < new Date() ? 'text-destructive font-bold' : ''}>
                          {new Date(key.next_rotation).toLocaleDateString()}
                        </span>
                      ) : '-'}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {key.key_id.substring(0, 8)}...
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}