import type { ComponentType, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Button } from './Button';

export type PillButtonTone = 'cta' | 'subtle';

export interface PillButtonProps {
  /** `cta` is the primary action; `subtle` a quiet ink-tinted pill. */
  tone?: PillButtonTone;
  /** An optional leading icon, such as a plus for a create action. */
  icon?: ComponentType<{ className?: string }>;
  onClick: () => void;
  className?: string;
  children: ReactNode;
}

/**
 * A rounded-full pill for empty states and setup cards. Tight vertical
 * padding; a leading icon tightens the left padding so the icon, not the
 * pill's edge, sets the rhythm.
 */
export function PillButton({ tone, icon: Icon, onClick, className, children }: PillButtonProps) {
  const subtle = tone === 'subtle';
  return (
    <Button
      variant={subtle ? 'outlined' : 'cta'}
      size="md"
      className={cn('rounded-full py-1', subtle ? 'bg-ink/5 px-2.5' : Icon ? 'pl-3 pr-4' : 'px-4', className)}
      onClick={onClick}
    >
      {Icon && <Icon className="size-4" />}
      {children}
    </Button>
  );
}
