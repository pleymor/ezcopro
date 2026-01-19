'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { UserRole, isSyndic, isCoproprietaire } from '@/types/auth';

// Routes réservées aux syndics
const SYNDIC_ROUTES = [
  '/coproprietaires',
  '/lots',
  '/finances',
  '/assemblees-generales',
  '/documents',
  '/historique',
  '/onboarding',
  '/soldes',
  '/ressources',
];

// Routes réservées aux copropriétaires
const EXTRANET_ROUTES = ['/extranet'];

// Routes accessibles à tous les utilisateurs authentifiés
const SHARED_ROUTES = ['/dashboard'];

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

/**
 * Composant de protection des routes basé sur le rôle utilisateur.
 * Redirige automatiquement les utilisateurs vers la bonne section.
 */
export function RoleGuard({ children, requiredRole }: RoleGuardProps) {
  const { user, claims, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    // Pas d'utilisateur connecté -> login
    if (!user) {
      router.replace('/login');
      return;
    }

    // Utilisateur sans claims -> pas encore de rôle assigné
    // Cela peut arriver pour un nouveau syndic qui n'a pas encore de copropriété
    if (!claims) {
      // Si on est sur une route syndic ou shared, on laisse passer
      // Le syndic sera redirigé vers onboarding s'il n'a pas de copropriété
      const isOnSyndicRoute = SYNDIC_ROUTES.some((r) => pathname.startsWith(r));
      const isOnSharedRoute = SHARED_ROUTES.some((r) => pathname.startsWith(r));
      if (isOnSyndicRoute || isOnSharedRoute) {
        return;
      }
      // Sinon redirection vers dashboard
      router.replace('/dashboard');
      return;
    }

    // Vérification du rôle spécifique si requis
    if (requiredRole) {
      if (requiredRole === 'syndic' && !isSyndic(claims)) {
        window.location.href = '/extranet';
        return;
      }
      if (requiredRole === 'coproprietaire' && !isCoproprietaire(claims)) {
        router.replace('/dashboard');
        return;
      }
    }

    // Vérification automatique basée sur la route
    const isOnSyndicRoute = SYNDIC_ROUTES.some((r) => pathname.startsWith(r));
    const isOnExtranetRoute = EXTRANET_ROUTES.some((r) => pathname.startsWith(r));

    // Copropriétaire qui essaie d'accéder aux routes syndic
    if (isOnSyndicRoute && isCoproprietaire(claims)) {
      window.location.href = '/extranet';
      return;
    }

    // Syndic qui essaie d'accéder à l'extranet
    if (isOnExtranetRoute && isSyndic(claims)) {
      router.replace('/dashboard');
      return;
    }

    // Route /dashboard - redirection selon le rôle
    if (pathname === '/dashboard') {
      if (isCoproprietaire(claims)) {
        window.location.href = '/extranet';
        return;
      }
    }
  }, [user, claims, loading, pathname, router, requiredRole]);

  // Affichage pendant le chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Pas d'utilisateur -> ne rien afficher (redirection en cours)
  if (!user) {
    return null;
  }

  return <>{children}</>;
}
