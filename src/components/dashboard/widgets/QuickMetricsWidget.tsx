import React from 'react';
import { Card } from '@/components/ui/card';
import { Target, Users, Server, Globe, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const QuickMetricsWidget = () => {
    const navigate = useNavigate();

    const metrics = [
        { label: "Ativos Monitorados", value: "156", icon: Server, color: "text-purple-400", bg: "bg-purple-500/10", route: "/assets" },
        { label: "Aplicações", value: "24", icon: Globe, color: "text-blue-400", bg: "bg-blue-500/10", route: "/apps" },
        { label: "Usuários", value: "12", icon: Users, color: "text-emerald-400", bg: "bg-emerald-500/10", route: "/settings/users" },
        { label: "Políticas", value: "8", icon: Target, color: "text-amber-400", bg: "bg-amber-500/10", route: "/policies" }
    ];

    return (
        <div className="grid grid-cols-2 gap-4 h-full">
            {metrics.map((metric, idx) => (
                <Card
                    key={idx}
                    className="relative overflow-hidden bg-card border-border/50 hover:border-border hover:bg-accent/5 transition-all duration-300 cursor-pointer group flex flex-col justify-between p-5"
                    onClick={() => metric.route && navigate(metric.route)}
                >
                    <div className="flex justify-between items-start z-10">
                        <div className={`p-2 rounded-lg ${metric.bg} border border-white/5`}>
                            <metric.icon className={`h-5 w-5 ${metric.color}`} />
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                    </div>

                    <div className="z-10 mt-2">
                        <span className="text-3xl font-bold text-foreground tracking-tight block">{metric.value}</span>
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-1 block">{metric.label}</span>
                    </div>

                    {/* Decorative Background Icon */}
                    <metric.icon className={`absolute -right-4 -bottom-4 h-20 w-20 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity ${metric.color} pointer-events-none`} />
                </Card>
            ))}
        </div>
    );
};
