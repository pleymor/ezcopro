'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CoproprieteForm } from '@/components/forms/CoproprieteForm';
import { useAuth } from '@/lib/hooks/useAuth';
import { FullPageLoading } from '@/components/ui/loading';
import { Building2, Users } from 'lucide-react';

type OnboardingStep = 'choice' | 'create' | 'join';

export default function OnboardingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>('choice');

  if (loading) {
    return <FullPageLoading />;
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  const handleCreateSuccess = () => {
    router.push('/');
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Bienvenue sur EzCopro</h1>
        <p className="mt-2 text-muted-foreground">
          {step === 'choice' && 'Commencez par créer ou rejoindre une copropriété'}
          {step === 'create' && 'Créez votre copropriété'}
          {step === 'join' && 'Rejoignez une copropriété existante'}
        </p>
      </div>

      {step === 'choice' && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card
            className="cursor-pointer transition-shadow hover:shadow-lg"
            onClick={() => setStep('create')}
          >
            <CardHeader>
              <Building2 className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>Créer une copropriété</CardTitle>
              <CardDescription>
                Vous êtes le premier à configurer votre copropriété
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Créer</Button>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer transition-shadow hover:shadow-lg"
            onClick={() => setStep('join')}
          >
            <CardHeader>
              <Users className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>Rejoindre une copropriété</CardTitle>
              <CardDescription>
                Vous avez reçu un code d&apos;invitation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Rejoindre
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {step === 'create' && (
        <Card>
          <CardHeader>
            <CardTitle>Nouvelle copropriété</CardTitle>
            <CardDescription>
              Renseignez les informations de votre copropriété
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CoproprieteForm onSuccess={handleCreateSuccess} />
            <Button
              variant="ghost"
              className="mt-4 w-full"
              onClick={() => setStep('choice')}
            >
              Retour
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 'join' && (
        <Card>
          <CardHeader>
            <CardTitle>Rejoindre une copropriété</CardTitle>
            <CardDescription>
              Entrez le code d&apos;invitation que vous avez reçu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              Cette fonctionnalité sera disponible prochainement
            </p>
            <Button
              variant="ghost"
              className="mt-4 w-full"
              onClick={() => setStep('choice')}
            >
              Retour
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
