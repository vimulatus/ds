import { Field } from '@base-ui/react/field';
import { Radio } from '@base-ui/react/radio';
import { RadioGroup as BaseRadioGroup } from '@base-ui/react/radio-group';
import {
  type ComponentProps,
  createContext,
  useContext,
  useEffect,
  useId,
  useState,
} from 'react';
import { cn } from '@/lib/cn';
import { createFieldErrorMessage, FieldInvalidContext } from './FieldError';

/*
<RadioGroup value={...} onChange={...}>
  <RadioGroup.Item value="a">
    <RadioGroup.ItemControl />
    <RadioGroup.ItemLabel>Option A</RadioGroup.ItemLabel>
  </RadioGroup.Item>
</RadioGroup>

A bare <RadioGroup.ItemControl /> renders its own dot. Base UI renders the
hidden input with it, so <RadioGroup.ItemInput /> renders nothing.
*/

export type RadioGroupProps = Omit<ComponentProps<'div'>, 'onChange' | 'defaultValue'> & {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  validationState?: 'valid' | 'invalid';
};

type ItemProps = Omit<ComponentProps<'div'>, 'className'> & {
  className?: string;
  value: string;
  disabled?: boolean;
};
type ItemControlProps = Omit<ComponentProps<typeof Radio.Root>, 'className' | 'value'> & {
  className?: string;
};
type ItemLabelProps = Omit<ComponentProps<typeof Field.Label>, 'className'> & { className?: string };

const CONTROL_CLASS = cn(
  'inline-flex items-center justify-center size-4 shrink-0 rounded-full',
  'bg-surface border-1 border-edge',
  'data-checked:border-accent data-checked:bg-accent',
  'not-touch:group-hover/radio-item:not-data-disabled:not-data-checked:border-accent',
  'data-disabled:opacity-50 data-disabled:cursor-not-allowed',
  'data-invalid:border-failure',
  // Base UI focuses the control itself; there is no peer input.
  'focus-visible:ring-2 focus-visible:ring-accent'
);

const DOT_CLASS = cn(
  'size-1/2 rounded-full bg-surface scale-0',
  'group-data-checked/radio-control:scale-100',
  'transition-transform duration-150 ease-out motion-reduce:transition-none'
);

const GroupLabelContext = createContext<{ id: string; register: (on: boolean) => void } | null>(null);
const ItemContext = createContext<{ value: string; disabled?: boolean }>({ value: '' });

function RadioGroupRoot({
  value,
  defaultValue,
  onChange,
  name,
  required,
  disabled,
  readOnly,
  validationState,
  className,
  children,
  'aria-labelledby': ariaLabelledBy,
  ...rest
}: RadioGroupProps) {
  const labelId = useId();
  const [hasLabel, setHasLabel] = useState(false);
  const invalid = validationState === 'invalid';
  return (
    <FieldInvalidContext.Provider value={invalid}>
      <GroupLabelContext.Provider value={{ id: labelId, register: setHasLabel }}>
        <Field.Root
          name={name}
          disabled={disabled}
          invalid={invalid || undefined}
          render={
            <BaseRadioGroup
              {...rest}
              aria-labelledby={ariaLabelledBy ?? (hasLabel ? labelId : undefined)}
              value={value}
              defaultValue={defaultValue}
              onValueChange={(next) => onChange?.(next as string)}
              required={required}
              readOnly={readOnly}
            />
          }
          className={cn('flex flex-col gap-2', className)}
        >
          {children}
        </Field.Root>
      </GroupLabelContext.Provider>
    </FieldInvalidContext.Provider>
  );
}

function RadioGroupLabel({ className, ...props }: Omit<ComponentProps<'span'>, 'id'>) {
  const context = useContext(GroupLabelContext);
  const register = context?.register;
  useEffect(() => {
    register?.(true);
    return () => register?.(false);
  }, [register]);
  return <span {...props} id={context?.id} className={className} />;
}

function RadioGroupDescription({ className, ...props }: ComponentProps<typeof Field.Description> & { className?: string }) {
  return <Field.Description {...props} render={<div />} className={className} />;
}

function RadioGroupItem({ value, disabled, className, ...props }: ItemProps) {
  return (
    <ItemContext.Provider value={{ value, disabled }}>
      <Field.Item
        {...props}
        disabled={disabled}
        className={cn('group/radio-item inline-flex items-center gap-2', className)}
      />
    </ItemContext.Provider>
  );
}

function RadioGroupItemControl({ className, children, ...props }: ItemControlProps) {
  const item = useContext(ItemContext);
  return (
    <Radio.Root
      {...props}
      value={item.value}
      disabled={item.disabled}
      className={cn('group/radio-control', CONTROL_CLASS, className)}
    >
      {/* Kept mounted so the dot scales out as well as in. */}
      {children ?? <Radio.Indicator keepMounted aria-hidden="true" className={DOT_CLASS} />}
    </Radio.Root>
  );
}

function RadioGroupItemLabel({ className, ...props }: ItemLabelProps) {
  return <Field.Label {...props} className={cn(className)} />;
}

/** Base UI renders the radio's input with its control; kept so old markup still compiles. */
function RadioGroupItemInput(_props: { className?: string }) {
  return null;
}

/**
 * A Base UI radio group with the app's control styling, composed from slots
 * so the item label, description, and error message are yours to place.
 *
 * @do Give the group an `aria-label` (or a `RadioGroup.Label`) describing the
 *   choice.
 * @do Render a `RadioGroup.ItemLabel` for every item, even when the visible
 *   text sits elsewhere.
 * @dont Do not add `RadioGroup.ItemInput` yourself; `RadioGroup.ItemControl`
 *   already renders one.
 * @dont Do not use a radio group for a short inline switch between views;
 *   that is Tabs.
 */
export const RadioGroup = Object.assign(RadioGroupRoot, {
  Label: RadioGroupLabel,
  Description: RadioGroupDescription,
  ErrorMessage: createFieldErrorMessage(Field.Error, {
    placement: 'bottom-start',
    flip: true,
  }),
  Item: RadioGroupItem,
  ItemInput: RadioGroupItemInput,
  ItemControl: RadioGroupItemControl,
  ItemIndicator: Radio.Indicator,
  ItemLabel: RadioGroupItemLabel,
  ItemDescription: RadioGroupDescription,
});
