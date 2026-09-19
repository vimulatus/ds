import { DotsThree, FileText, Folder, Image } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '@/components/Button';
import { Item } from '@/components/Item';

/**
 * A content row shared by lists and rich cards. Compose Media or Icon,
 * Content (Title, Description, Metadata) and Actions in reading order; every
 * part is optional. Titles wrap rather than truncate. The root is not a
 * click target: put links or Buttons in the parts.
 */
const meta = {
  title: 'Primitives/Item',
  component: Item,
  args: { variant: 'outlined', size: 'md' },
  argTypes: {
    variant: { control: 'select', options: ['ghost', 'outlined', 'filled'] },
    size: { control: 'select', options: ['sm', 'md'] },
    depth: { control: 'select', options: [0, 1, 2, 3, 4] },
  },
  render: (args) => (
    <Item {...args} className="max-w-96">
      <Item.Media className="text-write">
        <FileText />
      </Item.Media>
      <Item.Content>
        <Item.Title>Spring launch brief</Item.Title>
        <Item.Description>The plan, the owners and the dates for the spring release.</Item.Description>
        <Item.Metadata>
          <span>Edited 2h ago</span>
          <span>4 comments</span>
        </Item.Metadata>
      </Item.Content>
      <Item.Actions>
        <Button size="icon-sm" label="More">
          <DotsThree />
        </Button>
      </Item.Actions>
    </Item>
  ),
} satisfies Meta<typeof Item>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** `ghost` has no frame, `outlined` a muted edge, `filled` the layer surface. */
export const Variants: Story = {
  render: () => (
    <div className="flex max-w-96 flex-col gap-2">
      {(['ghost', 'outlined', 'filled'] as const).map((variant) => (
        <Item key={variant} variant={variant} depth={1}>
          <Item.Media>
            <Folder />
          </Item.Media>
          <Item.Content>
            <Item.Title>{variant}</Item.Title>
            <Item.Description>Same parts, a different frame.</Item.Description>
          </Item.Content>
        </Item>
      ))}
    </div>
  ),
};

/** `sm` rows with a plain Icon aligned to the first title line. */
export const Compact: Story = {
  render: () => (
    <div className="flex max-w-80 flex-col">
      <Item size="sm">
        <Item.Icon>
          <FileText />
        </Item.Icon>
        <Item.Content>
          <Item.Title>Spring launch brief</Item.Title>
        </Item.Content>
      </Item>
      <Item size="sm">
        <Item.Icon className="text-pink">
          <Image />
        </Item.Icon>
        <Item.Content>
          <Item.Title>hero-shot.png</Item.Title>
          <Item.Metadata>2.4 MB</Item.Metadata>
        </Item.Content>
      </Item>
    </div>
  ),
};
