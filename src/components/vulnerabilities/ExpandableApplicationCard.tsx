import React, { useState, memo } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import ApplicationForm from './ApplicationForm';
import {
    ChevronDown,
    ChevronRight,
    Eye,
    Trash2,
    MoreVertical,
    AlertTriangle,
    Edit,
    Globe,
    Smartphone,
    Code,
    Database,
    Cloud,
    Monitor,
    Shield,
    Calendar,
    ExternalLink,
    User,
    Target,
    Search,
    Clock,
    MoreHorizontal,
    type LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const assetIcons: Record<string, LucideIcon> = {
    'Web Application': Globe,
    'Mobile App': Smartphone,
    'API': Code,
    'Database': Database,
    'Cloud Service': Cloud,
    'Desktop App': Monitor
};

const getStatusBadgeColor = (status: string) => {
    const colors = {
        'Ativo': 'bg-green-600 text-white border border-green-700 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
        'Em Implementação': 'bg-blue-600 text-white border border-blue-700 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
        'Desenvolvimento': 'bg-yellow-600 text-white border border-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
        'Teste': 'bg-blue-600 text-white border border-blue-700 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
        'Descontinuado': 'bg-gray-600 text-white border border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
        'Manutenção': 'bg-orange-600 text-white border border-orange-700 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
    };
    return colors[status as keyof typeof colors] || colors['Ativo'];
};

const getStatusDisplayText = (status: string) => {
    const displayTexts = {
        'Ativo': 'Ativo',
        'Desenvolvimento': 'Desenv.',
        'Teste': 'Teste',
        'Descontinuado': 'Descont.',
        'Manutenção': 'Manutenção',
    };
    return displayTexts[status as keyof typeof displayTexts] || status;
};

const getRiskBadgeColor = (risk: string) => {
    const colors = {
        'Crítica': 'bg-red-600 text-white border border-red-700 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
        'Alta': 'bg-orange-600 text-white border border-orange-700 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
        'Média': 'bg-yellow-600 text-white border border-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
        'Baixa': 'bg-green-600 text-white border border-green-700 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
        'Crítico': 'bg-red-600 text-white border border-red-700 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
        'Alto': 'bg-orange-600 text-white border border-orange-700 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
        'Médio': 'bg-yellow-600 text-white border border-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
        'Baixo': 'bg-green-600 text-white border border-green-700 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    };
    return colors[risk as keyof typeof colors] || colors['Baixa'];
};

// Define Application type properly to avoid 'any'
export type ApplicationType = {
    id: string;
    name: string;
    type: string;
    status: string;
    url: string;
    technology: string;
    owner: string;
    vulnerabilities: number;
    last_scan: string | null;
    risk_level: string;
    is_lgpd?: boolean;
    is_sox?: boolean;
    is_acn?: boolean;
    internet_facing?: boolean;
    [key: string]: string | number | boolean | null | undefined; // Allow other properties if needed
};

interface ExpandableApplicationCardProps {
    application: ApplicationType;
    onView: (app: ApplicationType) => void;
    onDelete: (id: string) => void;
}

const ExpandableApplicationCard: React.FC<ExpandableApplicationCardProps> = memo(({
    application,
    onView,
    onDelete
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const navigate = useNavigate();

    const AssetIcon = assetIcons[application.type] || Globe;

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(application.id);
    };

    const handleView = (e: React.MouseEvent) => {
        e.stopPropagation();
        onView(application);
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(`/vulnerabilities/applications/edit/${application.id}`);
    };

    return (
        <Card className={cn(
            "rounded-lg border text-card-foreground w-full transition-all duration-300 overflow-hidden mb-3",
            isExpanded
                ? "shadow-lg border-primary/30"
                : "hover:bg-gray-50/50 dark:hover:bg-gray-800/50 border-border"
        )}>
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
                <CollapsibleTrigger asChild>
                    <CardHeader className="pb-2 pt-3 px-3 sm:py-4 sm:px-4 cursor-pointer relative z-10 group/header">
                        {/* Hover Effect */}
                        <div
                            className="absolute inset-0 opacity-0 group-hover/header:opacity-100 transition-opacity duration-300 pointer-events-none"
                            style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.05), transparent)' }}
                        />

                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 relative z-10 w-full">
                            {/* Left Section (Always Visible) */}
                            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                    {isExpanded ?
                                        <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" /> :
                                        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                    }
                                </div>

                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    {/* Title Row with Mobile Score & Actions */}
                                    <div className="flex justify-between items-start gap-2 w-full">
                                        <h3 className="font-semibold text-sm truncate flex items-center gap-2" title={application.name}>
                                            <span className="text-muted-foreground text-xs font-mono">{application.id.slice(0, 8)}</span>
                                            {application.name}
                                        </h3>

                                        {/* Mobile Actions (Visible when collapsed on mobile) */}
                                        <div className="flex sm:hidden items-center gap-1.5 flex-shrink-0">
                                            {!isExpanded && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 ml-1">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={handleView}>
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            Visualizar
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={handleEdit}>
                                                            <Edit className="h-4 w-4 mr-2" />
                                                            Editar
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50">
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Excluir
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </div>
                                    </div>

                                    {/* Subtitle Row - Technologies and Owner */}
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                                        <span className="truncate max-w-[120px] sm:max-w-none">{application.type}</span>
                                        <span className="inline">•</span>
                                        <span className="truncate max-w-[120px] sm:max-w-none text-[10px] uppercase tracking-wider font-semibold">{application.technology}</span>
                                        <span className="inline">•</span>
                                        <User className="h-3 w-3 shrink-0" />
                                        <span className="truncate flex-1 min-w-0 max-w-[100px] sm:max-w-none">
                                            {application.owner || 'Não atribuído'}
                                        </span>
                                    </div>

                                    {/* Badges Row - Always visible on mobile, responsive flex */}
                                    <div className="flex items-center gap-1.5 mt-2 flex-wrap sm:hidden">
                                        <Badge className={`${getStatusBadgeColor(application.status)} text-[9px] px-1.5 py-0`}>
                                            {getStatusDisplayText(application.status)}
                                        </Badge>
                                        <Badge className={`${getRiskBadgeColor(application.risk_level)} text-[9px] px-1.5 py-0`}>
                                            {application.risk_level}
                                        </Badge>
                                        {application.vulnerabilities > 0 && (
                                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-destructive text-destructive bg-destructive/5 flex items-center gap-1">
                                                <Target className="h-2.5 w-2.5" />
                                                {application.vulnerabilities}
                                            </Badge>
                                        )}
                                        {application.is_lgpd && (
                                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
                                                LGPD
                                            </Badge>
                                        )}
                                        {application.is_sox && (
                                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800">
                                                SOX
                                            </Badge>
                                        )}
                                        {application.is_acn && (
                                            <Badge variant="outline" className="hidden sm:inline-flex bg-muted/50 border-muted-foreground/20 text-muted-foreground hover:bg-muted font-normal text-xs px-2 py-0">
                                                ACN
                                            </Badge>
                                        )}
                                        {application.internet_facing && (
                                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-400 dark:border-cyan-800 flex items-center gap-1">
                                                <Globe className="h-2.5 w-2.5" />
                                                On
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Desktop Badges (hidden on mobile) */}
                            <div className="hidden sm:flex items-center justify-end gap-2 flex-wrap shrink-0">
                                {application.is_lgpd && (
                                    <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 px-2">
                                        LGPD
                                    </Badge>
                                )}
                                {application.is_sox && (
                                    <Badge variant="outline" className="text-[10px] bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800 px-2">
                                        SOX
                                    </Badge>
                                )}
                                {application.internet_facing && (
                                    <Badge variant="outline" className="text-[10px] bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-400 dark:border-cyan-800 flex items-center gap-1 px-2">
                                        <Globe className="h-3 w-3" />
                                        On
                                    </Badge>
                                )}
                                {application.vulnerabilities > 0 && (
                                    <Badge variant="outline" className="text-[10px] border-destructive text-destructive bg-destructive/5 flex items-center gap-1 px-2">
                                        <Target className="h-3 w-3" />
                                        {application.vulnerabilities}
                                    </Badge>
                                )}
                                <Badge className={`${getRiskBadgeColor(application.risk_level)} text-[10px] px-2`}>
                                    {application.risk_level}
                                </Badge>
                                <Badge className={`${getStatusBadgeColor(application.status)} text-[10px] px-2 w-[70px] justify-center`}>
                                    {getStatusDisplayText(application.status)}
                                </Badge>

                                {!isExpanded && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 ml-1">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48">
                                            <DropdownMenuItem onClick={handleView} className="cursor-pointer">
                                                <Eye className="h-4 w-4 mr-2" />
                                                Visualizar Detalhes
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
                                                <Edit className="h-4 w-4 mr-2" />
                                                Editar Aplicação
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={handleDelete} className="cursor-pointer text-destructive focus:bg-red-50 dark:focus:bg-red-950/50">
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Excluir Aplicação
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                    <div className="border-t bg-card">
                        {isExpanded && (
                            <ApplicationForm
                                applicationId={application.id}
                                isEmbedded={true}
                                onSuccess={() => { setIsExpanded(false); }}
                                onCancel={() => setIsExpanded(false)}
                            />
                        )}
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
});

ExpandableApplicationCard.displayName = 'ExpandableApplicationCard';

export default ExpandableApplicationCard;
