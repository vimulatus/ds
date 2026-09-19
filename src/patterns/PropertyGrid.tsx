import type { ComponentProps, ReactNode } from 'react';
import { Input } from '@/components/Input';
import { cn } from '@/lib/cn';

/**
 * Label and value pairs in two columns. Put it in a `ResourceDetail.Section`
 * and in the `Fold`, so both widths show the same properties.
 */
export function PropertyGrid({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      {...props}
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
      <Input id={id} variant="ghost" size="sm" {...props} className={className} />
    </>
  );
}
