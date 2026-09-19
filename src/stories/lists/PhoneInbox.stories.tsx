import { Check, EnvelopeSimple, EnvelopeSimpleOpen, Trash } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from '@/components/Button';
import { Toolbar } from '@/components/Toolbar';
import { EntityList, type EntityListItem } from '@/patterns/EntityList';
import { SwipableRow } from '@/patterns/SwipableRow';
import { PHONE } from '../phone';
import { ROWS } from './sample';

const INBOX = ROWS.filter((row) => ['faq', 'sync', 'reminder', 'plan', 'contract', 'demo', 'hero', 'voiceover'].includes(row.id));

function Inbox({ initialSelected = [] }: { initialSelected?: string[] }) {
  const [items, setItems] = useState<EntityListItem[]>(INBOX);
  const [selected, setSelected] = useState<Set<string>>(new Set(initialSelected));
  const remove = (id: string) => setItems((prev) => prev.filter((item) => item.id !== id));
  const toggleUnread = (id: string) =>
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, unread: !item.unread } : item)));

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-panel">
      <header className="px-4 pt-4 pb-2 text-xl font-semibold text-ink">Inbox</header>
      <EntityList
        label="Inbox"
        items={items}
        selected={selected}
        onSelectedChange={setSelected}
        selectionActions={
          <Toolbar.Button
            label="Done"
            onClick={() => {
              setItems((prev) => prev.filter((item) => !selected.has(item.id)));
              setSelected(new Set());
            }}
          >
            <Check />
          </Toolbar.Button>
        }
        renderRow={(item, row) => (
          <SwipableRow
            leading={{
              label: item.unread ? 'Read' : 'Unread',
              icon: item.unread ? <EnvelopeSimpleOpen /> : <EnvelopeSimple />,
              tone: 'accent',
              onAction: () => toggleUnread(item.id),
            }}
            trailing={[
              { label: 'Done', icon: <Check />, tone: 'success', dismiss: true, onAction: () => remove(item.id) },
              { label: 'Delete', icon: <Trash />, tone: 'failure', dismiss: true, onAction: () => remove(item.id) },
            ]}
          >
            {row}
          </SwipableRow>
        )}
        empty={{
          tone: 'accent',
          title: 'All done',
          description: 'Nothing left in your inbox.',
          action: (
            <Button variant="outlined" size="md" onClick={() => setItems(INBOX)}>
              Start over
            </Button>
          ),
        }}
      />
    </div>
  );
}

/**
 * The list on a phone: 56px full-bleed rows, the icon on a round tile, the
 * secondary line under the title and a hairline from the text edge. Nothing
 * hides behind hover. A row swipes instead: left reveals Done and Delete,
 * right toggles unread.
 */
const meta = {
  title: 'Lists/Phone inbox',
  parameters: { layout: 'fullscreen' },
  ...PHONE,
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Swipe a row left and let go past half the actions to keep them open; swipe
 * past half the row and Done fires: the row slides out and collapses. Swipe
 * right past a third to toggle unread. A short drag springs back. Long press
 * a row to start selecting.
 */
export const SwipeActions: Story = {
  render: () => <Inbox />,
};

/** While a selection is under way every checkbox shows, a tap toggles a row, and the bar holds the bulk action. */
export const Selecting: Story = {
  render: () => <Inbox initialSelected={['sync', 'plan']} />,
};
