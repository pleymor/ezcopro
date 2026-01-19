'use client';

import Link from 'next/link';
import type { Route } from 'next';
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
  Key,
  ChevronDown,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useState } from 'react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresCopro: boolean;
  subItems?: Array<{
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }>;
}

const navItems: NavItem[] = [
  { href: '/', label: 'Accueil', icon: Home, requiresCopro: false },
  {
    href: '/lots',
    label: 'Lots',
    icon: Building2,
    requiresCopro: true,
    subItems: [
      { href: '/lots/cles-repartition', label: 'Clés de répartition', icon: Key },
    ],
  },
  { href: '/coproprietaires', label: 'Copropriétaires', icon: Users, requiresCopro: true },
  { href: '/finances', label: 'Finances', icon: Wallet, requiresCopro: true },
  { href: '/soldes', label: 'Soldes', icon: PiggyBank, requiresCopro: true },
  { href: '/documents', label: 'Documents', icon: FileText, requiresCopro: true },
  { href: '/assemblees-generales', label: 'AG', icon: Vote, requiresCopro: true },
  { href: '/historique', label: 'Historique', icon: History, requiresCopro: true },
];

const ressourcesItems = [
  { href: '/ressources/obligations-legales' as const, label: 'Obligations légales', icon: BookOpen },
];

export function Navigation() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { coproprietes } = useCopropriete();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const hasCopro = coproprietes.length > 0;

  const toggleExpanded = (href: string) => {
    setExpandedItems((prev) =>
      prev.includes(href) ? prev.filter((h) => h !== href) : [...prev, href]
    );
  };

  const isSubItemActive = (item: NavItem) => {
    return item.subItems?.some((sub) => pathname.startsWith(sub.href)) ?? false;
  };

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
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isExpanded = expandedItems.includes(item.href) || isSubItemActive(item);
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
              <div key={item.href}>
                <div className="flex items-center">
                  <Link
                    href={item.href as Route}
                    className={cn(
                      'flex flex-1 items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                      isActive && !isSubItemActive(item)
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                  {hasSubItems && (
                    <button
                      onClick={() => toggleExpanded(item.href)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                      aria-label={isExpanded ? 'Réduire' : 'Développer'}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </div>
                {hasSubItems && isExpanded && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.subItems!.map((subItem) => {
                      const isSubActive = pathname.startsWith(subItem.href);
                      return (
                        <Link
                          key={subItem.href}
                          href={subItem.href as Route}
                          className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                            isSubActive
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-muted text-muted-foreground'
                          )}
                        >
                          <subItem.icon className="h-4 w-4" />
                          {subItem.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
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
              const hasSubItems = item.subItems && item.subItems.length > 0;
              const isExpanded = expandedItems.includes(item.href) || isSubItemActive(item);
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
                <div key={item.href}>
                  <div className="flex items-center">
                    <Link
                      href={item.href as Route}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex flex-1 items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors',
                        isActive && !isSubItemActive(item)
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                    {hasSubItems && (
                      <button
                        onClick={() => toggleExpanded(item.href)}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                        aria-label={isExpanded ? 'Réduire' : 'Développer'}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>
                  {hasSubItems && isExpanded && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.subItems!.map((subItem) => {
                        const isSubActive = pathname.startsWith(subItem.href);
                        return (
                          <Link
                            key={subItem.href}
                            href={subItem.href as Route}
                            onClick={() => setMobileMenuOpen(false)}
                            className={cn(
                              'flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors',
                              isSubActive
                                ? 'bg-primary text-primary-foreground'
                                : 'hover:bg-muted text-muted-foreground'
                            )}
                          >
                            <subItem.icon className="h-4 w-4" />
                            {subItem.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
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
              href={item.href as Route}
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
