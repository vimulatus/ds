import type { Meta, StoryObj } from '@storybook/react-vite';
import { EntityList } from '@/patterns/EntityList';
import { ROWS } from './sample';

const ITEMS = ROWS.filter((row) => ['plan', 'faq', 'contract', 'sync'].includes(row.id)).map(
  ({ group: _group, ...row }) => row
);

const WIDTHS = [
  { rem: 44, note: 'everything' },
  { rem: 30, note: 'badges gone' },
  { rem: 26, note: 'people gone' },
  { rem: 20, note: 'secondary line gone' },
];

/**
 * A row is a container: as its list narrows it sheds columns in a set
 * order, so a list beside a detail view or in a phone-width column keeps
 * the title and the time readable. Badges go under 32rem, people under
 * 28rem and the inline secondary line under 24rem. The title truncates
 * last; the time never goes.
 */
const meta = {
  title: 'Lists/Narrow layouts',
  component: EntityList,
  args: { label: 'Recent files', items: ITEMS },
} satisfies Meta<typeof EntityList>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The same rows at four widths. */
export const DropOrder: Story = {
  render: (args) => (
    <div className="flex flex-col gap-6">
      {WIDTHS.map(({ rem, note }) => (
        <div key={rem} className="flex flex-col gap-1.5">
          <span className="font-mono text-xs text-ink-subtle">
            {rem}rem, {note}
          </span>
          <div className="rounded-xl bg-panel" style={{ width: `${rem}rem`, maxWidth: '100%' }}>
            <EntityList {...args} />
          </div>
        </div>
      ))}
    </div>
  ),
};

/** Drag the corner to resize the column and watch the columns go. */
export const Resizable: Story = {
  render: (args) => (
    <div className="w-[44rem] min-w-40 max-w-full resize-x overflow-hidden rounded-xl bg-panel">
      <EntityList {...args} />
    </div>
  ),
};

/** `md` density keeps the secondary line at every width: it sits under the title and truncates instead. */
export const RoomyNarrow: Story = {
  render: (args) => (
    <div className="w-[20rem] rounded-xl bg-panel">
      <EntityList {...args} density="md" />
    </div>
  ),
};
