'use client';

import { useCallback, useMemo } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, CheckCircle, Calculator } from 'lucide-react';
import type { QuotePart } from '@/lib/schemas/cle-repartition';
import { validateQuotePartsTotal } from '@/lib/schemas/cle-repartition';
import type { Lot } from '@/types/lot';
import type { Coproprietaire } from '@/types/coproprietaire';
import { lotTypeLabels } from '@/lib/schemas/lot';

interface QuotesPartsEditorProps {
  quoteParts: QuotePart[];
  onChange: (quoteParts: QuotePart[]) => void;
  lots: Lot[];
  coproprietaires: Coproprietaire[];
  disabled?: boolean;
}

/**
 * Calculate quote-parts automatically from tantièmes of included lots.
 * Uses rule of three: (lot tantièmes / total tantièmes of included lots) × 10000
 */
function calculateQuotePartsFromTantiemes(
  lots: Lot[],
  includedLotIds: Set<string>
): QuotePart[] {
  const includedLots = lots.filter((lot) => includedLotIds.has(lot.id));
  const totalTantiemes = includedLots.reduce((sum, lot) => sum + lot.tantiemes, 0);

  if (totalTantiemes === 0) {
    return lots.map((lot) => ({ lotId: lot.id, valeur: 0 }));
  }

  return lots.map((lot) => {
    if (!includedLotIds.has(lot.id)) {
      return { lotId: lot.id, valeur: 0 };
    }
    // Rule of three: proportional distribution based on tantièmes
    const quotePart = Math.round((lot.tantiemes / totalTantiemes) * 10000);
    return { lotId: lot.id, valeur: quotePart };
  });
}

/**
 * Adjust quote-parts to ensure total is exactly 10000 (handle rounding errors)
 */
function adjustToTotal10000(quoteParts: QuotePart[]): QuotePart[] {
  if (quoteParts.length === 0) return quoteParts;

  const total = quoteParts.reduce((sum, qp) => sum + qp.valeur, 0);
  if (total === 10000 || total === 0) return quoteParts;

  const diff = 10000 - total;
  // Find the lot with highest value to adjust (minimizes relative error)
  let maxIndex = 0;
  let maxValue = quoteParts[0]?.valeur ?? 0;
  for (let i = 1; i < quoteParts.length; i++) {
    const value = quoteParts[i]?.valeur ?? 0;
    if (value > maxValue) {
      maxValue = value;
      maxIndex = i;
    }
  }

  return quoteParts.map((qp, idx) =>
    idx === maxIndex ? { ...qp, valeur: qp.valeur + diff } : qp
  );
}

