import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { type Depth, Layer } from './Layer';

export type CardProps = Omit<ComponentProps<'section'>, 'title'> & {
  /** A quiet `xs` label above the content. */
  title?: ReactNode;
  /** The depth the card sits at. Nested surfaces step one shade lighter. */
  depth?: Depth;
};

/** A surface that groups related content: a hairline edge, rounded-xl, no shadow. */
export function Card({ title, depth = 1, className, children, ...props }: CardProps) {
  return (
    <Layer depth={depth}>
      <section
        {...props}
        className={cn(
          'flex flex-col gap-3 rounded-xl border border-edge-muted bg-surface p-3',
          className
        )}
      >
        {title && <h2 className="text-xs font-medium text-ink-muted">{title}</h2>}
        {children}
      </section>
    </Layer>
  );
}
