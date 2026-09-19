import { createContext, type ReactNode, useContext } from 'react';

export type Depth = 0 | 1 | 2 | 3 | 4;

const LayerContext = createContext<Depth>(0);

const clamp = (depth: number) => Math.min(4, Math.max(0, depth)) as Depth;

export type LayerProps = {
  children?: ReactNode;
  /** An absolute depth. Omit it to inherit the parent's. */
  depth?: Depth;
  /** Steps added to the depth, such as 1 to sit one above the parent. */
  offset?: number;
};

/**
 * Marks a subtree with an absolute or parent-relative surface depth.
 * bg-surface, bg-hover and bg-input step one shade lighter per depth.
 * Renders no box of its own.
 */
export function Layer({ depth, offset = 0, children }: LayerProps) {
  const parent = useContext(LayerContext);
  const resolved = clamp((depth ?? parent) + offset);
  return (
    <LayerContext.Provider value={resolved}>
      <div data-layer="" data-depth={resolved} style={{ display: 'contents' }}>
        {children}
      </div>
    </LayerContext.Provider>
  );
}
