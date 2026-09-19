import { Toggle } from '@base-ui/react/toggle';
import { Eye, EyeSlash } from '@phosphor-icons/react';
import { type ReactNode, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { PinnedCallout } from './Callout';

type Source =
  | {
      /** The value, when the caller already has it. */
      value: string;
      onReveal?: never;
    }
  | {
      value?: undefined;
      /**
       * Fetches the value on the first reveal. Resolve `null`, or throw, when
       * the viewer may not see it: the value stays masked and the denied
       * message shows.
       */
      onReveal: () => Promise<string | null>;
    };

export type MaskRevealProps = Source & {
  /** What shows while hidden, such as "+1 415 •••• ••12". */
  masked: string;
  /** Names the value for a screen reader: "phone number". */
  label: string;
  /** Replaces "You don't have permission to view this {label}." */
  deniedMessage?: ReactNode;
  revealed?: boolean;
  defaultRevealed?: boolean;
  onRevealedChange?: (revealed: boolean) => void;
  className?: string;
};

/**
 * A masked value that is its own reveal control. With a pointer, hover
 * blurs it and shows an eye; a click reveals, a second click hides. On
 * touch a tap toggles it and there is no eye. With `onReveal` the value is
 * fetched on the first reveal, and a denied reveal keeps it masked and says
 * why until focus leaves the control. Owns its state unless you pass
 * `revealed`.
 */
export function MaskReveal({
  masked,
  value,
  onReveal,
  label,
  deniedMessage,
  revealed,
  defaultRevealed = false,
  onRevealedChange,
  className,
}: MaskRevealProps) {
  const [ownRevealed, setOwnRevealed] = useState(defaultRevealed);
  const [fetched, setFetched] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'denied'>('idle');
  const anchor = useRef<HTMLButtonElement>(null);

  const known = value ?? fetched;
  const isRevealed = (revealed ?? ownRevealed) && known !== null;

  const setRevealed = (next: boolean) => {
    setOwnRevealed(next);
    onRevealedChange?.(next);
  };

  const press = async (pressed: boolean) => {
    if (status === 'loading') return;
    if (!pressed || known !== null) {
      setStatus('idle');
      setRevealed(pressed);
      return;
    }
    if (!onReveal) return;
    setStatus('loading');
    const next = await onReveal().catch(() => null);
    if (next === null) {
      setStatus('denied');
      return;
    }
    setFetched(next);
    setStatus('idle');
    setRevealed(true);
  };

  return (
    <>
      <Toggle
        ref={anchor}
        pressed={isRevealed}
        onPressedChange={press}
        onBlur={() => status === 'denied' && setStatus('idle')}
        aria-busy={status === 'loading' || undefined}
        className={cn(
          'group/mask relative -mx-1 inline-grid w-fit items-center rounded-md px-1 text-left text-sm text-ink-muted tabular-nums outline-none transition-colors',
          'focus-visible:focus-ring data-pressed:text-ink not-touch:hover:text-ink',
          className
        )}
      >
        <span className="sr-only">Show {label}: </span>
        <span
          className={cn(
            'col-start-1 row-start-1 transition-[filter] not-touch:group-hover/mask:blur-[3px] group-data-pressed/mask:hidden',
            status === 'loading' && 'animate-pulse'
          )}
        >
          {masked}
        </span>
        <span className="col-start-1 row-start-1 hidden select-text group-data-pressed/mask:inline">
          {known}
        </span>
        <span
          aria-hidden
          className="pointer-events-none col-start-1 row-start-1 flex justify-center opacity-0 transition-opacity touch:hidden not-touch:group-hover/mask:opacity-100 group-data-pressed/mask:hidden [&_svg]:size-4"
        >
          <Eye />
        </span>
        <span
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-full hidden -translate-y-1/2 pl-1 text-ink-subtle not-touch:group-hover/mask:group-data-pressed/mask:block [&_svg]:size-3.5"
        >
          <EyeSlash />
        </span>
      </Toggle>
      {status === 'denied' && (
        <PinnedCallout anchor={anchor} variant="danger" placement="bottom-start" role="alert">
          {deniedMessage ?? `You don't have permission to view this ${label}.`}
        </PinnedCallout>
      )}
    </>
  );
}
