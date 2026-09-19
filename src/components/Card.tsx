import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';
import { type Depth, Layer } from './Layer';

export type CardVariant = 'ghost' | 'outlined' | 'filled';

const VARIANT: Record<CardVariant, string> = {
  ghost: 'border-transparent bg-transparent',
  outlined: 'border-edge-muted bg-transparent',
  filled: 'border-edge bg-surface',
};

export type CardProps = ComponentProps<'div'> & {
  /** `ghost` has no frame, `outlined` a muted edge, `filled` the layer surface. */
  variant?: CardVariant;
  /** The depth the card sits at; `filled` paints that depth's surface. */
  depth?: Depth;
};

/**
 * An intrinsic-height frame for rich content: a hairline edge and a 12px
 * radius. Compose it from `Card.Header`, `Card.Title`, `Card.Description`,
 * `Card.Metadata`, `Card.Body` and `Card.Footer`, the same hierarchy as a
 * list row.
 */
function Root({ variant = 'outlined', depth = 0, className, ...props }: CardProps) {
  return (
    <Layer depth={depth}>
      <div
        {...props}
        className={cn(
          'relative flex min-w-0 flex-col rounded-xl border text-ink',
          VARIANT[variant],
          className
        )}
      />
    </Layer>
  );
}

function Header({ className, ...props }: ComponentProps<'div'>) {
  return <div {...props} className={cn('flex min-w-0 flex-col gap-1 p-3', className)} />;
}

function Title({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      {...props}
      className={cn('min-w-0 text-sm leading-5 font-semibold wrap-break-word', className)}
    />
  );
}

function Description({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      {...props}
      className={cn('text-sm leading-5 font-normal wrap-break-word text-ink-muted', className)}
    />
  );
}

function Metadata({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      {...props}
      className={cn(
        'flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs leading-4 font-medium text-ink-subtle',
        className
      )}
    />
  );
}

function Body({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div {...props} className={cn('min-w-0 p-3 text-sm leading-6 text-ink-muted', className)} />
  );
}

function Footer({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      {...props}
      className={cn(
        'flex min-w-0 flex-wrap items-center justify-between gap-2 border-t border-edge-muted p-3',
        className
      )}
    />
  );
}

export const Card = Object.assign(Root, { Header, Title, Description, Metadata, Body, Footer });
