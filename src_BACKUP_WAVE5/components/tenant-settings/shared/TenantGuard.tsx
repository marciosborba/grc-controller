import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface TenantGuardProps {
  message: string;
  icon: LucideIcon;
}

export const TenantGuard: React.FC<TenantGuardProps> = ({ message, icon: Icon }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center text-muted-foreground">
          <Icon className="mx-auto h-12 w-12 mb-4" />
          <p>{message}</p>
        </div>
      </CardContent>
    </Card>
  );
};