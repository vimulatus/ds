import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { Button } from '@/components/Button';
import { EmptyStatePanel } from '@/components/EmptyStatePanel';

/** A tilted card behind a glyph. Strokes and fills follow `currentColor`, so the panel's tone colors it. */
function Slab({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 96 96" fill="none" className="size-24">
      <rect x="18" y="26" width="60" height="48" rx="10" transform="rotate(-6 48 50)" className="fill-surface stroke-edge" />
      <rect x="22" y="22" width="56" height="46" rx="10" className="fill-hover stroke-edge-muted" />
      <g stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </g>
    </svg>
  );
}

const Search = () => (
  <Slab>
    <circle cx="46" cy="43" r="9" />
    <path d="m53 50 7 7" />
  </Slab>
);

const Filter = () => (
  <Slab>
    <path d="M36 36h24M40 45h16M44 54h8" />
  </Slab>
);

const Missing = () => (
  <Slab>
    <path d="M42 39a7 7 0 1 1 9 6.5c-2 .8-3 2.2-3 4v1.5" />
    <circle cx="48" cy="57" r="0.5" />
  </Slab>
);

const Broken = () => (
  <Slab>
    <path d="M48 34v14" />
    <circle cx="48" cy="56" r="0.5" />
  </Slab>
);

function Column({ children }: { children: ReactNode }) {
  return <div className="flex h-[36rem] w-[44rem] max-w-full flex-col rounded-xl bg-panel">{children}</div>;
}

/**
 * What a view shows when it has nothing to show: a small drawing, a title
 * that says what happened, a line on what to do, and at most one action.
 * `tone` colors the drawing: accent for a miss, warning for not found,
 * failure for an error. The drawing rises in as the panel mounts.
 */
const meta = {
  title: 'Lists/EmptyStatePanel',
  component: EmptyStatePanel,
  argTypes: {
    tone: { control: 'select', options: ['neutral', 'accent', 'warning', 'failure'] },
  },
  render: (args) => (
    <Column>
      <EmptyStatePanel {...args} />
    </Column>
  ),
} satisfies Meta<typeof EmptyStatePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A search that matched nothing. The title can name the query. */
export const NoSearchResults: Story = {
  args: {
    illustration: <Search />,
    title: 'No results for "roadmap"',
    description: 'Try a different search.',
  },
};

/** Filters hide every item. The one action clears them. */
export const NoFilterResults: Story = {
  args: {
    illustration: <Filter />,
    title: 'Nothing matches these filters',
    description: 'Clear them to see every item.',
    action: <Button variant="outlined" size="sm">Clear filters</Button>,
  },
};

/** A link to something that is not there. */
export const NotFound: Story = {
  args: {
    illustration: <Missing />,
    tone: 'warning',
    title: 'This page does not exist',
    description: 'It may have moved, or the link is wrong.',
    action: <Button variant="outlined" size="sm">Go home</Button>,
  },
};

/** A view that failed to load. The action retries. */
export const LoadError: Story = {
  args: {
    illustration: <Broken />,
    tone: 'failure',
    title: 'This view did not load',
    description: 'Check your connection, then try again.',
    action: <Button variant="outlined" size="sm">Try again</Button>,
  },
};

/** `centered` puts the panel in the middle of its container, for a small pane. */
export const Centered: Story = {
  args: {
    centered: true,
    tone: 'neutral',
    illustration: <Filter />,
    title: 'No tasks yet',
    description: 'Tasks you create show up here.',
  },
  render: (args) => (
    <div className="flex h-72 w-80 flex-col rounded-xl bg-panel">
      <EmptyStatePanel {...args} />
    </div>
  ),
};
