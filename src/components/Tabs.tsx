import { Tabs as Base } from '@base-ui/react/tabs';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type TabItem = {
  value: string;
  label: string | (() => ReactNode);
};

export type TabsProps = {
  list: TabItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  itemClass?: string;
  labelClass?: string;
  fullWidth?: boolean;
  'aria-label'?: string;
};

/**
 * A borderless switcher. No track: a hairline pill with the `active` scrim
 * slides behind the checked item. It renders no panels; show the content
 * for `value` yourself.
 */
export function Tabs({
  list,
  value,
  defaultValue,
  onChange,
  disabled,
  className,
  itemClass,
  labelClass,
  fullWidth,
  'aria-label': ariaLabel,
}: TabsProps) {
  return (
    <Base.Root
      value={value}
      defaultValue={defaultValue ?? list[0]?.value}
      onValueChange={(next) => onChange?.(String(next))}
      className="contents"
    >
      <Base.List
        activateOnFocus
        aria-label={ariaLabel}
        className={cn('relative inline-flex h-8 items-center', fullWidth && 'flex w-full', className)}
      >
        <Base.Indicator className="pointer-events-none absolute top-0 left-0 z-0 h-(--active-tab-height) w-(--active-tab-width) [transform:translateX(var(--active-tab-left))] rounded-xl border border-edge-muted bg-active transition-[transform,width,height] duration-50" />
        {list.map((item) => (
          <Base.Tab
            key={item.value}
            value={item.value}
            disabled={disabled}
            className={cn(
              'relative z-1 rounded-full focus-visible:ring-2 focus-visible:ring-accent/20',
              fullWidth && 'flex-1',
              itemClass
            )}
          >
            <span
              className={cn(
                'flex h-8 items-center px-4 text-xs font-medium rounded-full select-none',
                'text-ink-extra-muted hover:text-ink in-data-active:text-ink',
                fullWidth && 'w-full justify-center',
                labelClass
              )}
            >
              {typeof item.label === 'function' ? item.label() : item.label}
            </span>
          </Base.Tab>
        ))}
      </Base.List>
    </Base.Root>
  );
}
