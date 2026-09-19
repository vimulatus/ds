import type { Meta, StoryObj } from '@storybook/react-vite';
import { ScrollArea } from '@/components/ScrollArea';

const ROWS = Array.from({ length: 40 }, (_, index) => `Launch note ${index + 1}`);

/**
 * A scrolling region with a thin scrollbar that floats over the content.
 * It shows while you scroll or hover and fades after, and the content never
 * gives up width to a gutter. Give the area a size.
 */
const meta = {
  title: 'Primitives/ScrollArea',
  component: ScrollArea,
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Vertical: Story = {
  render: () => (
    <ScrollArea className="h-64 w-64 rounded-xl border border-edge-muted bg-surface" contentClassName="p-1">
      {ROWS.map((row) => (
        <div key={row} className="rounded-md px-2 py-1.5 text-sm text-ink-muted hover:bg-hover hover:text-ink">
          {row}
        </div>
      ))}
    </ScrollArea>
  ),
};

/** `horizontal` for a strip wider than its box. */
export const Horizontal: Story = {
  render: () => (
    <ScrollArea orientation="horizontal" className="w-96 max-w-full rounded-xl border border-edge-muted bg-surface">
      <div className="flex w-max gap-2 p-2">
        {ROWS.slice(0, 16).map((row) => (
          <div key={row} className="flex h-20 w-32 shrink-0 items-end rounded-lg bg-hover p-2 text-xs text-ink-muted">
            {row}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};
