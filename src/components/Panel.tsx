import type { ComponentProps, CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { type Depth, Layer } from './Layer';
import { Scroll } from './Scroll';

// The root is a Surface. Surface lands with the overlays work; until then the
// panel draws the same box: a layer, a hairline edge, and an optional ring.
export type PanelProps = Omit<ComponentProps<'div'>, 'style'> & {
  depth?: Depth;
  style?: CSSProperties;
  edgeColor?: string;
  highlightColor?: string;
  active?: boolean;
  solid?: boolean;
  hideBorder?: boolean;
};

type SlotProps = { className?: string; children?: ReactNode };
type BodyProps = SlotProps & { scroll?: boolean };

const hasContent = (children: ReactNode) => children !== undefined && children !== null && children !== false;

function Root({
  depth,
  edgeColor,
  highlightColor,
  active,
  solid: _solid,
  hideBorder,
  className,
  style,
  children,
  ...props
}: PanelProps) {
  return (
    <Layer depth={depth ?? 0}>
      <div
        {...props}
        data-surface=""
        style={{
          ...(hideBorder ? {} : { border: `var(--app-border-width, 0.5px) solid ${edgeColor ?? 'var(--color-edge)'}` }),
          ...(active
            ? { boxShadow: `0 0 0 2px color-mix(in srgb, ${highlightColor ?? 'var(--color-edge)'} 60%, transparent)` }
            : {}),
          gridTemplateAreas: '"header" "toolbar" "body" "footer"',
          gridTemplateRows: 'auto auto minmax(0, 1fr) auto',
          gridTemplateColumns: 'minmax(0, 1fr)',
          ...style,
        }}
        className={cn('relative rounded-md overflow-clip min-h-0 size-full bg-surface', 'grid min-h-0 min-w-0 bg-panel', className)}
      >
        {children}
      </div>
    </Layer>
  );
}

function Header({ className, children }: SlotProps) {
  if (!hasContent(children)) return null;
  return (
    <div
      className={cn('flex flex-none items-center min-h-10 px-2 border-b border-edge-muted overflow-hidden', className)}
      style={{ gridArea: 'header' }}
    >
      {children}
    </div>
  );
}

function Toolbar({ className, children }: SlotProps) {
  if (!hasContent(children)) return null;
  return (
    <div
      className={cn('flex flex-none items-center p-2 border-b border-edge-muted overflow-hidden', className)}
      style={{ gridArea: 'toolbar' }}
    >
      {children}
    </div>
  );
}

function Body({ className, scroll, children }: BodyProps) {
  if (!hasContent(children)) return null;
  if (scroll) {
    return (
      <Scroll className={className} style={{ gridArea: 'body' }}>
        {children}
      </Scroll>
    );
  }
  // `clip`, not `hidden`: a hidden overflow is still a scroll container, so
  // focusing a control below the fold would scroll the body with no way back.
  return (
    <div className={cn('relative min-h-0 min-w-0 overflow-clip', className)} style={{ gridArea: 'body' }}>
      {children}
    </div>
  );
}

function Footer({ className, children }: SlotProps) {
  if (!hasContent(children)) return null;
  return (
    <div
      className={cn('flex flex-none items-center min-h-10 px-2 border-t border-edge-muted overflow-hidden', className)}
      style={{ gridArea: 'footer' }}
    >
      {children}
    </div>
  );
}

/**
 * A depth-aware container with fixed header, toolbar and footer slots around
 * a body that takes the remaining height. Put titles in Header and controls
 * in Toolbar so heights line up across panels; use `Body scroll` rather than
 * your own overflow.
 */
export const Panel = Object.assign(Root, { Toolbar, Header, Footer, Body });
