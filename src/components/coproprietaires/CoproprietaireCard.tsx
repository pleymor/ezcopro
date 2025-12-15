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
import type { Coproprietaire } from '@/types/coproprietaire';
import type { Lot } from '@/types/lot';
import { Pencil, Mail, UserX } from 'lucide-react';

interface CoproprietaireCardProps {
  coproprietaire: Coproprietaire;
  lots: Lot[];
  onInvite?: () => void;
  onAnonymize?: () => void;
}

export function CoproprietaireCard({
  coproprietaire,
  lots,
  onInvite,
  onAnonymize,
}: CoproprietaireCardProps) {
  const totalTantiemes = lots.reduce((sum, lot) => sum + lot.tantiemes, 0);

  return (
    <Card className={coproprietaire.isAnonymized ? 'opacity-60' : ''}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">
          {coproprietaire.nom} {coproprietaire.prenom}
        </CardTitle>
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
      <CardFooter className="flex-wrap gap-2">
        {!coproprietaire.isAnonymized && (
          <>
            <Link href={`/coproprietaires/${coproprietaire.id}/edit`}>
              <Button variant="outline" size="sm">
                <Pencil className="mr-2 h-4 w-4" />
                Modifier
              </Button>
            </Link>
            {!coproprietaire.userId && onInvite && (
              <Button variant="outline" size="sm" onClick={onInvite}>
                <Mail className="mr-2 h-4 w-4" />
                Inviter
              </Button>
            )}
            {onAnonymize && (
              <Button variant="ghost" size="sm" onClick={onAnonymize}>
                <UserX className="mr-2 h-4 w-4" />
                Anonymiser
              </Button>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
}
