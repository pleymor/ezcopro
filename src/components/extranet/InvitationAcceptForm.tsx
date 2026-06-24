'use client';

import { useState } from 'react';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface InvitationAcceptFormProps {
  email: string;
  coproprieteName?: string;
  onAccept: (password: string) => Promise<void>;
  onSignIn: (password: string) => Promise<void>;
}

/**
 * Formulaire d'acceptation d'invitation extranet.
 * Permet au copropriétaire de créer son mot de passe.
 */
export function InvitationAcceptForm({
  email,
  coproprieteName,
  onAccept,
  onSignIn,
}: InvitationAcceptFormProps) {
  const [mode, setMode] = useState<'create' | 'signin'>('create');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validatePassword = (): string | null => {
    if (password.length < 8) {
      return 'Le mot de passe doit contenir au moins 8 caractères';
    }
    if (mode === 'create' && password !== confirmPassword) {
      return 'Les mots de passe ne correspondent pas';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validatePassword();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (mode === 'create') {
        await onAccept(password);
      } else {
        await onSignIn(password);
      }
      // Redirection vers l'extranet après succès
      window.location.href = '/extranet';
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur';
      // Si l'email existe déjà, proposer de se connecter
      if (errorMessage.includes('email-already-in-use')) {
        setMode('signin');
        setError('Un compte existe déjà avec cet email. Connectez-vous avec votre mot de passe.');
        setConfirmPassword('');
      } else if (errorMessage.includes('wrong-password') || errorMessage.includes('invalid-credential')) {
        setError('Mot de passe incorrect');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>{mode === 'create' ? 'Créer votre compte' : 'Se connecter'}</CardTitle>
        <CardDescription>
          {coproprieteName
            ? `Bienvenue sur l'extranet de ${coproprieteName}`
            : 'Bienvenue sur l\'extranet copropriétaire'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Adresse email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Cette adresse sera utilisée pour vous connecter
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder="Minimum 8 caractères"
                disabled={isSubmitting}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {mode === 'create' && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError(null);
                }}
                placeholder="Retapez votre mot de passe"
                disabled={isSubmitting}
              />
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {mode === 'create' ? 'Création du compte...' : 'Connexion...'}
              </>
            ) : (
              mode === 'create' ? 'Créer mon compte' : 'Se connecter'
            )}
          </Button>

          {mode === 'signin' ? (
            <Button
              type="button"
              variant="link"
              className="w-full"
              onClick={() => {
                setMode('create');
                setError(null);
                setPassword('');
              }}
            >
              Créer un nouveau compte
            </Button>
          ) : (
            <Button
              type="button"
              variant="link"
              className="w-full"
              onClick={() => {
                setMode('signin');
                setError(null);
                setPassword('');
                setConfirmPassword('');
              }}
            >
              J&apos;ai déjà un compte
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
