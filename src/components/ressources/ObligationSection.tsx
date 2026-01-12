import type { ObligationCategory, ObligationIconName } from '@/types/obligations';
import { LegalReferenceDisplay } from './LegalReference';
import { cn } from '@/lib/utils/cn';
import { Calculator, Users, Shield, FileText, Archive } from 'lucide-react';

const iconMap = {
  'calculator': Calculator,
  'users': Users,
  'shield': Shield,
  'file-text': FileText,
  'archive': Archive,
} as const satisfies Record<ObligationIconName, React.ComponentType<{ className?: string }>>;

interface ObligationSectionProps {
  category: ObligationCategory;
}

export function ObligationSection({ category }: ObligationSectionProps) {
  const Icon = iconMap[category.iconName];

  return (
    <section id={category.id} className="scroll-mt-20">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">{category.title}</h2>
          <p className="text-sm text-muted-foreground">{category.description}</p>
        </div>
      </div>

      <div className="space-y-4 ml-0 md:ml-13">
        {category.obligations.map((obligation) => (
          <div
            key={obligation.id}
            className={cn(
              'rounded-lg border p-4 bg-card',
              obligation.importance === 'critical' && 'border-l-4 border-l-destructive',
              obligation.importance === 'important' && 'border-l-4 border-l-warning'
            )}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-medium">{obligation.title}</h3>
              {obligation.importance === 'critical' && (
                <span className="shrink-0 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                  Obligatoire
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {obligation.description}
            </p>
            {obligation.legalReferences.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {obligation.legalReferences.map((ref, index) => (
                  <LegalReferenceDisplay key={index} reference={ref} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
