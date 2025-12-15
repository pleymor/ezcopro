import type { Meta, StoryObj } from '@storybook/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Titre de la carte</CardTitle>
        <CardDescription>Description de la carte</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Contenu de la carte</p>
      </CardContent>
      <CardFooter>
        <Button>Action</Button>
      </CardFooter>
    </Card>
  ),
};

export const LotCard: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Lot A01</CardTitle>
        <CardDescription>Appartement</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm">
            <span className="text-muted-foreground">Propriétaire:</span> Jean Dupont
          </p>
          <p className="text-sm">
            <span className="text-muted-foreground">Tantièmes:</span> 150/1000
          </p>
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button variant="outline" size="sm">
          Modifier
        </Button>
        <Button variant="destructive" size="sm">
          Supprimer
        </Button>
      </CardFooter>
    </Card>
  ),
};

export const CoproprietaireCard: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Jean Dupont</CardTitle>
        <CardDescription>3 lots - 450 tantièmes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm">
            <span className="text-muted-foreground">Email:</span> jean.dupont@email.com
          </p>
          <p className="text-sm">
            <span className="text-muted-foreground">Solde:</span>{' '}
            <span className="text-green-600 font-medium">+150,00 €</span>
          </p>
        </div>
      </CardContent>
    </Card>
  ),
};
