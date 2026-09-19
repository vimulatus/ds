import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from '@/components/Input';

/**
 * A thin native input. A hairline `edge-muted` border frames it on the input
 * fill, and focus adds a soft 2px ring instead of an accent outline. Sizes
 * match Button, so an input and a button sit on one line.
 */
const meta = {
  title: 'Primitives/Input',
  component: Input,
  args: { placeholder: 'Search documents', variant: 'outlined', size: 'md' },
  argTypes: {
    variant: { control: 'select', options: ['outlined', 'ghost'] },
    size: { control: 'select', options: ['sm', 'md'] },
  },
  decorators: [(Story) => <div className="max-w-80">{Story()}</div>],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      {(['sm', 'md'] as const).map((size) => (
        <Input key={size} size={size} placeholder={`size="${size}"`} />
      ))}
    </div>
  ),
};

/** `aria-invalid` turns the border and ring to `failure`. */
export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Input defaultValue="Q3 planning" />
      <Input aria-invalid defaultValue="not-an-email" />
      <Input disabled placeholder="Disabled" />
      <Input variant="ghost" placeholder="Ghost: the parent owns the frame" />
    </div>
  ),
};
