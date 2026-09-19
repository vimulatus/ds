import { FileText } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';

/**
 * A surface that groups related content: a hairline edge, rounded-xl, no
 * shadow. It sits at depth 1; a card inside a card steps one shade lighter,
 * so nesting still reads without a heavier edge.
 */
const meta = {
  title: 'Primitives/Card',
  component: Card,
  args: { title: 'Launch plan', depth: 1 },
  argTypes: { depth: { control: 'select', options: [0, 1, 2, 3, 4] } },
  render: (args) => (
    <Card {...args} className="max-w-96">
      <div className="flex items-center gap-2">
        <FileText className="size-4 text-write" />
        <span className="text-sm font-medium text-ink">Spring launch brief</span>
        <span className="ml-auto text-xs text-ink-subtle">Edited 2 h ago</span>
      </div>
      <p className="text-sm text-ink-muted">
        The rollout ships behind a flag on Monday. Support gets the help article on Friday.
      </p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-ink-subtle">Shared with 6 people</span>
        <Button variant="outlined" size="sm">
          Open
        </Button>
      </div>
    </Card>
  ),
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Depth 0 to 4, each one shade lighter than the last. Depths 3 and 4 share the top shade. */
export const Depth: Story = {
  render: () => (
    <div className="grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-5">
      {([0, 1, 2, 3, 4] as const).map((depth) => (
        <Card key={depth} depth={depth} title={`depth ${depth}`}>
          <div className="h-10" />
        </Card>
      ))}
    </div>
  ),
};

/** A card inside a card: pass the next depth and the inner surface steps up a shade. */
export const Nesting: Story = {
  render: () => (
    <Card title="Launch" className="max-w-md">
      <Card depth={2} title="Checklist">
        <ul className="flex flex-col gap-1 text-sm text-ink-muted">
          <li>Draft the announcement</li>
          <li>Record the demo</li>
        </ul>
        <Card depth={3} title="Blocked">
          <p className="text-sm text-ink-muted">Waiting on the pricing page.</p>
        </Card>
      </Card>
    </Card>
  ),
};
