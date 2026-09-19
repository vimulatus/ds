import type { ReactNode } from 'react';

export type SwatchEntry = { token: string; note?: string };

/** One color token: a filled tile, then its name and what it is for. */
export function Swatch({ token, note }: SwatchEntry) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <div
        className="h-12 w-full rounded-md border border-edge-muted"
        style={{ backgroundColor: `var(--color-${token})` }}
      />
      <span className="font-mono text-xs text-ink">{token}</span>
      <span className="text-xs text-ink-subtle">{note ?? ''}</span>
    </div>
  );
}

export function SwatchGrid({ tokens }: { tokens: SwatchEntry[] }) {
  return (
    <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {tokens.map((entry) => (
        <Swatch key={entry.token} {...entry} />
      ))}
    </div>
  );
}

export function Section({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        {note && <p className="text-sm text-ink-muted">{note}</p>}
      </div>
      {children}
    </section>
  );
}
