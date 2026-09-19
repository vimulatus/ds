import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from '@/components/Input';
import { PHONE } from '../phone';

/**
 * A single-line text control. `outlined` sits in a form: a hairline edge on
 * the input fill, and focus adds a soft 2px accent ring. `ghost` is a value
 * that edits in place: no frame until hover. Heights match Button, so an
 * input and a button sit on one line. For a label and an error, use
 * TextField.
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

/** Heights are 24 and 32px, for each variant. */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      {(['outlined', 'ghost'] as const).map((variant) =>
        (['sm', 'md'] as const).map((size) => (
          <Input
            key={variant + size}
            variant={variant}
            size={size}
            placeholder={`${variant}, ${size}`}
            aria-label={`${variant}, ${size}`}
          />
        ))
      )}
    </div>
  ),
};

/** `aria-invalid` turns the hairline and ring to failure. */
export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Input defaultValue="Q3 planning" aria-label="Filled" />
      <Input aria-invalid defaultValue="not-an-email" aria-label="Invalid" />
      <Input disabled placeholder="Disabled" aria-label="Disabled" />
      <Input variant="ghost" defaultValue="Ghost: hover to see the fill" aria-label="Ghost" />
    </div>
  ),
};

/** On a phone `md` grows to 40px with 16px text, so iOS does not zoom on focus. */
export const Phone: Story = {
  ...PHONE,
  render: () => (
    <div className="flex flex-col gap-2">
      <Input placeholder="Search documents" aria-label="Search" />
      <Input variant="ghost" defaultValue="Untitled document" aria-label="Title" />
    </div>
  ),
};
