import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RiskTableRowProps {
  risk: any;
  onEdit: (risk: any) => void;
  onDelete: (id: string) => void;
  getRiskLevelColor: (level: string) => string;
  getStatusColor: (status: string) => string;
}

const RiskTableRow = React.memo(({ risk, onEdit, onDelete, getRiskLevelColor, getStatusColor }: RiskTableRowProps) => {
  const handleEdit = () => onEdit(risk);
  const handleDelete = () => onDelete(risk.id);

  return (
    <TableRow>
      <TableCell className="text-xs">
        <div>
          <p className="font-medium">{risk.title}</p>
          <p className="text-xs text-muted-foreground truncate max-w-xs">
            {risk.description}
          </p>
        </div>
      </TableCell>
      <TableCell className="text-xs">{risk.risk_category}</TableCell>
      <TableCell className="text-xs">
        <Badge className={getRiskLevelColor(risk.risk_level)}>
          {risk.risk_level}
        </Badge>
      </TableCell>
      <TableCell className="text-xs">
        <Badge className={getStatusColor(risk.status)}>
          {risk.status === 'open' ? 'Aberto' :
           risk.status === 'in_progress' ? 'Em Progresso' :
           risk.status === 'mitigated' ? 'Mitigado' : 'Fechado'}
        </Badge>
      </TableCell>
      <TableCell className="text-xs">
        <span className="font-mono">{risk.risk_score}</span>
      </TableCell>
      <TableCell className="text-xs">
        {risk.due_date ? format(new Date(risk.due_date), "dd/MM/yyyy", { locale: ptBR }) : '-'}
      </TableCell>
      <TableCell>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleEdit}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
});

RiskTableRow.displayName = 'RiskTableRow';

export default RiskTableRow;