/**
 * Represents a legal reference to French law articles
 */
export interface LegalReference {
  /** Short display text (e.g., "Art. 14 loi 1965") */
  shortText: string;
  /** Full reference text */
  fullText: string;
  /** Optional external URL (e.g., Légifrance) */
  url?: string;
}

/**
 * Represents an individual legal obligation
 */
export interface Obligation {
  /** Unique identifier */
  id: string;
  /** Obligation title */
  title: string;
  /** Detailed description */
  description: string;
  /** Associated legal references */
  legalReferences: LegalReference[];
  /** Importance level */
  importance: 'critical' | 'important' | 'standard';
}

/**
 * Icon name type for category icons
 */
export type ObligationIconName = 'calculator' | 'users' | 'shield' | 'file-text' | 'archive';

/**
 * Represents a category of legal obligations
 */
export interface ObligationCategory {
  /** Unique identifier for HTML anchors */
  id: string;
  /** Category title */
  title: string;
  /** Icon name (will be mapped to Lucide component) */
  iconName: ObligationIconName;
  /** Short category description */
  description: string;
  /** List of obligations in this category */
  obligations: Obligation[];
}
