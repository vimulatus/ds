import { Toggle } from '@base-ui/react/toggle';
import { Eye, EyeSlash } from '@phosphor-icons/react';
import { cn } from '@/lib/cn';

export type MaskRevealProps = {
  /** What shows while hidden, such as "+1 415 •••• ••12". */
  masked: string;
  value: string;
  /** Names the value for a screen reader: "phone number". */
  label: string;
  revealed?: boolean;
  defaultRevealed?: boolean;
  onRevealedChange?: (revealed: boolean) => void;
  className?: string;
};

/**
 * A masked value that is its own reveal control. With a pointer, hover
 * blurs it and shows an eye; a click reveals, a second click hides. On
 * touch a tap toggles it and there is no eye. Owns its state unless you
 * pass `revealed`.
 */
export function MaskReveal({
  masked,
  value,
  label,
  revealed,
  defaultRevealed,
  onRevealedChange,
  className,
}: MaskRevealProps) {
  return (
    <Toggle
      pressed={revealed}
      defaultPressed={defaultRevealed}
      onPressedChange={(pressed) => onRevealedChange?.(pressed)}
      className={cn(
        'group/mask relative -mx-1 inline-grid w-fit items-center rounded-md px-1 text-left text-sm text-ink-muted tabular-nums outline-none transition-colors',
        'focus-visible:focus-ring data-pressed:text-ink not-touch:hover:text-ink',
        className
      )}
    >
      <span className="sr-only">Show {label}: </span>
      <span className="col-start-1 row-start-1 transition-[filter] not-touch:group-hover/mask:blur-[3px] group-data-pressed/mask:hidden">
        {masked}
      </span>
      <span className="col-start-1 row-start-1 hidden select-text group-data-pressed/mask:inline">
        {value}
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
  );
}
