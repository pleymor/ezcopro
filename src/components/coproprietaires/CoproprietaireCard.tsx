'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { InviteButton } from '@/components/extranet/InviteButton';
import { useAuth } from '@/lib/hooks/useAuth';
import { useInvitationStatus } from '@/hooks/useInvitationsExtranet';
import { condoPaths } from '@/lib/utils/condo-routes';
import type { Coproprietaire } from '@/types/coproprietaire';
import type { Lot } from '@/types/lot';
import { Pencil, UserX, UserCheck, Clock, Shield, ShieldOff, Crown } from 'lucide-react';

interface CoproprietaireCardProps {
  coproprietaire: Coproprietaire;
  lots: Lot[];
  onInviteExtranet?: (email: string) => Promise<void>;
  onResendInvitation?: () => Promise<void>;
  onAnonymize?: () => void;
  onToggleBoardMember?: (isBoardMember: boolean) => Promise<void>;
  onSetPresident?: (isPresident: boolean) => Promise<void>;
  isEditable?: boolean;
  condoId: string;
}

type InvitationStatusType = 'active' | 'pending' | 'none';

function StatusIcon({ status, showTooltip, onToggle }: {
  status: InvitationStatusType;
  showTooltip: boolean;
  onToggle: () => void;
}) {
  if (status === 'none') return null;

  const config = {
    active: { icon: UserCheck, color: 'text-green-600', label: 'Compte actif' },
    pending: { icon: Clock, color: 'text-amber-500', label: 'Invitation envoyée' },
  }[status];

  const Icon = config.icon;

  return (
    <span className="relative">
      <Icon
        className={`h-4 w-4 ${config.color} cursor-pointer`}
        onClick={onToggle}
      />
      {showTooltip && (
        <span className="absolute left-6 top-0 z-10 whitespace-nowrap rounded bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md border">
          {config.label}
        </span>
      )}
    </span>
  );
}

export function CoproprietaireCard({
  coproprietaire,
  lots,
  onInviteExtranet,
  onResendInvitation,
  onAnonymize,
  onToggleBoardMember,
  onSetPresident,
  isEditable = true,
  condoId,
}: CoproprietaireCardProps) {
  const { user } = useAuth();
  const { hasPending, hasAccount: hasAccountFromInvitation } = useInvitationStatus(coproprietaire.id);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isTogglingBoard, setIsTogglingBoard] = useState(false);
  const [isSettingPresident, setIsSettingPresident] = useState(false);
  const totalTantiemes = lots.reduce((sum, lot) => sum + lot.tantiemes, 0);

  const handleToggleBoardMember = async () => {
    if (!onToggleBoardMember) return;
    setIsTogglingBoard(true);
    try {
      await onToggleBoardMember(!coproprietaire.isBoardMember);
    } finally {
      setIsTogglingBoard(false);
    }
  };

  const handleSetPresident = async () => {
    if (!onSetPresident) return;
    setIsSettingPresident(true);
    try {
      await onSetPresident(!coproprietaire.isPresident);
    } finally {
      setIsSettingPresident(false);
    }
  };

  // Formater la date de nomination si présente
  const formatNominationDate = () => {
    if (!coproprietaire.dateNominationConseil) return null;
    const date = coproprietaire.dateNominationConseil as { toDate?: () => Date; seconds: number };
    const d = date.toDate ? date.toDate() : new Date(date.seconds * 1000);
    return d.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
  };

  // Vérifier si le compte est lié
  const emailMatchesCurrentUser = !!(user?.email && coproprietaire.email &&
    user.email.toLowerCase() === coproprietaire.email.toLowerCase());
  const hasLinkedAccount = !!coproprietaire.userId || emailMatchesCurrentUser || hasAccountFromInvitation;

  // Déterminer le statut à afficher
  const invitationStatus: InvitationStatusType = hasLinkedAccount ? 'active' : hasPending ? 'pending' : 'none';

  const nominationDate = formatNominationDate();

  return (
    <Card className={coproprietaire.isAnonymized ? 'opacity-60' : ''}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <StatusIcon
              status={invitationStatus}
              showTooltip={showTooltip}
              onToggle={() => setShowTooltip(!showTooltip)}
            />
            {coproprietaire.nom} {coproprietaire.prenom}
          </CardTitle>
          {coproprietaire.isBoardMember && (
            <Badge
              variant={coproprietaire.isPresident ? "default" : "secondary"}
              className="flex items-center gap-1"
            >
              {coproprietaire.isPresident ? (
                <Crown className="h-3 w-3" />
              ) : (
                <Shield className="h-3 w-3" />
              )}
              {coproprietaire.isPresident ? 'Président' : 'Conseil'}
              {nominationDate && ` (${nominationDate})`}
            </Badge>
          )}
        </div>
        <CardDescription>
          {lots.length} lot{lots.length > 1 ? 's' : ''} - {totalTantiemes} tantièmes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {coproprietaire.email && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Email</span>
            <span>{coproprietaire.email}</span>
          </div>
        )}
        {coproprietaire.telephone && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Téléphone</span>
            <span>{coproprietaire.telephone}</span>
          </div>
        )}
        {lots.length > 0 && (
          <div className="text-sm">
            <span className="text-muted-foreground">Lots: </span>
            {lots.map((lot) => lot.numero).join(', ')}
          </div>
        )}
        {coproprietaire.isAnonymized && (
          <p className="text-sm text-muted-foreground italic">
            Données anonymisées (RGPD)
          </p>
        )}
      </CardContent>
      {isEditable && !coproprietaire.isAnonymized && (
        <CardFooter className="flex-wrap gap-2">
          <Link href={condoPaths.coproprietaireEdit(condoId, coproprietaire.id)}>
            <Button variant="outline" size="sm">
              <Pencil className="mr-2 h-4 w-4" />
              Modifier
            </Button>
          </Link>
          {onToggleBoardMember && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleBoardMember}
              disabled={isTogglingBoard}
            >
              {coproprietaire.isBoardMember ? (
                <>
                  <ShieldOff className="mr-2 h-4 w-4" />
                  Retirer du conseil
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Ajouter au conseil
                </>
              )}
            </Button>
          )}
          {onSetPresident && coproprietaire.isBoardMember && !coproprietaire.isPresident && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSetPresident}
              disabled={isSettingPresident}
            >
              <Crown className="mr-2 h-4 w-4" />
              Nommer président
            </Button>
          )}
          {onInviteExtranet && (
            <InviteButton
              coproprietaireId={coproprietaire.id}
              coproprietaireNom={`${coproprietaire.prenom} ${coproprietaire.nom}`}
              coproprietaireEmail={coproprietaire.email ?? null}
              linkedUserId={coproprietaire.userId}
              currentUserEmail={user?.email}
              onInvite={onInviteExtranet}
              onResend={onResendInvitation}
            />
          )}
          {onAnonymize && (
            <Button variant="ghost" size="sm" onClick={onAnonymize}>
              <UserX className="mr-2 h-4 w-4" />
              Anonymiser
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
