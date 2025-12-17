import type { Meta, StoryObj } from '@storybook/react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { ThemeProvider } from '@/lib/hooks/useTheme'

const meta: Meta<typeof ThemeToggle> = {
  title: 'UI/ThemeToggle',
  component: ThemeToggle,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div className="p-4">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}

export const InHeader: Story = {
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div className="flex h-14 items-center justify-between border-b bg-background px-4">
          <span className="text-lg font-bold text-primary">EzCopro</span>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
}

export const InSidebar: Story = {
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div className="w-64 border-r bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="truncate text-sm text-muted-foreground">
              user@example.com
            </span>
            <Story />
          </div>
        </div>
      </ThemeProvider>
    ),
  ],
}
