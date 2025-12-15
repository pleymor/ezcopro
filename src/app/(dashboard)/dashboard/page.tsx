'use client';

import Link from 'next/link';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { useCopropriete } from '@/lib/hooks/useCopropriete';
import { Building2, Users, Wallet, History } from 'lucide-react';

export default function DashboardPage() {
  const { coproprietes, selectedCopro, setSelectedCopro, loading } = useCopropriete();

  if (loading) {
    return <Loading message="Chargement de vos copropriétés..." />;
  }

  if (!selectedCopro && coproprietes.length > 1) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">Vos copropriétés</h1>
        <div className="grid gap-4 md:grid-cols-2">
          {coproprietes.map((copro) => (
            <Card
              key={copro.id}
              className="cursor-pointer transition-shadow hover:shadow-lg"
              onClick={() => setSelectedCopro(copro)}
            >
              <CardHeader>
                <CardTitle>{copro.nom}</CardTitle>
                <CardDescription>{copro.adresse}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!selectedCopro) {
    return <Loading message="Chargement..." />;
  }

  const quickLinks = [
    {
      title: 'Lots',
      description: 'Gérer les lots de la copropriété',
      href: '/lots' as const,
      icon: Building2,
    },
    {
      title: 'Copropriétaires',
      description: 'Gérer les copropriétaires',
      href: '/coproprietaires' as const,
      icon: Users,
    },
    {
      title: 'Finances',
      description: 'Appels de fonds et paiements',
      href: '/finances' as const,
      icon: Wallet,
    },
    {
      title: 'Historique',
      description: 'Voir l\'historique des actions',
      href: '/historique' as const,
      icon: History,
    },
  ];

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{selectedCopro.nom}</h1>
        <p className="text-muted-foreground">{selectedCopro.adresse}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="cursor-pointer transition-shadow hover:shadow-lg">
              <CardHeader>
                <link.icon className="mb-2 h-8 w-8 text-primary" />
                <CardTitle>{link.title}</CardTitle>
                <CardDescription>{link.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      {coproprietes.length > 1 && (
        <div className="mt-8 text-center">
          <Button variant="outline" onClick={() => setSelectedCopro(null)}>
            Changer de copropriété
          </Button>
        </div>
      )}
    </div>
  );
}
