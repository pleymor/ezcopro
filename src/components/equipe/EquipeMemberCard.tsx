'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Crown, UserMinus, Eye, Pencil } from 'lucide-react';
import type { RoleSyndic, MembreSyndic } from '@/types/membre-syndic';
import { roleLabels } from '@/types/membre-syndic';

interface MembreAvecId extends MembreSyndic {
  userId: string;
}

interface EquipeMemberCardProps {
  membre: MembreAvecId;
  isCurrentUser: boolean;
  canManageTeam: boolean;
  canTransferOwnership: boolean;
  onUpdateRole: (userId: string, newRole: RoleSyndic) => Promise<void>;
  onRemove: (userId: string) => Promise<void>;
  onTransferOwnership: (userId: string) => void;
}

const roleIcons: Record<RoleSyndic, React.ComponentType<{ className?: string }>> = {
  admin: Crown,
  gestionnaire: Pencil,
  lecteur: Eye,
};

const roleBadgeVariants: Record<RoleSyndic, 'default' | 'secondary' | 'outline'> = {
  admin: 'default',
  gestionnaire: 'secondary',
  lecteur: 'outline',
};

export function EquipeMemberCard({
  membre,
  isCurrentUser,
  canManageTeam,
  canTransferOwnership,
  onUpdateRole,
  onRemove,
  onTransferOwnership,
}: EquipeMemberCardProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);

  const RoleIcon = roleIcons[membre.role];

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await onRemove(membre.userId);
      setShowRemoveDialog(false);
    } finally {
      setIsRemoving(false);
    }
  };

  const handleRoleChange = async (newRole: RoleSyndic) => {
    if (newRole === membre.role) return;
    setIsUpdatingRole(true);
    try {
      await onUpdateRole(membre.userId, newRole);
    } finally {
      setIsUpdatingRole(false);
    }
  };

  // Le admin ne peut pas etre modifie directement (seulement via transfert)
  const canModify = canManageTeam && !isCurrentUser && membre.role !== 'admin';
  const canRemove = canManageTeam && !isCurrentUser && membre.role !== 'admin';

  return (
    <>
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <RoleIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {membre.displayName || membre.email || membre.userId.slice(0, 8)}
                </span>
                {isCurrentUser && (
                  <Badge variant="outline" className="text-xs">
                    Vous
                  </Badge>
                )}
              </div>
              {membre.email && membre.displayName && (
                <p className="text-sm text-muted-foreground">{membre.email}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={roleBadgeVariants[membre.role]}>
              {roleLabels[membre.role]}
            </Badge>

            {(canModify || canRemove || (canTransferOwnership && membre.role !== 'admin')) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={isUpdatingRole || isRemoving}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {canModify && (
                    <>
                      <DropdownMenuItem
                        onClick={() => handleRoleChange('gestionnaire')}
                        disabled={membre.role === 'gestionnaire'}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Passer Gestionnaire
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleRoleChange('lecteur')}
                        disabled={membre.role === 'lecteur'}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Passer Lecteur
                      </DropdownMenuItem>
                    </>
                  )}
                  {canTransferOwnership && membre.role !== 'admin' && (
                    <>
                      {canModify && <DropdownMenuSeparator />}
                      <DropdownMenuItem onClick={() => onTransferOwnership(membre.userId)}>
                        <Crown className="mr-2 h-4 w-4" />
                        Transférer la propriété
                      </DropdownMenuItem>
                    </>
                  )}
                  {canRemove && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setShowRemoveDialog(true)}
                      >
                        <UserMinus className="mr-2 h-4 w-4" />
                        Retirer de l&apos;equipe
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </Card>

      <ConfirmDialog
        open={showRemoveDialog}
        onOpenChange={setShowRemoveDialog}
        title="Retirer ce membre ?"
        description={`${membre.displayName || membre.email || 'Ce membre'} n'aura plus acces a cette copropriete.`}
        confirmLabel="Retirer"
        onConfirm={handleRemove}
        isLoading={isRemoving}
        variant="destructive"
      />
    </>
  );
}
