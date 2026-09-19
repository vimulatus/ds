import { Field } from '@base-ui/react/field';
import { Select as BaseSelect } from '@base-ui/react/select';
import { CaretDown, Check } from '@phosphor-icons/react';
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react';
import { cn } from '@/lib/cn';
import type { CalloutPlacement } from './Callout';
import { createFieldErrorMessage, FieldInvalidContext } from './FieldError';
import { type Depth, Layer } from './Layer';

/** One option as the item renderer receives it. */
export type SelectItemNode<Option> = {
  rawValue: Option;
  key: string;
  textValue: string;
  disabled: boolean;
  index: number;
};

export type SelectRootItemComponentProps<Option> = { item: SelectItemNode<Option> };

type OptionField<Option> = keyof Option | ((option: Option) => string);

type SelectContextValue = {
  nodes: SelectItemNode<unknown>[];
  itemComponent: (props: SelectRootItemComponentProps<unknown>) => ReactNode;
  placeholder?: ReactNode;
  side: 'top' | 'right' | 'bottom' | 'left';
  align: 'start' | 'center' | 'end';
  gutter: number;
};

const SelectContext = createContext<SelectContextValue | null>(null);

function useSelectContext() {
  const context = useContext(SelectContext);
  if (!context) throw new Error('Select slots must be used inside Select');
  return context;
}

export type SelectTriggerProps = Omit<ComponentProps<typeof BaseSelect.Trigger>, 'className'> & {
  className?: string;
};

function SelectTrigger({ className, ...props }: SelectTriggerProps) {
  return (
    <BaseSelect.Trigger
      data-slot="select-trigger"
      {...props}
      className={cn(
        'flex w-full items-center justify-between gap-2 text-left data-popup-open:bg-hover',
        className
      )}
    />
  );
}

export type SelectValueState<Option> = {
  selectedOption: () => Option;
  selectedOptions: () => Option[];
};

export type SelectValueProps<Option> = Omit<ComponentProps<'span'>, 'children'> & {
  children?: (state: SelectValueState<Option>) => ReactNode;
};

function SelectValue<Option>({ className, children, ...props }: SelectValueProps<Option>) {
  const { placeholder } = useSelectContext();
  return (
    <BaseSelect.Value
      {...props}
      placeholder={placeholder}
      className={cn('min-w-0 flex-1 truncate', className)}
    >
      {children
        ? (value: Option | Option[] | null) =>
            value === null || (Array.isArray(value) && value.length === 0)
              ? placeholder
              : children({
                  selectedOption: () => (Array.isArray(value) ? value[0] : value) as Option,
                  selectedOptions: () => (Array.isArray(value) ? value : [value]),
                })
        : undefined}
    </BaseSelect.Value>
  );
}

export type SelectIconProps = Omit<ComponentProps<typeof BaseSelect.Icon>, 'className'> & {
  className?: string;
};

function SelectIcon({ className, children, ...props }: SelectIconProps) {
  return (
    <BaseSelect.Icon {...props} className={cn('shrink-0 text-ink-extra-muted', className)}>
      {children ?? <CaretDown className="size-3" />}
    </BaseSelect.Icon>
  );
}

type SelectPortalScope = 'local';

export type SelectContentProps = Omit<ComponentProps<typeof BaseSelect.Popup>, 'className'> & {
  className?: string;
  depth?: Depth;
  /** The element the list portals into. */
  mount?: HTMLElement;
  /** `local` portals into the closest `.portal-scope`, such as a dialog. */
  portalScope?: SelectPortalScope;
};

