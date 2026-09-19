import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Radio, RadioGroup } from '@/components/RadioGroup';

const SCOPE = [
  { value: 'this', label: 'This event' },
  { value: 'following', label: 'This and following events' },
  { value: 'all', label: 'All events' },
];

/**
 * Picks one of a few options that all stay visible. The checked ring fills
 * with accent at once; the dot, in the color of the surface below, grows in
 * over 150ms. Hovering a row, label included, turns its ring accent.
 *
 * **Do**
 * - Name the group with `label`, or `aria-label` when the question sits
 *   elsewhere.
 * - Give every Radio a `label`.
 *
 * **Don't**
 * - Use a radio group for a short switch between views: that is Tabs.
 */
const meta = {
  title: 'Forms/RadioGroup',
  component: RadioGroup,
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Pass `value` and `onValueChange` to control it, or `defaultValue`. */
export const Basic: Story = {
  render: function Render() {
    const [value, setValue] = useState<unknown>('this');
    return (
      <RadioGroup label="Apply changes to" value={value} onValueChange={setValue}>
        {SCOPE.map((option) => (
          <Radio key={option.value} value={option.value} label={option.label} />
        ))}
      </RadioGroup>
    );
  },
};

/** `horizontal` lays the options in a row; `sm` radios fit a compact footer. */
export const Horizontal: Story = {
  render: () => (
    <RadioGroup aria-label="Apply changes to" defaultValue="this" orientation="horizontal">
      <Radio value="this" label="This event" size="sm" className="text-xs text-ink-muted" />
      <Radio value="all" label="All events" size="sm" className="text-xs text-ink-muted" />
    </RadioGroup>
  ),
};

/** `description` adds a quiet line under an option. */
export const WithDescriptions: Story = {
  name: 'With descriptions',
  render: () => (
    <RadioGroup label="Who can open this file" defaultValue="team">
      <Radio value="private" label="Only you" description="Nobody else can find it." />
      <Radio value="team" label="Your team" description="Anyone on the team can open it." />
      <Radio value="link" label="Anyone with the link" description="No sign-in needed." />
    </RadioGroup>
  ),
};

/** `disabled` on the group dims and locks every option. */
export const Disabled: Story = {
  render: () => (
    <RadioGroup label="Apply changes to" defaultValue="all" disabled>
      {SCOPE.map((option) => (
        <Radio key={option.value} value={option.value} label={option.label} />
      ))}
    </RadioGroup>
  ),
};

/** The error pins under the group, start aligned. */
export const Invalid: Story = {
  render: () => (
    <RadioGroup label="Apply changes to" invalid error="Pick where the change applies.">
      {SCOPE.map((option) => (
        <Radio key={option.value} value={option.value} label={option.label} />
      ))}
    </RadioGroup>
  ),
};
