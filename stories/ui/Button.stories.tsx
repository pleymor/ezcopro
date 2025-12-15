import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/components/ui/button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Bouton',
    variant: 'default',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Supprimer',
    variant: 'destructive',
  },
};

export const Outline: Story = {
  args: {
    children: 'Annuler',
    variant: 'outline',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondaire',
    variant: 'secondary',
  },
};

export const Ghost: Story = {
  args: {
    children: 'Ghost',
    variant: 'ghost',
  },
};

export const Link: Story = {
  args: {
    children: 'Lien',
    variant: 'link',
  },
};

export const Small: Story = {
  args: {
    children: 'Petit',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    children: 'Grand',
    size: 'lg',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Désactivé',
    disabled: true,
  },
};
