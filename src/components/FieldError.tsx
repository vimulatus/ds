import type { Field } from '@base-ui/react/field';
import { type ComponentProps, createContext, type ReactNode, type Ref, useCallback, useContext, useState } from 'react';
import { Callout, type CalloutPlacement } from './Callout';

export type FieldError = { message?: string } | undefined;

type ErrorMessageComponent = (props: ComponentProps<typeof Field.Error>) => ReactNode;

export type FieldErrorMessageProps = {
  id?: string;
  /** Shows the message whatever the validity. */
  forceMount?: boolean;
  className?: string;
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
  errors?: FieldError[];
};

type FieldErrorOptions = {
  /** Selector for the control inside the form-control root. Missing, the root is the anchor. */
  anchor?: string;
  placement?: CalloutPlacement;
  flip?: boolean | string;
};

/**
 * True while the control's root has `validationState="invalid"`. Every form
 * root provides it, so its error message shows without waiting for the
 * browser's own validity.
 */
export const FieldInvalidContext = createContext(false);

/**
 * Wraps a Base UI `Field.Error` as a danger `Callout` pinned beside the
 * control. The `Field.Error` element keeps its id and holds the text, so
 * the control's `aria-describedby` still reaches it.
 */
export function createFieldErrorMessage(
  ErrorMessage: ErrorMessageComponent,
  options: FieldErrorOptions = {}
) {
  return function FieldErrorMessage({
    className,
    errors,
    children,
    forceMount,
    ref,
    ...rest
  }: FieldErrorMessageProps) {
    const invalid = useContext(FieldInvalidContext);
    const [anchor, setAnchor] = useState<HTMLElement | null>(null);
    const uniqueErrors = [...new Map(errors?.map((error) => [error?.message, error])).values()];

    const attach = useCallback(
      (element: HTMLDivElement | null) => {
        const root = element?.parentElement ?? null;
        setAnchor((options.anchor && root?.querySelector<HTMLElement>(options.anchor)) || root);
        if (typeof ref === 'function') ref(element);
        else if (ref) ref.current = element;
      },
      [ref]
    );

    let message: ReactNode;
    if (children) message = children;
    else if (!errors?.length) message = null;
    else if (uniqueErrors.length === 1) message = uniqueErrors[0]?.message;
    else
      message = (
        <ul className="ml-4 flex list-disc flex-col gap-1">
          {uniqueErrors.map((error, index) => (
            <li key={index}>{error?.message}</li>
          ))}
        </ul>
      );

    return (
      <ErrorMessage
        {...rest}
        ref={attach}
        match={forceMount || invalid ? true : undefined}
        className="contents"
      >
        <Callout
          pinned
          open
          anchorRef={anchor}
          placement={options.placement ?? 'right'}
          flip={options.flip ?? 'bottom-start'}
        >
          <Callout.Content variant="danger" portal={false} className={className}>
            {message}
          </Callout.Content>
        </Callout>
      </ErrorMessage>
    );
  };
}
