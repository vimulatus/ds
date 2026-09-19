import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Tabs } from '@/components/Tabs';

const LIST = [
  { value: 'all', label: 'All' },
  { value: 'docs', label: 'Documents' },
  { value: 'tasks', label: 'Tasks' },
  { value: 'files', label: 'Files' },
];

/**
 * A borderless switcher. There is no track: a hairline pill with the
 * `active` scrim slides behind the checked item. Labels are `xs` medium and
 * step from `ink-extra-muted` to `ink` when checked.
 */
const meta = {
  title: 'Primitives/Tabs',
  component: Tabs,
  args: { list: LIST, defaultValue: 'docs' },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState('tasks');
    return (
      <div className="flex flex-col gap-3">
        <Tabs list={LIST} value={value} onChange={setValue} />
        <p className="text-sm text-ink-muted">Showing: {value}</p>
      </div>
    );
  },
};

export const FullWidth: Story = {
  render: () => (
    <div className="max-w-md">
      <Tabs list={LIST.slice(0, 3)} fullWidth />
    </div>
  ),
};
