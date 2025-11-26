import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    MoreHorizontal,
    Eye,
    Edit,
    Trash2,
    Copy,
    AlertCircle,
    CheckCircle,
    Clock,
    Activity,
    Shield,
    Archive,
    AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Incident, IncidentStatus, IncidentSeverity, IncidentPriority } from '@/types/incident-management';

interface IncidentDataTableProps {
    data: Incident[];
    onEdit: (incident: Incident) => void;
    onDelete: (id: string) => void;
    onDuplicate: (id: string) => void;
    onView: (incident: Incident) => void;
}

const IncidentDataTable: React.FC<IncidentDataTableProps> = ({
    data,
    onEdit,
    onDelete,
    onDuplicate,
    onView
}) => {

    const getStatusBadge = (status: IncidentStatus) => {
        switch (status) {
            case 'open':
                return <Badge variant="destructive" className="bg-red-500/15 text-red-600 dark:text-red-400 hover:bg-red-500/25 border-red-200 dark:border-red-900">Aberto</Badge>;
            case 'investigating':
                return <Badge variant="secondary" className="bg-blue-500/15 text-blue-600 dark:text-blue-400 hover:bg-blue-500/25 border-blue-200 dark:border-blue-900">Investigando</Badge>;
            case 'contained':
                return <Badge variant="secondary" className="bg-orange-500/15 text-orange-600 dark:text-orange-400 hover:bg-orange-500/25 border-orange-200 dark:border-orange-900">Contido</Badge>;
            case 'resolved':
                return <Badge variant="secondary" className="bg-green-500/15 text-green-600 dark:text-green-400 hover:bg-green-500/25 border-green-200 dark:border-green-900">Resolvido</Badge>;
            case 'closed':
                return <Badge variant="outline" className="text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800">Fechado</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getSeverityIcon = (severity: IncidentSeverity) => {
        switch (severity) {
            case 'critical':
                return <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />;
            case 'high':
                return <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />;
            case 'medium':
                return <Activity className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
            case 'low':
                return <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
            default:
                return <Activity className="h-4 w-4 text-gray-400" />;
        }
    };

    return (
        <div className="rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm overflow-hidden">
            <Table>
                <TableHeader className="bg-gray-50 dark:bg-gray-900/50">
                    <TableRow>
                        <TableHead className="w-[300px]">Incidente</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Severidade</TableHead>
                        <TableHead>Prioridade</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Prazo</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                Nenhum incidente encontrado.
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((incident) => (
                            <TableRow key={incident.id} className="group hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                <TableCell className="font-medium">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors">
                                            {incident.title}
                                        </span>
                                        <span className="text-xs text-muted-foreground truncate max-w-[280px]">
                                            {incident.description}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>{getStatusBadge(incident.status)}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {getSeverityIcon(incident.severity)}
                                        <span className="capitalize text-sm">
                                            {incident.severity?.toLowerCase() === 'critical' ? 'Crítica' :
                                                incident.severity?.toLowerCase() === 'high' ? 'Alta' :
                                                    incident.severity?.toLowerCase() === 'medium' ? 'Média' :
                                                        incident.severity?.toLowerCase() === 'low' ? 'Baixa' : (incident.severity || 'N/A')}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="capitalize text-sm">
                                        {incident.priority === 'critical' ? 'Crítica' :
                                            incident.priority === 'high' ? 'Alta' :
                                                incident.priority === 'medium' ? 'Média' :
                                                    incident.priority === 'low' ? 'Baixa' : incident.priority}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="font-normal text-xs">
                                        {incident.category}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                    {incident.resolution_date ?
                                        format(new Date(incident.resolution_date), "dd/MM/yyyy", { locale: ptBR }) :
                                        '-'}
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                    {format(new Date(incident.created_at), "dd MMM, HH:mm", { locale: ptBR })}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Abrir menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => onView(incident)}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                Visualizar
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onEdit(incident)}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Editar
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onDuplicate(incident.id)}>
                                                <Copy className="mr-2 h-4 w-4" />
                                                Duplicar
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={() => onDelete(incident.id)}
                                                className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Excluir
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default IncidentDataTable;
