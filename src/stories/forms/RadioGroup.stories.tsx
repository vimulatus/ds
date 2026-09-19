import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { RadioGroup } from '@/components/RadioGroup';

const SCOPE_OPTIONS = [
  { value: 'this_event', label: 'This event' },
  { value: 'this_and_following', label: 'This and following events' },
  { value: 'all', label: 'All events' },
];

/**
 * A Base UI radio group with the app's control styling. Composed from slots,
 * so the item label, description, and error message are yours to place.
 *
 * **Do**
 * - Give the group an `aria-label` (or a `RadioGroup.Label`) describing the
 *   choice.
 * - Render a `RadioGroup.ItemLabel` for every item, even when the visible text
 *   sits elsewhere.
 *
 * **Don't**
 * - Add `RadioGroup.ItemInput` yourself; `RadioGroup.ItemControl` already
 *   renders one.
 * - Use a radio group for a short inline switch between views; that is Tabs.
 */
const meta = {
  title: 'Forms/RadioGroup',
  component: RadioGroup,
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Pass `value` and `onChange` for a controlled group, or `defaultValue` to
 * let it manage itself. `RadioGroup.ItemControl` renders the hidden input as
 * well as the dot. The checked ring fills with accent at once; the dot, in
 * the color of the surface below, grows in over 150ms.
 */
export const Basic: Story = {
  render: function Render() {
    const [value, setValue] = useState('this_event');
    return (
      <RadioGroup
        value={value}
        onChange={setValue}
        aria-label="Apply changes to"
        className="text-sm text-ink"
      >
        {SCOPE_OPTIONS.map((option) => (
          <RadioGroup.Item key={option.value} value={option.value}>
            <RadioGroup.ItemControl />
            <RadioGroup.ItemLabel>{option.label}</RadioGroup.ItemLabel>
          </RadioGroup.Item>
        ))}
      </RadioGroup>
    );
  },
};

/**
 * The root defaults to a vertical stack; override with `flex-row` and a
 * smaller `ItemControl` for a compact inline selector, e.g. a form footer.
 */
export const Horizontal: Story = {
  render: () => (
    <RadioGroup
      defaultValue="this_event"
      aria-label="Apply changes to"
      className="flex-row items-center gap-3 text-xs text-ink-muted"
    >
      <RadioGroup.Item value="this_event" className="gap-1.5">
        <RadioGroup.ItemControl className="size-3.5" />
        <RadioGroup.ItemLabel>This event</RadioGroup.ItemLabel>
      </RadioGroup.Item>
      <RadioGroup.Item value="all" className="gap-1.5">
        <RadioGroup.ItemControl className="size-3.5" />
        <RadioGroup.ItemLabel>All events</RadioGroup.ItemLabel>
      </RadioGroup.Item>
    </RadioGroup>
  ),
};

/** `disabled` on the root dims and locks every item. */
export const Disabled: Story = {
  render: () => (
    <RadioGroup
      defaultValue="all"
      disabled
      aria-label="Apply changes to"
      className="text-sm text-ink-disabled"
    >
      {SCOPE_OPTIONS.map((option) => (
        <RadioGroup.Item key={option.value} value={option.value}>
          <RadioGroup.ItemControl />
          <RadioGroup.ItemLabel>{option.label}</RadioGroup.ItemLabel>
        </RadioGroup.Item>
      ))}
    </RadioGroup>
  ),
};

// Literal class strings only: Tailwind's scanner cannot see built ones.
const HALO =
  'not-touch:group-hover/radio-item:not-data-disabled:shadow-[0_0_0_4px_color-mix(in_oklch,var(--color-accent)_18%,transparent),0_0_12px_color-mix(in_oklch,var(--color-accent)_40%,transparent)] not-touch:group-hover/radio-item:not-data-disabled:not-data-checked:bg-accent/15';

const HOVER_PROTOTYPES = [
  {
    name: 'Ring',
    note: 'The default. The outer ring takes the accent.',
    className: '',
  },
  {
    name: 'Halo',
    note: 'An accent tint and a soft accent glow. The ring stays gray.',
    className: `not-touch:group-hover/radio-item:not-data-disabled:not-data-checked:border-edge ${HALO}`,
  },
  {
    name: 'Ring and halo',
    note: 'Both at once.',
    className: HALO,
  },
];

/**
 * Hover prototypes, side by side. Hover a row, label included, to compare.
 * Touch devices get no hover.
 */
export const HoverPrototypes: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
      {HOVER_PROTOTYPES.map((prototype) => (
        <div key={prototype.name} className="flex flex-col gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-ink">{prototype.name}</span>
            <span className="text-xs text-ink-subtle">{prototype.note}</span>
          </div>
          <RadioGroup
            defaultValue="this_event"
            aria-label={`Apply changes to (${prototype.name})`}
            className="text-sm text-ink"
          >
            {SCOPE_OPTIONS.map((option) => (
              <RadioGroup.Item key={option.value} value={option.value}>
                <RadioGroup.ItemControl className={prototype.className} />
                <RadioGroup.ItemLabel>{option.label}</RadioGroup.ItemLabel>
              </RadioGroup.Item>
            ))}
          </RadioGroup>
        </div>
      ))}
    </div>
  ),
};
