import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { TextField } from '@/components/TextField';

/**
 * An accessible, slot-based text input and textarea. Base UI connects labels,
 * descriptions, and errors while the controls use the app's layer-aware
 * tokens. The error message is a pinned danger `Callout`.
 *
 * **Do**
 * - Put `TextField.Label`, the control, and any description or error inside
 *   the same root so Base UI wires their accessible relationships.
 * - Set `validationState="invalid"` on the root; `TextField.Input` and
 *   `TextField.TextArea` receive `aria-invalid` automatically.
 * - Use `TextField.TextArea autoResize` for growing multiline input.
 *
 * **Don't**
 * - Add manual `id`, `for`, or `aria-describedby` attributes when the slots
 *   share a root.
 * - Use TextField for search with suggestions or fixed-choice values; use the
 *   appropriate combobox or Select primitive.
 */
const meta = {
  title: 'Forms/TextField',
  component: TextField,
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The root owns value state and automatically connects the label and
 * description to the input.
 */
export const Basic: Story = {
  render: function Render() {
    const [value, setValue] = useState('');
    return (
      <TextField className="w-full max-w-sm" value={value} onChange={setValue} required>
        <TextField.Label>Project name</TextField.Label>
        <TextField.Input placeholder="Quarterly planning" />
        <TextField.Description>A short name teammates will recognize.</TextField.Description>
      </TextField>
    );
  },
};

/**
 * `TextField.TextArea` shares the same root API. `autoResize` grows it with
 * its content.
 */
export const Textarea: Story = {
  render: () => (
    <TextField className="w-full max-w-sm" defaultValue="">
      <TextField.Label>Notes</TextField.Label>
      <TextField.TextArea autoResize placeholder="Add context for your teammates…" />
      <TextField.Description>This field grows as you type.</TextField.Description>
    </TextField>
  ),
};

/**
 * Root state flows to every slot. Invalid controls receive `aria-invalid`,
 * and the error message is included in `aria-describedby`. The message is a
 * danger `Callout` pinned beside the input: right when there is room, else
 * under the field.
 */
export const DisabledAndInvalid: Story = {
  name: 'Disabled and invalid',
  render: () => (
    <div className="flex w-full max-w-sm flex-col gap-5">
      <TextField disabled defaultValue="you@example.com">
        <TextField.Label>Account email</TextField.Label>
        <TextField.Input type="email" />
        <TextField.Description>Managed by your workspace administrator.</TextField.Description>
      </TextField>

      <TextField validationState="invalid" defaultValue="acme">
        <TextField.Label>Workspace URL</TextField.Label>
        <TextField.Input />
        <TextField.ErrorMessage>Enter the full workspace URL.</TextField.ErrorMessage>
      </TextField>
    </div>
  ),
};
