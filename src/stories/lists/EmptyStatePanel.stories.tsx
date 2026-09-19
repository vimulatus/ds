import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { EmptyStatePanel } from '@/components/EmptyStatePanel';
import { FilteredHiddenBanner } from '@/components/FilteredHiddenBanner';

const Column = ({ children }: { children: ReactNode }) => (
  <div className="@container flex h-[36rem] w-[44rem] max-w-full flex-col rounded-xl bg-panel">{children}</div>
);

/**
 * What a view shows when it has nothing to show. `kind` picks one of four
 * states and brings its graphic and default copy: no search results, no
 * filter results, not found and error. Each kind tints its graphic: accent
 * for the misses, warning for not found, danger for an error; `tone`
 * overrides it. The title lands on the same baseline in every state. The
 * graphic enters in two layers at once: the slab rises from below while the
 * icon's pieces drop in from above, one after another.
 */
const meta = {
  title: 'Lists/EmptyStatePanel',
  component: EmptyStatePanel,
  argTypes: {
    kind: {
      control: 'select',
      options: ['no-search-results', 'no-filter-results', 'not-found', 'error'],
    },
    tone: {
      control: 'select',
      options: ['neutral', 'accent', 'warning', 'danger'],
    },
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
  args: { kind: 'no-search-results', title: 'No results for "roadmap"' },
};

/** Filters hide every item. The banner, collapsed to its button, clears them. */
export const NoFilterResults: Story = {
  args: {
    kind: 'no-filter-results',
    children: <FilteredHiddenBanner hasHiddenItems={false} onClearFilters={() => {}} />,
  },
};

/** A link to something that is not there. */
export const NotFound: Story = {
  name: '404',
  args: {
    kind: 'not-found',
    primaryAction: { label: 'Go home', onClick: () => {} },
  },
};

/** A view that failed to load. The one action retries it. */
export const Error: Story = {
  args: {
    kind: 'error',
    primaryAction: { label: 'Try again', onClick: () => {} },
  },
};

/** The banner on its own, above a list that filters partly hide. */
export const HiddenBanner: Story = {
  render: () => (
    <div className="w-[44rem] max-w-full">
      <FilteredHiddenBanner onClearFilters={() => {}} />
    </div>
  ),
};
