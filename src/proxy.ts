import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes publiques qui n'ont pas besoin d'authentification
const publicRoutes = ['/login', '/join', '/invitation'];

// Old dashboard routes that need to be redirected to /copro/[condoId]/...
const OLD_DASHBOARD_ROUTES = [
  '/lots',
  '/coproprietaires',
  '/finances',
  '/assemblees-generales',
  '/documents',
  '/historique',
  '/soldes',
  '/parametres',
  '/dashboard',
];

// Routes réservées aux syndics (gestionnaires) - now under /copro/[condoId]/
const syndicOnlyRoutes = [
  '/copro',
];

// Routes réservées aux copropriétaires (extranet)
const extranetRoutes = ['/extranet'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permettre l'accès aux fichiers statiques et API
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // fichiers statiques
  ) {
    return NextResponse.next();
  }

  // Redirect old dashboard routes to new /copro/[condoId]/ structure
  const isOldDashboardRoute = OLD_DASHBOARD_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isOldDashboardRoute) {
    // Get the last selected condo from cookie
    const lastCondoId = request.cookies.get('lastCondoId')?.value;

    if (lastCondoId) {
      // Redirect to the new URL structure with the last condo
      const newPath = pathname === '/dashboard' ? '' : pathname;
      const newUrl = new URL(`/copro/${lastCondoId}${newPath}`, request.url);
      return NextResponse.redirect(newUrl);
    } else {
      // No last condo, redirect to condo selector with the intended path
      const newUrl = new URL('/copro', request.url);
      if (pathname !== '/dashboard') {
        newUrl.searchParams.set('redirect', pathname);
      }
      return NextResponse.redirect(newUrl);
    }
  }

  // Permettre l'accès aux routes publiques
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Note: La vérification d'authentification réelle et du rôle se fait côté client
  // car Firebase Auth est client-side. Ce proxy configure les headers.
  // La protection des routes par rôle est gérée par le composant RoleGuard.

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

// Export des configurations de routes pour utilisation côté client
export { syndicOnlyRoutes, extranetRoutes };
