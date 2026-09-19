import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Scroll } from './Scroll';
import { Surface, type SurfaceProps } from './Surface';

export type PanelProps = SurfaceProps;

type SlotProps = { className?: string; children?: ReactNode };
type BodyProps = SlotProps & { scroll?: boolean };

const hasContent = (children: ReactNode) => children !== undefined && children !== null && children !== false;

function Root({ style, className, ...props }: PanelProps) {
  return (
    <Surface
      {...props}
      style={{
        gridTemplateAreas: '"header" "toolbar" "body" "footer"',
        gridTemplateRows: 'auto auto minmax(0, 1fr) auto',
        gridTemplateColumns: 'minmax(0, 1fr)',
        ...style,
      }}
      className={cn('grid min-h-0 min-w-0 bg-panel', className)}
    />
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
