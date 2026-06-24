'use client';

import Link from 'next/link';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Users, ShieldCheck } from 'lucide-react';

const settingsItems = [
  {
    href: '/parametres/equipe' as const,
    title: 'Équipe',
    description: 'Gérer les membres de votre équipe de gestion',
    icon: Users,
  },
  {
    href: '/parametres/roles-et-acces' as const,
    title: 'Rôles et accès',
    description: 'Configurer les permissions et niveaux d\'accès',
    icon: ShieldCheck,
  },
];

export default function ParametresPage() {
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

      <div className="grid gap-4 md:grid-cols-2">
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
    </div>
  );
}
