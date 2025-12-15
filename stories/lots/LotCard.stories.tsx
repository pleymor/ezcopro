import type { Meta, StoryObj } from '@storybook/react';
import { LotCard } from '@/components/lots/LotCard';

const meta: Meta<typeof LotCard> = {
  title: 'Lots/LotCard',
  component: LotCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockLot = {
  id: '1',
  numero: 'A01',
  type: 'appartement' as const,
  tantiemes: 150,
  coproprietaireId: 'cp1',
  description: '3ème étage, vue jardin',
  createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 },
  updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 },
};

export const Default: Story = {
  args: {
    lot: mockLot,
    totalTantiemes: 1000,
    coproprietaireName: 'Jean Dupont',
    onDelete: () => alert('Delete clicked'),
  },
};

export const Appartement: Story = {
  args: {
    lot: { ...mockLot, type: 'appartement' },
    totalTantiemes: 1000,
  },
};

export const Cave: Story = {
  args: {
    lot: { ...mockLot, numero: 'C01', type: 'cave', tantiemes: 10 },
    totalTantiemes: 1000,
  },
};

export const Parking: Story = {
  args: {
    lot: { ...mockLot, numero: 'P01', type: 'parking', tantiemes: 25 },
    totalTantiemes: 1000,
  },
};

export const WithoutDescription: Story = {
  args: {
    lot: { ...mockLot, description: null },
    totalTantiemes: 1000,
  },
};
