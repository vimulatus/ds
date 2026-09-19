import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Checkbox, InlineCheckbox, SingleSelectCheck } from '@/components/Checkbox';

/**
 * A Base UI checkbox with the app's control styling. Composed from slots, so
 * the label, description, and error message are yours to place.
 *
 * **Do**
 * - Always render a `Checkbox.Label`, even when the visible text sits
 *   elsewhere.
 * - Use `indeterminate` on a select-all that only covers part of its group.
 * - Use `InlineCheckbox` when the whole row is already clickable.
 *
 * **Don't**
 * - Use a checkbox for an immediate action — that is a ToggleSwitch or a
 *   Button.
 * - Add `Checkbox.Input` yourself; `Checkbox.Control` already renders one.
 */
const meta = {
  title: 'Forms/Checkbox',
  component: Checkbox,
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Pass `checked` and `onChange` for a controlled checkbox, or
 * `defaultChecked` to let it manage itself. `Checkbox.Control` renders the
 * hidden input as well as the box.
 */
export const Basic: Story = {
  render: function Render() {
    const [checked, setChecked] = useState(true);
    return (
      <div className="flex flex-col gap-3">
        <Checkbox checked={checked} onChange={setChecked}>
          <Checkbox.Control />
          <Checkbox.Label className="text-sm text-ink">Notify me about replies</Checkbox.Label>
        </Checkbox>
        <Checkbox defaultChecked={false}>
          <Checkbox.Control />
          <Checkbox.Label className="text-sm text-ink">Unchecked</Checkbox.Label>
        </Checkbox>
      </div>
    );
  },
};

/**
 * `indeterminate` shows a dash instead of a check — use it for a parent whose
 * children are partially selected.
 */
export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Checkbox indeterminate>
        <Checkbox.Control />
        <Checkbox.Label className="text-sm text-ink">Indeterminate</Checkbox.Label>
      </Checkbox>
      <Checkbox disabled defaultChecked>
        <Checkbox.Control />
        <Checkbox.Label className="text-sm text-ink-disabled">Disabled, checked</Checkbox.Label>
      </Checkbox>
      <Checkbox disabled>
        <Checkbox.Control />
        <Checkbox.Label className="text-sm text-ink-disabled">Disabled</Checkbox.Label>
      </Checkbox>
    </div>
  ),
};

/**
 * Two visual-only helpers for rows that are themselves the hit target:
 * `SingleSelectCheck` for pick-one menus, `InlineCheckbox` for multi-select
 * lists. Neither handles input — the row does.
 */
export const ListAffordances: Story = {
  render: function Render() {
    const [selected, setSelected] = useState('Inbox');
    const rows = ['Inbox', 'Drafts', 'Sent'];
    return (
      <div className="flex w-full max-w-sm flex-col gap-4">
        <div className="flex flex-col">
          <span className="mb-1 font-mono text-xs text-ink-subtle">SingleSelectCheck</span>
          {rows.map((row) => (
            <button
              key={row}
              type="button"
              className="flex items-center justify-between rounded-sm px-2 py-1.5 text-sm text-ink hover:bg-hover"
              onClick={() => setSelected(row)}
            >
              {row}
              <SingleSelectCheck active={selected === row} />
            </button>
          ))}
        </div>

        <div className="flex flex-col">
          <span className="mb-1 font-mono text-xs text-ink-subtle">InlineCheckbox</span>
          {rows.map((row) => (
            <div key={row} className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-ink">
              <InlineCheckbox checked={row !== 'Sent'} />
              {row}
            </div>
          ))}
        </div>
      </div>
    );
  },
};
