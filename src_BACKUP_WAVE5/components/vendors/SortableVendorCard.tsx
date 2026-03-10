import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import VendorCard from './VendorCard';
import { Vendor } from '@/types/vendor-management';

interface SortableVendorCardProps {
  vendor: Vendor;
  onUpdate?: (vendorId: string, updates: any) => void;
  onDelete?: (vendorId: string) => void;
  canEdit?: boolean;
  dragHandleProps?: any;
}

const SortableVendorCard: React.FC<SortableVendorCardProps> = ({
  vendor,
  onUpdate,
  onDelete,
  canEdit = true,
  dragHandleProps,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: vendor.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <VendorCard
        vendor={vendor}
        onUpdate={onUpdate}
        onDelete={onDelete}
        canEdit={canEdit}
      />
    </div>
  );
};

export default SortableVendorCard;