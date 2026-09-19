import { CaretRight, Copy, DotsThree, Funnel, Link, PencilSimple, Trash } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Dropdown } from '@/components/Dropdown';

/**
 * The menu surface. `Dropdown.Content` paints `glass` on `bg-menu-glass` at
 * depth 2, radius `xl`, with the 120ms `menu-open` animation. Each
 * `Dropdown.Group` sits on `bg-menu`, and the content's hairline gap draws
 * the rule between groups, so a menu needs no separators.
 *
 * Rows are `rounded-lg` with a `bg-ink/5` highlight. Text size comes from
 * the content (`text-sm`), so a `text-*` class on the content resizes the
 * whole menu. Ctrl+J/K/H/L move through the items like the arrows.
 */
const meta = {
  title: 'Menus/Dropdown',
  component: Dropdown,
  parameters: { docs: { story: { inline: false, iframeHeight: 360 } } },
} satisfies Meta<typeof Dropdown>;

export default meta;
type Story = StoryObj;

/** A row menu: actions grouped by kind, the destructive one last. */
export const Default: Story = {
  render: () => (
    <Dropdown>
      <Dropdown.Trigger variant="ghost" size="icon-sm" label="More actions">
        <DotsThree />
      </Dropdown.Trigger>
      <Dropdown.Content className="min-w-48">
        <Dropdown.Group>
          <Dropdown.Item>
            <PencilSimple className="size-3.5 text-ink-muted" />
            Rename
          </Dropdown.Item>
          <Dropdown.Item>
            <Copy className="size-3.5 text-ink-muted" />
            Duplicate
          </Dropdown.Item>
          <Dropdown.Item>
            <Link className="size-3.5 text-ink-muted" />
            Copy link
          </Dropdown.Item>
        </Dropdown.Group>
        <Dropdown.Group>
          <Dropdown.Item className="text-failure-ink">
            <Trash className="size-3.5" />
            Delete
          </Dropdown.Item>
        </Dropdown.Group>
      </Dropdown.Content>
    </Dropdown>
  ),
};

const COLUMNS = ['Name', 'Owner', 'Updated', 'Size'];

function ColumnsMenu() {
  const [shown, setShown] = useState(new Set(['Name', 'Updated']));
  const toggle = (column: string, checked: boolean) => {
    const next = new Set(shown);
    if (checked) next.add(column);
    else next.delete(column);
    setShown(next);
  };
  return (
    <Dropdown>
      <Dropdown.Trigger>
        <Funnel />
        Columns
      </Dropdown.Trigger>
      <Dropdown.Content className="min-w-48">
        <Dropdown.Group>
          <Dropdown.GroupLabel>List columns</Dropdown.GroupLabel>
          {COLUMNS.map((column) => (
            <Dropdown.CheckboxItem
              key={column}
              checked={shown.has(column)}
              onChange={(checked) => toggle(column, checked)}
              closeOnSelect={false}
            >
              {column}
            </Dropdown.CheckboxItem>
          ))}
        </Dropdown.Group>
      </Dropdown.Content>
    </Dropdown>
  );
}

/** Checkbox rows keep the menu open, so a person can toggle several. */
export const Checkboxes: Story = {
  render: () => <ColumnsMenu />,
};

function SortMenu() {
  const [sort, setSort] = useState('Updated');
  return (
    <Dropdown>
      <Dropdown.Trigger>Sort: {sort}</Dropdown.Trigger>
      <Dropdown.Content className="min-w-48">
        <Dropdown.Group>
          <Dropdown.GroupLabel>Sort by</Dropdown.GroupLabel>
          <Dropdown.RadioGroup value={sort} onChange={setSort}>
            {['Name', 'Updated', 'Created'].map((option) => (
              <Dropdown.RadioItem key={option} value={option} className="justify-between">
                {option}
                <Dropdown.ItemIndicator className="text-accent">•</Dropdown.ItemIndicator>
              </Dropdown.RadioItem>
            ))}
          </Dropdown.RadioGroup>
        </Dropdown.Group>
      </Dropdown.Content>
    </Dropdown>
  );
}

/** A radio group picks one value. `ItemIndicator` marks the chosen row. */
export const Radio: Story = {
  render: () => <SortMenu />,
};

/** A submenu opens beside its row, on the same glass surface. */
export const Submenu: Story = {
  render: () => (
    <Dropdown>
      <Dropdown.Trigger>Move</Dropdown.Trigger>
      <Dropdown.Content className="min-w-48">
        <Dropdown.Group>
          <Dropdown.Item>Pin to sidebar</Dropdown.Item>
          <Dropdown.Sub>
            <Dropdown.SubTrigger>
              <span className="flex-1">Move to project</span>
              <CaretRight className="size-3 text-ink-muted" />
            </Dropdown.SubTrigger>
            <Dropdown.SubContent className="min-w-40">
              <Dropdown.Group>
                {['Roadmap', 'Hiring', 'Launch'].map((project) => (
                  <Dropdown.Item key={project}>{project}</Dropdown.Item>
                ))}
              </Dropdown.Group>
            </Dropdown.SubContent>
          </Dropdown.Sub>
          <Dropdown.Item disabled>Archive</Dropdown.Item>
        </Dropdown.Group>
      </Dropdown.Content>
    </Dropdown>
  ),
};
