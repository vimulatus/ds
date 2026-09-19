import { Field } from '@base-ui/react/field';
import {
  type ComponentProps,
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
} from 'react';
import { cn } from '@/lib/cn';
import {
  createFieldErrorMessage,
  type FieldError,
  type FieldErrorMessageProps,
  FieldInvalidContext,
} from './FieldError';
import { Input, type InputProps, inputOutlineFocusClasses } from './Input';

type TextFieldState = {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
};

export type TextFieldProps = Omit<ComponentProps<'div'>, 'onChange' | 'defaultValue'> &
  TextFieldState & {
    name?: string;
    validationState?: 'valid' | 'invalid';
  };

const TextFieldContext = createContext<TextFieldState>({});

function TextFieldRoot({
  value,
  defaultValue,
  onChange,
  required,
  readOnly,
  disabled,
  name,
  validationState,
  className,
  ...props
}: TextFieldProps) {
  const invalid = validationState === 'invalid';
  return (
    <FieldInvalidContext.Provider value={invalid}>
      <TextFieldContext.Provider value={{ value, defaultValue, onChange, required, readOnly, disabled }}>
        <Field.Root
          data-slot="text-field"
          {...props}
          name={name}
          disabled={disabled}
          invalid={invalid || undefined}
          className={cn('grid w-full gap-1.5', className)}
        />
      </TextFieldContext.Provider>
    </FieldInvalidContext.Provider>
  );
}

export type TextFieldInputProps = InputProps;

function TextFieldInput({ className, ...props }: TextFieldInputProps) {
  const { value, defaultValue, onChange, required, readOnly } = useContext(TextFieldContext);
  return (
    <Input
      data-slot="text-field-input"
      value={value}
      defaultValue={defaultValue}
      onValueChange={onChange ? (next) => onChange(next) : undefined}
      required={required}
      readOnly={readOnly}
      {...props}
      className={className}
    />
  );
}

export type TextFieldTextAreaProps = Omit<ComponentProps<'textarea'>, 'className'> & {
  className?: string;
  /** Grows with its content. */
  autoResize?: boolean;
};

function TextFieldTextArea({ className, autoResize, ref, onInput, ...props }: TextFieldTextAreaProps) {
  const { value, defaultValue, onChange, required, readOnly } = useContext(TextFieldContext);
  const element = useRef<HTMLTextAreaElement | null>(null);
  const resize = useCallback(() => {
    const textarea = element.current;
    if (!autoResize || !textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [autoResize]);
  useLayoutEffect(resize, [resize, value]);

  return (
    <Field.Control
      data-slot="text-field-textarea"
      value={value}
      defaultValue={defaultValue}
      onValueChange={onChange ? (next) => onChange(next) : undefined}
      required={required}
      readOnly={readOnly}
      render={
        <textarea
          {...props}
          ref={(node) => {
            element.current = node;
            if (typeof ref === 'function') ref(node);
            else if (ref) ref.current = node;
          }}
          onInput={(event) => {
            onInput?.(event);
            resize();
          }}
        />
      }
      className={cn(
        'flex min-h-20 w-full resize-none rounded-md border border-edge-muted bg-input px-2.5 py-2 text-base text-ink caret-current outline-none transition-[border-color,box-shadow]',
        'placeholder:text-ink-placeholder',
        inputOutlineFocusClasses,
        'aria-invalid:border-failure aria-invalid:ring-2 aria-invalid:ring-failure/20',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
    />
  );
}

export type TextFieldLabelProps = Omit<ComponentProps<typeof Field.Label>, 'className'> & {
  className?: string;
};

function TextFieldLabel({ className, ...props }: TextFieldLabelProps) {
  return (
    <Field.Label
      data-slot="text-field-label"
      {...props}
      className={cn(
        'text-sm font-medium text-ink select-none',
        'data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:text-ink-disabled',
        'data-invalid:text-failure',
        className
      )}
    />
  );
}

export type TextFieldError = FieldError;
export type TextFieldErrorMessageProps = FieldErrorMessageProps;

const TextFieldErrorMessage = createFieldErrorMessage(Field.Error, {
  anchor: '[data-slot=text-field-input],[data-slot=text-field-textarea]',
});

export type TextFieldDescriptionProps = Omit<ComponentProps<typeof Field.Description>, 'className'> & {
  className?: string;
};

function TextFieldDescription({ className, ...props }: TextFieldDescriptionProps) {
  return (
    <Field.Description
      data-slot="text-field-description"
      {...props}
      render={<div />}
      className={cn('text-xs text-ink-subtle', className)}
    />
  );
}

/**
 * An accessible text input or textarea composed from Base UI Field slots and
 * styled with the app's layer-aware form-control tokens.
 *
 * @do Put `TextField.Label`, the control, and any description or error inside
 *   the same root so Base UI wires their accessible relationships.
 * @do Set `validationState="invalid"` on the root; `TextField.Input` and
 *   `TextField.TextArea` receive `aria-invalid` automatically, and
 *   `TextField.ErrorMessage` pins a danger callout beside the control.
 * @do Use `TextField.TextArea autoResize` for growing multiline input.
 * @dont Do not add manual `id`, `for`, or `aria-describedby` attributes when
 *   the slots share a root.
 * @dont Do not use TextField for search with suggestions or fixed-choice
 *   values; use the appropriate combobox or Select primitive.
 */
export const TextField = Object.assign(TextFieldRoot, {
  Description: TextFieldDescription,
  ErrorMessage: TextFieldErrorMessage,
  Input: TextFieldInput,
  Label: TextFieldLabel,
  TextArea: TextFieldTextArea,
});
