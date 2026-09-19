import { Input as Base } from '@base-ui/react/input';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import type { InputSize } from './Input';

const FRAME: Record<InputSize, string> = {
  sm: 'h-6 gap-1 px-1.5 [&_svg]:size-3.5',
  md: 'h-8 gap-1.5 px-2 [&_svg]:size-4 touch:h-10',
};

export type InputGroupProps = Omit<ComponentProps<typeof Base>, 'className' | 'size'> & {
  /** Classes for the frame. */
  className?: string;
  size?: InputSize;
  /** Before the text: an icon, a unit such as "https://", or a Button at `icon-sm`. */
  start?: ReactNode;
  /** After the text: a status icon, a unit, or a Button at `icon-sm`. */
  end?: ReactNode;
};

/**
 * An Input with addons inside one frame: text, an icon or a small button at
 * either end. The frame carries the border and the focus ring, so the
 * addons read as part of the control. Inside a Field it takes the field's
 * label and validity.
 */
export function InputGroup({ size = 'md', start, end, className, ...props }: InputGroupProps) {
  return (
    <div
      className={cn(
        'flex w-full min-w-0 items-center rounded-md border border-edge bg-input text-sm text-ink-subtle transition-[border-color,box-shadow]',
        'focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20',
        'has-data-invalid:border-failure has-data-invalid:ring-2 has-data-invalid:ring-failure/20',
        'has-disabled:cursor-not-allowed has-disabled:opacity-60',
        '[&_svg]:shrink-0',
        FRAME[size],
        className
      )}
    >
      {start && <span className="flex shrink-0 items-center whitespace-nowrap">{start}</span>}
      <Base
        {...props}
        className="h-full w-full min-w-0 bg-transparent text-ink outline-none touch:text-base disabled:cursor-not-allowed"
      />
      {end && <span className="flex shrink-0 items-center whitespace-nowrap">{end}</span>}
    </div>
  );
}
