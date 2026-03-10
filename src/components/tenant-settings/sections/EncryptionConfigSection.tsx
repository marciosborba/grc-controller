import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Shield, Lock, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export function EncryptionConfigSection() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('v_tenant_encryption_status')
          .select('*')
          .maybeSingle();

        if (!error && data) {
          setStatus(data);
        }
      } catch (err) {
        console.error("Failed to fetch encryption status", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Data Encryption
        </CardTitle>
        <CardDescription>
          Configuration for data at rest encryption.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between space-x-2">
          <div className="flex flex-col space-y-1">
            <Label htmlFor="encryption-enabled" className="text-base font-medium">
              Encryption at Rest
            </Label>
            <span className="text-sm text-muted-foreground">
              All sensitive data fields are encrypted using AES-256-GCM.
            </span>
          </div>
          <Switch id="encryption-enabled" checked={true} disabled />
        </div>

        <div className="rounded-lg border p-4 bg-muted/50">
          <div className="flex items-start gap-3">
            <Lock className="h-5 w-5 text-primary mt-0.5" />
            <div className="space-y-1 w-full">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium leading-none">Standard Encryption</h4>
                {loading ? (
                  <Skeleton className="h-5 w-16" />
                ) : (
                  <Badge variant={status?.is_active ? "default" : "destructive"}>
                    {status?.is_active ? "Active" : "Inactive"}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Your data is secured using industry-standard AES-256-GCM encryption with tenant-specific keys.
                Keys are automatically rotated according to your policy.
              </p>
              {status && (
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  <span>Version: {status.encryption_version}</span>
                  <span className="mx-1">•</span>
                  <span>Key Age: {Math.round(status.key_age_days || 0)} days</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}