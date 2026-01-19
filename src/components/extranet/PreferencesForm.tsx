'use client';

import { Bell, Mail, Check, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface PreferencesFormProps {
  emailNouveauxDocuments: boolean;
  onToggleEmailNouveauxDocuments: () => Promise<void>;
  saving: boolean;
  error: Error | null;
}

/**
 * Formulaire de gestion des préférences de notification
 */
export function PreferencesForm({
  emailNouveauxDocuments,
  onToggleEmailNouveauxDocuments,
  saving,
  error,
}: PreferencesFormProps) {
  const handleToggle = async () => {
    try {
      await onToggleEmailNouveauxDocuments();
    } catch (err) {
      // L'erreur est gérée par le hook
      console.error('Erreur lors de la mise à jour:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Notifications Email */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Notifications par email
          </CardTitle>
          <CardDescription>
            Choisissez quand vous souhaitez recevoir des emails de notification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Toggle nouveaux documents */}
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="flex items-start gap-3">
              <Bell className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <Label
                  htmlFor="email-nouveaux-documents"
                  className="text-base font-medium cursor-pointer"
                >
                  Nouveaux documents
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Recevoir un email lorsqu'un nouveau document est partagé par le syndic
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {saving && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
              )}
              <Switch
                id="email-nouveaux-documents"
                checked={emailNouveauxDocuments}
                onCheckedChange={handleToggle}
                disabled={saving}
              />
            </div>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 text-sm">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>{error.message}</p>
            </div>
          )}

          {/* Message de confirmation */}
          {!error && !saving && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 text-green-500" />
              <span>Vos préférences sont automatiquement enregistrées</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section Informations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">À propos des notifications</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-3">
          <p>
            Les notifications par email vous permettent de rester informé des nouveautés
            de votre copropriété sans avoir à consulter régulièrement l'extranet.
          </p>
          <p>
            Vous pouvez modifier vos préférences à tout moment. Les changements sont
            appliqués immédiatement.
          </p>
          <p>
            Si vous ne recevez pas les emails, vérifiez votre dossier de courriers indésirables
            et ajoutez notre adresse à vos contacts.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
