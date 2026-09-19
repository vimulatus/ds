import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Select, type SelectOption } from '@/components/Select';
import { PHONE } from '../phone';

const ROLES: SelectOption[] = [
  { value: 'owner', label: 'Owner', hint: 'Full access, including billing' },
  { value: 'admin', label: 'Admin', hint: 'Manage members and settings' },
  { value: 'member', label: 'Member', hint: 'Create and edit content' },
  { value: 'guest', label: 'Guest', hint: 'View shared items only' },
];

const PLAIN = ROLES.map(({ value, label }) => ({ value, label }));

/**
 * Picks one value from a short fixed list. The trigger matches Input, so a
 * select and a text field sit on one line; the list opens under it on
 * glass and checks the current value.
 *
 * **Do**
 * - Give it a `label`, or an `aria-label` when the label sits elsewhere.
 * - Keep the list short: past a dozen options, use a searchable list.
 */
const meta = {
  title: 'Forms/Select',
  component: Select,
  args: { options: PLAIN, size: 'md' },
  argTypes: { size: { control: 'select', options: ['sm', 'md'] } },
  parameters: { docs: { story: { inline: false, iframeHeight: 280 } } },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Pass `value` and `onValueChange` to control it, or `defaultValue`. */
export const Basic: Story = {
  render: function Render(args) {
    const [value, setValue] = useState<string | null>('member');
    return (
      <Select
        {...args}
        label="Role"
        value={value}
        onValueChange={setValue}
        fieldClassName="w-44"
      />
    );
  },
};

/** An option's `hint` adds a quiet second line in the list; the trigger shows the label only. */
export const RichItems: Story = {
  name: 'Rich items',
  args: { options: ROLES },
  render: (args) => (
    <Select {...args} label="Role" defaultValue="admin" fieldClassName="w-56" />
  ),
};

/** Heights match Input: 24 and 32px. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-end gap-2">
      <Select {...args} size="sm" aria-label="Role, small" defaultValue="member" className="w-32" />
      <Select {...args} size="md" aria-label="Role" defaultValue="member" className="w-36" />
    </div>
  ),
};

/** `placeholder` shows until a value is picked. */
export const Placeholder: Story = {
  render: (args) => (
    <Select {...args} label="Role" placeholder="Pick a role" fieldClassName="w-44" />
  ),
};

/** Disabled keeps its value visible but will not open. Invalid pins its error to the right. */
export const DisabledAndInvalid: Story = {
  name: 'Disabled and invalid',
  render: (args) => (
    <div className="flex flex-col gap-5">
      <Select {...args} label="Role" defaultValue="owner" disabled fieldClassName="w-44" />
      <Select
        {...args}
        label="Role"
        placeholder="Pick a role"
        invalid
        error="Pick a role for the new member."
        fieldClassName="w-44"
      />
    </div>
  ),
};

/** On a phone the trigger and the rows grow for a thumb. */
export const Phone: Story = {
  ...PHONE,
  args: { options: ROLES },
  render: (args) => <Select {...args} label="Role" defaultValue="member" />,
};
