import React from 'react';
import AIManagerCore from '@/components/ai/AIManagerCore';

interface AISettingsTabProps {
    tenantId?: string;
}

export const AISettingsTab: React.FC<AISettingsTabProps> = ({ tenantId }) => {
    if (!tenantId) return <div>Selecione uma organização para configurar.</div>;

    return (
        <AIManagerCore
            tenantId={tenantId}
            mode="tenant"
        />
    );
};
