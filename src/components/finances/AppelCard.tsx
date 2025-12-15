'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { AppelDeFonds } from '@/types/appel';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { Calendar, Trash2, Eye } from 'lucide-react';

interface AppelCardProps {
  appel: AppelDeFonds;
  onDelete: () => void;
}

export function AppelCard({ appel, onDelete }: AppelCardProps) {
  const isEchu = new Date(appel.dateEcheance.seconds * 1000) < new Date();

  return (
    <Card className={isEchu ? 'border-destructive/50' : ''}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{appel.libelle}</CardTitle>
          <span className="text-xl font-bold">{formatCurrency(appel.montantTotalCents)}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              Échéance: {formatDate(appel.dateEcheance)}
              {isEchu && <span className="ml-2 text-destructive">(échu)</span>}
            </span>
          </div>
          <div className="flex gap-2">
            <Link href={`/finances/appels/${appel.id}`}>
              <Button variant="outline" size="sm">
                <Eye className="mr-2 h-4 w-4" />
                Détails
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
