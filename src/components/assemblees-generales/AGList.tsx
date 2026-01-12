'use client';

import Link from 'next/link';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AGStatusBadge } from './AGStatusBadge';
import type { AssembleeGenerale } from '@/types/assemblee-generale';

const AG_TYPE_LABELS = {
  ordinaire: 'AGO',
  extraordinaire: 'AGE',
  mixte: 'AGM',
} as const;

interface AGListProps {
  ags: AssembleeGenerale[];
  emptyMessage?: string;
}

type FirestoreTimestamp = { seconds: number; nanoseconds: number };

function timestampToDate(ts: FirestoreTimestamp | Date | { toDate: () => Date }): Date {
  if (ts instanceof Date) {
    return ts;
  }
  if ('toDate' in ts && typeof ts.toDate === 'function') {
    return ts.toDate();
  }
  // Firestore-like timestamp
  return new Date((ts as FirestoreTimestamp).seconds * 1000);
}

function formatDate(date: FirestoreTimestamp | Date | { toDate: () => Date }): string {
  const d = timestampToDate(date);
  return d.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function AGList({ ags, emptyMessage = 'Aucune assemblée générale.' }: AGListProps) {
  if (ags.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">{emptyMessage}</CardContent>
      </Card>
    );
  }

  const sortedAGs = [...ags].sort((a, b) => {
    const dateA = timestampToDate(a.date);
    const dateB = timestampToDate(b.date);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className="space-y-4">
      {sortedAGs.map((ag) => (
        <Link
          key={ag.id}
          href={`/assemblees-generales/${ag.id}`}
          className="block transition-colors"
        >
          <Card className="hover:bg-accent/50">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg">
                  {AG_TYPE_LABELS[ag.type]} - {formatDate(ag.date)}
                </CardTitle>
                <AGStatusBadge status={ag.statut} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(ag.date)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>{ag.heure}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  <span className="truncate max-w-xs">{ag.lieu}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
