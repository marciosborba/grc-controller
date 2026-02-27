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
import { RiskEvolutionWidget } from './widgets/RiskEvolutionWidget';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { Skeleton } from '@/components/ui/skeleton';
import { ShieldCheck, CalendarClock, Settings, Activity, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const WidgetSkeleton = () => <Skeleton className="h-full w-full rounded-xl min-h-[220px] bg-slate-800/50" />;

export default function ModernDashboard() {
    const { user } = useAuth();
    const tenantId = useCurrentTenantId();
    const date = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

    // Force dark mode background for this specific component to ensure consistency
    // regardless of system theme
    return (
        <div className="bg-background text-foreground space-y-6 animate-in fade-in duration-700 font-sans selection:bg-primary/30">

            {/* Header Section */}
            {/* Header Section */}
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 md:gap-6 pb-4 md:pb-8 border-b border-white/5 relative">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none opacity-20" />

                <div className="relative z-10 w-full">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                        <div className="px-2 py-1 rounded-md bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">GRC Intelligence</span>
                        </div>
                    </div>
                    <h1 className="text-xl sm:text-3xl md:text-5xl font-black tracking-tight text-foreground mt-1 max-w-[90%] sm:max-w-full">
                        Dashboard Executivo
                    </h1>
                    <p className="text-muted-foreground mt-2 sm:mt-3 max-w-2xl text-[13px] sm:text-base md:text-lg font-light leading-relaxed">
                        Visão holística de <span className="text-foreground font-medium">Governança</span>, <span className="text-foreground font-medium">Riscos</span> e <span className="text-foreground font-medium">Conformidade</span>.
                    </p>
                </div>

                <div className="flex flex-col items-start md:items-end gap-3 relative z-10 w-full md:w-auto mt-2 md:mt-0">
                    {/* Smart Alerts / Indicators */}
                    <div className="flex flex-wrap justify-start md:justify-end gap-1.5 sm:gap-2 w-full">
                        <div className="flex items-center gap-1 sm:gap-2 px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 animate-pulse">
                            <ShieldCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            <span className="text-[9px] sm:text-xs font-bold leading-none">3 Riscos Críticos</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400">
                            <AlertTriangle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            <span className="text-[9px] sm:text-xs font-bold leading-none">8 Forn. Críticos</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
                            <Activity className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            <span className="text-[9px] sm:text-xs font-bold leading-none">92% Conformidade</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end mt-1">
                        <Button variant="outline" size="sm" className="bg-white/5 border-white/10 hover:bg-white/10 text-slate-300 gap-1.5 h-8 sm:h-10 px-2 sm:px-4 text-[10px] sm:text-sm flex-1 md:flex-none justify-start md:justify-center">
                            <CalendarClock className="h-3 w-3 sm:h-4 sm:w-4" />
                            {date}
                        </Button>
                        <div className="h-8 w-[1px] bg-white/10 mx-1 hidden md:block" />
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-white/5 h-8 w-8 sm:h-10 sm:w-10">
                            <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
                    </div>
                </div>
            </div>






            {/* Main Grid - Ultimate 12 Modules (4x3) for Expert GRC Coverage */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {/* Row 1: Strategic & High Level */}
                <div className="min-h-[160px] sm:min-h-[260px] lg:min-h-[350px] h-auto w-full">
                    <Suspense fallback={<WidgetSkeleton />}>
                        <RiskWidget />
                    </Suspense>
                </div>
                <div className="min-h-[160px] sm:min-h-[260px] lg:min-h-[350px] h-auto w-full">
                    <Suspense fallback={<WidgetSkeleton />}>
                        <ComplianceWidget />
                    </Suspense>
                </div>
                <div className="min-h-[160px] sm:min-h-[260px] lg:min-h-[350px] h-auto w-full">
                    <Suspense fallback={<WidgetSkeleton />}>
                        <PrivacyWidget />
                    </Suspense>
                </div>
                <div className="min-h-[160px] sm:min-h-[260px] lg:min-h-[350px] h-auto w-full">
                    <Suspense fallback={<WidgetSkeleton />}>
                        <TPRMWidget />
                    </Suspense>
                </div>

                {/* Row 2: Operational & Tactical */}
                <div className="min-h-[160px] sm:min-h-[260px] lg:min-h-[350px] h-auto w-full">
                    <Suspense fallback={<WidgetSkeleton />}>
                        <VulnerabilityWidget />
                    </Suspense>
                </div>
                <div className="min-h-[160px] sm:min-h-[260px] lg:min-h-[350px] h-auto w-full">
                    <Suspense fallback={<WidgetSkeleton />}>
                        <IncidentsWidget />
                    </Suspense>
                </div>
                <div className="min-h-[160px] sm:min-h-[260px] lg:min-h-[350px] h-auto w-full">
                    <Suspense fallback={<WidgetSkeleton />}>
                        <AuditWidget />
                    </Suspense>
                </div>
                <div className="min-h-[160px] sm:min-h-[260px] lg:min-h-[350px] h-auto w-full">
                    <Suspense fallback={<WidgetSkeleton />}>
                        <PolicyWidget />
                    </Suspense>
                </div>

                <div className="min-h-[160px] sm:min-h-[260px] lg:min-h-[350px] h-auto w-full">
                    <Suspense fallback={<WidgetSkeleton />}>
                        <EthicsWidget />
                    </Suspense>
                </div>
                <div className="min-h-[160px] sm:min-h-[260px] lg:min-h-[350px] h-auto w-full">
                    <Suspense fallback={<WidgetSkeleton />}>
                        <AssessmentsWidget />
                    </Suspense>
                </div>
                <div className="min-h-[160px] sm:min-h-[260px] lg:min-h-[350px] h-auto w-full">
                    <Suspense fallback={<WidgetSkeleton />}>
                        <NotificationsWidget />
                    </Suspense>
                </div>
                <div className="min-h-[160px] sm:min-h-[260px] lg:min-h-[350px] h-auto w-full">
                    <Suspense fallback={<WidgetSkeleton />}>
                        <ActionPlanWidget />
                    </Suspense>
                </div>
            </div>



            {/* Secondary Grid - Risk Matrix & Evolution (Side-by-Side) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
                <div className="min-h-[350px] sm:min-h-[450px] lg:min-h-[800px] h-auto w-full">
                    <Suspense fallback={<WidgetSkeleton />}>
                        <RiskMatrixWidget />
                    </Suspense>
                </div>
                <div className="min-h-[520px] sm:min-h-[500px] lg:h-[900px] h-auto">
                    <Suspense fallback={<WidgetSkeleton />}>
                        <RiskEvolutionWidget />
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
