import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Checkbox, CheckboxGroup, InlineCheckbox } from '@/components/Checkbox';
import { Field } from '@/components/Field';
import { PHONE } from '../phone';

/**
 * A choice the user confirms later. The label is part of the hit target.
 *
 * **Do**
 * - Give every checkbox a `label`, or an `aria-label` when the text sits
 *   elsewhere.
 * - Use `indeterminate` on a select-all that covers part of its group.
 * - Use `InlineCheckbox` when the whole row is already the hit target.
 *
 * **Don't**
 * - Use a checkbox for an immediate action: that is a Switch or a Button.
 */
const meta = {
  title: 'Forms/Checkbox',
  component: Checkbox,
  args: { label: 'Notify me about replies', size: 'md' },
  argTypes: { size: { control: 'select', options: ['sm', 'md'] } },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Pass `checked` and `onCheckedChange` to control it, or `defaultChecked`. */
export const Basic: Story = {
  render: function Render(args) {
    const [checked, setChecked] = useState(true);
    return (
      <div className="flex flex-col gap-3">
        <Checkbox {...args} checked={checked} onCheckedChange={setChecked} />
        <Checkbox
          label="Weekly digest"
          description="A summary of the week's activity, every Monday."
        />
      </div>
    );
  },
};

/** Checked, indeterminate, disabled, and both sizes. */
export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Checkbox label="Indeterminate" indeterminate />
      <Checkbox label="Disabled, checked" disabled defaultChecked />
      <Checkbox label="Disabled" disabled />
      <Checkbox label="Small" size="sm" defaultChecked />
    </div>
  ),
};

const CHANNELS = ['email', 'push', 'sms'];

/** A parent checkbox checks the group, and turns indeterminate when only some are checked. */
export const Group: Story = {
  render: function Render() {
    const [value, setValue] = useState(['email']);
    return (
      <CheckboxGroup
        label="Notify me by"
        value={value}
        onValueChange={setValue}
        allValues={CHANNELS}
      >
        <Checkbox parent label="All channels" />
        <div className="flex flex-col gap-2 ps-6">
          <Checkbox value="email" label="Email" />
          <Checkbox value="push" label="Push" />
          <Checkbox value="sms" label="Text message" />
        </div>
      </CheckboxGroup>
    );
  },
};

/** An error pins under the control, start aligned: a checkbox has no room to its right. */
export const Invalid: Story = {
  render: () => (
    <div className="flex flex-col gap-16">
      <Field invalid error="Accept the terms to continue." errorPlacement="bottom-start">
        <Checkbox label="I accept the terms" />
      </Field>
      <CheckboxGroup label="Notify me by" invalid error="Pick at least one channel.">
        <Checkbox value="email" label="Email" />
        <Checkbox value="push" label="Push" />
      </CheckboxGroup>
    </div>
  ),
};

/** For a row that is itself the hit target. Visual only: the row handles input. */
export const ListAffordance: Story = {
  name: 'List affordance',
  render: function Render() {
    const [picked, setPicked] = useState(['Roadmap', 'Launch notes']);
    const rows = ['Roadmap', 'Launch notes', 'Budget'];
    return (
      <div className="flex max-w-xs flex-col">
        {rows.map((row) => {
          const on = picked.includes(row);
          return (
            <button
              key={row}
              type="button"
              aria-pressed={on}
              onClick={() => setPicked(on ? picked.filter((r) => r !== row) : [...picked, row])}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-ink hover:bg-hover"
            >
              <InlineCheckbox checked={on} />
              {row}
            </button>
          );
        })}
      </div>
    );
  },
};

/** On a phone the box grows to 20px. */
export const Phone: Story = {
  ...PHONE,
  render: () => (
    <div className="flex flex-col gap-4">
      <Checkbox label="Notify me about replies" defaultChecked />
      <Checkbox label="Weekly digest" />
    </div>
  ),
};
