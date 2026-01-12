'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCopropriete } from '@/lib/hooks/useCopropriete';
import {
  Building2,
  Users,
  Wallet,
  History,
  Home,
  LogOut,
  Menu,
  PiggyBank,
  BookOpen,
  Vote,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useState } from 'react';

const navItems = [
  { href: '/' as const, label: 'Accueil', icon: Home, requiresCopro: false },
  { href: '/lots' as const, label: 'Lots', icon: Building2, requiresCopro: true },
  { href: '/coproprietaires' as const, label: 'Copropriétaires', icon: Users, requiresCopro: true },
  { href: '/finances' as const, label: 'Finances', icon: Wallet, requiresCopro: true },
  { href: '/soldes' as const, label: 'Soldes', icon: PiggyBank, requiresCopro: true },
  { href: '/assemblees-generales' as const, label: 'AG', icon: Vote, requiresCopro: true },
  { href: '/historique' as const, label: 'Historique', icon: History, requiresCopro: true },
];

const ressourcesItems = [
  { href: '/ressources/obligations-legales' as const, label: 'Obligations légales', icon: BookOpen },
];

export function Navigation() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { coproprietes } = useCopropriete();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const hasCopro = coproprietes.length > 0;

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r bg-card">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="text-xl font-bold text-primary">
            EzCopro
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const isDisabled = item.requiresCopro && !hasCopro;

            if (isDisabled) {
              return (
                <span
                  key={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground/50 cursor-not-allowed"
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </span>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}

          {/* Ressources Section */}
          <div className="pt-4 mt-4 border-t">
            <span className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Ressources
            </span>
            <div className="mt-2 space-y-1">
              {ressourcesItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        <div className="border-t p-4">
          <div className="mb-3 flex items-center justify-between">
            {user && (
              <span className="truncate text-sm text-muted-foreground">
                {user.email}
              </span>
            )}
            <ThemeToggle />
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Déconnexion
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-background px-4 md:hidden">
        <Link href="/" className="text-lg font-bold text-primary">
          EzCopro
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-background md:hidden">
          <div className="flex h-14 items-center justify-between border-b px-4">
            <span className="text-lg font-bold">Menu</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(false)}
            >
              ✕
            </Button>
          </div>
          <nav className="space-y-1 p-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const isDisabled = item.requiresCopro && !hasCopro;

              if (isDisabled) {
                return (
                  <span
                    key={item.href}
                    className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-muted-foreground/50 cursor-not-allowed"
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </span>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}

            {/* Ressources Section in Mobile Menu */}
            <div className="pt-4 mt-4 border-t">
              <span className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Ressources
              </span>
              <div className="mt-2 space-y-1">
                {ressourcesItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            <hr className="my-4" />
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </Button>
          </nav>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-background md:hidden">
        {navItems.slice(0, 5).map((item) => {
          const isActive = pathname === item.href;
          const isDisabled = item.requiresCopro && !hasCopro;

          if (isDisabled) {
            return (
              <span
                key={item.href}
                className="flex flex-col items-center gap-1 p-2 text-muted-foreground/50 cursor-not-allowed"
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs">{item.label}</span>
              </span>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 p-2',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
