import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { AlertTriangle, Save, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import type { Incident } from '@/types/incident-management';

interface IncidentManagementModalProps {
  incident: Incident | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const IncidentManagementModalTest: React.FC<IncidentManagementModalProps> = ({
  incident,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();
  const tenantIdFromSelector = useCurrentTenantId();
  
  // Determinar tenant_id correto
  const getEffectiveTenantId = (): string => {
    if (user?.isPlatformAdmin) {
      return tenantIdFromSelector || '';
    }
    return user?.tenantId || '';
  };
  
  const effectiveTenantId = getEffectiveTenantId();
  
  // Estados básicos
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validação super simples
  const validateForm = (): boolean => {
    console.log('🔍 VALIDAÇÃO TESTE');
    console.log('📋 Title:', title);
    console.log('👤 User:', user);
    console.log('🏢 Effective Tenant ID:', effectiveTenantId);
    
    if (!title.trim()) {
      console.log('❌ Título vazio');
      toast.error('Título é obrigatório');
      return false;
    }
    
    if (!effectiveTenantId) {
      console.log('❌ Tenant ID vazio');
      toast.error('Tenant ID não encontrado');
      return false;
    }
    
    console.log('✅ Validação passou');
    return true;
  };

  // Submit super simples
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 SUBMIT TESTE INICIADO');
    
    if (!validateForm()) {
      console.log('❌ Validação falhou');
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Dados mínimos
      const incidentData = {
        title: title.trim(),
        description: 'Teste de incidente',
        category: 'Segurança da Informação',
        priority: 'medium',
        status: 'open',
        type: 'security_breach',
        severity: 'medium',
        detection_date: new Date().toISOString(),
        tenant_id: effectiveTenantId,
        created_at: new Date().toISOString()
      };
      
      console.log('📤 Dados para teste:', incidentData);

      const { data, error } = await supabase
        .from('incidents')
        .insert(incidentData)
        .select()
        .single();

      console.log('📥 Resposta:', { data, error });

      if (error) {
        console.error('❌ ERRO:', error);
        throw error;
      }
      
      console.log('✅ Sucesso:', data);
      toast.success('Incidente de teste criado!');
      onSuccess();
      onClose();

    } catch (error: any) {
      console.error('❌ ERRO CAPTURADO:', error);
      toast.error(`Erro: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Teste de Incidente
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Debug Info */}
          <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded border">
            <strong>🔧 Debug Teste:</strong>
            <br />
            <strong>User ID:</strong> {user?.id || 'N/A'}
            <br />
            <strong>User Tenant ID:</strong> {user?.tenantId || 'N/A'}
            <br />
            <strong>Selector Tenant ID:</strong> {tenantIdFromSelector || 'N/A'}
            <br />
            <strong>Effective Tenant ID:</strong> {effectiveTenantId || 'N/A'}
            <br />
            <strong>Platform Admin:</strong> {user?.isPlatformAdmin ? 'Sim' : 'Não'}
          </div>

          <div>
            <Label htmlFor="title">Título do Teste *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite um título para teste"
              disabled={isSubmitting}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Criar Teste
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default IncidentManagementModalTest;