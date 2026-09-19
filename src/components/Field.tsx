import { Field as Base } from '@base-ui/react/field';
import { type ComponentProps, type ReactNode, useRef } from 'react';
import { cn } from '@/lib/cn';
import { PinnedCallout } from './Callout';

export type FieldErrorPlacement = 'right' | 'bottom-start';

export type FieldProps = Omit<ComponentProps<typeof Base.Root>, 'className'> & {
  className?: string;
  label?: ReactNode;
  description?: ReactNode;
  /** Shown while the field is invalid. Without it, the browser's validation message shows. */
  error?: ReactNode;
  /**
   * Where the error goes. A text control takes `right`, which drops under
   * the field when there is no room; a checkbox or a group takes
   * `bottom-start`. Never above: the label is there.
   */
  errorPlacement?: FieldErrorPlacement;
  /**
   * False when the control is not a labelable element, such as a select
   * trigger. The label then renders as a div that still names the control.
   */
  nativeLabel?: boolean;
};

/**
 * A label, a description and an error around one control, on Base UI Field.
 * The control keeps its width. While the field is invalid the control shows
 * a failure hairline and ring, and the error pins beside it as a danger
 * Callout that `aria-describedby` still reaches.
 */
export function Field({
  label,
  description,
  error,
  errorPlacement = 'right',
  nativeLabel = true,
  className,
  children,
  ...props
}: FieldProps) {
  const anchor = useRef<HTMLDivElement>(null);
  return (
    <Base.Root {...props} className={cn('flex min-w-0 flex-col gap-1.5', className)}>
      {label && (
        <Base.Label
          nativeLabel={nativeLabel}
          render={nativeLabel ? undefined : <div />}
          className="self-start text-xs font-medium text-ink-muted data-disabled:text-ink-disabled"
        >
          {label}
        </Base.Label>
      )}
      <div ref={anchor} className={cn('min-w-0', errorPlacement === 'bottom-start' && 'self-start')}>
        {children}
      </div>
      {description && (
        <Base.Description className="text-xs text-ink-subtle">{description}</Base.Description>
      )}
      <Base.Error
        match={props.invalid || undefined}
        render={(errorProps) => (
          <PinnedCallout
            {...errorProps}
            anchor={anchor}
            variant="danger"
            placement={errorPlacement}
            className="dialog-overlay-open-animation"
          />
        )}
      >
        {error}
      </Base.Error>
    </Base.Root>
  );
}
