import type { ReactNode } from 'react';

export type Depth = 0 | 1 | 2 | 3 | 4;

/**
 * Sets the depth for everything inside. bg-surface, bg-hover and bg-input
 * step one shade lighter per depth, so a card on a card still reads.
 * Renders no box of its own.
 */
export function Layer({ depth, children }: { depth: Depth; children: ReactNode }) {
  return (
    <div data-depth={depth} className="contents">
      {children}
    </div>
  );
}
