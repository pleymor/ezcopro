'use client';

import { ArrowLeft, Settings } from 'lucide-react';
import { usePreferencesNotification } from '@/hooks/usePreferencesNotification';
import { Button } from '@/components/ui/button';
import { PreferencesForm } from '@/components/extranet/PreferencesForm';

/**
 * Page des préférences de notification pour les copropriétaires
 */
export default function ExtranetPreferencesPage() {
  const {
    loading,
    error,
    saving,
    emailNouveauxDocuments,
    toggleEmailNouveauxDocuments,
  } = usePreferencesNotification();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
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
            Gérez vos préférences de notification
          </p>
        </div>
      </div>

      {/* Formulaire */}
      <PreferencesForm
        emailNouveauxDocuments={emailNouveauxDocuments}
        onToggleEmailNouveauxDocuments={toggleEmailNouveauxDocuments}
        saving={saving}
        error={error}
      />
    </div>
  );
}
