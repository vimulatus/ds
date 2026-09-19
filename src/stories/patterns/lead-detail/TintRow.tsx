import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type TintTone = 'accent' | 'warning' | 'red';

const TONE: Record<TintTone, { row: string; label: string }> = {
  accent: { row: 'bg-accent-bg', label: 'text-accent-ink' },
  warning: { row: 'bg-warning-bg', label: 'text-warning-ink' },
  red: { row: 'bg-red-bg', label: 'text-red-ink' },
};

/**
 * One state of the lead on a tinted row: an icon and a label in the tone's
 * ink, the facts in `ink`, then the actions on the right. The follow-up and
 * a closed enquiry's outcome share this shape.
 */
export function TintRow({
  tone,
  icon,
  label,
  actions,
  children,
  'aria-label': ariaLabel,
}: {
  tone: TintTone;
  icon: ReactNode;
  label: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  'aria-label'?: string;
}) {
  return (
    <div
      role="region"
      aria-label={ariaLabel}
      className={cn(
        'flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl px-3 py-2.5 text-sm',
        TONE[tone].row
      )}
    >
      <span
        className={cn(
          'flex shrink-0 items-center gap-1.5 font-medium [&_svg]:size-4',
          TONE[tone].label
        )}
      >
        {icon}
        {label}
      </span>
      <span className="min-w-0 basis-full text-ink @[480px]/article:flex-1 @[480px]/article:basis-auto @[480px]/article:truncate">
        {children}
      </span>
      {actions && <span className="ml-auto flex shrink-0 items-center gap-1">{actions}</span>}
    </div>
  );
}
