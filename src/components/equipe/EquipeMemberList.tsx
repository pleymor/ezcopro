'use client';

import { EquipeMemberCard } from './EquipeMemberCard';
import type { RoleSyndic, MembreSyndic } from '@/types/membre-syndic';

interface MembreAvecId extends MembreSyndic {
  userId: string;
}

interface EquipeMemberListProps {
  membres: MembreAvecId[];
  currentUserId: string;
  canManageTeam: boolean;
  canTransferOwnership: boolean;
  onUpdateRole: (userId: string, newRole: RoleSyndic) => Promise<void>;
  onRemove: (userId: string) => Promise<void>;
  onTransferOwnership: (userId: string) => void;
}

export function EquipeMemberList({
  membres,
  currentUserId,
  canManageTeam,
  canTransferOwnership,
  onUpdateRole,
  onRemove,
  onTransferOwnership,
}: EquipeMemberListProps) {
  if (membres.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Aucun membre dans l&apos;equipe
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {membres.map((membre) => (
        <EquipeMemberCard
          key={membre.userId}
          membre={membre}
          isCurrentUser={membre.userId === currentUserId}
          canManageTeam={canManageTeam}
          canTransferOwnership={canTransferOwnership}
          onUpdateRole={onUpdateRole}
          onRemove={onRemove}
          onTransferOwnership={onTransferOwnership}
        />
      ))}
    </div>
  );
}
