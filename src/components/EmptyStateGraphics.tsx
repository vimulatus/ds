import { type ReactNode, useId } from 'react';

type GraphicProps = { className?: string };

/**
 * The shared base of the empty-state drawings: a glass slab tilted a few
 * degrees, with a symbol on its face. Everything draws in currentColor, so the
 * panel's tone tints it. Inside `.empty-state-graphic` the slab (`es-slab`)
 * rises in while each child of the symbol (`es-icon`) drops in after it.
 * Ids are per instance, so two drawings on one page keep their own gradients.
 */
function Slab({
  label,
  symbol,
  className,
}: GraphicProps & { label: string; symbol: (id: string) => ReactNode }) {
  const id = useId();
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="240"
      height="180"
      viewBox="0 0 240 180"
      role="img"
      aria-label={label}
      className={className}
    >
      <defs>
        <linearGradient id={`${id}-base-body`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="currentColor" stopOpacity=".14" />
          <stop offset="1" stopColor="currentColor" stopOpacity=".035" />
        </linearGradient>
        <linearGradient id={`${id}-base-rim`} x1="0" y1="0" x2=".75" y2="1">
          <stop stopColor="currentColor" stopOpacity=".65" />
          <stop offset=".5" stopColor="currentColor" stopOpacity=".26" />
          <stop offset="1" stopColor="currentColor" stopOpacity=".12" />
        </linearGradient>
        <linearGradient id={`${id}-base-side`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="currentColor" stopOpacity=".08" />
          <stop offset="1" stopColor="currentColor" stopOpacity=".16" />
        </linearGradient>
      </defs>
      <g transform="rotate(-7 120 92)">
        <g className="es-slab">
          <g id={`${id}-base-thickness`}>
            <path
              d="M66 118v6a12 12 0 0 0 12 12h84a12 12 0 0 0 12-12v-6a12 12 0 0 1-12 12H78a12 12 0 0 1-12-12Z"
              fill={`url(#${id}-base-side)`}
              stroke="currentColor"
              strokeOpacity=".16"
              strokeWidth=".8"
            />
          </g>
          <g id={`${id}-base-front-pane`}>
            <rect
              x="66"
              y="46"
              width="108"
              height="84"
              rx="12"
              fill={`url(#${id}-base-body)`}
              stroke={`url(#${id}-base-rim)`}
              strokeWidth="1"
            />
            <path d="M79 48h80" stroke="currentColor" strokeOpacity=".13" strokeLinecap="round" />
            <path d="M80 128h80" stroke="currentColor" strokeOpacity=".16" strokeLinecap="round" />
          </g>
        </g>
        {symbol(id)}
      </g>
    </svg>
  );
}

/** A magnifier. */
export function NoSearchResultsGraphic({ className }: GraphicProps) {
  return (
    <Slab
      label="No search results"
      className={className}
      symbol={(id) => (
        <g
          id={`${id}-base-symbol`}
          className="es-icon"
          stroke="currentColor"
          strokeOpacity=".72"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <g>
            <circle cx="116" cy="84" r="13" fill="none" strokeWidth="2" />
            <path d="m126 94 12 12" strokeWidth="2" />
          </g>
        </g>
      )}
    />
  );
}

/** A funnel. */
export function NoFilterResultsGraphic({ className }: GraphicProps) {
  return (
    <Slab
      label="No filtered results"
      className={className}
      symbol={(id) => (
        <g
          id={`${id}-base-symbol`}
          className="es-icon"
          stroke="currentColor"
          strokeOpacity=".72"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M102 74h36l-14 17v12l-8 4V91Z" fill="none" strokeWidth="2" />
        </g>
      )}
    />
  );
}

/** 404, one digit at a time. */
export function NotFoundGraphic({ className }: GraphicProps) {
  return (
    <Slab
      label="Page not found"
      className={className}
      symbol={(id) => (
        <g
          id={`${id}-base-symbol`}
          className="es-icon"
          stroke="currentColor"
          strokeOpacity=".72"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M98 77l-8 16h14M100 77v24" fill="none" strokeWidth="2" />
          <path d="M116 77h9v24h-9Z" fill="none" strokeWidth="2" />
          <path d="M140 77l-8 16h14M142 77v24" fill="none" strokeWidth="2" />
        </g>
      )}
    />
  );
}

/** An exclamation mark. */
export function ErrorGraphic({ className }: GraphicProps) {
  return (
    <Slab
      label="Something went wrong"
      className={className}
      symbol={(id) => (
        <g id={`${id}-base-error-mark`} className="es-icon" stroke="currentColor" strokeOpacity=".72" strokeLinecap="round">
          <path d="M120 75v18" strokeWidth="2.5" />
          <circle cx="120" cy="101" r="1.5" fill="currentColor" fillOpacity=".72" stroke="none" />
        </g>
      )}
    />
  );
}
