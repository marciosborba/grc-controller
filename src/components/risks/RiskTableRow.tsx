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
      <TableCell className="text-[10px] sm:text-xs py-2 px-1 sm:px-4">
        <div>
          <p className="font-medium line-clamp-1">{risk.title}</p>
          <p className="text-[8px] sm:text-xs text-muted-foreground line-clamp-1 max-w-[100px] sm:max-w-xs">
            {risk.description}
          </p>
        </div>
      </TableCell>
      <TableCell className="text-[10px] sm:text-xs py-2 px-1 sm:px-4 hidden md:table-cell">{risk.risk_category}</TableCell>
      <TableCell className="text-[10px] sm:text-xs py-2 px-1 sm:px-4">
        <Badge className={getRiskLevelColor(risk.risk_level)}>
          {risk.risk_level}
        </Badge>
      </TableCell>
      <TableCell className="text-[10px] sm:text-xs py-2 px-1 sm:px-4 hidden sm:table-cell">
        <Badge className={getStatusColor(risk.status)}>
          {risk.status === 'open' ? 'Aberto' :
            risk.status === 'in_progress' ? 'Em Progresso' :
              risk.status === 'mitigated' ? 'Mitigado' : 'Fechado'}
        </Badge>
      </TableCell>
      <TableCell className="text-[10px] sm:text-xs py-2 px-1 sm:px-4 text-center">
        <span className="font-mono">{risk.risk_score}</span>
      </TableCell>
      <TableCell className="text-[10px] sm:text-xs py-2 px-1 sm:px-4 hidden sm:table-cell">
        {risk.due_date ? format(new Date(risk.due_date), "dd/MM/yyyy", { locale: ptBR }) : '-'}
      </TableCell>
      <TableCell>
        <div className="flex space-x-1 sm:space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6 sm:h-8 sm:w-8"
            onClick={handleEdit}
          >
            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6 sm:h-8 sm:w-8"
            onClick={handleDelete}
          >
            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
});

RiskTableRow.displayName = 'RiskTableRow';

export default RiskTableRow;