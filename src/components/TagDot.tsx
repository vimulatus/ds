import type { ComponentProps, CSSProperties } from 'react';
import { cn } from '@/lib/cn';

export type TagDotSize = 'sm' | 'md';

export type TagDotProps = Omit<ComponentProps<'span'>, 'children' | 'style'> & {
  size?: TagDotSize;
} & ({ fill?: string; fills?: never } | { fill?: never; fills: readonly string[] });

/** One flat color, or a pie of up to four distinct fills weighted by how often each repeats. */
function fillStyle(fill: string | undefined, fills: readonly string[] | undefined): CSSProperties {
  const counts = new Map<string, number>();
  for (const color of fills ?? []) {
    if (counts.has(color) || counts.size < 4) counts.set(color, (counts.get(color) ?? 0) + 1);
  }
  if (counts.size <= 1) {
    return { backgroundColor: counts.keys().next().value ?? fill ?? 'var(--color-ink-extra-muted)' };
  }
  const total = [...counts.values()].reduce((sum, count) => sum + count, 0);
  let start = 0;
  const slices = [...counts].map(([color, count]) => {
    const end = start + (count / total) * 100;
    const slice = `${color} ${start}% ${end}%`;
    start = end;
    return slice;
  });
  return { backgroundImage: `conic-gradient(${slices.join(', ')})` };
}

/**
 * A color dot. Pass one `fill`, or `fills` for up to four pie slices in input
 * order; a repeated fill takes a bigger share. Pair it with a text label so
 * color is never the only identifier.
 */
export function TagDot({ fill, fills, size = 'md', className, ...props }: TagDotProps) {
  return (
    <span
      aria-hidden
      {...props}
      data-slot="tag-dot"
      data-size={size}
      className={cn('inline-block shrink-0 rounded-full', size === 'sm' ? 'size-2' : 'size-2.5', className)}
      style={fillStyle(fill, fills)}
    />
  );
}
