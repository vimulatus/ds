import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox';
import { Field } from '@base-ui/react/field';
import { Check, Minus } from '@phosphor-icons/react';
import { type ComponentProps, createContext, useContext } from 'react';
import { cn } from '@/lib/cn';
import { createFieldErrorMessage, FieldInvalidContext } from './FieldError';

/*
<Checkbox checked={...} onChange={...}>
  <Checkbox.Control />
</Checkbox>

A bare <Checkbox.Control /> renders its own <Checkbox.Indicator /> with a
check (or minus for indeterminate). Override by passing children:

<Checkbox.Control>
  <Checkbox.Indicator>
    <CustomGlyph />
  </Checkbox.Indicator>
</Checkbox.Control>
*/

type CheckboxState = {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  indeterminate?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  value?: string;
};

export type CheckboxProps = Omit<ComponentProps<'div'>, 'onChange' | 'defaultChecked'> &
  CheckboxState & {
    name?: string;
    validationState?: 'valid' | 'invalid';
  };
type ControlProps = Omit<ComponentProps<typeof BaseCheckbox.Root>, 'className'> & { className?: string };
type IndicatorProps = Omit<ComponentProps<typeof BaseCheckbox.Indicator>, 'className'> & { className?: string };
type LabelProps = Omit<ComponentProps<typeof Field.Label>, 'className'> & { className?: string };

const CONTROL_CLASS = cn(
  'inline-flex items-center justify-center size-4 shrink-0 rounded-sm text-surface',
  'bg-surface border-1 border-edge',
  'data-checked:bg-accent data-checked:border-accent',
  'data-indeterminate:bg-accent data-indeterminate:border-accent',
  'data-disabled:opacity-50 data-disabled:cursor-not-allowed',
  'data-invalid:border-failure',
  // Base UI focuses the control itself; there is no peer input.
  'focus-visible:ring-2 focus-visible:ring-accent'
);

const CheckboxContext = createContext<CheckboxState>({});

function CheckboxIndicator({ className, children, ...props }: IndicatorProps) {
  return (
    <BaseCheckbox.Indicator
      {...props}
      className={cn('group inline-flex items-center justify-center', className)}
    >
      {children ?? (
        <>
          <Check className="size-3 group-data-indeterminate:hidden" />
          <Minus className="size-3 hidden group-data-indeterminate:block" />
        </>
      )}
    </BaseCheckbox.Indicator>
  );
}

function CheckboxControl({ className, children, ...props }: ControlProps) {
  const { checked, defaultChecked, onChange, indeterminate, disabled, readOnly, required, value } =
    useContext(CheckboxContext);
  return (
    <BaseCheckbox.Root
      checked={checked}
      defaultChecked={defaultChecked}
      onCheckedChange={(next) => onChange?.(next)}
      indeterminate={indeterminate}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      value={value}
      {...props}
      className={cn(CONTROL_CLASS, className)}
    >
      {children ?? <CheckboxIndicator />}
    </BaseCheckbox.Root>
  );
}

function CheckboxLabel({ className, ...props }: LabelProps) {
  return <Field.Label {...props} className={cn(className)} />;
}

function CheckboxDescription({ className, ...props }: ComponentProps<typeof Field.Description> & { className?: string }) {
  return <Field.Description {...props} render={<div />} className={className} />;
}

/** Base UI renders the checkbox's input with its control; kept so old markup still compiles. */
function CheckboxInput(_props: { className?: string }) {
  return null;
}

function CheckboxRoot({
  checked,
  defaultChecked,
  onChange,
  indeterminate,
  disabled,
  readOnly,
  required,
  value,
  name,
  validationState,
  className,
  ...props
}: CheckboxProps) {
  const invalid = validationState === 'invalid';
  return (
    <FieldInvalidContext.Provider value={invalid}>
      <CheckboxContext.Provider
        value={{ checked, defaultChecked, onChange, indeterminate, disabled, readOnly, required, value }}
      >
        <Field.Root
          {...props}
          name={name}
          disabled={disabled}
          invalid={invalid || undefined}
          className={cn('inline-flex items-center gap-2', className)}
        />
      </CheckboxContext.Provider>
    </FieldInvalidContext.Provider>
  );
}

/**
 * A Base UI checkbox with the app's control styling, composed from slots so
 * the label, description, and error message are yours to place.
 *
 * @do Always render a `Checkbox.Label`, even when the visible text sits
 *   elsewhere.
 * @do Use `indeterminate` on a select-all that only covers part of its group.
 * @do Use `InlineCheckbox` when the whole row is already clickable.
 * @dont Do not use a checkbox for an immediate action — that is a ToggleSwitch
 *   or a Button.
 * @dont Do not add `Checkbox.Input` yourself; `Checkbox.Control` already
 *   renders one.
 */
export const Checkbox = Object.assign(CheckboxRoot, {
  ErrorMessage: createFieldErrorMessage(Field.Error, {
    placement: 'bottom-start',
    flip: true,
  }),
  Description: CheckboxDescription,
  Input: CheckboxInput,
  Indicator: CheckboxIndicator,
  Control: CheckboxControl,
  Label: CheckboxLabel,
});

export const SingleSelectCheck = ({ active }: { active: boolean }) => (
  <Check className={cn('size-3 text-accent shrink-0', !active && 'hidden')} />
);

/**
 * Inline checkbox affordance — a small square that fills accent when checked
 * and shows an outlined empty box when not. Matches the menu checkbox
 * pattern. Visual-only; pair with a clickable parent for the actual toggle.
 */
export const InlineCheckbox = ({ checked }: { checked: boolean }) => (
  <span
    aria-hidden
    className={cn(
      'inline-flex items-center justify-center size-3.5 shrink-0 rounded-sm',
      checked ? 'bg-accent text-surface' : 'bg-transparent border-1 border-edge-muted text-transparent'
    )}
  >
    <Check className="size-2.5" />
  </span>
);
