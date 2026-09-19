import { MagnifyingGlass, Plus, Trash } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, type ButtonVariant } from '@/components/Button';

const VARIANTS: ButtonVariant[] = ['ghost', 'outlined', 'accent', 'danger', 'cta'];

/**
 * Triggers an action. `variant` carries emphasis and `size` carries density.
 * Every variant except `ghost` is glass: a specular rim and a soft shadow.
 */
const meta = {
  title: 'Primitives/Button',
  component: Button,
  args: { children: 'New document', variant: 'outlined', size: 'md' },
  argTypes: {
    variant: { control: 'select', options: VARIANTS },
    size: { control: 'select', options: ['sm', 'md'] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Emphasis rises left to right. Give a screen at most one `cta`. */
export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      {VARIANTS.map((variant) => (
        <Button key={variant} variant={variant}>
          {variant}
        </Button>
      ))}
    </div>
  ),
};

/** Heights are 24 and 32px. `md` is the default. */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-end gap-2">
      {(['sm', 'md'] as const).map((size) => (
        <Button key={size} variant="outlined" size={size}>
          <Plus />
          {size}
        </Button>
      ))}
    </div>
  ),
};

/** An icon-only button takes `label` as its accessible name and its tooltip. */
export const IconOnly: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Button size="icon-sm" label="Search" shortcut="⌘K">
        <MagnifyingGlass />
      </Button>
      <Button size="icon-md" variant="outlined" label="Create">
        <Plus />
      </Button>
      <Button size="icon-md" variant="danger" label="Delete">
        <Trash />
      </Button>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex gap-2">
      <Button variant="outlined" disabled>
        Outlined
      </Button>
      <Button variant="cta" disabled>
        Continue
      </Button>
    </div>
  ),
};
