import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { MaskReveal } from '@/components/MaskReveal';
import { PHONE } from '../phone';

/**
 * A masked value that is its own reveal control. Hover blurs it and shows
 * the eye; a click reveals, a second click hides. On touch there is no
 * hover and no eye: a tap toggles it. It is a toggle button, so a screen
 * reader hears its state.
 *
 * - **Do** mask what a bystander should not read off the screen: a phone
 *   number, an account number, a key.
 * - **Don't** add an eye button beside it; the value is the target.
 */
const meta = {
  title: 'Parts/MaskReveal',
  component: MaskReveal,
  args: { masked: '+1 415 ••• ••82', value: '+1 415 555 0182', label: 'phone number' },
} satisfies Meta<typeof MaskReveal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Under a name, as a contact card shows it. */
export const InContext: Story = {
  render: (args) => (
    <div className="flex flex-col gap-0.5">
      <span className="text-sm font-medium text-ink">Nina Park</span>
      <MaskReveal {...args} />
      <span className="text-sm text-ink-muted">nina@northwind.io</span>
    </div>
  ),
};

/** Controlled: the parent holds the state. */
export const Controlled: Story = {
  render: () => {
    const [revealed, setRevealed] = useState(false);
    return (
      <div className="flex items-center gap-3">
        <MaskReveal
          masked="•••• •••• •••• 4821"
          value="4111 2203 9876 4821"
          label="card number"
          revealed={revealed}
          onRevealedChange={setRevealed}
        />
        <span className="text-xs text-ink-subtle">{revealed ? 'Revealed' : 'Hidden'}</span>
      </div>
    );
  },
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * The value comes from the server on reveal. `onReveal` resolves it; the
 * reveal is fetched once, then a click toggles it like any other.
 */
export const Fetched: Story = {
  args: { value: undefined },
  render: () => (
    <MaskReveal
      masked="+1 415 ••• ••82"
      label="phone number"
      onReveal={async () => {
        await wait(600);
        return '+1 415 555 0182';
      }}
    />
  ),
};

/**
 * The viewer may not see the value. `onReveal` returns `null` (or throws),
 * the value stays masked, and a danger callout says why. It clears when
 * focus leaves the control.
 */
export const Denied: Story = {
  args: { value: undefined },
  render: () => (
    <MaskReveal
      masked="+1 415 ••• ••82"
      label="phone number"
      onReveal={async () => {
        await wait(600);
        return null;
      }}
    />
  ),
};

/** On a phone a tap toggles the value; no eye, no blur. */
export const Phone: Story = { ...PHONE, render: InContext.render };
