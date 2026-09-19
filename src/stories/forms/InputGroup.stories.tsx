import { ArrowRight, CheckCircle, Envelope, MagnifyingGlass } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from '@/components/Button';
import { ButtonGroup } from '@/components/ButtonGroup';
import { InputGroup } from '@/components/InputGroup';

/**
 * Composes an Input with decorative addons, standard Buttons, and a reactive
 * clear action inside one shared frame.
 *
 * **Do**
 * - Put exactly one `InputGroup.Input` inside the root.
 * - Put icons and actions in `InputGroup.Addon` and set their visual edge with
 *   `align`; DOM order does not determine placement.
 * - Use `InputGroup.ClearButton` for the standard reactive clear action.
 * - Nest the root in `ButtonGroup` when it must share a frame with sibling
 *   Buttons; size and framing are inherited by the group, not the input.
 */
const meta = {
  title: 'Forms/InputGroup',
  component: InputGroup,
} satisfies Meta<typeof InputGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The clear slot follows the input value, dispatches the normal input event,
 * and restores focus without a tooltip.
 */
export const SearchAndClear: Story = {
  name: 'Search and clear',
  render: function Render() {
    const [query, setQuery] = useState('Quarterly plan');
    return (
      <InputGroup className="max-w-sm">
        <InputGroup.Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
          placeholder="Search documents"
          aria-label="Search documents"
        />
        <InputGroup.Addon align="inline-start">
          <MagnifyingGlass aria-hidden="true" />
        </InputGroup.Addon>
        <InputGroup.Addon align="inline-end">
          <InputGroup.ClearButton />
        </InputGroup.Addon>
      </InputGroup>
    );
  },
};

/**
 * Addon alignment controls visual placement independently of DOM order. Use
 * `InputGroup.Button` for an interactive action.
 */
export const AddonsAndActions: Story = {
  name: 'Addons and actions',
  render: () => (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <InputGroup>
        <InputGroup.Input type="email" defaultValue="team@example.com" aria-label="Team email" />
        <InputGroup.Addon align="inline-start">
          <Envelope aria-hidden="true" />
        </InputGroup.Addon>
        <InputGroup.Addon align="inline-end">
          <CheckCircle className="text-success" aria-hidden="true" />
        </InputGroup.Addon>
      </InputGroup>

      <InputGroup>
        <InputGroup.Addon align="inline-start">https://</InputGroup.Addon>
        <InputGroup.Input placeholder="example.com" aria-label="Website" />
        <InputGroup.Addon align="inline-end">
          <InputGroup.Button aria-label="Open website" square>
            <ArrowRight />
          </InputGroup.Button>
        </InputGroup.Addon>
      </InputGroup>
    </div>
  ),
};

/**
 * When nested in ButtonGroup, InputGroup inherits its size and lets the outer
 * group own the shared frame.
 */
export const ButtonGroupComposition: Story = {
  name: 'Button group composition',
  render: () => (
    <ButtonGroup variant="outlined" size="md" className="w-full max-w-sm" aria-label="Search documents">
      <InputGroup>
        <InputGroup.Input placeholder="Search documents" aria-label="Search query" />
        <InputGroup.Addon align="inline-start">
          <MagnifyingGlass aria-hidden="true" />
        </InputGroup.Addon>
      </InputGroup>
      <ButtonGroup.Divider />
      <Button aria-label="Submit search" square>
        <ArrowRight />
      </Button>
    </ButtonGroup>
  ),
};
