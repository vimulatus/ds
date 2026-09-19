import { CaretDown, Check } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Select, type SelectItemNode } from '@/components/Select';

type Option = { value: string; label: string; hint?: string };

const OPTIONS: Option[] = [
  { value: 'owner', label: 'Owner', hint: 'Full access, including billing' },
  { value: 'admin', label: 'Admin', hint: 'Manage members and settings' },
  { value: 'member', label: 'Member', hint: 'Create and edit content' },
  { value: 'guest', label: 'Guest', hint: 'View shared items only' },
];

const ITEM_CLASS =
  'flex items-center justify-between gap-3 rounded-md px-2 py-1.5 text-sm outline-none data-highlighted:bg-hover';

/**
 * A Base UI select, styled for the app. It is slot-based: you supply the
 * trigger and the item renderer, while `Select.Content` handles portalling,
 * popper sizing, menu chrome, and its own layer depth.
 *
 * **Do**
 * - Let `Select.Content` own the menu chrome; pass only sizing classes to it.
 * - Include `Select.ItemIndicator` so the current selection is visible in the
 *   list.
 * - Use `portalScope="local"` when the select lives inside a dialog or other
 *   portal scope.
 *
 * **Don't**
 * - Wrap `Select.Content` in a Portal — it already portals itself.
 * - Use Select for more than roughly a dozen options; use a list with search.
 */
const meta = {
  title: 'Forms/Select',
  parameters: { docs: { story: { inline: false, iframeHeight: 260 } } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * `optionValue` and `optionTextValue` tell the select which fields identify
 * and label each option. `Select.Value` receives the selected option, so the
 * trigger renders whatever you want.
 */
export const Basic: Story = {
  render: function Render() {
    const [value, setValue] = useState<Option>(OPTIONS[2]!);
    return (
      <Select<Option>
        options={OPTIONS}
        value={value}
        onChange={(option) => option && setValue(option)}
        optionValue="value"
        optionTextValue="label"
        gutter={4}
        itemComponent={(props: { item: SelectItemNode<Option> }) => (
          <Select.Item item={props.item} className={ITEM_CLASS}>
            <Select.ItemLabel>{props.item.rawValue.label}</Select.ItemLabel>
            <Select.ItemIndicator>
              <Check className="size-3" />
            </Select.ItemIndicator>
          </Select.Item>
        )}
      >
        <Select.Trigger className="h-8 w-44 rounded-md border border-edge-muted px-2 text-sm text-ink-muted">
          <Select.Value<Option>>{(state) => state.selectedOption().label}</Select.Value>
          <CaretDown className="size-3 shrink-0 text-ink-subtle" />
        </Select.Trigger>
        <Select.Content>
          <Select.Listbox />
        </Select.Content>
      </Select>
    );
  },
};

/**
 * `itemComponent` renders arbitrary content. Keep `Select.ItemLabel` around
 * the primary text so typeahead and the accessible name still work.
 */
export const RichItems: Story = {
  render: function Render() {
    const [value, setValue] = useState<Option>(OPTIONS[1]!);
    return (
      <Select<Option>
        options={OPTIONS}
        value={value}
        onChange={(option) => option && setValue(option)}
        optionValue="value"
        optionTextValue="label"
        gutter={4}
        itemComponent={(props: { item: SelectItemNode<Option> }) => (
          <Select.Item item={props.item} className={ITEM_CLASS}>
            <span className="flex flex-col gap-0.5">
              <Select.ItemLabel>{props.item.rawValue.label}</Select.ItemLabel>
              <span className="text-xs text-ink-subtle">{props.item.rawValue.hint}</span>
            </span>
            <Select.ItemIndicator>
              <Check className="size-3" />
            </Select.ItemIndicator>
          </Select.Item>
        )}
      >
        <Select.Trigger className="h-8 w-56 rounded-md border border-edge-muted px-2 text-sm text-ink-muted">
          <Select.Value<Option>>{(state) => state.selectedOption().label}</Select.Value>
          <CaretDown className="size-3 shrink-0 text-ink-subtle" />
        </Select.Trigger>
        <Select.Content className="min-w-56">
          <Select.Listbox />
        </Select.Content>
      </Select>
    );
  },
};

/** A disabled select keeps its value visible but will not open. */
export const Disabled: Story = {
  render: () => (
    <Select<Option>
      options={OPTIONS}
      value={OPTIONS[0]}
      disabled
      optionValue="value"
      optionTextValue="label"
      itemComponent={(props: { item: SelectItemNode<Option> }) => (
        <Select.Item item={props.item} className={ITEM_CLASS}>
          <Select.ItemLabel>{props.item.rawValue.label}</Select.ItemLabel>
        </Select.Item>
      )}
    >
      <Select.Trigger className="h-8 w-44 rounded-md border border-edge-muted px-2 text-sm text-ink-disabled">
        <Select.Value<Option>>{(state) => state.selectedOption().label}</Select.Value>
        <CaretDown className="size-3 shrink-0" />
      </Select.Trigger>
      <Select.Content>
        <Select.Listbox />
      </Select.Content>
    </Select>
  ),
};
