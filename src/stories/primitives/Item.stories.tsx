import { CheckSquare, FileText, Folder, Image, VideoCamera } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Hotkey } from '@/components/Hotkey';
import { Item } from '@/components/Item';
import { PHONE } from '../phone';

const ROWS = [
  { id: 'brief', icon: <FileText className="text-write" />, label: 'Spring launch brief', meta: '2 h' },
  { id: 'assets', icon: <Folder />, label: 'Launch assets', meta: '14' },
  { id: 'hero', icon: <Image className="text-pink" />, label: 'hero-shot.png', meta: 'Sep 12' },
  { id: 'demo', icon: <VideoCamera className="text-violet" />, label: 'Demo recording', meta: '4:12' },
  { id: 'qa', icon: <CheckSquare className="text-green" />, label: 'Finish QA pass', meta: 'Today' },
];

/**
 * A list row: an icon, a label, trailing meta. Hover lifts it to `bg-hover`;
 * a selected row keeps that fill and turns its ink up. Rows are 32px, 44px
 * on touch.
 */
const meta = {
  title: 'Primitives/Item',
  component: Item,
  args: { icon: <FileText />, label: 'Spring launch brief', meta: '2 h' },
} satisfies Meta<typeof Item>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <div className="w-72">
      <Item {...args} />
    </div>
  ),
};

/** Pass `selected` and the row becomes selectable; one row is selected at a time here. */
export const Selectable: Story = {
  render: () => {
    const [selected, setSelected] = useState('brief');
    return (
      <div className="flex w-72 flex-col gap-px">
        {ROWS.map((row) => (
          <Item
            key={row.id}
            icon={row.icon}
            label={row.label}
            meta={row.meta}
            selected={selected === row.id}
            onClick={() => setSelected(row.id)}
          />
        ))}
      </div>
    );
  },
};

/** A second line under the label, and a hotkey as the trailing meta. */
export const WithDescription: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-px">
      <Item icon={<FileText />} label="New document" description="A blank page" meta={<Hotkey shortcut="mod+n" />} />
      <Item icon={<Folder />} label="New folder" description="Group files together" meta={<Hotkey shortcut="mod+shift+n" />} />
    </div>
  ),
};

/** On a phone the rows grow to 44px. */
export const Phone: Story = { ...PHONE, render: Selectable.render };
