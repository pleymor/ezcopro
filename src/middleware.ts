import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes publiques qui n'ont pas besoin d'authentification
const publicRoutes = ['/login', '/join'];

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

  // Note: La vérification d'authentification réelle se fait côté client
  // car Firebase Auth est client-side. Ce middleware est principalement
  // pour la configuration des headers et le routage initial.

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
