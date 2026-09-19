import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * A role and its utility. `className` must be a literal utility string, so
 * Tailwind sees it in source and emits it.
 */
export type SwatchEntry = { name: string; className: string; note?: string };

/** One color role: a filled tile, then its utility name and what it is for. */
export function Swatch({ name, className, note }: SwatchEntry) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <div className={cn('h-12 w-full rounded-md border border-edge-muted', className)} />
      <span className="font-mono text-xs text-ink">{name}</span>
      {note && <span className="text-xs text-ink-subtle">{note}</span>}
    </div>
  );
}

export function SwatchGrid({ entries }: { entries: SwatchEntry[] }) {
  return (
    <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {entries.map((entry) => (
        <Swatch key={entry.name} {...entry} />
      ))}
    </div>
  );
}

/** A table of names, values and uses, for the foundations that are numbers. */
export function SpecTable({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <table className="w-full max-w-3xl text-sm">
      <thead>
        <tr className="border-b border-edge-muted text-left text-xs text-ink-subtle">
          {head.map((cell) => (
            <th key={cell} className="py-1.5 pr-4 font-medium">
              {cell}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={index} className="border-b border-edge-muted">
            {row.map((cell, column) => (
              <td
                key={column}
                className={cn(
                  'py-1.5 pr-4 text-xs',
                  column === 0 ? 'font-mono text-ink' : 'text-ink-muted'
                )}
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
