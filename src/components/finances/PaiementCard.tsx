'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Paiement } from '@/types/paiement';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { condoPaths } from '@/lib/utils/condo-routes';
import { Calendar, Trash2, Pencil, User } from 'lucide-react';

interface PaiementCardProps {
  paiement: Paiement;
  condoId: string;
  coproprietaireNom: string;
  onDelete?: () => void;
  isEditable?: boolean;
}

export function PaiementCard({ paiement, condoId, coproprietaireNom, onDelete, isEditable = true }: PaiementCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-lg">{coproprietaireNom}</CardTitle>
          </div>
          <span className="text-xl font-bold text-green-600">
            +{formatCurrency(paiement.montantCents)}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(paiement.datePaiement)}</span>
            </div>
            {paiement.reference && (
              <div className="text-xs">Réf: {paiement.reference}</div>
            )}
          </div>
          {isEditable && (
            <div className="flex gap-2">
              <Link href={condoPaths.paiementEdit(condoId, paiement.id)}>
                <Button variant="outline" size="sm">
                  <Pencil className="mr-2 h-4 w-4" />
                  Modifier
                </Button>
              </Link>
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDelete}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
