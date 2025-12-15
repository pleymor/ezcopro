import type { Meta, StoryObj } from '@storybook/react';
import { LotForm } from '@/components/forms/LotForm';
import type { LotFormData } from '@/lib/schemas/lot';

const meta: Meta<typeof LotForm> = {
  title: 'Forms/LotForm',
  component: LotForm,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockCoproprietaires = [
  { id: 'cp1', nom: 'Dupont', prenom: 'Jean' },
  { id: 'cp2', nom: 'Martin', prenom: 'Marie' },
  { id: 'cp3', nom: 'SCI Les Lilas', prenom: '' },
];

export const Create: Story = {
  args: {
    coproprietaires: mockCoproprietaires,
    totalTantiemes: 850,
    onSubmit: async (data: LotFormData) => {
      alert(`Lot créé: ${JSON.stringify(data, null, 2)}`);
    },
  },
};

export const Edit: Story = {
  args: {
    initialData: {
      id: '1',
      numero: 'A01',
      type: 'appartement',
      tantiemes: 150,
      coproprietaireId: 'cp1',
      description: '3ème étage, vue jardin',
    },
    coproprietaires: mockCoproprietaires,
    totalTantiemes: 700, // 850 - 150 (lot actuel)
    onSubmit: async (data: LotFormData) => {
      alert(`Lot modifié: ${JSON.stringify(data, null, 2)}`);
    },
  },
};

export const Loading: Story = {
  args: {
    coproprietaires: mockCoproprietaires,
    totalTantiemes: 850,
    onSubmit: async () => {
      await new Promise((resolve) => setTimeout(resolve, 5000));
    },
    isLoading: true,
  },
};

export const NoCoproprietaires: Story = {
  args: {
    coproprietaires: [],
    totalTantiemes: 0,
    onSubmit: async () => {},
  },
};

export const HighTantiemesWarning: Story = {
  args: {
    initialData: {
      id: '1',
      numero: 'A01',
      type: 'appartement',
      tantiemes: 5000,
      coproprietaireId: 'cp1',
    },
    coproprietaires: mockCoproprietaires,
    totalTantiemes: 6000,
    onSubmit: async () => {},
  },
};
