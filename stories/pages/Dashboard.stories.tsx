import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, Wallet, History } from 'lucide-react';

// Mock Dashboard component for Storybook
function DashboardMock() {
  const quickLinks = [
    {
      title: 'Lots',
      description: 'Gérer les lots de la copropriété',
      href: '/lots',
      icon: Building2,
    },
    {
      title: 'Copropriétaires',
      description: 'Gérer les copropriétaires',
      href: '/coproprietaires',
      icon: Users,
    },
    {
      title: 'Finances',
      description: 'Appels de fonds et paiements',
      href: '/finances',
      icon: Wallet,
    },
    {
      title: 'Historique',
      description: "Voir l'historique des actions",
      href: '/historique',
      icon: History,
    },
  ];

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Résidence Les Lilas</h1>
        <p className="text-muted-foreground">12 rue des Fleurs, 75001 Paris</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {quickLinks.map((link) => (
          <Card key={link.href} className="cursor-pointer transition-shadow hover:shadow-lg">
            <CardHeader>
              <link.icon className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>{link.title}</CardTitle>
              <CardDescription>{link.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}

const meta: Meta<typeof DashboardMock> = {
  title: 'Pages/Dashboard',
  component: DashboardMock,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
