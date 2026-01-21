'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Users, ShieldCheck, Trash2, AlertTriangle } from 'lucide-react';
import { useCondoFromUrl } from '@/lib/hooks/useCondoFromUrl';
import { useAuth } from '@/lib/hooks/useAuth';
import { condoPaths } from '@/lib/utils/condo-routes';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { softDeleteCondo } from '@/lib/firebase/services/condo';

export default function ParametresPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { condoId, currentCondo, loading, refresh } = useCondoFromUrl();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (loading) {
    return <Loading message="Chargement..." />;
  }

  if (!currentCondo || !condoId) {
    return <ErrorMessage message="Aucune copropriété sélectionnée" />;
  }

  const isOwner = user?.uid === currentCondo.ownerId;

  const handleDelete = async () => {
    if (!condoId) return;

    setIsDeleting(true);
    try {
      await softDeleteCondo(condoId);
      await refresh();
      router.push('/copro');
    } catch (error) {
      console.error('Error deleting condo:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const settingsItems = [
    {
      href: condoPaths.equipe(condoId),
      title: 'Équipe',
      description: 'Gérer les membres de votre équipe de gestion',
      icon: Users,
    },
    {
      href: condoPaths.rolesAcces(condoId),
      title: 'Rôles et accès',
      description: 'Configurer les permissions et niveaux d\'accès',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">Paramètres</h1>
        </div>
        <p className="text-muted-foreground">
          Configurez les paramètres de votre copropriété
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-8">
        {settingsItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="cursor-pointer transition-shadow hover:shadow-lg h-full">
              <CardHeader>
                <item.icon className="mb-2 h-8 w-8 text-primary" />
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      {/* Zone de danger */}
      {isOwner && (
        <Card className="border-destructive/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-destructive">Zone de danger</CardTitle>
            </div>
            <CardDescription>
              Actions irréversibles sur cette copropriété
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Supprimer cette copropriété</p>
                <p className="text-sm text-muted-foreground">
                  La copropriété sera archivée et ne sera plus accessible.
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Supprimer la copropriété"
        description={`Êtes-vous sûr de vouloir supprimer "${currentCondo.name}" ? Cette copropriété sera archivée et vous n'y aurez plus accès.`}
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
        isLoading={isDeleting}
        variant="destructive"
      />
    </div>
  );
}
