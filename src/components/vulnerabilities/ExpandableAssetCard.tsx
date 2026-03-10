import React, { useState, memo } from 'react';
import { format, isPast, parseISO } from 'date-fns';
import {
    Card,
    CardContent,
    CardHeader,
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
import AssetForm from './AssetForm';
import {
    ChevronDown,
    ChevronRight,
    Eye,
    Trash2,
    MoreVertical,
    Edit,
    Globe,
    Smartphone,
    Monitor,
    Database,
    Cloud,
    Server,
    Network,
    HardDrive,
    Building,
    Cpu,
    Target,
    User,
    Shield,
    Calendar,
    MoreHorizontal,
    type LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const assetIcons: Record<string, LucideIcon> = {
    'Server': Server,
    'Workstation': Monitor,
    'Network Device': Network,
    'Mobile Device': Smartphone,
    'Storage': HardDrive,
    'Infrastructure': Building,
    'Cloud Service': Cloud,
    'Virtual Machine': Cpu
};

const getStatusBadgeColor = (status: string) => {
    const colors = {
        'Ativo': 'bg-green-600 text-white border border-green-700 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
        'Inativo': 'bg-gray-600 text-white border border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
        'Manutenção': 'bg-orange-600 text-white border border-orange-700 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
        'Descomissionado': 'bg-red-600 text-white border border-red-700 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
        'Em Teste': 'bg-blue-600 text-white border border-blue-700 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    };
    return colors[status as keyof typeof colors] || colors['Ativo'];
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

export type AssetType = {
    id: string;
    name: string;
    type: string;
    status: string;
    ip_address: string;
    location: string;
    os: string;
    owner: string;
    vulnerabilities: number;
    last_scan: string | null;
    risk_level: string;
    eol_date?: string | null;
    edr_enabled?: boolean;
    [key: string]: string | number | boolean | null | undefined;
};

interface ExpandableAssetCardProps {
    asset: AssetType;
    onView: (asset: AssetType) => void;
    onDelete: (id: string) => void;
    onUpdate?: () => void;
}

const ExpandableAssetCard: React.FC<ExpandableAssetCardProps> = memo(({
    asset,
    onView,
    onDelete,
    onUpdate
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const navigate = useNavigate();

    const AssetIcon = assetIcons[asset.type] || Server;

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(asset.id);
    };

    const handleView = (e: React.MouseEvent) => {
        e.stopPropagation();
        onView(asset);
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(true);
    };

    // Check EOL status
    const isEolPast = !asset.eol_date || isPast(parseISO(asset.eol_date));
    const eolBadgeClasses = isEolPast
        ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
        : "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800";

    // Check EDR status
    const hasEdr = asset.edr_enabled === true;
    const edrBadgeClasses = !hasEdr
        ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
        : "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800";

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
                        <div
                            className="absolute inset-0 opacity-0 group-hover/header:opacity-100 transition-opacity duration-300 pointer-events-none"
                            style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.05), transparent)' }}
                        />

                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 relative z-10 w-full">
                            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                    {isExpanded ?
                                        <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" /> :
                                        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                    }
                                </div>
                                <div className="flex items-center justify-center p-2 rounded-md bg-primary/10 text-primary hidden sm:flex">
                                    <AssetIcon className="h-5 w-5" />
                                </div>

                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <div className="flex justify-between items-start gap-2 w-full">
                                        <h3 className="font-semibold text-sm truncate flex items-center gap-2" title={asset.name}>
                                            <span className="text-muted-foreground text-xs font-mono">{asset.id.slice(0, 8)}</span>
                                            {asset.name}
                                        </h3>

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

                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                                        <span className="truncate max-w-[120px] sm:max-w-none">{asset.type}</span>
                                        <span className="inline">•</span>
                                        <span className="truncate max-w-[100px] sm:max-w-none text-[10px]">{asset.ip_address}</span>
                                        <span className="inline">•</span>
                                        <span className="truncate max-w-[100px] sm:max-w-none text-[10px]">{asset.os !== 'N/A' && asset.os ? asset.os : 'OS N/A'}</span>
                                        <span className="inline">•</span>
                                        <span className="truncate max-w-[100px] sm:max-w-none text-[10px]">{asset.location !== 'N/A' && asset.location ? asset.location : 'Local N/A'}</span>
                                        <span className="inline">•</span>
                                        <User className="h-3 w-3 shrink-0" />
                                        <span className="truncate flex-1 min-w-0 max-w-[100px] sm:max-w-none">
                                            {asset.owner || 'Não atribuído'}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1.5 mt-2 flex-wrap sm:hidden">
                                        <Badge className={`${getStatusBadgeColor(asset.status)} text-[9px] px-1.5 py-0`}>
                                            {asset.status}
                                        </Badge>
                                        <Badge className={`${getRiskBadgeColor(asset.risk_level)} text-[9px] px-1.5 py-0`}>
                                            {asset.risk_level}
                                        </Badge>
                                        <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0", eolBadgeClasses)}>
                                            <Calendar className="h-2.5 w-2.5 mr-1" />
                                            EOL
                                        </Badge>
                                        <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0", edrBadgeClasses)}>
                                            <Shield className="h-2.5 w-2.5 mr-1" />
                                            EDR
                                        </Badge>
                                        {asset.vulnerabilities > 0 && (
                                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-destructive text-destructive bg-destructive/5 flex items-center gap-1">
                                                <Target className="h-2.5 w-2.5" />
                                                {asset.vulnerabilities}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="hidden sm:flex items-center justify-end gap-2 flex-wrap shrink-0">
                                <Badge variant="outline" className={cn("text-[10px] px-2", eolBadgeClasses)}>
                                    <Calendar className="h-3 w-3 mr-1" />
                                    EOL
                                </Badge>
                                <Badge variant="outline" className={cn("text-[10px] px-2", edrBadgeClasses)}>
                                    <Shield className="h-3 w-3 mr-1" />
                                    EDR
                                </Badge>
                                {asset.vulnerabilities > 0 && (
                                    <Badge variant="outline" className="text-[10px] border-destructive text-destructive bg-destructive/5 flex items-center gap-1 px-2">
                                        <Target className="h-3 w-3" />
                                        {asset.vulnerabilities}
                                    </Badge>
                                )}
                                <Badge className={`${getRiskBadgeColor(asset.risk_level)} text-[10px] px-2`}>
                                    {asset.risk_level}
                                </Badge>
                                <Badge className={`${getStatusBadgeColor(asset.status)} text-[10px] px-2 w-[80px] justify-center`}>
                                    {asset.status}
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
                                                Editar Ativo
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={handleDelete} className="cursor-pointer text-destructive focus:bg-red-50 dark:focus:bg-red-950/50">
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Excluir Ativo
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
                            <AssetForm
                                assetId={asset.id}
                                initialData={asset}
                                isEmbedded={true}
                                onSuccess={() => { setIsExpanded(false); if (onUpdate) onUpdate(); }}
                                onCancel={() => setIsExpanded(false)}
                            />
                        )}
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
});

ExpandableAssetCard.displayName = 'ExpandableAssetCard';

export default ExpandableAssetCard;
