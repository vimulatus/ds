import { Toolbar as Base } from '@base-ui/react/toolbar';
import { type ComponentProps, createContext, type ReactNode, useContext } from 'react';
import { Button, type ButtonProps, type ButtonSize, type ButtonVariant } from '@/components/Button';
import { type Depth, Layer } from '@/components/Layer';
import { cn } from '@/lib/cn';

type ToolbarOrientation = 'horizontal' | 'vertical';

type ToolbarContextValue = {
  size: ButtonSize;
  variant: ButtonVariant;
  orientation: ToolbarOrientation;
};

const ToolbarContext = createContext<ToolbarContextValue>({
  size: 'md',
  variant: 'ghost',
  orientation: 'horizontal',
});

export type ToolbarProps = Omit<ComponentProps<typeof Base.Root>, 'className' | 'orientation'> & {
  className?: string;
  depth?: Depth;
  orientation?: ToolbarOrientation;
  /** Default size for `Toolbar.Button` children. Defaults to `md`. */
  size?: ButtonSize;
  /** Default variant for `Toolbar.Button` children. Defaults to `ghost`. */
  variant?: ButtonVariant;
};

/**
 * A floating bar of controls. It owns its frame (rounded-xl, padding, edge,
 * surface, shadow) and sets the default size and variant of its
 * `Toolbar.Button`s. Arrow keys move between the buttons.
 */
function ToolbarRoot({
  depth = 2,
  orientation = 'horizontal',
  size = 'md',
  variant = 'ghost',
  className,
  ...props
}: ToolbarProps) {
  return (
    <ToolbarContext.Provider value={{ size, variant, orientation }}>
      <Layer depth={depth}>
        <Base.Root
          data-slot="toolbar"
          orientation={orientation}
          {...props}
          className={cn(
            'inline-flex items-center gap-1 rounded-xl border border-edge bg-surface p-1.5 shadow-lg',
            'data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch',
            className
          )}
        />
      </Layer>
    </ToolbarContext.Provider>
  );
}

export type ToolbarButtonProps = ButtonProps;

/** A `Button` that takes the toolbar's default size and variant, and joins its arrow-key order. */
function ToolbarButton({ size, variant, ...props }: ToolbarButtonProps) {
  const context = useContext(ToolbarContext);
  return (
    <Base.Button
      render={<Button size={size ?? context.size} variant={variant ?? context.variant} {...props} />}
    />
  );
}

export type ToolbarGroupProps = { className?: string; children?: ReactNode };

/** Related controls, spaced tighter than the toolbar. */
function ToolbarGroup({ className, children }: ToolbarGroupProps) {
  const { orientation } = useContext(ToolbarContext);
  return (
    <div
      role="group"
      data-slot="toolbar-group"
      data-orientation={orientation}
      className={cn(
        'inline-flex items-center gap-0.5',
        'data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch',
        className
      )}
    >
      {children}
    </div>
  );
}

export type ToolbarDividerProps = { className?: string };

/** A hairline between clusters, turned to match the toolbar. */
function ToolbarDivider({ className }: ToolbarDividerProps) {
  const { orientation } = useContext(ToolbarContext);
  return (
    <div
      role="separator"
      aria-orientation={orientation === 'horizontal' ? 'vertical' : 'horizontal'}
      data-orientation={orientation}
      className={cn(
        'shrink-0 self-stretch bg-edge-muted',
        'data-[orientation=horizontal]:mx-0.5 data-[orientation=horizontal]:my-1 data-[orientation=horizontal]:w-px',
        'data-[orientation=vertical]:my-0.5 data-[orientation=vertical]:mx-1 data-[orientation=vertical]:h-px',
        className
      )}
    />
  );
}

/** Pushes the controls after it to the far end. */
function ToolbarSpacer() {
  return <div data-slot="toolbar-spacer" className="grow" />;
}

export const Toolbar = Object.assign(ToolbarRoot, {
  Button: ToolbarButton,
  Group: ToolbarGroup,
  Divider: ToolbarDivider,
  Spacer: ToolbarSpacer,
});
