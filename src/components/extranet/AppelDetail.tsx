'use client';

import { Calendar, Home, FileText, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatMontant, formatDate } from '@/hooks/useExtranetSolde';
import type { DetailAppel } from '@/lib/firebase/services/solde';

interface AppelDetailProps {
  appel: DetailAppel & { lots?: { lotId: string; lotNumero: string }[] };
  onBack?: () => void;
}

/**
 * Détail d'un appel de fonds.
 */
export function AppelDetail({ appel, onBack }: AppelDetailProps) {
  const lots = appel.lots || [{ lotId: appel.lotId, lotNumero: appel.lotNumero }];
  const isOverdue = new Date(appel.dateEcheance.seconds * 1000) < new Date();

  return (
    <Card>
      <CardHeader>
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="w-fit -ml-2 mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour
          </Button>
        )}
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{appel.libelle}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Calendar className="h-4 w-4" />
              Échéance: {formatDate(appel.dateEcheance)}
              {isOverdue && (
                <Badge variant="destructive" className="ml-2">
                  Échue
                </Badge>
              )}
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{formatMontant(appel.montantCents)}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Lots concernés */}
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Home className="h-4 w-4" />
            Lots concernés
          </h4>
          <div className="flex flex-wrap gap-2">
            {lots.map((lot) => (
              <Badge key={lot.lotId} variant="secondary">
                Lot {lot.lotNumero}
              </Badge>
            ))}
          </div>
        </div>

        {/* Informations supplémentaires */}
        <div className="rounded-lg bg-muted p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Référence appel</span>
            <span className="font-mono">{appel.appelId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Montant total</span>
            <span className="font-semibold">{formatMontant(appel.montantCents)}</span>
          </div>
        </div>

        {/* Note informative */}
        <div className="text-xs text-muted-foreground flex items-start gap-2">
          <FileText className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <p>
            Cet appel de fonds correspond à votre quote-part des charges de la copropriété.
            Pour toute question, veuillez contacter votre syndic.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
