import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes publiques qui n'ont pas besoin d'authentification
const publicRoutes = ['/login', '/join', '/invitation'];

// Routes réservées aux syndics (gestionnaires)
const syndicOnlyRoutes = [
  '/coproprietaires',
  '/lots',
  '/finances',
  '/assemblees-generales',
  '/documents',
  '/historique',
];

// Routes réservées aux copropriétaires (extranet)
const extranetRoutes = ['/extranet'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permettre l'accès aux routes publiques
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Permettre l'accès aux fichiers statiques et API
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // fichiers statiques
  ) {
    return NextResponse.next();
  }

  // Note: La vérification d'authentification réelle et du rôle se fait côté client
  // car Firebase Auth est client-side. Ce middleware configure les headers.
  // La protection des routes par rôle est gérée par le composant RoleGuard.

  // Pour la route /dashboard, on laisse passer - le composant client redirigera
  // selon le rôle (syndic -> /dashboard, coproprietaire -> /extranet)

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

// Export des configurations de routes pour utilisation côté client
export { syndicOnlyRoutes, extranetRoutes };
