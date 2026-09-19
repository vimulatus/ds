import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Switch } from '@/components/Switch';
import { PHONE } from '../phone';

/**
 * Turns a setting on or off, and the change applies at once. If the change
 * waits for a Save button, use a Checkbox.
 *
 * **Do**
 * - Name the setting in its on state: "Read receipts", not "Disable read
 *   receipts".
 * - Use `md` in settings and `sm` in toolbars.
 *
 * **Don't**
 * - Put a switch in a form with a Save button.
 * - Add "On" and "Off" text: the control already says it.
 */
const meta = {
  title: 'Forms/Switch',
  component: Switch,
  args: { label: 'Desktop notifications', size: 'md' },
  argTypes: { size: { control: 'select', options: ['sm', 'md'] } },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Pass `checked` and `onCheckedChange` to control it, or `defaultChecked`. The label is part of the hit target. */
export const Basic: Story = {
  render: function Render(args) {
    const [on, setOn] = useState(true);
    return <Switch {...args} checked={on} onCheckedChange={setOn} />;
  },
};

/** `md` for settings rows, `sm` for toolbars. */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      {(['sm', 'md'] as const).map((size) => (
        <div key={size} className="flex flex-col items-start gap-1.5">
          <span className="font-mono text-xs text-ink-subtle">{size}</span>
          <Switch size={size} defaultChecked aria-label={`Example ${size}`} />
        </div>
      ))}
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Switch label="Read receipts" disabled defaultChecked />
      <Switch label="Typing indicators" disabled />
    </div>
  ),
};

const ROWS = [
  { label: 'Read receipts', description: 'Let others see when you read a message.', on: true },
  { label: 'Typing indicators', description: 'Show when you are writing a reply.', on: false },
];

/** The settings row: the name and a description on the left, the switch on the right. */
export const SettingsRow: Story = {
  name: 'Settings row',
  render: () => (
    <div className="flex max-w-md flex-col divide-y divide-edge-muted">
      {ROWS.map((row) => (
        <label key={row.label} className="flex items-center justify-between gap-4 py-3">
          <span className="flex flex-col gap-0.5">
            <span className="text-sm text-ink">{row.label}</span>
            <span className="text-xs text-ink-subtle">{row.description}</span>
          </span>
          <Switch defaultChecked={row.on} />
        </label>
      ))}
    </div>
  ),
};

/** On a phone the track grows to 44 by 24px. */
export const Phone: Story = {
  ...PHONE,
  render: () => (
    <div className="flex flex-col gap-4">
      <Switch label="Read receipts" defaultChecked />
      <Switch label="Typing indicators" />
    </div>
  ),
};
