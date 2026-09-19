import type { ComponentProps, ReactNode } from 'react';
import { Input } from '@/components/Input';
import { cn } from '@/lib/cn';

export type PropertyGridProps = ComponentProps<'div'> & {
  /** Enter in one of the grid's inputs saves the edits. */
  onSave?: () => void;
  /** Escape in one of the grid's inputs throws the edits away. */
  onDiscard?: () => void;
};

/**
 * Label and value pairs in two columns. Put it in a `ResourceDetail.Section`
 * and in the `Fold`, so both widths show the same properties. With `onSave`
 * and `onDiscard` it is the form behind `ResourceDetail.Changes`: Enter saves
 * and Escape discards from any input in the grid, but not from a popup that
 * a property opens.
 */
export function PropertyGrid({ onSave, onDiscard, onKeyDown, className, ...props }: PropertyGridProps) {
  return (
    <div
      {...props}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        const target = event.target;
        if (!(target instanceof HTMLInputElement) || !event.currentTarget.contains(target)) return;
        if (event.key === 'Enter' && onSave) {
          event.preventDefault();
          onSave();
        } else if (event.key === 'Escape' && onDiscard) {
          event.preventDefault();
          onDiscard();
        }
      }}
      className={cn(
        'grid grid-cols-[6.5rem_1fr] items-center gap-x-3 gap-y-2.5 text-sm',
        className
      )}
    />
  );
}

/** A read-only property. */
export function Property({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <>
      <span className="truncate text-ink-subtle">{label}</span>
      <div className="min-w-0">{children}</div>
    </>
  );
}

/** The in-place editing look: a hover wash, and a grey ring on focus. */
export const editablePropertyClasses =
  '-mx-1.5 px-1.5 text-sm hover:bg-hover focus-visible:bg-input focus-visible:ring-2 focus-visible:ring-edge-muted';

/**
 * An editable property. The value is the control: a ghost input with no
 * pencil and no edit state.
 */
export function EditableProperty({
  id,
  label,
  className,
  ...props
}: ComponentProps<typeof Input> & { id: string; label: ReactNode }) {
  return (
    <>
      <label htmlFor={id} className="truncate text-ink-subtle">
        {label}
      </label>
      <Input
        id={id}
        variant="ghost"
        size="sm"
        {...props}
        className={cn(editablePropertyClasses, className)}
      />
    </>
  );
}
