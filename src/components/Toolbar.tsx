import { Toolbar as Base } from '@base-ui/react/toolbar';
import type { ComponentProps } from 'react';
import { type ButtonSize, type ButtonVariant, buttonClasses } from '@/components/Button';
import { Tooltip } from '@/components/Tooltip';
import { cn } from '@/lib/cn';

type Classed<T> = Omit<T, 'className'> & { className?: string };

/**
 * A floating bar of compact actions. It owns its frame: glass, a hairline
 * edge, rounded-xl. Arrow keys move between its buttons.
 */
function Root({ className, ...props }: Classed<ComponentProps<typeof Base.Root>>) {
  return (
    <Base.Root
      {...props}
      className={cn(
        'glass flex w-fit items-center gap-0.5 rounded-xl border border-edge-muted bg-menu-glass p-1',
        'data-[orientation=vertical]:flex-col',
        className
      )}
    />
  );
}

/** Related buttons that belong together. */
function Group({ className, ...props }: Classed<ComponentProps<typeof Base.Group>>) {
  return (
    <Base.Group
      {...props}
      className={cn('flex items-center gap-0.5 data-[orientation=vertical]:flex-col', className)}
    />
  );
}

/** A hairline between groups; it turns to match the toolbar. */
function Separator({ className, ...props }: Classed<ComponentProps<typeof Base.Separator>>) {
  return (
    <Base.Separator
      {...props}
      className={cn(
        'shrink-0 bg-edge data-[orientation=vertical]:mx-1 data-[orientation=vertical]:h-4 data-[orientation=vertical]:w-px',
        'data-[orientation=horizontal]:my-1 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-4',
        className
      )}
    />
  );
}

/** Pushes what follows to the far end. */
function Spacer() {
  return <span aria-hidden className="flex-1" />;
}

type ButtonProps = Classed<ComponentProps<typeof Base.Button>> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** The accessible name and tooltip. Required for an icon-only button. */
  label?: string;
  shortcut?: string;
};

/** A ghost button by default, `icon-sm` for an icon alone. */
function Button({ variant = 'ghost', size = 'icon-sm', label, shortcut, className, ...props }: ButtonProps) {
  const button = (
    <Base.Button
      aria-label={label}
      {...props}
      className={cn(buttonClasses({ variant, size }), className)}
    />
  );
  if (!label) return button;
  return (
    <Tooltip content={label} shortcut={shortcut}>
      {button}
    </Tooltip>
  );
}

export const Toolbar = { Root, Group, Separator, Spacer, Button };
