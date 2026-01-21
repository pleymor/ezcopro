'use client';

import Link from 'next/link';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCondoFromUrl } from '@/lib/hooks/useCondoFromUrl';
import { condoPaths } from '@/lib/utils/condo-routes';
import { Building2, Users, Wallet, History } from 'lucide-react';

export default function CondoDashboardPage() {
  const { condoId, currentCondo } = useCondoFromUrl();

  if (!condoId || !currentCondo) {
    return null;
  }

  const quickLinks = [
    {
      title: 'Lots',
      description: 'Gérer les lots de la copropriété',
      href: condoPaths.lots(condoId),
      icon: Building2,
    },
    {
      title: 'Copropriétaires',
      description: 'Gérer les copropriétaires',
      href: condoPaths.coproprietaires(condoId),
      icon: Users,
    },
    {
      title: 'Finances',
      description: 'Appels de fonds et paiements',
      href: condoPaths.finances(condoId),
      icon: Wallet,
    },
    {
      title: 'Historique',
      description: "Voir l'historique des actions",
      href: condoPaths.historique(condoId),
      icon: History,
    },
  ];

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{currentCondo.name}</h1>
        <p className="text-muted-foreground">{currentCondo.address}</p>
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
    </div>
  );
}
