import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { ToggleSwitch } from '@/components/ToggleSwitch';

/**
 * An on/off switch for a setting that applies immediately. If the change
 * needs a save step, use a Checkbox instead.
 *
 * **Do**
 * - Use a switch only when the change takes effect immediately.
 * - Label the setting in its on-state ("Read receipts", not "Disable read
 *   receipts").
 * - Use `size="md"` in settings and `size="sm"` in toolbars.
 *
 * **Don't**
 * - Put a switch in a form that has a Save button — use a Checkbox.
 * - Pair a switch with an on/off text label; the control already says it.
 */
const meta = {
  title: 'Forms/ToggleSwitch',
  component: ToggleSwitch,
} satisfies Meta<typeof ToggleSwitch>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Controlled via `checked` and `onChange`, or uncontrolled via
 * `defaultChecked`. The whole component — including the gap between control
 * and label — is one hit target.
 */
export const Basic: Story = {
  render: function Render() {
    const [enabled, setEnabled] = useState(true);
    return (
      <div className="flex flex-col gap-3">
        <ToggleSwitch
          checked={enabled}
          onChange={setEnabled}
          label="Desktop notifications"
          labelClass="text-sm text-ink"
        />
        <span className="text-xs text-ink-subtle">Currently {enabled ? 'on' : 'off'}</span>
      </div>
    );
  },
};

/**
 * `md` is the default, for settings rows; `sm` is the compact toolbar size.
 */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-6">
      {(['sm', 'md'] as const).map((size) => (
        <div key={size} className="flex flex-col items-start gap-1.5">
          <span className="font-mono text-xs text-ink-subtle">{size}</span>
          <ToggleSwitch size={size} defaultChecked />
        </div>
      ))}
    </div>
  ),
};

/**
 * The standard settings pattern: label and description on the left, switch
 * on the right.
 */
export const SettingsRow: Story = {
  render: () => {
    const rows = [
      {
        label: 'Read receipts',
        description: 'Let others see when you read a message.',
        on: true,
      },
      {
        label: 'Typing indicators',
        description: 'Show when you are composing.',
        on: false,
      },
    ];
    return (
      <div className="flex w-full max-w-md flex-col divide-y divide-edge-muted">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4 py-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm text-ink">{row.label}</span>
              <span className="text-xs text-ink-subtle">{row.description}</span>
            </div>
            <ToggleSwitch size="md" defaultChecked={row.on} aria-label={row.label} />
          </div>
        ))}
      </div>
    );
  },
};
