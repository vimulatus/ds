import { Copy, DotsThree, Funnel, Link, PencilSimple, Trash } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import {
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuGroup,
  MenuItem,
  MenuLabel,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
} from '@/components/Menu';
import { PHONE } from '../phone';

/**
 * A list of actions or choices behind a trigger. The popup is glass on
 * `bg-menu-glass`, `rounded-lg`, and grows from the trigger with
 * `motion-pop`. Rows are 32px (40px in touch mode) with a `bg-hover`
 * highlight. `MenuTrigger` takes the `Button` variants and sizes, and lights
 * while its menu is open.
 */
const meta = {
  title: 'Menus/Menu',
  component: Menu,
  parameters: { docs: { story: { inline: false, iframeHeight: 360 } } },
} satisfies Meta<typeof Menu>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A row menu: actions grouped by kind, the destructive one last, behind a rule. */
export const Default: Story = {
  render: () => (
    <Menu>
      <MenuTrigger variant="ghost" size="icon-sm" label="More actions">
        <DotsThree weight="bold" />
      </MenuTrigger>
      <MenuContent>
        <MenuItem icon={<PencilSimple />} shortcut="⌘R">
          Rename
        </MenuItem>
        <MenuItem icon={<Copy />} shortcut="⌘D">
          Duplicate
        </MenuItem>
        <MenuItem icon={<Link />}>Copy link</MenuItem>
        <MenuSeparator />
        <MenuItem icon={<Trash />} destructive>
          Delete
        </MenuItem>
      </MenuContent>
    </Menu>
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
    <Menu>
      <MenuTrigger>
        <Funnel />
        Columns
      </MenuTrigger>
      <MenuContent>
        <MenuGroup>
          <MenuLabel>List columns</MenuLabel>
          {COLUMNS.map((column) => (
            <MenuCheckboxItem
              key={column}
              checked={shown.has(column)}
              onCheckedChange={(checked) => toggle(column, checked)}
            >
              {column}
            </MenuCheckboxItem>
          ))}
        </MenuGroup>
      </MenuContent>
    </Menu>
  );
}

/** Checkbox rows keep the menu open, so a person can toggle several. */
export const Checkboxes: Story = { render: () => <ColumnsMenu /> };

function SortMenu() {
  const [sort, setSort] = useState('Updated');
  return (
    <Menu>
      <MenuTrigger>Sort: {sort}</MenuTrigger>
      <MenuContent>
        <MenuRadioGroup value={sort} onValueChange={setSort}>
          <MenuLabel>Sort by</MenuLabel>
          {['Name', 'Updated', 'Created'].map((option) => (
            <MenuRadioItem key={option} value={option}>
              {option}
            </MenuRadioItem>
          ))}
        </MenuRadioGroup>
      </MenuContent>
    </Menu>
  );
}

/** A radio group picks one value; the chosen row carries an accent dot. */
export const Radio: Story = { render: () => <SortMenu /> };

/** A submenu opens beside its row, on the same glass surface. */
export const Submenu: Story = {
  render: () => (
    <Menu>
      <MenuTrigger>Move</MenuTrigger>
      <MenuContent>
        <MenuItem>Pin to sidebar</MenuItem>
        <MenuSub>
          <MenuSubTrigger>Move to project</MenuSubTrigger>
          <MenuSubContent>
            {['Roadmap', 'Hiring', 'Launch'].map((project) => (
              <MenuItem key={project}>{project}</MenuItem>
            ))}
          </MenuSubContent>
        </MenuSub>
        <MenuItem disabled>Archive</MenuItem>
      </MenuContent>
    </Menu>
  ),
};

/** In touch mode rows grow to 40px and 16px text, for a thumb. */
export const Phone: Story = {
  ...PHONE,
  render: Default.render,
};
