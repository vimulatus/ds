import { Plus } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { PillButton } from '@/components/PillButton';

/**
 * A rounded-full pill for empty states and setup cards. `cta` is the one
 * primary action; `subtle` is a quiet ink-tinted pill beside it. A leading
 * icon tightens the left padding.
 */
const meta = {
  title: 'Primitives/PillButton',
  component: PillButton,
  args: { children: 'New document', tone: 'cta', onClick: () => {} },
  argTypes: { tone: { control: 'select', options: ['cta', 'subtle'] } },
} satisfies Meta<typeof PillButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** A primary pill with an icon, and a subtle one beside it. */
export const Tones: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <PillButton icon={Plus} onClick={() => {}}>
        New document
      </PillButton>
      <PillButton onClick={() => {}}>Get started</PillButton>
      <PillButton tone="subtle" onClick={() => {}}>
        Learn more
      </PillButton>
    </div>
  ),
};
