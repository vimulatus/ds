import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';
import { Item } from './Item';
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

/**
 * An intrinsic-height frame for rich content: a hairline edge and a 12px
 * radius. Compose Header, Media, Body and Footer in the order the content
 * needs; Title, Icon, Description, Metadata and Actions are Item's, so a card
 * and a list row carry one hierarchy.
 */
export const Card = Object.assign(Root, {
  Header,
  Media,
  Body,
  Footer,
  Title: Item.Title,
  Icon: Item.Icon,
  Description: Item.Description,
  Metadata: Item.Metadata,
  Actions: Item.Actions,
});