function SelectContent({ className, children, depth, mount, portalScope, ...props }: SelectContentProps) {
  const { side, align, gutter } = useSelectContext();
  const [scope, setScope] = useState<HTMLElement | null>(null);
  const search = useCallback((element: HTMLDivElement | null) => {
    setScope(element?.closest<HTMLElement>('.portal-scope') ?? null);
  }, []);
  const container = mount ?? (portalScope === 'local' ? scope : null) ?? undefined;
  return (
    <>
      <div className="hidden" ref={search} />
      <BaseSelect.Portal container={container}>
        <Layer depth={depth ?? 3}>
          <BaseSelect.Positioner
            side={side}
            align={align}
            sideOffset={gutter}
            collisionPadding={8}
            alignItemWithTrigger={false}
            className="z-action-menu outline-none"
          >
            <BaseSelect.Popup
              {...props}
              className={cn(
                'z-action-menu max-h-[var(--available-height)] min-w-[var(--anchor-width)] overflow-y-auto rounded-xl border border-edge bg-menu-glass p-1.5 glass menu-open-animation',
                className
              )}
            >
              {children}
            </BaseSelect.Popup>
          </BaseSelect.Positioner>
        </Layer>
      </BaseSelect.Portal>
    </>
  );
}

export type SelectListboxProps = Omit<ComponentProps<typeof BaseSelect.List>, 'className' | 'children'> & {
  className?: string;
};

/** Renders every option through the root's `itemComponent`. */
function SelectListbox({ className, ...props }: SelectListboxProps) {
  const { nodes, itemComponent: ItemComponent } = useSelectContext();
  return (
    <BaseSelect.List {...props} className={cn('flex flex-col gap-(--app-border-width)', className)}>
      {nodes.map((node) => (
        <ItemComponent key={node.key} item={node} />
      ))}
    </BaseSelect.List>
  );
}

export type SelectItemProps<Option = unknown> = Omit<
  ComponentProps<typeof BaseSelect.Item>,
  'className' | 'value'
> & {
  className?: string;
  item: SelectItemNode<Option>;
};

function SelectItem<Option>({ className, item, ...props }: SelectItemProps<Option>) {
  return (
    <BaseSelect.Item
      value={item.rawValue}
      label={item.textValue}
      disabled={item.disabled}
      {...props}
      className={cn(
        'group flex w-full cursor-default items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-sm font-normal text-ink outline-none data-disabled:cursor-not-allowed data-disabled:opacity-50 data-highlighted:bg-hover',
        className
      )}
    />
  );
}

export type SelectItemLabelProps = Omit<ComponentProps<typeof BaseSelect.ItemText>, 'className'> & {
  className?: string;
};

function SelectItemLabel({ className, ...props }: SelectItemLabelProps) {
  return <BaseSelect.ItemText {...props} className={cn('min-w-0 flex-1 truncate', className)} />;
}

export type SelectItemIndicatorProps = Omit<ComponentProps<typeof BaseSelect.ItemIndicator>, 'className'> & {
  className?: string;
};

function SelectItemIndicator({ className, children, ...props }: SelectItemIndicatorProps) {
  return (
    <BaseSelect.ItemIndicator {...props} className={cn('shrink-0 text-accent', className)}>
      {children ?? <Check className="size-3.5" />}
    </BaseSelect.ItemIndicator>
  );
}

function SelectDescription({ className, ...props }: ComponentProps<typeof Field.Description> & { className?: string }) {
  return <Field.Description {...props} render={<div />} className={className} />;
}

export type SelectRootProps<Option> = {
  options: Option[];
  value?: Option | null;
  defaultValue?: Option | null;
  onChange?: (option: Option | null) => void;
  /** The field, or a function, that identifies an option. Missing, the option itself as a string. */
  optionValue?: OptionField<Option>;
  /** The field, or a function, that labels an option for typeahead. */
  optionTextValue?: OptionField<Option>;
  optionDisabled?: keyof Option | ((option: Option) => boolean);
  itemComponent?: (props: SelectRootItemComponentProps<Option>) => ReactNode;
  placeholder?: ReactNode;
  /** Distance from the trigger. */
  gutter?: number;
  placement?: CalloutPlacement;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  validationState?: 'valid' | 'invalid';
  className?: string;
  children?: ReactNode;
};

