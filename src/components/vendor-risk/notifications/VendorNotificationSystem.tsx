import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Mail, Send } from 'lucide-react';
import type { VendorRegistry, VendorAssessment } from '@/hooks/useVendorRiskManagement';

export interface VendorNotificationSystemProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendors: VendorRegistry[];
  assessments: VendorAssessment[];
}

export const VendorNotificationSystem: React.FC<VendorNotificationSystemProps> = ({
  open,
  onOpenChange,
  vendors,
  assessments
}) => {
  const pendingNotifications = [
    {
      type: 'assessment_reminder',
      count: assessments.filter(a => a.status === 'sent').length,
      description: 'Lembretes de assessment pendentes'
    },
    {
      type: 'contract_expiry',
      count: vendors.filter(v => v.contract_end_date && 
        new Date(v.contract_end_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      ).length,
      description: 'Contratos vencendo em 30 dias'
    },
    {
      type: 'overdue_assessment',
      count: assessments.filter(a => 
        new Date(a.due_date) < new Date() && !['completed', 'approved'].includes(a.status)
      ).length,
      description: 'Assessments em atraso'
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Central de Comunicação - Vendor Risk
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Notification Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pendingNotifications.map((notification, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>{notification.description}</span>
                    <div className="text-2xl font-bold text-blue-600">
                      {notification.count}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button size="sm" variant="outline" className="w-full gap-2">
                    <Send className="h-4 w-4" />
                    Enviar Notificações
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Integration Notice */}
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Sistema de Notificações
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    O sistema de notificações está integrado com o módulo principal de comunicações.
                    Todas as notificações de vendor risk são enviadas através da central unificada.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};