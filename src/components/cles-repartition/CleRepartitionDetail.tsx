'use client';

import Link from 'next/link';
import { Pencil, Trash2, Key, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { CleRepartition } from '@/lib/schemas/cle-repartition';
import { validateQuotePartsTotal } from '@/lib/schemas/cle-repartition';
import type { Lot } from '@/types/lot';
import type { Coproprietaire } from '@/types/coproprietaire';
import { lotTypeLabels } from '@/lib/schemas/lot';
import { condoPaths } from '@/lib/utils/condo-routes';

interface CleRepartitionDetailProps {
  cle: CleRepartition;
  lots: Lot[];
  coproprietaires: Coproprietaire[];
  onDelete?: () => void;
  isDeleting?: boolean;
  canDelete?: boolean;
  condoId: string;
}

export function CleRepartitionDetail({
  cle,
  lots,
  coproprietaires,
  onDelete,
  isDeleting = false,
  canDelete = true,
  condoId,
}: CleRepartitionDetailProps) {
  const { total, isValid, deviation } = validateQuotePartsTotal(cle.quoteParts);

  // Get coproprietaire name by ID
  const getCoproprietaireName = (coproprietaireId: string): string => {
    const cp = coproprietaires.find((c) => c.id === coproprietaireId);
    return cp ? `${cp.prenom} ${cp.nom}` : 'Inconnu';
  };

  // Get quote-part value for a lot
  const getQuotePartValue = (lotId: string): number => {
    const qp = cle.quoteParts.find((q) => q.lotId === lotId);
    return qp?.valeur ?? 0;
  };

  // Filter lots that have a quote-part > 0 and sort by numero
  const includedLots = lots
    .filter((lot) => getQuotePartValue(lot.id) > 0)
    .sort((a, b) => a.numero.localeCompare(b.numero));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <Key className="h-8 w-8 text-muted-foreground mt-1" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">{cle.nom}</h1>
              {cle.isDefault && (
                <Badge variant="secondary">Par défaut</Badge>
              )}
            </div>
            {cle.description && (
              <p className="mt-1 text-muted-foreground">{cle.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={condoPaths.cleRepartitionEdit(condoId, cle.id)}>
            <Button variant="outline" size="sm">
              <Pencil className="mr-2 h-4 w-4" />
              Modifier
            </Button>
          </Link>
          {onDelete && canDelete && !cle.isDefault && (
            <Button
              variant="destructive"
              size="sm"
              onClick={onDelete}
              disabled={isDeleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </Button>
          )}
        </div>
      </div>

      {/* Total validation - only show if invalid */}
      {!isValid && (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Le total des quotes-parts ({total}) n&apos;est pas égal à 10000 millièmes.
            {deviation > 0
              ? ` Excédent de ${deviation} millièmes.`
              : ` Manque ${Math.abs(deviation)} millièmes.`}
          </AlertDescription>
        </Alert>
      )}

      {/* Quotes-parts table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">Lot</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
              <th className="px-4 py-3 text-left text-sm font-medium hidden sm:table-cell">
                Propriétaire
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Tantièmes
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium">
                Quote-part
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {includedLots.map((lot) => {
              const value = getQuotePartValue(lot.id);
              return (
                <tr key={lot.id} className="hover:bg-muted/25">
                  <td className="px-4 py-3 text-sm font-medium">{lot.numero}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {lotTypeLabels[lot.type]}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                    {getCoproprietaireName(lot.coproprietaireId)}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {lot.tantiemes}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-right">{value}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-muted/50">
            <tr>
              <td colSpan={4} className="px-4 py-3 text-sm font-medium text-right">
                Total
              </td>
              <td className={`px-4 py-3 text-sm font-bold text-right ${isValid ? '' : 'text-amber-600'}`}>
                {total}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
