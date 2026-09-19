import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Field, type FieldProps } from './Field';
import { Input, type InputProps } from './Input';

export type TextFieldProps = Omit<InputProps, 'variant'> & {
  label?: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  /** Marks the field invalid from outside, such as a server check. */
  invalid?: boolean;
  /** A textarea that grows with its content. */
  multiline?: boolean;
  /** Visible lines before it grows. Only with `multiline`. */
  rows?: number;
  validate?: FieldProps['validate'];
  validationMode?: FieldProps['validationMode'];
  /** Classes for the field around the control. */
  fieldClassName?: string;
};

/**
 * A labelled text control with an optional description and error. The
 * field wires the label, the description and the error to the control, and
 * the error pins beside it. `multiline` makes a textarea that grows as the
 * user types.
 */
export function TextField({
  label,
  description,
  error,
  invalid,
  multiline,
  rows = 3,
  validate,
  validationMode,
  disabled,
  name,
  fieldClassName,
  className,
  ...props
}: TextFieldProps) {
  return (
    <Field
      label={label}
      description={description}
      error={error}
      invalid={invalid}
      validate={validate}
      validationMode={validationMode}
      disabled={disabled}
      name={name}
      className={fieldClassName}
    >
      {multiline ? (
        <Input
          {...props}
          render={<textarea rows={rows} />}
          className={cn(
            'h-auto min-h-16 resize-none py-1.5 field-sizing-content touch:h-auto',
            className
          )}
        />
      ) : (
        <Input {...props} className={className} />
      )}
    </Field>
  );
}
