import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import VendorRiskCard from './VendorRiskCard';

interface VendorRisk {
  id: string;
  vendor_id: string;
  vendor: {
    name: string;
    category: string;
    status: string;
    risk_level: string;
    contact_person: string;
    email: string;
    phone: string;
  };
  title: string;
  description: string;
  risk_category: string;
  likelihood: string;
  impact: string;
  risk_level: string;
  risk_score: number;
  status: string;
  risk_owner: string;
  identified_date: string;
  next_review_date?: string;
  mitigation_actions: any[];
  created_at: string;
  updated_at: string;
}

interface SortableVendorRiskCardProps {
  risk: VendorRisk;
  onUpdate?: (riskId: string, updates: any) => void;
  onDelete?: (riskId: string) => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

const SortableVendorRiskCard: React.FC<SortableVendorRiskCardProps> = (props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: props.risk.id,
    data: {
      type: 'vendor-risk',
      risk: props.risk,
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

      {/* Vendor Risk Card */}
      <VendorRiskCard {...props} />
    </div>
  );
};

export default SortableVendorRiskCard;