import { Separator as Base } from '@base-ui/react/separator';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

export type SeparatorProps = Omit<ComponentProps<typeof Base>, 'className'> & {
  className?: string;
};

/** A hairline between groups of content. Vertical in a row, horizontal in a column. */
export function Separator({ className, ...props }: SeparatorProps) {
  return (
    <Base
      {...props}
      className={cn(
        'shrink-0 bg-edge-muted data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full',
        'data-[orientation=vertical]:w-px data-[orientation=vertical]:self-stretch',
        className
      )}
    />
  );
}
