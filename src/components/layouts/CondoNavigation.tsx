'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCondo } from '@/lib/hooks/useCondo';
import { getAllAcceptedInvitationsForUser } from '@/lib/firebase/services/invitation-extranet';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { condoPath, condoPaths } from '@/lib/utils/condo-routes';
import type { Condo } from '@/types/condo';
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
  Settings,
  Eye,
  ArrowLeftRight,
  Plus,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useState, useEffect, useMemo, useRef } from 'react';

interface SubNavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: SubNavItem[];
  requiresCoproprietaires?: boolean;
}

interface CondoNavigationProps {
  condoId: string;
  condo: Condo;
}

export function CondoNavigation({ condoId, condo }: CondoNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { condos } = useCondo();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [hasExtranetAccess, setHasExtranetAccess] = useState(false);
  const [hasOwners, setHasOwners] = useState(false);
  const prevCondoIdRef = useRef<string | null>(null);

  // Reset hasOwners when condoId changes (before subscription updates)
  useEffect(() => {
    if (prevCondoIdRef.current !== condoId) {
      setHasOwners(false);
      prevCondoIdRef.current = condoId;
    }
  }, [condoId]);

  // Subscribe to owners to determine if nav items should be enabled
  useEffect(() => {
    if (!condoId) return;

    const ownersRef = collection(db, 'condos', condoId, 'owners');
    const unsubscribe = onSnapshot(
      ownersRef,
      (snapshot) => {
        setHasOwners(snapshot.docs.length > 0);
      },
      (error) => {
        console.error('Error subscribing to owners:', error);
        setHasOwners(false);
      }
    );

    return () => unsubscribe();
  }, [condoId]);

  // Generate nav items with condo-scoped paths
  const navItems: NavItem[] = useMemo(
    () => [
      { path: condoPaths.dashboard(condoId), label: 'Accueil', icon: Home },
      { path: condoPaths.coproprietaires(condoId), label: 'Copropriétaires', icon: Users },
      {
        path: condoPaths.lots(condoId),
        label: 'Lots',
        icon: Building2,
        requiresCoproprietaires: true,
        subItems: [
          { path: condoPaths.cleRepartition(condoId), label: 'Clés de répartition', icon: Key },
        ],
      },
      { path: condoPaths.finances(condoId), label: 'Finances', icon: Wallet, requiresCoproprietaires: true },
      { path: condoPaths.soldes(condoId), label: 'Soldes', icon: PiggyBank, requiresCoproprietaires: true },
      { path: condoPaths.documents(condoId), label: 'Documents', icon: FileText },
      { path: condoPaths.assembleesGenerales(condoId), label: 'AG', icon: Vote, requiresCoproprietaires: true },
      { path: condoPaths.historique(condoId), label: 'Historique', icon: History },
      { path: condoPaths.parametres(condoId), label: 'Paramètres', icon: Settings },
    ],
    [condoId]
  );

  const ressourcesItems = [
    { href: '/ressources/obligations-legales', label: 'Obligations légales', icon: BookOpen },
  ];

  // Check if user has extranet access
  useEffect(() => {
    if (!user) {
      setHasExtranetAccess(false);
      return;
    }

    getAllAcceptedInvitationsForUser(user.uid)
      .then((invitations) => {
        setHasExtranetAccess(invitations.length > 0);
      })
      .catch(() => {
        setHasExtranetAccess(false);
      });
  }, [user]);

  const handleSwitchToExtranet = () => {
    router.push('/extranet');
  };

  const handleSwitchCondo = () => {
    router.push('/copro');
  };

  const toggleExpanded = (path: string) => {
    setExpandedItems((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
    );
  };

  const isSubItemActive = (item: NavItem) => {
    const filtered = item.subItems ?? [];
    return filtered.some((sub) => pathname.startsWith(sub.path));
  };

  const isItemActive = (item: NavItem) => {
    // Exact match for dashboard
    if (item.path === condoPath(condoId)) {
      return pathname === item.path;
    }
    // Prefix match for other items
    return pathname.startsWith(item.path);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r bg-card">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/copro" className="text-xl font-bold text-primary">
            EzCopro
          </Link>
        </div>

        {/* Condo info and switcher */}
        <div className="border-b px-3 py-3">
          <div className="flex items-center justify-between gap-1">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{condo.name}</p>
              <p className="text-xs text-muted-foreground truncate">{condo.address}</p>
            </div>
            <div className="flex items-center gap-1">
              {condos.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSwitchCondo}
                  title="Changer de copropriété"
                >
                  <ArrowLeftRight className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/onboarding')}
                title="Créer une copropriété"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = isItemActive(item) && !isSubItemActive(item);
            const filteredSubItems = item.subItems ?? [];
            const hasSubItems = filteredSubItems.length > 0;
            const isExpanded = expandedItems.includes(item.path) || isSubItemActive(item);
            const isDisabled = item.requiresCoproprietaires && !hasOwners;

            return (
              <div key={item.path}>
                <div className="flex items-center">
                  {isDisabled ? (
                    <span
                      className="flex flex-1 items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground cursor-not-allowed opacity-50"
                      title="Ajoutez d'abord des copropriétaires"
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </span>
                  ) : (
                    <Link
                      href={item.path}
                      className={cn(
                        'flex flex-1 items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  )}
                  {hasSubItems && (
                    <button
                      onClick={() => toggleExpanded(item.path)}
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
                    {filteredSubItems.map((subItem) => {
                      const isSubActive = pathname.startsWith(subItem.path);
                      return (
                        <Link
                          key={subItem.path}
                          href={subItem.path}
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

        <div className="border-t p-4 space-y-2">
          <div className="mb-3 flex items-center justify-between">
            {user && (
              <span className="truncate text-sm text-muted-foreground">
                {user.email}
              </span>
            )}
            <ThemeToggle />
          </div>
          {hasExtranetAccess && (
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleSwitchToExtranet}
            >
              <Eye className="mr-2 h-4 w-4" />
              Vue copropriétaire
            </Button>
          )}
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
        <Link href="/copro" className="text-lg font-bold text-primary">
          EzCopro
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground truncate max-w-32">
            {condo.name}
          </span>
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

          {/* Condo info in mobile menu */}
          <div className="border-b px-4 py-3">
            <p className="text-sm font-medium">{condo.name}</p>
            <p className="text-xs text-muted-foreground">{condo.address}</p>
            <div className="flex gap-2 mt-2">
              {condos.length > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleSwitchCondo();
                    setMobileMenuOpen(false);
                  }}
                >
                  <ArrowLeftRight className="mr-2 h-3 w-3" />
                  Changer
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  router.push('/onboarding');
                  setMobileMenuOpen(false);
                }}
              >
                <Plus className="mr-2 h-3 w-3" />
                Nouvelle copro
              </Button>
            </div>
          </div>

          <nav className="space-y-1 p-4 overflow-y-auto max-h-[calc(100vh-200px)]">
            {navItems.map((item) => {
              const isActive = isItemActive(item) && !isSubItemActive(item);
              const filteredSubItems = item.subItems ?? [];
              const hasSubItems = filteredSubItems.length > 0;
              const isExpanded = expandedItems.includes(item.path) || isSubItemActive(item);
              const isDisabled = item.requiresCoproprietaires && !hasOwners;

              return (
                <div key={item.path}>
                  <div className="flex items-center">
                    {isDisabled ? (
                      <span
                        className="flex flex-1 items-center gap-3 rounded-lg px-3 py-3 text-sm text-muted-foreground cursor-not-allowed opacity-50"
                        title="Ajoutez d'abord des copropriétaires"
                      >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                      </span>
                    ) : (
                      <Link
                        href={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          'flex flex-1 items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors',
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted'
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    )}
                    {hasSubItems && (
                      <button
                        onClick={() => toggleExpanded(item.path)}
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
                      {filteredSubItems.map((subItem) => {
                        const isSubActive = pathname.startsWith(subItem.path);
                        return (
                          <Link
                            key={subItem.path}
                            href={subItem.path}
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
            {hasExtranetAccess && (
              <Button
                variant="outline"
                className="w-full justify-start mb-2"
                onClick={() => {
                  handleSwitchToExtranet();
                  setMobileMenuOpen(false);
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                Vue copropriétaire
              </Button>
            )}
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
          const isActive = isItemActive(item);
          const isDisabled = item.requiresCoproprietaires && !hasOwners;

          if (isDisabled) {
            return (
              <span
                key={item.path}
                className="flex flex-col items-center gap-1 p-2 text-muted-foreground opacity-50 cursor-not-allowed"
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs">{item.label}</span>
              </span>
            );
          }

          return (
            <Link
              key={item.path}
              href={item.path}
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
