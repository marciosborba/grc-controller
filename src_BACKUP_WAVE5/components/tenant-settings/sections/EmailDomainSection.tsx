import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Mail, Plus, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface EmailDomainSectionProps {
  tenantId: string;
  onSettingsChange: () => void;
}

export const EmailDomainSection: React.FC<EmailDomainSectionProps> = ({
  tenantId,
  onSettingsChange
}) => {
  const [domainRestriction, setDomainRestriction] = useState(false);
  const [allowedDomains, setAllowedDomains] = useState(['empresa.com']);
  const [newDomain, setNewDomain] = useState('');

  const addDomain = () => {
    if (!newDomain.trim()) return;
    
    const domain = newDomain.trim().toLowerCase();
    if (allowedDomains.includes(domain)) {
      toast.error('Domínio já está na lista');
      return;
    }
    
    setAllowedDomains([...allowedDomains, domain]);
    setNewDomain('');
    onSettingsChange();
    toast.success('Domínio adicionado');
  };

  const removeDomain = (domain: string) => {
    setAllowedDomains(allowedDomains.filter(d => d !== domain));
    onSettingsChange();
    toast.success('Domínio removido');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Domínios de Email Permitidos
        </CardTitle>
        <CardDescription>
          Restrinja o registro de usuários a domínios específicos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="domain-restriction">Restringir domínios de email</Label>
            <p className="text-sm text-muted-foreground">
              Apenas emails dos domínios listados poderão se registrar
            </p>
          </div>
          <Switch
            id="domain-restriction"
            checked={domainRestriction}
            onCheckedChange={(checked) => {
              setDomainRestriction(checked);
              onSettingsChange();
            }}
          />
        </div>

        {domainRestriction && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="exemplo.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addDomain()}
              />
              <Button onClick={addDomain} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Adicionar
              </Button>
            </div>
            
            <div className="space-y-2">
              <Label>Domínios Permitidos</Label>
              {allowedDomains.map((domain, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="font-mono text-sm">{domain}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDomain(domain)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};