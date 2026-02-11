import React, { Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { RiskWidget } from './widgets/RiskWidget';
import { ComplianceWidget } from './widgets/ComplianceWidget';
import { VulnerabilityWidget } from './widgets/VulnerabilityWidget';
import { IncidentsWidget } from './widgets/IncidentsWidget';
import { ActionPlanWidget } from './widgets/ActionPlanWidget';
import { QuickMetricsWidget } from './widgets/QuickMetricsWidget';
import { QuickActions } from './widgets/QuickActions';
import { PrivacyWidget } from './widgets/PrivacyWidget';
import { TPRMWidget } from './widgets/TPRMWidget';
import { PolicyWidget } from './widgets/PolicyWidget';
import { AuditWidget } from './widgets/AuditWidget';
import { EthicsWidget } from './widgets/EthicsWidget';
import { AssessmentsWidget } from './widgets/AssessmentsWidget';
import { NotificationsWidget } from './widgets/NotificationsWidget';
import { RiskMatrixWidget } from './widgets/RiskMatrixWidget';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { Skeleton } from '@/components/ui/skeleton';
import { ShieldCheck, CalendarClock, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

const WidgetSkeleton = () => <Skeleton className="h-full w-full rounded-xl min-h-[220px] bg-slate-800/50" />;

export default function ModernDashboard() {
    const { user } = useAuth();
    const tenantId = useCurrentTenantId();
    const date = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

    // Force dark mode background for this specific component to ensure consistency
    // regardless of system theme
    return (
        <div className="min-h-screen bg-background text-foreground p-4 lg:p-8 space-y-8 animate-in fade-in duration-700 font-sans selection:bg-primary/30">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-white/5">
                <div>
                    <div className="flex items-center gap-2 text-blue-400 mb-2">
                        <ShieldCheck className="h-5 w-5" />
                        <span className="text-xs font-bold uppercase tracking-widest">Mission Control</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mt-1">
                        Visão Geral de Segurança
                    </h1>
                    <p className="text-slate-400 mt-2 max-w-2xl text-lg">
                        Monitoramento em tempo real de riscos, conformidade e ameaças.
                    </p>
                </div>

                <div className="flex flex-col items-end gap-3">
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500 font-mono hidden md:inline-block">
                            Tenant: <span className="text-slate-300">{tenantId}</span>
                        </span>
                        <Button variant="outline" size="sm" className="bg-white/5 border-white/10 hover:bg-white/10 text-white gap-2">
                            <CalendarClock className="h-4 w-4" />
                            {date}
                        </Button>
                        <Button variant="outline" size="icon" className="bg-white/5 border-white/10 hover:bg-white/10 text-white">
                            <Settings className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>






            {/* Main Grid - Ultimate 12 Modules (4x3) for Expert GRC Coverage */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Row 1: Strategic & High Level */}
                <div className="h-[350px]">
                    <Suspense fallback={<WidgetSkeleton />}>
                        <RiskWidget />
                    </Suspense>
                </div>
                <div className="h-[350px]">
                    <Suspense fallback={<WidgetSkeleton />}>
                        <ComplianceWidget />
                    </Suspense>
                </div>
                <div className="h-[350px]">
                    <Suspense fallback={<WidgetSkeleton />}>
                        <PrivacyWidget />
                    </Suspense>
                </div>
                <div className="h-[350px]">
                    <Suspense fallback={<WidgetSkeleton />}>
                        <TPRMWidget />
                    </Suspense>
                </div>

                {/* Row 2: Operational & Tactical */}
                <div className="h-[350px]">
                    <Suspense fallback={<WidgetSkeleton />}>
                        <VulnerabilityWidget />
                    </Suspense>
                </div>
                <div className="h-[350px]">
                    <Suspense fallback={<WidgetSkeleton />}>
                        <IncidentsWidget />
                    </Suspense>
                </div>
                <div className="h-[350px]">
                    <Suspense fallback={<WidgetSkeleton />}>
                        <AuditWidget />
                    </Suspense>
                </div>
                <div className="h-[350px]">
                    <Suspense fallback={<WidgetSkeleton />}>
                        <PolicyWidget />
                    </Suspense>
                </div>

                {/* Row 3: Human & Process */}
                <div className="h-[350px]">
                    <Suspense fallback={<WidgetSkeleton />}>
                        <EthicsWidget />
                    </Suspense>
                </div>
                <div className="h-[350px]">
                    <Suspense fallback={<WidgetSkeleton />}>
                        <AssessmentsWidget />
                    </Suspense>
                </div>
                <div className="h-[350px]">
                    <Suspense fallback={<WidgetSkeleton />}>
                        <NotificationsWidget />
                    </Suspense>
                </div>
                <div className="h-[350px]">
                    <Suspense fallback={<WidgetSkeleton />}>
                        <ActionPlanWidget />
                    </Suspense>
                </div>
            </div>

            {/* Secondary Grid - Risk Matrix */}
            <div className="grid grid-cols-1 gap-6">
                <div className="min-h-[350px]">
                    <Suspense fallback={<WidgetSkeleton />}>
                        <RiskMatrixWidget />
                    </Suspense>
                </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="pt-6 border-t border-white/5">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 px-1">Acesso Rápido</h2>
                <Suspense fallback={<Skeleton className="h-[100px] w-full bg-slate-800/50" />}>
                    <QuickActions />
                </Suspense>
            </div>
        </div>
    );
}
