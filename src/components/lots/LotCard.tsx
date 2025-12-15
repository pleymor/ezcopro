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
import { lotTypeLabels, type Lot } from '@/types/lot';
import { formatTantiemesPercent } from '@/lib/utils/format';
import { Pencil, Trash2 } from 'lucide-react';

interface LotCardProps {
  lot: Lot;
  totalTantiemes: number;
  coproprietaireName?: string;
  onDelete?: () => void;
}

export function LotCard({
  lot,
  totalTantiemes,
  coproprietaireName,
  onDelete,
}: LotCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Lot {lot.numero}</CardTitle>
        <CardDescription>{lotTypeLabels[lot.type]}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tantièmes</span>
          <span className="font-medium">
            {lot.tantiemes} ({formatTantiemesPercent(lot.tantiemes, totalTantiemes)})
          </span>
        </div>
        {coproprietaireName && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Propriétaire</span>
            <span>{coproprietaireName}</span>
          </div>
        )}
        {lot.description && (
          <p className="text-sm text-muted-foreground">{lot.description}</p>
        )}
      </CardContent>
      <CardFooter className="gap-2">
        <Link href={`/lots/${lot.id}/edit`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full">
            <Pencil className="mr-2 h-4 w-4" />
            Modifier
          </Button>
        </Link>
        {onDelete && (
          <Button variant="destructive" size="sm" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
