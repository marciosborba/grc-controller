import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import TenantCard from './TenantCard';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  contact_email: string;
  contact_phone?: string;
  billing_email?: string;
  max_users: number;
  current_users_count: number;
  subscription_plan: string;
  subscription_status: string;
  is_active: boolean;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

interface SortableTenantCardProps {
  tenant: Tenant;
  onDelete: (tenantId: string) => void;
  isDeleting: boolean;
}

const SortableTenantCard: React.FC<SortableTenantCardProps> = (props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.tenant.id });

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
      {/* Drag Handle */}
      <div
        className="absolute right-1 top-1 sm:right-2 sm:top-2 z-10 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-grab active:cursor-grabbing bg-background rounded p-1.5 shadow-sm border border-border" aria-label="Arrastar para reordenar"
        {...attributes}
        {...listeners}
        title="Arrastar para reordenar"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground hover:text-foreground" />
      </div>
      
      <TenantCard {...props} />
    </div>
  );
};

export default SortableTenantCard;