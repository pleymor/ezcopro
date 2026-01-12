import type { LegalReference } from '@/types/obligations';
import { Scale, ExternalLink } from 'lucide-react';

interface LegalReferenceDisplayProps {
  reference: LegalReference;
}

export function LegalReferenceDisplay({ reference }: LegalReferenceDisplayProps) {
  const content = (
    <>
      <Scale className="h-3 w-3" />
      {reference.shortText}
      {reference.url && <ExternalLink className="h-3 w-3" />}
    </>
  );

  const baseClassName = "inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground";

  if (reference.url) {
    return (
      <a
        href={reference.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`${baseClassName} hover:bg-muted/80 hover:text-foreground transition-colors`}
        title={reference.fullText}
      >
        {content}
      </a>
    );
  }

  return (
    <span className={baseClassName} title={reference.fullText}>
      {content}
    </span>
  );
}
