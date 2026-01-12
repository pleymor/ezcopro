'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AttendanceSummary } from '@/types/assemblee-generale';

interface PresenceSummaryProps {
  summary: AttendanceSummary | null;
  totalTantiemes: number;
}

export function PresenceSummary({ summary, totalTantiemes }: PresenceSummaryProps) {
  if (!summary) {
    return null;
  }

  const quorumPercent = totalTantiemes > 0
    ? ((summary.tantiemesPresents + summary.tantiemesRepresentes) / totalTantiemes * 100).toFixed(1)
    : '0';

  const presentPercent = totalTantiemes > 0
    ? (summary.tantiemesPresents / totalTantiemes * 100).toFixed(1)
    : '0';

  const representsPercent = totalTantiemes > 0
    ? (summary.tantiemesRepresentes / totalTantiemes * 100).toFixed(1)
    : '0';

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Résumé des présences</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
            <p className="text-sm font-medium text-green-700 dark:text-green-300">Présents</p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">
              {summary.presents}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400">
              {summary.tantiemesPresents} tantièmes ({presentPercent}%)
            </p>
          </div>

          <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
            <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Représentés</p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {summary.representes}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              {summary.tantiemesRepresentes} tantièmes ({representsPercent}%)
            </p>
          </div>

          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Absents</p>
            <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">
              {summary.absents}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {summary.tantiemesTotal - summary.tantiemesPresents - summary.tantiemesRepresentes} tantièmes
            </p>
          </div>

          <div className="rounded-lg bg-primary/10 p-4">
            <p className="text-sm font-medium text-primary">Quorum</p>
            <p className="text-2xl font-bold text-primary">
              {quorumPercent}%
            </p>
            <p className="text-xs text-primary/80">
              {summary.tantiemesPresents + summary.tantiemesRepresentes} / {totalTantiemes} tantièmes
            </p>
          </div>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className="h-full bg-green-500"
            style={{ width: `${presentPercent}%` }}
          />
          <div
            className="h-full bg-blue-500 -mt-2"
            style={{ width: `${Number(presentPercent) + Number(representsPercent)}%`, marginLeft: `${presentPercent}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          <span>0%</span>
          <span>50% (quorum Art.25)</span>
          <span>100%</span>
        </div>
      </CardContent>
    </Card>
  );
}
