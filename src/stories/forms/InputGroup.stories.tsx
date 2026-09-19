import { ArrowRight, CheckCircle, Envelope, MagnifyingGlass, X } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef, useState } from 'react';
import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import { InputGroup } from '@/components/InputGroup';

/**
 * An Input with addons in one frame: an icon, a unit or a small button at
 * either end. The frame owns the border and the focus ring.
 *
 * **Do**
 * - Keep addons short: one icon, one unit, one action.
 * - Use a Button at `icon-sm` with `aria-label` for an action.
 * - Wrap it in a Field for a label and an error.
 */
const meta = {
  title: 'Forms/InputGroup',
  component: InputGroup,
  args: { size: 'md', placeholder: 'Search documents' },
  argTypes: { size: { control: 'select', options: ['sm', 'md'] } },
  decorators: [(Story) => <div className="max-w-sm">{Story()}</div>],
} satisfies Meta<typeof InputGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A search icon before, a clear button after. Clearing puts focus back in the input. */
export const SearchAndClear: Story = {
  name: 'Search and clear',
  render: function Render(args) {
    const [query, setQuery] = useState('Quarterly plan');
    const input = useRef<HTMLInputElement>(null);
    return (
      <InputGroup
        {...args}
        ref={input}
        type="search"
        value={query}
        onValueChange={setQuery}
        aria-label="Search documents"
        start={<MagnifyingGlass />}
        end={
          query && (
            <Button
              size="icon-sm"
              aria-label="Clear"
              className="-me-1.5"
              onClick={() => {
                setQuery('');
                input.current?.focus();
              }}
            >
              <X />
            </Button>
          )
        }
      />
    );
  },
};

/** Text, icon and button addons. */
export const AddonsAndActions: Story = {
  name: 'Addons and actions',
  render: () => (
    <div className="flex flex-col gap-3">
      <InputGroup
        type="email"
        defaultValue="team@example.com"
        aria-label="Team email"
        start={<Envelope />}
        end={<CheckCircle className="text-success" />}
      />
      <InputGroup
        placeholder="example.com"
        aria-label="Website"
        start="https://"
        end={
          <Button size="icon-sm" aria-label="Open website" className="-me-1.5">
            <ArrowRight />
          </Button>
        }
      />
      <InputGroup size="sm" placeholder="0" aria-label="Budget" start="$" end="per month" />
    </div>
  ),
};

/** Inside a Field, the frame takes the invalid hairline and the error pins beside it. */
export const InAField: Story = {
  name: 'In a field',
  render: () => (
    <Field label="Website" invalid error="Enter a domain, such as example.com.">
      <InputGroup start="https://" defaultValue="example" />
    </Field>
  ),
};
