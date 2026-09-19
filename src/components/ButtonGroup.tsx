import { createContext, type ReactNode, useContext } from 'react';
import { cn } from '@/lib/cn';
import { createVariants } from '@/lib/variants';
import type { ButtonSize, ButtonVariant } from './Button';
import { type Depth, Layer } from './Layer';

type Orientation = 'horizontal' | 'vertical';

type ButtonGroupContextValue = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  orientation: Orientation;
};

const ButtonGroupContext = createContext<ButtonGroupContextValue | undefined>(undefined);

/** The enclosing ButtonGroup's variant, size and orientation, if any. */
export const useButtonGroupContext = () => useContext(ButtonGroupContext);

// The group frame takes a focus ring when an input-group control inside it has focus.
const groupFocusRing =
  'has-[[data-slot=input-group-control]:focus-visible]:border-[color-mix(in_oklch,var(--color-edge)_80%,var(--color-ink))] has-[[data-slot=input-group-control]:focus-visible]:ring-2 has-[[data-slot=input-group-control]:focus-visible]:ring-edge-muted';

/** Canonical classes for the button-group frame. */
export const buttonGroupVariants = createVariants(
  cn(
    'inline-flex items-center justify-center',
    'data-[orientation=horizontal]:flex-row',
    'data-[orientation=vertical]:flex-col',
    '**:data-button:rounded-none **:data-button:border-0'
  ),
  {
    variant: {
      danger: cn('border-1 border-failure/50', groupFocusRing),
      outlined: cn('border-1 border-edge-muted', groupFocusRing),
      accent: cn('border-1 border-accent', groupFocusRing),
      ghost: '',
      cta: cn('border-1 border-transparent', groupFocusRing),
    },
    size: {
      sm: 'rounded-md data-[orientation=horizontal]:h-6',
      md: 'rounded-md',
      'icon-sm': 'rounded-md data-[orientation=horizontal]:h-6 data-[orientation=vertical]:w-6',
      'icon-md': 'rounded-md data-[orientation=horizontal]:h-8 data-[orientation=vertical]:w-8',
    },
  },
  { variant: 'ghost', size: 'md' }
);

/** Divider classes; `variant` picks the rule color. */
export const buttonGroupDividerVariants = createVariants(
  cn('shrink-0 self-stretch', 'data-[orientation=horizontal]:w-px', 'data-[orientation=vertical]:h-px'),
  {
    variant: {
      danger: 'bg-failure/50',
      outlined: 'bg-edge-muted',
      accent: 'bg-accent',
      ghost: 'bg-edge-muted',
      cta: 'bg-surface/50',
    },
  },
  { variant: 'outlined' }
);

export type ButtonGroupProps = {
  depth?: Depth;
  variant?: ButtonVariant;
  size?: ButtonSize;
  orientation?: Orientation;
  className?: string;
  children?: ReactNode;
  'aria-label'?: string;
};

/**
 * Buttons joined into one frame. The group owns the rim, the rounding and
 * the glass; its buttons take its variant and size unless they set their own.
 */
function Root({ depth, variant, size = 'md', orientation = 'horizontal', className, children, ...props }: ButtonGroupProps) {
  return (
    <ButtonGroupContext.Provider value={{ variant, size, orientation }}>
      <Layer depth={depth ?? 0}>
        <div
          {...props}
          data-slot="button-group"
          data-orientation={orientation}
          data-size={size}
          role="group"
          className={cn(buttonGroupVariants({ variant, size }), variant && variant !== 'ghost' && 'glass', className)}
        >
          <div className="flex size-full min-w-0 items-center justify-center overflow-hidden rounded-[inherit] [flex-direction:inherit]">
            {children}
          </div>
        </div>
      </Layer>
    </ButtonGroupContext.Provider>
  );
}

/** A rule between two buttons of the group. */
function Divider({ className }: { className?: string }) {
  const group = useButtonGroupContext();
  const orientation = group?.orientation ?? 'horizontal';
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      data-orientation={orientation}
      className={cn(buttonGroupDividerVariants({ variant: group?.variant }), className)}
    />
  );
}

export const ButtonGroup = Object.assign(Root, { Divider });
