import { Copy, PencilSimple, Star, Trash } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ReactNode, useState } from 'react';
import { Badge } from '@/components/Badge';
import { Dropdown } from '@/components/Dropdown';
import { Hotkey } from '@/components/Hotkey';
import { TagDot } from '@/components/TagDot';
import { ENTITY, ENTITY_KINDS } from '@/patterns/EntityIcon';
import { ListEntity } from '@/patterns/ListEntity';

function Frame({ children }: { children: ReactNode }) {
  return (
    <div role="listbox" aria-label="Files" className="flex w-[44rem] max-w-full flex-col rounded-xl bg-panel p-1">
      {children}
    </div>
  );
}

const ACTIONS = (
  <>
    <Dropdown.Group>
      <Dropdown.Item>
        <Star className="size-3.5 text-ink-muted" />
        Star
      </Dropdown.Item>
      <Dropdown.Item>
        <PencilSimple className="size-3.5 text-ink-muted" />
        Rename
      </Dropdown.Item>
      <Dropdown.Item>
        <Copy className="size-3.5 text-ink-muted" />
        Duplicate
        <Hotkey shortcut="⌘D" variant="inline" className="ml-auto" />
      </Dropdown.Item>
    </Dropdown.Group>
    <Dropdown.Group>
      <Dropdown.Item className="text-failure-ink">
        <Trash className="size-3.5" />
        Delete
      </Dropdown.Item>
    </Dropdown.Group>
  </>
);

/**
 * One row of an entity list: the kind's icon in its color, a title and a
 * quieter line, then badges, people and a time.
 *
 * - **Do** give the row `onSelectedChange` to make it selectable: the unread
 *   dot turns into a checkbox on hover, and Cmd-click selects.
 * - **Do** put the row's actions in `actions`; they open from the trailing
 *   button, a right click or Shift+F10.
 * - **Don't** put a second clickable control in the title; the row is the
 *   hit target.
 */
const meta = {
  title: 'Lists/ListEntity',
  component: ListEntity,
  args: {
    kind: 'document',
    title: 'Spring launch plan',
    secondary: 'Launch / Planning',
    time: '2h',
    unread: false,
    active: false,
    selected: false,
    density: 'sm',
  },
  argTypes: {
    kind: { control: 'select', options: ENTITY_KINDS },
    density: { control: 'inline-radio', options: ['sm', 'md'] },
  },
  render: function Render(args) {
    const [selected, setSelected] = useState(args.selected);
    return (
      <Frame>
        <ListEntity {...args} selected={selected} onSelectedChange={setSelected} actions={ACTIONS} />
      </Frame>
    );
  },
} satisfies Meta<typeof ListEntity>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/**
 * Hover lifts a row to `bg-hover` and shows its checkbox and actions.
 * `active` is the open row; `selected` takes the accent tint, a shade deeper
 * when the row is also active. An unread row is medium weight with a dot.
 */
export const States: Story = {
  render: function Render() {
    const [selected, setSelected] = useState(new Set(['selected', 'both']));
    const bind = (id: string) => ({
      selected: selected.has(id),
      onSelectedChange: (on: boolean) =>
        setSelected((prev) => {
          const next = new Set(prev);
          if (on) next.add(id);
          else next.delete(id);
          return next;
        }),
      actions: ACTIONS,
    });
    return (
      <Frame>
        <ListEntity kind="document" title="Default, hover me" time="2h" {...bind('default')} />
        <ListEntity kind="document" title="Unread" time="5m" unread {...bind('unread')} />
        <ListEntity kind="document" title="Active" time="1d" active {...bind('active')} />
        <ListEntity kind="document" title="Selected" time="1d" {...bind('selected')} />
        <ListEntity kind="document" title="Selected and active" time="3d" active {...bind('both')} />
        <ListEntity kind="document" title="Read only: no checkbox, no menu" time="Sep 4" />
      </Frame>
    );
  },
};

/** Every kind a list holds, each in its own color. A plain file stays neutral. */
export const Kinds: Story = {
  render: () => (
    <Frame>
      {ENTITY_KINDS.map((kind) => (
        <ListEntity key={kind} kind={kind} title={ENTITY[kind].name} secondary={kind} time="Sep 4" />
      ))}
    </Frame>
  ),
};

/**
 * `sm` is one 32px line with the secondary text inline; `md` stacks it under
 * the title for a roomier list.
 */
export const Densities: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {(['sm', 'md'] as const).map((density) => (
        <Frame key={density}>
          <ListEntity density={density} kind="pdf" title="Venue contract.pdf" secondary="2.4 MB, shared by Omar" time="1h" />
          <ListEntity density={density} kind="task" title="Draft the pricing FAQ" secondary="Due Friday" time="14m" unread />
        </Frame>
      ))}
    </div>
  ),
};

/** Trailing meta: badges and tag dots, then the people on it, then the time. */
export const WithMeta: Story = {
  render: () => (
    <Frame>
      <ListEntity
        kind="document"
        title="Spring launch plan"
        secondary="Launch / Planning"
        badges={<span className="inline-flex min-w-0 items-center gap-2 text-xs text-ink-muted"><TagDot fill="var(--color-blue)" size="sm" />Launch</span>}
        people={[{ name: 'Nina Park' }, { name: 'Omar Haddad' }]}
        time="2h"
      />
      <ListEntity
        kind="task"
        title="Draft the pricing FAQ"
        secondary="Due Friday"
        badges={<Badge size="sm">In progress</Badge>}
        people={[{ name: 'Lena Novak' }]}
        time="Yesterday"
        unread
      />
      <ListEntity
        kind="call"
        title="Weekly launch sync"
        secondary="32 min"
        badges={<Badge size="sm" className="border-transparent bg-green-bg text-green-ink">Recorded</Badge>}
        people={[{ name: 'Nina Park' }, { name: 'Omar Haddad' }, { name: 'Lena Novak' }, { name: 'Jonas Berg' }]}
        time="Tue"
      />
    </Frame>
  ),
};
