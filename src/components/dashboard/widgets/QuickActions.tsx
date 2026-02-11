import React from 'react';
import { Plus, Siren, FileText, UserPlus, FileCheck, Shield, Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const QuickActions = () => {
    const navigate = useNavigate();

    const actions = [
        { label: "Novo Assessment", icon: FileCheck, color: "text-emerald-500", route: "/assessments/new" },
        { label: "Reportar Incidente", icon: Siren, color: "text-red-500", route: "/incidents" },
        { label: "Analisar Risco", icon: Shield, color: "text-orange-500", route: "/risks/matrix" },
        { label: "Plano de Ação", icon: Rocket, color: "text-blue-500", route: "/action-plans/create" },
        { label: "Novo Usuário", icon: UserPlus, color: "text-purple-500", route: "/settings/users" },
        { label: "Relatórios", icon: FileText, color: "text-foreground", route: "/reports" },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {actions.map((action, idx) => (
                <button
                    key={idx}
                    className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border/50 hover:bg-accent hover:border-border hover:-translate-y-1 transition-all duration-300 text-left group shadow-sm hover:shadow-md"
                    onClick={() => navigate(action.route)}
                >
                    <div className="p-2 rounded-lg bg-secondary group-hover:bg-background transition-colors border border-border/10">
                        <action.icon className={`h-4 w-4 ${action.color}`} />
                    </div>
                    <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors uppercase tracking-wider">
                        {action.label}
                    </span>
                </button>
            ))}
        </div>
    );
};
