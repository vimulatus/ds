import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';
import { type Depth, Layer } from './Layer';

export type CardVariant = 'ghost' | 'outlined' | 'filled';

export type CardProps = ComponentProps<'div'> & {
  /** An absolute surface depth. Omit it to inherit the parent layer. */
  depth?: Depth;
  /** Steps above the parent depth, such as 1. */
  offset?: number;
  /** `ghost` has no frame, `outlined` a muted edge, `filled` the layer surface. */
  variant?: CardVariant;
};

function Root({ depth, offset, variant = 'outlined', className, ...props }: CardProps) {
  return (
    <Layer depth={depth} offset={offset}>
      <div
        data-slot="card"
        data-variant={variant}
        {...props}
        className={cn(
          'relative flex min-w-0 flex-col rounded-xl border border-transparent text-ink',
          variant === 'outlined' && 'border-edge-muted',
          variant === 'filled' ? 'border-edge bg-surface' : 'bg-transparent',
          className
        )}
      />
    </Layer>
  );
}

function Header({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="card-header" {...props} className={cn('flex min-w-0 flex-col gap-1 p-3', className)} />;
}

function Body({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="card-body" {...props} className={cn('min-w-0 p-3 text-sm leading-6', className)} />;
}

/** Give media an explicit height or aspect ratio at the call site. */
function Media({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-media"
      {...props}
      className={cn(
        'relative min-w-0 overflow-hidden bg-hover first:rounded-t-[inherit] last:rounded-b-[inherit] [&>img]:w-full [&>img]:object-cover',
        className
      )}
    />
  );
}

function Footer({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      {...props}
      className={cn(
        'flex min-w-0 flex-wrap items-center justify-between gap-2 border-t border-edge-muted p-3',
        className
      )}
    />
  );
}

/** A header row: a Tile or Icon beside Content, and Actions at the end. */
function Row({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-row"
      {...props}
      className={cn(
        'flex min-w-0 items-center gap-3 rounded-xl border border-transparent bg-transparent text-sm text-ink',
        className
      )}
    />
  );
}

function Icon({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span
      data-slot="card-icon"
      {...props}
      className={cn(
        'inline-flex h-5 w-4 shrink-0 self-start items-center justify-center [&>svg]:size-4',
        className
      )}
    />
  );
}

function Tile({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-tile"
      {...props}
      className={cn(
        'flex size-10 shrink-0 self-start items-center justify-center overflow-hidden rounded-lg bg-hover text-ink-muted [&>svg]:size-5 [&>img]:size-full [&>img]:object-cover',
        className
      )}
    />
  );
}

function Content({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="card-content" {...props} className={cn('flex min-w-0 flex-1 flex-col gap-1', className)} />;
}

function Title({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      {...props}
      className={cn('min-w-0 text-sm font-semibold leading-5 wrap-break-word', className)}
    />
  );
}

function Description({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      {...props}
      className={cn('text-sm font-normal leading-5 text-ink-muted wrap-break-word', className)}
    />
  );
}

function Metadata({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-metadata"
      {...props}
      className={cn(
        'flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium leading-4 text-ink-subtle',
        className
      )}
    />
  );
}

function Actions({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="card-actions" {...props} className={cn('flex shrink-0 items-center gap-1', className)} />;
}

/**
 * An intrinsic-height frame for rich content: a hairline edge and a 12px
 * radius. Compose Header, Media, Body and Footer in the order the content
 * needs. A Header holds Title, Description and Metadata, or a Row with a
 * Tile or Icon beside Content and Actions at the end.
 */
export const Card = Object.assign(Root, {
  Header,
  Media,
  Body,
  Footer,
  Row,
  Tile,
  Icon,
  Content,
  Title,
  Description,
  Metadata,
  Actions,
});
