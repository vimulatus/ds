import { FolderSimple, PencilSimple, Star, Trash } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ComponentProps, type ReactNode, useState } from 'react';
import { Button } from '@/components/Button';
import { MenuItem, MenuSeparator } from '@/components/Menu';
import { Toolbar } from '@/components/Toolbar';
import { EntityList } from '@/patterns/EntityList';
import { ROWS } from './sample';

function Column({ children }: { children: ReactNode }) {
  return <div className="flex h-[32rem] w-[44rem] max-w-full flex-col rounded-xl bg-panel">{children}</div>;
}

const ACTIONS = (
  <>
    <MenuItem icon={<Star />}>Star</MenuItem>
    <MenuItem icon={<PencilSimple />}>Rename</MenuItem>
    <MenuItem icon={<FolderSimple />}>Move to…</MenuItem>
    <MenuSeparator />
    <MenuItem icon={<Trash />} destructive>
      Delete
    </MenuItem>
  </>
);

const BULK = (
  <>
    <Toolbar.Button label="Star">
      <Star />
    </Toolbar.Button>
    <Toolbar.Button label="Move to…">
      <FolderSimple />
    </Toolbar.Button>
    <Toolbar.Button label="Delete">
      <Trash />
    </Toolbar.Button>
  </>
);

type ListArgs = Partial<ComponentProps<typeof EntityList>>;

function Demo({ initialSelected = [], items = ROWS, ...props }: ListArgs & { initialSelected?: string[] }) {
  const [active, setActive] = useState('contract');
  const [selected, setSelected] = useState<Set<string>>(new Set(initialSelected));
  return (
    <Column>
      <EntityList
        label="Recent files"
        items={items.map((item) => ({ ...item, actions: ACTIONS }))}
        activeId={active}
        onOpen={setActive}
        selected={selected}
        onSelectedChange={setSelected}
        selectionActions={BULK}
        {...props}
      />
    </Column>
  );
}

/**
 * A list of ListEntity rows under sticky group headers. Click a row to open
 * it. Hover a row and tick its checkbox, or Cmd-click, to select; a floating
 * bar then counts the selection and holds the bulk actions.
 *
 * The list is one tab stop. Arrow keys move focus, Home and End jump, Enter
 * opens, x toggles selection, Escape clears it, and Shift+F10 opens the
 * focused row's menu.
 */
const meta = {
  title: 'Lists/EntityList',
  component: EntityList,
} satisfies Meta<typeof EntityList>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Rows grouped by day. Scroll the list: each header sticks until the next one pushes it off. */
export const Default: Story = {
  args: { label: 'Recent files', items: ROWS },
  render: () => <Demo />,
};

/** With rows selected, every checkbox shows and the bar floats over the list. */
export const WithSelection: Story = {
  args: { label: 'Recent files', items: ROWS },
  render: () => <Demo initialSelected={['faq', 'budget', 'hero']} />,
};

/** `md` density stacks each row's secondary line under its title. Without `group`, no headers. */
export const Roomy: Story = {
  args: { label: 'Recent files', items: ROWS },
  render: () => <Demo density="md" items={ROWS.map(({ group: _group, ...row }) => row)} />,
};

/** With nothing to show, the list shows an EmptyStatePanel with one way forward. */
export const Empty: Story = {
  args: { label: 'Recent files', items: [] },
  render: () => (
    <Demo
      items={[]}
      empty={{
        tone: 'neutral',
        title: 'No files yet',
        description: 'Files you create or upload show up here.',
        action: (
          <Button variant="outlined" size="sm">
            Upload a file
          </Button>
        ),
      }}
    />
  ),
};
