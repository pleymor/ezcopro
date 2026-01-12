import { ObligationsContent } from '@/components/ressources/ObligationsContent';
import { Scale } from 'lucide-react';

export const metadata = {
  title: 'Obligations légales du syndic bénévole - EzCopro',
  description: 'Guide complet des obligations légales du syndic bénévole en copropriété selon la loi du 10 juillet 1965.',
};

export default function ObligationsLegalesPage() {
  return (
    <div id="top">
      <div className="px-4 py-6 md:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Scale className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Obligations légales du syndic bénévole</h1>
              <p className="text-muted-foreground">
                Guide pratique basé sur la loi du 10 juillet 1965 et le décret du 17 mars 1967
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <ObligationsContent />
      </div>
    </div>
  );
}
