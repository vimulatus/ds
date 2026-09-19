import { Tabs as Base } from '@base-ui/react/tabs';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type Tab = { value: string; label: ReactNode; disabled?: boolean };

export type TabsProps = {
  list: Tab[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Tabs share the width equally. */
  fullWidth?: boolean;
  /** `TabsPanel`s, one per tab. Leave empty when the tabs filter content elsewhere. */
  children?: ReactNode;
  className?: string;
};

/**
 * Switches between views of one thing. A hairline runs under the row and
 * an underline slides to the active tab; labels step from `ink-subtle` to
 * `ink`. Arrow keys move between tabs.
 */
export function Tabs({
  list,
  value,
  defaultValue,
  onValueChange,
  fullWidth,
  children,
  className,
}: TabsProps) {
  return (
    <Base.Root
      value={value}
      defaultValue={defaultValue ?? list[0]?.value}
      onValueChange={(next) => onValueChange?.(String(next))}
      className={cn('flex flex-col', className)}
    >
      <Base.List className="relative flex items-center gap-1 border-b border-edge-muted">
        {list.map((tab) => (
          <Base.Tab
            key={tab.value}
            value={tab.value}
            disabled={tab.disabled}
            className={cn(
              'flex h-8 select-none items-center justify-center whitespace-nowrap rounded-md px-2 text-sm font-medium text-ink-subtle outline-none transition-colors',
              'hover:text-ink focus-visible:focus-ring data-active:text-ink',
              'data-disabled:pointer-events-none data-disabled:text-ink-disabled',
              fullWidth && 'flex-1'
            )}
          >
            {tab.label}
          </Base.Tab>
        ))}
        <Base.Indicator className="absolute -bottom-px left-0 h-0.5 w-(--active-tab-width) translate-x-(--active-tab-left) rounded-full bg-ink transition-[translate,width] duration-200 ease-out" />
      </Base.List>
      {children}
    </Base.Root>
  );
}

/** The content of one tab. */
export function TabsPanel({ className, ...props }: Omit<ComponentProps<typeof Base.Panel>, 'className'> & { className?: string }) {
  return <Base.Panel {...props} className={cn('pt-3 outline-none focus-visible:focus-ring', className)} />;
}
