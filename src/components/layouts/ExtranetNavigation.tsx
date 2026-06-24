'use client';

import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCondo } from '@/lib/hooks/useCondo';
import { useExtranetCondo } from '@/hooks/useExtranetCondo';
import {
  Home,
  Wallet,
  CreditCard,
  FileText,
  Settings,
  LogOut,
  Menu,
  Shield,
  Building2,
  ChevronDown,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

interface ExtranetNavigationProps {
  newDocumentsCount?: number;
}

/**
 * Navigation pour l'extranet copropriétaires
 */
export function ExtranetNavigation({ newDocumentsCount = 0 }: ExtranetNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { condos: adminCondos } = useCondo();
  const {
    condos: extranetCondos,
    selectedCondo,
    setSelectedCondo,
    hasMultipleCondos,
  } = useExtranetCondo();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // User can switch to admin view if they own or manage any condo
  const canSwitchToAdmin = user && adminCondos.some(
    (condo) => condo.ownerId === user.uid || condo.boardMemberIds.includes(user.uid)
  );

  const handleSwitchToAdmin = () => {
    router.push('/');
  };

  const navItems: NavItem[] = [
    { href: '/extranet', label: 'Accueil', icon: Home },
    { href: '/extranet/solde', label: 'Mon solde', icon: Wallet },
    { href: '/extranet/paiements', label: 'Paiements', icon: CreditCard },
    { href: '/extranet/documents', label: 'Documents', icon: FileText, badge: newDocumentsCount },
    { href: '/extranet/preferences', label: 'Préférences', icon: Settings },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  const isActive = (href: string) => {
    if (href === '/extranet') {
      return pathname === '/extranet';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r bg-card">
        <div className="flex h-16 items-center border-b px-6">
          <a href="/extranet" className="text-xl font-bold text-primary">
            EzCopro
          </a>
          <Badge variant="secondary" className="ml-2 text-xs">
            Extranet
          </Badge>
        </div>

        {/* Condo Selector */}
        {selectedCondo && (
          <div className="border-b px-3 py-3">
            {hasMultipleCondos ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between text-left">
                    <span className="flex items-center gap-2 truncate">
                      <Building2 className="h-4 w-4 shrink-0" />
                      <span className="truncate">{selectedCondo.coproprieteName}</span>
                    </span>
                    <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {extranetCondos.map((condo) => (
                    <DropdownMenuItem
                      key={condo.coproprieteId}
                      onClick={() => setSelectedCondo(condo)}
                      className={cn(
                        'cursor-pointer',
                        condo.coproprieteId === selectedCondo.coproprieteId && 'bg-muted'
                      )}
                    >
                      <Building2 className="mr-2 h-4 w-4" />
                      <span className="truncate">{condo.coproprieteName}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span className="truncate">{selectedCondo.coproprieteName}</span>
              </div>
            )}
          </div>
        )}

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const active = isActive(item.href);

            return (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="flex-1">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <Badge variant={active ? 'secondary' : 'default'} className="text-xs">
                    {item.badge}
                  </Badge>
                )}
              </a>
            );
          })}
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
          {canSwitchToAdmin && (
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleSwitchToAdmin}
            >
              <Shield className="mr-2 h-4 w-4" />
              Vue administration
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
      <header className="sticky top-0 z-50 border-b bg-background md:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <a href="/extranet" className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary">EzCopro</span>
            <Badge variant="secondary" className="text-xs">Extranet</Badge>
          </a>
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
        </div>
        {/* Mobile Condo Selector */}
        {selectedCondo && hasMultipleCondos && (
          <div className="border-t px-4 py-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="w-full justify-between text-left">
                  <span className="flex items-center gap-2 truncate">
                    <Building2 className="h-4 w-4 shrink-0" />
                    <span className="truncate text-xs">{selectedCondo.coproprieteName}</span>
                  </span>
                  <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {extranetCondos.map((condo) => (
                  <DropdownMenuItem
                    key={condo.coproprieteId}
                    onClick={() => setSelectedCondo(condo)}
                    className={cn(
                      'cursor-pointer',
                      condo.coproprieteId === selectedCondo.coproprieteId && 'bg-muted'
                    )}
                  >
                    <Building2 className="mr-2 h-4 w-4" />
                    <span className="truncate">{condo.coproprieteName}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
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
              const active = isActive(item.href);

              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors',
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <Badge variant={active ? 'secondary' : 'default'} className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </a>
              );
            })}

            <hr className="my-4" />
            {canSwitchToAdmin && (
              <Button
                variant="outline"
                className="w-full justify-start mb-2"
                onClick={() => {
                  handleSwitchToAdmin();
                  setMobileMenuOpen(false);
                }}
              >
                <Shield className="mr-2 h-4 w-4" />
                Vue administration
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
        {navItems.slice(0, 4).map((item) => {
          const active = isActive(item.href);

          return (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 p-2 relative',
                active ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <div className="relative">
                <item.icon className="h-5 w-5" />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
                )}
              </div>
              <span className="text-xs">{item.label}</span>
            </a>
          );
        })}
      </nav>
    </>
  );
}
