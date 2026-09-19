import { FileText, Image, CheckSquare } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { PillButton } from '@/components/PillButton';

/**
 * A rounded filter pill. It stays pressed, on the accent tint, while its
 * filter is on. A row of pills narrows one list; each toggles on its own.
 */
const meta = {
  title: 'Primitives/PillButton',
  component: PillButton,
  args: { children: 'Documents', size: 'md' },
  argTypes: { size: { control: 'select', options: ['sm', 'md'] } },
} satisfies Meta<typeof PillButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** A filter row. The count says how many items the filter matches. */
export const FilterRow: Story = {
  render: () => {
    const [on, setOn] = useState<string[]>(['docs']);
    const toggle = (value: string) => (pressed: boolean) =>
      setOn((current) => (pressed ? [...current, value] : current.filter((v) => v !== value)));
    return (
      <div className="flex flex-wrap gap-2">
        <PillButton pressed={on.includes('docs')} onPressedChange={toggle('docs')} count={24}>
          <FileText />
          Documents
        </PillButton>
        <PillButton pressed={on.includes('media')} onPressedChange={toggle('media')} count={8}>
          <Image />
          Media
        </PillButton>
        <PillButton pressed={on.includes('tasks')} onPressedChange={toggle('tasks')} count={5}>
          <CheckSquare />
          Tasks
        </PillButton>
      </div>
    );
  },
};

/** `sm` is 24px, `md` 32px, the same as Button. */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <PillButton size="sm">Small</PillButton>
      <PillButton size="sm" defaultPressed>
        Small on
      </PillButton>
      <PillButton>Medium</PillButton>
      <PillButton defaultPressed>Medium on</PillButton>
      <PillButton disabled>Disabled</PillButton>
    </div>
  ),
};
