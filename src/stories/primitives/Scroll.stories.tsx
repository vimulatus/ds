import type { Meta, StoryObj } from '@storybook/react-vite';
import { Scroll } from '@/components/Scroll';

const ROWS = Array.from({ length: 40 }, (_, index) => `Launch note ${index + 1}`);

/**
 * A vertical scroller that fills its parent. The native scrollbar is hidden;
 * a 2px thumb fades in while you scroll and fades out half a second after,
 * so the content never gives up width to a gutter. Size the parent.
 */
const meta = {
  title: 'Primitives/Scroll',
  component: Scroll,
} satisfies Meta<typeof Scroll>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Vertical: Story = {
  render: () => (
    <div className="h-64 w-64 overflow-hidden rounded-xl border border-edge-muted bg-surface">
      <Scroll>
        <div className="p-1">
          {ROWS.map((row) => (
            <div key={row} className="rounded-md px-2 py-1.5 text-sm text-ink-muted hover:bg-hover hover:text-ink">
              {row}
            </div>
          ))}
        </div>
      </Scroll>
    </div>
  ),
};
