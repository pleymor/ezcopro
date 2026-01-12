import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { LegalReference } from '@/types/obligations';

// T007 [US1]: ObligationSection renders correctly
describe('ObligationSection', () => {
  it('renders category title and description', async () => {
    const { ObligationSection } = await import('@/components/ressources/ObligationSection');
    const { obligationsLegales } = await import('@/data/obligations-legales');

    const category = obligationsLegales[0];
    if (!category) return;

    render(<ObligationSection category={category} />);

    expect(screen.getByText(category.title)).toBeInTheDocument();
    expect(screen.getByText(category.description)).toBeInTheDocument();
  });

  it('renders all obligations in the category', async () => {
    const { ObligationSection } = await import('@/components/ressources/ObligationSection');
    const { obligationsLegales } = await import('@/data/obligations-legales');

    const category = obligationsLegales[0];
    if (!category) return;

    render(<ObligationSection category={category} />);

    category.obligations.forEach((obligation) => {
      expect(screen.getByText(obligation.title)).toBeInTheDocument();
    });
  });

  it('has correct id for anchor navigation', async () => {
    const { ObligationSection } = await import('@/components/ressources/ObligationSection');
    const { obligationsLegales } = await import('@/data/obligations-legales');

    const category = obligationsLegales[0];
    if (!category) return;

    const { container } = render(<ObligationSection category={category} />);

    const section = container.querySelector(`#${category.id}`);
    expect(section).toBeInTheDocument();
  });
});

// T014 [US2]: TableOfContents renders all categories
describe('TableOfContents', () => {
  it('renders all category links', async () => {
    const { TableOfContents } = await import('@/components/ressources/TableOfContents');
    const { obligationsLegales } = await import('@/data/obligations-legales');

    render(<TableOfContents categories={obligationsLegales} />);

    obligationsLegales.forEach((category) => {
      const link = screen.getByRole('link', { name: new RegExp(category.title) });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', `#${category.id}`);
    });
  });

  it('has correct test id', async () => {
    const { TableOfContents } = await import('@/components/ressources/TableOfContents');
    const { obligationsLegales } = await import('@/data/obligations-legales');

    render(<TableOfContents categories={obligationsLegales} />);

    expect(screen.getByTestId('table-of-contents')).toBeInTheDocument();
  });
});

// T021 [US3]: LegalReference component renders correctly
describe('LegalReferenceDisplay', () => {
  const mockReference: LegalReference = {
    shortText: 'Art. 14 loi 1965',
    fullText: 'Article 14 de la loi n° 65-557 du 10 juillet 1965',
  };

  const mockReferenceWithUrl: LegalReference = {
    shortText: 'Art. 18 loi 1965',
    fullText: 'Article 18 de la loi n° 65-557 du 10 juillet 1965',
    url: 'https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000038834476',
  };

  it('renders short text', async () => {
    const { LegalReferenceDisplay } = await import('@/components/ressources/LegalReference');

    render(<LegalReferenceDisplay reference={mockReference} />);

    expect(screen.getByText(mockReference.shortText)).toBeInTheDocument();
  });

  it('shows full text on hover or as tooltip', async () => {
    const { LegalReferenceDisplay } = await import('@/components/ressources/LegalReference');

    render(<LegalReferenceDisplay reference={mockReference} />);

    const element = screen.getByText(mockReference.shortText);
    expect(element.closest('[title]')).toHaveAttribute('title', mockReference.fullText);
  });

  it('renders as link when URL is provided', async () => {
    const { LegalReferenceDisplay } = await import('@/components/ressources/LegalReference');

    render(<LegalReferenceDisplay reference={mockReferenceWithUrl} />);

    const link = screen.getByRole('link', { name: /Art. 18 loi 1965/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', mockReferenceWithUrl.url);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders as span when URL is not provided', async () => {
    const { LegalReferenceDisplay } = await import('@/components/ressources/LegalReference');

    render(<LegalReferenceDisplay reference={mockReference} />);

    const link = screen.queryByRole('link');
    expect(link).not.toBeInTheDocument();
  });
});
