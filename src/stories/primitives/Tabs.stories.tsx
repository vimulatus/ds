import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Tabs, TabsPanel } from '@/components/Tabs';

const LIST = [
  { value: 'all', label: 'All' },
  { value: 'docs', label: 'Documents' },
  { value: 'tasks', label: 'Tasks' },
  { value: 'files', label: 'Files' },
];

/**
 * Switches between views of one thing. A hairline runs under the row and
 * an underline slides to the active tab. Labels are `sm` medium and step
 * from `ink-subtle` to `ink` when active. Arrow keys move between tabs;
 * Enter or Space picks one.
 */
const meta = {
  title: 'Primitives/Tabs',
  component: Tabs,
  args: { list: LIST, defaultValue: 'docs' },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Controlled: the parent holds `value` and gets every change. */
export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState('tasks');
    return (
      <div className="flex flex-col gap-3">
        <Tabs list={LIST} value={value} onValueChange={setValue} />
        <p className="text-sm text-ink-muted">Showing: {value}</p>
      </div>
    );
  },
};

/** With `TabsPanel` children, each tab owns its content. */
export const WithPanels: Story = {
  render: () => (
    <Tabs list={LIST.slice(1)} className="max-w-md">
      <TabsPanel value="docs" className="text-sm text-ink-muted">
        Launch brief, pricing notes and the press kit.
      </TabsPanel>
      <TabsPanel value="tasks" className="text-sm text-ink-muted">
        Four open tasks, one due today.
      </TabsPanel>
      <TabsPanel value="files" className="text-sm text-ink-muted">
        Twelve files from the design review.
      </TabsPanel>
    </Tabs>
  ),
};

/** `fullWidth` shares the row equally. */
export const FullWidth: Story = {
  render: () => (
    <div className="max-w-md">
      <Tabs list={LIST.slice(0, 3)} fullWidth />
    </div>
  ),
};

/** A disabled tab is skipped by the arrow keys. */
export const Disabled: Story = {
  args: { list: [...LIST.slice(0, 3), { value: 'files', label: 'Files', disabled: true }] },
};
