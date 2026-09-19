import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { TextField } from '@/components/TextField';
import { PHONE } from '../phone';

/**
 * A labelled text control. The field wires the label, the description and
 * the error to the input, so no manual `id` or `aria-describedby` is
 * needed. The error is a danger Callout pinned beside the input.
 *
 * **Do**
 * - Give every field a `label`, even a short one.
 * - Pass `invalid` and `error` together for a check the browser cannot
 *   run; `required`, `type` and `pattern` show the browser's message.
 * - Use `multiline` for text longer than a line; it grows as the user types.
 *
 * **Don't**
 * - Use a TextField for a fixed set of values: that is a Select.
 */
const meta = {
  title: 'Forms/TextField',
  component: TextField,
  args: { label: 'Project name', placeholder: 'Quarterly planning', size: 'md' },
  argTypes: { size: { control: 'select', options: ['sm', 'md'] } },
  decorators: [(Story) => <div className="max-w-sm">{Story()}</div>],
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The label sits above, the description below. */
export const Basic: Story = {
  args: { description: 'A short name teammates will recognize.', required: true },
};

/** `multiline` renders a textarea that grows with its content. */
export const Multiline: Story = {
  args: {
    label: 'Notes',
    placeholder: 'Add context for your teammates…',
    description: 'This field grows as you type.',
    multiline: true,
  },
};

/**
 * A disabled field dims its label and control. An invalid one turns the
 * hairline and ring to failure, and pins the error to the right, or under
 * the field when there is no room. The error stays in `aria-describedby`.
 */
export const DisabledAndInvalid: Story = {
  name: 'Disabled and invalid',
  render: () => (
    <div className="flex flex-col gap-5">
      <TextField
        label="Account email"
        type="email"
        disabled
        defaultValue="ana@example.com"
        description="Managed by your team admin."
      />
      <TextField
        label="Team URL"
        defaultValue="northwind"
        invalid
        error="Enter the full team URL."
      />
    </div>
  ),
};

/** Type a space and the error appears; remove it and the error goes. */
export const LiveValidation: Story = {
  name: 'Live validation',
  render: function Render() {
    const [value, setValue] = useState('launch-plan');
    return (
      <TextField
        label="Tag"
        value={value}
        onValueChange={setValue}
        invalid={/\s/.test(value)}
        error="Tags have no spaces."
        spellCheck={false}
      />
    );
  },
};

/** On a phone the control grows to 40px and 16px text, and the error drops under the field. */
export const Phone: Story = {
  ...PHONE,
  render: () => (
    <div className="flex flex-col gap-5">
      <TextField label="Project name" placeholder="Quarterly planning" />
      <TextField label="Team URL" defaultValue="northwind" invalid error="Enter the full team URL." />
    </div>
  ),
};
