import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Role {
  name: string;
  key: string;
  permissions: string[];
}

interface RolePermissionCardProps {
  role: Role;
  allModules: string[];
  onSave: (updatedRole: Role) => void;
  onDelete: (roleKey: string) => void;
}

const RolePermissionCard: React.FC<RolePermissionCardProps> = ({
  role,
  allModules,
  onSave,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedRole, setEditedRole] = useState(role);

  const handlePermissionToggle = (module: string) => {
    const newPermissions = editedRole.permissions.includes(module)
      ? editedRole.permissions.filter(p => p !== module)
      : [...editedRole.permissions, module];
    
    setEditedRole({
      ...editedRole,
      permissions: newPermissions
    });
  };

  const handleSave = () => {
    try {
      onSave(editedRole);
      setIsEditing(false);
      toast.success(`Papel "${editedRole.name}" atualizado com sucesso!`);
    } catch (error) {
      toast.error('Erro ao atualizar papel');
    }
  };

  const handleCancel = () => {
    setEditedRole(role);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm(`Tem certeza que deseja remover o papel "${role.name}"?`)) {
      onDelete(role.key);
      toast.success(`Papel "${role.name}" removido com sucesso!`);
    }
  };

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isEditing ? (
            <Input 
              value={editedRole.name}
              onChange={(e) => setEditedRole({...editedRole, name: e.target.value})}
              className="font-medium text-sm w-48"
            />
          ) : (
            <span className="font-medium">{role.name}</span>
          )}
          <Badge variant="secondary">{role.key}</Badge>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button size="sm" onClick={handleSave}>
                Salvar
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                Editar
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-red-600 hover:text-red-700" 
                onClick={handleDelete}
              >
                Remover
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-sm">
        {allModules.map((module) => (
          <label key={module} className="flex items-center gap-2">
            <input 
              type="checkbox" 
              checked={isEditing ? editedRole.permissions.includes(module) : role.permissions.includes(module)}
              onChange={() => isEditing && handlePermissionToggle(module)}
              disabled={!isEditing}
              className="rounded" 
            />
            <span className={!isEditing && !role.permissions.includes(module) ? 'text-muted-foreground' : ''}>
              {module}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default RolePermissionCard;