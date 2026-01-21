'use client';

import { useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { useCondo } from '@/lib/hooks/useCondo';
import { condoPath } from '@/lib/utils/condo-routes';
import { Building2, AlertCircle, Plus, MapPin } from 'lucide-react';

// Set the last condo cookie (client-side)
function setLastCondoCookie(condoId: string) {
  document.cookie = `lastCondoId=${condoId}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
}

export default function CoproSelectorPage() {
  const { condos, loading, error, refresh } = useCondo();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect');

  // Build the full redirect URL for a given condo
  const getCondoUrl = useCallback(
    (condoId: string) => {
      if (redirectPath) {
        return `/copro/${condoId}${redirectPath}`;
      }
      return condoPath(condoId);
    },
    [redirectPath]
  );

  // Handle condo selection (set cookie and navigate)
  const handleCondoSelect = useCallback(
    (condoId: string) => {
      setLastCondoCookie(condoId);
      router.push(getCondoUrl(condoId));
    },
    [router, getCondoUrl]
  );

  // Auto-redirect if only one condo
  useEffect(() => {
    if (!loading && condos.length === 1 && condos[0]) {
      setLastCondoCookie(condos[0].id);
      router.replace(getCondoUrl(condos[0].id));
    }
  }, [loading, condos, router, getCondoUrl]);

  if (loading) {
    return <Loading message="Chargement de vos copropriétés..." />;
  }

  if (error) {
    return (
      <div className="container mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center px-4 py-8">
        <Card className="w-full text-center">
          <CardHeader className="pb-4">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Erreur de chargement</CardTitle>
            <CardDescription className="text-base">{error}</CardDescription>
          </CardHeader>
          <div className="pb-6">
            <Button onClick={() => refresh()} size="lg">
              Réessayer
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // No condos: show onboarding
  if (condos.length === 0) {
    return (
      <EmptyState
        title="Bienvenue sur EzCopro"
        description="Vous n'avez pas encore de copropriété. Créez votre première copropriété pour commencer à gérer vos lots, copropriétaires et finances."
        actionLabel="Créer ma première copropriété"
        actionHref="/onboarding"
        icon={Building2}
      />
    );
  }

  // Single condo: loading state while redirecting
  if (condos.length === 1) {
    return <Loading message="Redirection..." />;
  }

  // Multiple condos: show selector
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Vos copropriétés</h1>
          <p className="text-muted-foreground">
            Sélectionnez une copropriété pour y accéder
          </p>
        </div>
        <Button asChild>
          <Link href="/onboarding">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle copropriété
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {condos.map((condo) => (
          <Card
            key={condo.id}
            className="h-full cursor-pointer transition-all hover:border-primary hover:shadow-lg"
            onClick={() => handleCondoSelect(condo.id)}
          >
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">{condo.name}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {condo.address}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