export function QuotesPartsEditor({
  quoteParts,
  onChange,
  lots,
  coproprietaires,
  disabled = false,
}: QuotesPartsEditorProps) {
  // Calculate total and validation
  const { total, isValid, deviation } = useMemo(
    () => validateQuotePartsTotal(quoteParts),
    [quoteParts]
  );

  // Get set of included lot IDs (lots with quote-part > 0)
  const includedLotIds = useMemo(() => {
    const ids = new Set<string>();
    quoteParts.forEach((qp) => {
      if (qp.valeur > 0) ids.add(qp.lotId);
    });
    return ids;
  }, [quoteParts]);

  // Get coproprietaire name by ID
  const getCoproprietaireName = useCallback(
    (coproprietaireId: string): string => {
      const cp = coproprietaires.find((c) => c.id === coproprietaireId);
      return cp ? `${cp.prenom} ${cp.nom}` : 'Inconnu';
    },
    [coproprietaires]
  );

  // Get quote-part value for a lot
  const getQuotePartValue = useCallback(
    (lotId: string): number => {
      const qp = quoteParts.find((q) => q.lotId === lotId);
      return qp?.valeur ?? 0;
    },
    [quoteParts]
  );

  // Check if a lot is included
  const isLotIncluded = useCallback(
    (lotId: string): boolean => {
      return includedLotIds.has(lotId);
    },
    [includedLotIds]
  );

  // Toggle lot inclusion and recalculate quote-parts
  const handleToggleLot = useCallback(
    (lotId: string, checked: boolean) => {
      const newIncludedIds = new Set(includedLotIds);
      if (checked) {
        newIncludedIds.add(lotId);
      } else {
        newIncludedIds.delete(lotId);
      }

      const newQuoteParts = calculateQuotePartsFromTantiemes(lots, newIncludedIds);
      const adjusted = adjustToTotal10000(newQuoteParts);
      onChange(adjusted);
    },
    [lots, includedLotIds, onChange]
  );

  // Recalculate all quote-parts from tantièmes (include all lots)
  const handleRecalculateAll = useCallback(() => {
    const allLotIds = new Set(lots.map((lot) => lot.id));
    const newQuoteParts = calculateQuotePartsFromTantiemes(lots, allLotIds);
    const adjusted = adjustToTotal10000(newQuoteParts);
    onChange(adjusted);
  }, [lots, onChange]);

  // Calculate percentage for display
  const getPercentage = (value: number): string => {
    return ((value / 10000) * 100).toFixed(2);
  };

  // Count included lots
  const includedCount = includedLotIds.size;

  if (lots.length === 0) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Aucun lot dans cette copropriété. Créez des lots avant de définir les
          quotes-parts.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="text-sm text-muted-foreground">
          Cochez les lots à inclure. Les quotes-parts sont calculées automatiquement
          au prorata des tantièmes.
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleRecalculateAll}
          disabled={disabled}
          className="shrink-0"
        >
          <Calculator className="h-4 w-4 mr-2" />
          Inclure tous les lots
        </Button>
      </div>

      {/* Lots table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-center text-sm font-medium w-16">
                Inclus
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">Lot</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
              <th className="px-4 py-3 text-left text-sm font-medium hidden sm:table-cell">
                Propriétaire
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium">
                Tantièmes
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium">
                Quote-part
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium hidden sm:table-cell">
                %
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {lots.map((lot) => {
              const value = getQuotePartValue(lot.id);
              const included = isLotIncluded(lot.id);
              return (
                <tr
                  key={lot.id}
                  className={`hover:bg-muted/25 ${!included ? 'opacity-50' : ''}`}
                >
                  <td className="px-4 py-3 text-center">
                    <Checkbox
                      checked={included}
                      onCheckedChange={(checked: boolean) =>
                        handleToggleLot(lot.id, checked)
                      }
                      disabled={disabled}
                      aria-label={`Inclure le lot ${lot.numero}`}
                    />
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">{lot.numero}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {lotTypeLabels[lot.type]}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                    {getCoproprietaireName(lot.coproprietaireId)}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground text-right">
                    {lot.tantiemes}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-right">
                    {value}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-muted-foreground hidden sm:table-cell">
                    {getPercentage(value)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-muted/50">
            <tr>
              <td className="px-4 py-3 text-sm text-center text-muted-foreground">
                {includedCount}/{lots.length}
              </td>
              <td colSpan={4} className="px-4 py-3 text-sm font-medium text-right">
                Total
              </td>
              <td className="px-4 py-3 text-sm font-bold text-right">{total}</td>
              <td className="px-4 py-3 text-sm text-right font-medium hidden sm:table-cell">
                {getPercentage(total)}%
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Validation message */}
      {includedCount === 0 ? (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Aucun lot sélectionné. Cochez au moins un lot pour cette clé de répartition.
          </AlertDescription>
        </Alert>
      ) : isValid ? (
        <Alert variant="default" className="border-green-500/50 bg-green-500/10">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700 dark:text-green-400">
            Le total des quotes-parts est égal à 10000 millièmes (100%).
          </AlertDescription>
        </Alert>
      ) : (
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
    </div>
  );
}
