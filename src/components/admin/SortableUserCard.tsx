import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import UserCard from './UserCard';
import type { ExtendedUser } from '@/types/user-management';

interface SortableUserCardProps {
  user: ExtendedUser;
  onUpdate: (userId: string, userData: unknown) => void;
  onDelete: (userId: string) => void;
  isUpdating: boolean;
  isDeleting: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

const SortableUserCard: React.FC<SortableUserCardProps> = (props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.user.id });

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
        className="absolute right-2 top-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-grab active:cursor-grabbing bg-white dark:bg-gray-800 rounded p-1 shadow-sm border border-gray-200 dark:border-gray-600"
        {...attributes}
        {...listeners}
        title="Arrastar para reordenar"
      >
        <GripVertical className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" />
      </div>
      
      <UserCard {...props} />
    </div>
  );
};

export default SortableUserCard;