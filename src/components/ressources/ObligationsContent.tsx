import { obligationsLegales } from '@/data/obligations-legales';
import { ObligationSection } from './ObligationSection';
import { TableOfContents } from './TableOfContents';

export function ObligationsContent() {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Table of Contents - Sticky on desktop */}
      <aside className="lg:w-64 shrink-0">
        <div className="lg:sticky lg:top-20">
          <TableOfContents categories={obligationsLegales} />
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 space-y-8">
        {obligationsLegales.map((category) => (
          <ObligationSection key={category.id} category={category} />
        ))}

        {/* Back to top */}
        <div className="pt-4 border-t">
          <a
            href="#top"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Retour en haut
          </a>
        </div>
      </div>
    </div>
  );
}
