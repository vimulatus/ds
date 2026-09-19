import { Select as Base } from '@base-ui/react/select';
import { CaretDown, Check } from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Field } from './Field';
import { type InputSize, inputClasses } from './Input';

export type SelectOption = {
  value: string;
  label: string;
  /** A quiet second line under the label, in the list only. */
  hint?: string;
};

export type SelectProps = {
  options: SelectOption[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  placeholder?: string;
  size?: InputSize;
  disabled?: boolean;
  name?: string;
  required?: boolean;
  label?: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  invalid?: boolean;
  /** Classes for the trigger, such as a width. */
  className?: string;
  /** Classes for the field around the trigger. */
  fieldClassName?: string;
  'aria-label'?: string;
};

/**
 * Picks one value from a short fixed list. The trigger looks like an Input;
 * the list opens under it on glass and checks the current value. Past a
 * dozen options, use a searchable list instead.
 */
export function Select({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder,
  size = 'md',
  disabled,
  name,
  required,
  label,
  description,
  error,
  invalid,
  className,
  fieldClassName,
  'aria-label': ariaLabel,
}: SelectProps) {
  return (
    <Field
      label={label}
      description={description}
      error={error}
      invalid={invalid}
      disabled={disabled}
      name={name}
      nativeLabel={false}
      className={fieldClassName}
    >
      <Base.Root
        items={options}
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        disabled={disabled}
        required={required}
      >
        <Base.Trigger
          aria-label={ariaLabel}
          className={cn(
            inputClasses({ size }),
            'flex cursor-pointer items-center justify-between gap-2 text-left',
            'focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/20 data-popup-open:border-accent',
            'data-invalid:border-failure data-invalid:ring-2 data-invalid:ring-failure/20',
            className
          )}
        >
          <Base.Value
            placeholder={placeholder}
            className="truncate data-placeholder:text-ink-placeholder"
          />
          <Base.Icon className="flex shrink-0 text-ink-subtle">
            <CaretDown className="size-3" />
          </Base.Icon>
        </Base.Trigger>
        <Base.Portal>
          <Base.Positioner alignItemWithTrigger={false} sideOffset={4} className="z-action-menu outline-none">
            <Base.Popup className="menu-open-animation glass min-w-(--anchor-width) rounded-lg border border-edge-muted bg-menu-glass p-1 text-ink outline-none">
              <Base.List className="max-h-(--available-height) overflow-y-auto">
                {options.map((option) => (
                  <Base.Item
                    key={option.value}
                    value={option.value}
                    className={cn(
                      'flex cursor-default select-none items-center justify-between gap-3 rounded-md px-2 py-1.5 text-sm outline-none',
                      'data-highlighted:bg-hover data-disabled:text-ink-disabled touch:py-2.5 touch:text-base'
                    )}
                  >
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <Base.ItemText className="truncate">{option.label}</Base.ItemText>
                      {option.hint && (
                        <span className="text-xs text-ink-subtle">{option.hint}</span>
                      )}
                    </span>
                    <Base.ItemIndicator className="flex shrink-0 text-accent-ink">
                      <Check weight="bold" className="size-3" />
                    </Base.ItemIndicator>
                  </Base.Item>
                ))}
              </Base.List>
            </Base.Popup>
          </Base.Positioner>
        </Base.Portal>
      </Base.Root>
    </Field>
  );
}