function read<Option>(option: Option, field: OptionField<Option> | undefined): string {
  if (field === undefined) return String(option);
  if (typeof field === 'function') return field(option);
  return String(option[field]);
}

function SelectRoot<Option>({
  options,
  value,
  defaultValue,
  onChange,
  optionValue,
  optionTextValue,
  optionDisabled,
  itemComponent,
  placeholder,
  gutter = 4,
  placement = 'bottom-start',
  open,
  defaultOpen,
  onOpenChange,
  name,
  required,
  disabled,
  readOnly,
  validationState,
  className,
  children,
}: SelectRootProps<Option>) {
  const invalid = validationState === 'invalid';
  const keyOf = (option: Option) => read(option, optionValue);
  const textOf = (option: Option) => read(option, optionTextValue ?? optionValue);
  const nodes: SelectItemNode<Option>[] = options.map((option, index) => ({
    rawValue: option,
    key: keyOf(option),
    textValue: textOf(option),
    disabled:
      optionDisabled === undefined
        ? false
        : typeof optionDisabled === 'function'
          ? optionDisabled(option)
          : Boolean(option[optionDisabled]),
    index,
  }));
  const [side, align = 'center'] = placement.split('-') as [
    SelectContextValue['side'],
    SelectContextValue['align']?,
  ];

  return (
    <FieldInvalidContext.Provider value={invalid}>
      <SelectContext.Provider
        value={{
          nodes: nodes as SelectItemNode<unknown>[],
          itemComponent: (itemComponent ?? DefaultItem) as SelectContextValue['itemComponent'],
          placeholder,
          side,
          align,
          gutter,
        }}
      >
        <Field.Root name={name} disabled={disabled} invalid={invalid || undefined} className={className}>
          <BaseSelect.Root<Option>
            value={value}
            defaultValue={defaultValue}
            onValueChange={(next) => onChange?.(next as Option | null)}
            isItemEqualToValue={(a, b) => a === b || (a != null && b != null && keyOf(a) === keyOf(b))}
            itemToStringValue={keyOf}
            itemToStringLabel={textOf}
            open={open}
            defaultOpen={defaultOpen}
            onOpenChange={(next) => onOpenChange?.(next)}
            required={required}
            disabled={disabled}
            readOnly={readOnly}
          >
            {children}
          </BaseSelect.Root>
        </Field.Root>
      </SelectContext.Provider>
    </FieldInvalidContext.Provider>
  );
}

function DefaultItem({ item }: SelectRootItemComponentProps<unknown>) {
  return (
    <SelectItem item={item}>
      <SelectItemLabel>{item.textValue}</SelectItemLabel>
      <SelectItemIndicator />
    </SelectItem>
  );
}

/** Composable, styled single-value select built on Base UI.
 *
 * @do Let `Select.Content` own the menu chrome; pass only sizing classes to
 *   it.
 * @do Include `Select.ItemIndicator` so the current selection is visible in
 *   the list.
 * @do Use `portalScope="local"` when the select lives inside a dialog or other
 *   portal scope.
 * @dont Do not wrap `Select.Content` in a Portal — it already portals itself.
 * @dont Do not use Select for more than roughly a dozen options; use a command
 *   menu with search.
 */
export const Select = Object.assign(SelectRoot, {
  Content: SelectContent,
  Icon: SelectIcon,
  Item: SelectItem,
  ItemIndicator: SelectItemIndicator,
  ItemLabel: SelectItemLabel,
  Listbox: SelectListbox,
  Trigger: SelectTrigger,
  Value: SelectValue,
  Description: SelectDescription,
  ErrorMessage: createFieldErrorMessage(Field.Error, {
    anchor: '[data-slot=select-trigger]',
  }),
  Label: BaseSelect.Label,
  Section: BaseSelect.GroupLabel,
});
