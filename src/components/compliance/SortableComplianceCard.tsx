import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import ComplianceCard from './ComplianceCard';
import type { ComplianceAssessment } from '@/types/compliance-management';

interface SortableComplianceCardProps {
  item: ComplianceAssessment;
  onUpdate?: (itemId: string, updates: any) => void;
  onDelete?: (itemId: string) => void;
  canEdit?: boolean;
}

const SortableComplianceCard: React.FC<SortableComplianceCardProps> = (props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: props.item.id,
    data: {
      type: 'compliance-item',
      item: props.item,
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        ${isDragging ? 'z-50 opacity-75 scale-105' : 'opacity-100 scale-100'}
        transition-all duration-200 ease-out
        ${isDragging ? 'shadow-2xl' : ''}
        relative group
      `}
    >
      {/* Drag Handle - Ícone no canto superior direito */}
      <div
        className="absolute right-2 top-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-grab active:cursor-grabbing bg-white dark:bg-gray-800 rounded p-1 shadow-sm border border-gray-200 dark:border-gray-600"
        {...attributes}
        {...listeners}
        title="Arrastar para reordenar"
      >
        <GripVertical className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" />
      </div>

      {/* Compliance Card */}
      <ComplianceCard 
        compliance={props.item}
        onUpdate={props.onUpdate}
        onDelete={props.onDelete}
        canEdit={props.canEdit}
      />
    </div>
  );
};

export default SortableComplianceCard;