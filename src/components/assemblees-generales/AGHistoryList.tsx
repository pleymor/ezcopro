'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, FileText, CheckCircle2 } from 'lucide-react';
import { condoPaths } from '@/lib/utils/condo-routes';
import type { AssembleeGenerale } from '@/types/assemblee-generale';
import { agTypeLabels } from '@/lib/schemas/assemblee-generale';

interface AGHistoryListProps {
  ags: AssembleeGenerale[];
  condoId: string;
}

export function AGHistoryList({ ags, condoId }: AGHistoryListProps) {
  // Filter only terminated AGs and sort by date descending
  const terminatedAGs = ags
    .filter((ag) => ag.statut === 'terminee')
    .sort((a, b) => {
      const dateA = a.date instanceof Date ? a.date : new Date(a.date.seconds * 1000);
      const dateB = b.date instanceof Date ? b.date : new Date(b.date.seconds * 1000);
      return dateB.getTime() - dateA.getTime();
    });

  if (terminatedAGs.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Aucune assemblée générale terminée.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {terminatedAGs.map((ag) => {
        const agDate = ag.date instanceof Date ? ag.date : new Date(ag.date.seconds * 1000);

        return (
          <Link
            key={ag.id}
            href={condoPaths.agDetail(condoId, ag.id)}
          >
            <Card className="hover:bg-accent/50 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <CardTitle className="text-base">
                        AG {agTypeLabels[ag.type]} du {format(agDate, 'd MMMM yyyy', { locale: fr })}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">{ag.lieu}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Terminée
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
