import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';
import { type Depth, Layer } from './Layer';

export type ItemProps = ComponentProps<'div'> & {
  size?: 'sm' | 'md';
  /** An absolute surface depth. Omit it to inherit the parent layer. */
  depth?: Depth;
  /** Steps above the parent depth, such as 1. */
  offset?: number;
  /** `ghost` has no frame, `outlined` a muted edge, `filled` the layer surface. */
  variant?: 'ghost' | 'outlined' | 'filled';
};

function Root({ size, depth, offset, variant = 'ghost', className, ...props }: ItemProps) {
  return (
    <Layer depth={depth} offset={offset}>
      <div
        data-slot="item"
        data-variant={variant}
        {...props}
        className={cn(
          'flex min-w-0 items-center gap-3 rounded-xl border border-transparent text-sm text-ink',
          variant === 'outlined' && 'border-edge-muted',
          variant === 'filled' ? 'border-edge bg-surface' : 'bg-transparent',
          size === 'sm' ? 'p-2' : 'p-3',
          className
        )}
      />
    </Layer>
  );
}

/** A plain 16px icon aligned with the first title line. */
function Icon({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span
      data-slot="item-icon"
      {...props}
      className={cn(
        'inline-flex h-5 w-4 shrink-0 self-start items-center justify-center [&>svg]:size-4',
        className
      )}
    />
  );
}

/** A 40px top-aligned tile for an icon or an image. */
function Media({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="item-media"
      {...props}
      className={cn(
        'flex size-10 shrink-0 self-start items-center justify-center overflow-hidden rounded-lg bg-hover text-ink-muted [&>svg]:size-5 [&>img]:size-full [&>img]:object-cover',
        className
      )}
    />
  );
}

function Content({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="item-content" {...props} className={cn('flex min-w-0 flex-1 flex-col gap-1', className)} />;
}

function Title({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="item-title"
      {...props}
      className={cn('min-w-0 text-sm font-semibold leading-5 wrap-break-word', className)}
    />
  );
}

function Description({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="item-description"
      {...props}
      className={cn('text-sm font-normal leading-5 text-ink-muted wrap-break-word', className)}
    />
  );
}

function Metadata({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="item-metadata"
      {...props}
      className={cn(
        'flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium leading-4 text-ink-subtle',
        className
      )}
    />
  );
}

function Actions({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="item-actions" {...props} className={cn('flex shrink-0 items-center gap-1', className)} />;
}

/**
 * A content row shared by lists and rich cards. Compose Media or Icon,
 * Content (Title, Description, Metadata) and Actions in reading order; every
 * part is optional. The root is not a click target: put links or Buttons in
 * the parts.
 */
export const Item = Object.assign(Root, { Icon, Media, Content, Title, Description, Metadata, Actions });
