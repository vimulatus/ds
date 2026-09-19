import type { ComponentProps, CSSProperties } from 'react';
import { cn } from '@/lib/cn';
import { type Depth, Layer } from './Layer';

export type SurfaceProps = ComponentProps<'div'> & {
  depth?: Depth;
  edgeColor?: string;
  highlightColor?: string;
  active?: boolean;
  /** Accepted for parity with the old API; it changes nothing. */
  solid?: boolean;
  hideBorder?: boolean;
};

/** Inline style of a surface: a hairline edge, and a ring while `active`. */
export function surfaceStyle({
  edgeColor,
  highlightColor,
  active,
  hideBorder,
  style,
}: Pick<SurfaceProps, 'edgeColor' | 'highlightColor' | 'active' | 'hideBorder' | 'style'>): CSSProperties {
  return {
    ...(hideBorder ? {} : { border: `var(--app-border-width, 0.5px) solid ${edgeColor ?? 'var(--color-edge)'}` }),
    ...(active
      ? { boxShadow: `0 0 0 2px color-mix(in srgb, ${highlightColor ?? 'var(--color-edge)'} 60%, transparent)` }
      : {}),
    ...style,
  };
}

export const SURFACE_CLASS = 'relative rounded-md overflow-clip min-h-0 size-full bg-surface';

/** A painted pane at a depth: `bg-surface` for that depth, and a hairline edge. */
export function Surface({
  depth = 0,
  edgeColor,
  highlightColor,
  active,
  hideBorder,
  style,
  className,
  solid: _solid,
  ...props
}: SurfaceProps) {
  return (
    <Layer depth={depth}>
      <div
        {...props}
        data-surface=""
        style={surfaceStyle({ edgeColor, highlightColor, active, hideBorder, style })}
        className={cn(SURFACE_CLASS, className)}
      />
    </Layer>
  );
}
