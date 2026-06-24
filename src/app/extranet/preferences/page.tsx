'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Settings, Trash2, AlertTriangle } from 'lucide-react';
import { usePreferencesNotification } from '@/hooks/usePreferencesNotification';
import { useExtranetCondo } from '@/hooks/useExtranetCondo';
import { useCondo } from '@/lib/hooks/useCondo';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PreferencesForm } from '@/components/extranet/PreferencesForm';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { deleteCurrentAccount } from '@/lib/firebase/auth';

/**
 * Page des préférences de notification pour les copropriétaires
 */
export default function ExtranetPreferencesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { selectedCondo } = useExtranetCondo();
  const { condos: adminCondos } = useCondo();
  const {
    loading,
    error,
    saving,
    emailNouveauxDocuments,
    toggleEmailNouveauxDocuments,
  } = usePreferencesNotification();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Déterminer si l'utilisateur est syndic de cette copropriété
  const isSyndic = useMemo(() => {
    if (!user || !selectedCondo) return false;
    const adminCondo = adminCondos.find((c) => c.id === selectedCondo.coproprieteId);
    if (!adminCondo) return false;
    return adminCondo.ownerId === user.uid || adminCondo.boardMemberIds.includes(user.uid);
  }, [user, selectedCondo, adminCondos]);

  // Ne permettre la suppression que pour les vrais copropriétaires (pas les syndics qui consultent)
  const canDeleteAccount = selectedCondo !== null && !isSyndic;

  const handleDeleteAccount = async () => {
    if (!canDeleteAccount) {
      setDeleteError('Vous ne pouvez pas supprimer votre compte syndic depuis l\'extranet.');
      return;
    }

    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteCurrentAccount();
      // Rediriger vers la page de login après suppression
      router.push('/login');
    } catch (err) {
      // Firebase peut demander une ré-authentification récente
      if (err instanceof Error && err.message.includes('requires-recent-login')) {
        setDeleteError('Pour des raisons de sécurité, veuillez vous reconnecter avant de supprimer votre compte.');
      } else {
        setDeleteError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
      }
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <a href="/extranet">
            <ArrowLeft className="h-5 w-5" />
          </a>
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Préférences
          </h1>
          <p className="text-muted-foreground">
            Gérez vos préférences et votre compte
          </p>
        </div>
      </div>

      {/* Formulaire notifications */}
      <PreferencesForm
        emailNouveauxDocuments={emailNouveauxDocuments}
        onToggleEmailNouveauxDocuments={toggleEmailNouveauxDocuments}
        saving={saving}
        error={error}
      />

      {/* Section suppression de compte - uniquement pour les vrais copropriétaires */}
      {canDeleteAccount && (
        <>
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Zone de danger
              </CardTitle>
              <CardDescription>
                Actions irréversibles sur votre compte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                La suppression de votre compte est définitive. Vous perdrez l&apos;accès
                à votre espace copropriétaire et devrez demander une nouvelle invitation
                à votre syndic pour y accéder à nouveau.
              </p>
              {deleteError && (
                <p className="text-sm text-destructive">{deleteError}</p>
              )}
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer mon compte
              </Button>
            </CardContent>
          </Card>

          <ConfirmDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            title="Supprimer votre compte ?"
            description="Cette action est irréversible. Votre compte sera définitivement supprimé et vous devrez demander une nouvelle invitation pour accéder à l'extranet."
            confirmLabel="Supprimer mon compte"
            onConfirm={handleDeleteAccount}
            isLoading={deleting}
            variant="destructive"
          />
        </>
      )}
    </div>
  );
}
