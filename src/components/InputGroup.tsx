import { X } from '@phosphor-icons/react';
import {
  type ComponentProps,
  createContext,
  type Ref,
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { cn } from '@/lib/cn';
import { createVariants, type VariantProps } from '@/lib/variants';
import { Button, type ButtonProps, type ButtonSize } from './Button';
import { useButtonGroupContext } from './ButtonGroup';
import { Input, type InputProps, type InputSize, type InputVariant } from './Input';

const INPUT_GROUP_SIZE_VARIANTS: Record<InputSize, string> = {
  sm: 'h-6 text-xs',
  md: 'h-8 text-base',
};

const INPUT_GROUP_ADDON_PADDING: Record<InputSize, { start: string; end: string; buttonEnd: string }> = {
  sm: {
    start: 'ps-2',
    end: 'pe-2',
    buttonEnd: '[&:has([data-button])]:pe-0',
  },
  md: {
    start: 'ps-2',
    end: 'pe-2',
    buttonEnd: '[&:has([data-button])]:pe-1',
  },
};

const INPUT_GROUP_BUTTON_SIZE: Record<InputSize, ButtonSize> = {
  sm: 'icon-sm',
  md: 'sm',
};

/** Canonical variants for a framed input composition. */
export const inputGroupVariants = createVariants(
  cn(
    'group/input-group relative flex w-full min-w-0 items-center overflow-hidden rounded-md border transition-[background-color,border-color,box-shadow]',
    'has-[[data-slot=input-group-control]:disabled]:pointer-events-none has-[[data-slot=input-group-control]:disabled]:opacity-50',
    'has-[[data-slot=input-group-control][aria-invalid=true]]:border-failure has-[[data-slot=input-group-control][aria-invalid=true]]:ring-2 has-[[data-slot=input-group-control][aria-invalid=true]]:ring-failure/20'
  ),
  {
    variant: {
      outlined: cn(
        'border-edge-muted bg-input',
        'has-[[data-slot=input-group-control]:focus-visible]:border-[color-mix(in_oklch,var(--color-edge)_80%,var(--color-ink))] has-[[data-slot=input-group-control]:focus-visible]:ring-2 has-[[data-slot=input-group-control]:focus-visible]:ring-edge-muted'
      ),
      ghost: 'border-transparent bg-transparent',
    },
    size: INPUT_GROUP_SIZE_VARIANTS,
  },
  { variant: 'outlined', size: 'md' }
);

export type InputGroupVariantProps = VariantProps<typeof inputGroupVariants>;
export type InputGroupAddonAlign = 'inline-start' | 'inline-end';

type InputGroupContextValue = {
  size: InputSize;
  control: { current: HTMLInputElement | null };
  hasValue: boolean;
  canClear: boolean;
  setControlState: (state: { hasValue: boolean; canClear: boolean }) => void;
  clear: () => void;
  focus: () => void;
};

const InputGroupContext = createContext<InputGroupContextValue | undefined>(undefined);

function useInputGroupContext(): InputGroupContextValue {
  const context = useContext(InputGroupContext);
  if (!context) throw new Error('InputGroup slots must be used inside InputGroup');
  return context;
}

// React tracks an input's value through its own setter; set it through the
// native one so the dispatched input event reaches onChange and onValueChange.
const setNativeValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;

export type InputGroupProps = Omit<ComponentProps<'div'>, 'size'> & {
  size?: InputSize;
  variant?: InputVariant;
};

function InputGroupRoot({ children, className, size: sizeProp, variant: variantProp, ...props }: InputGroupProps) {
  const buttonGroup = useButtonGroupContext();
  const control = useRef<HTMLInputElement | null>(null);
  const [state, setState] = useState({ hasValue: false, canClear: false });
  const setControlState = useCallback(
    (next: { hasValue: boolean; canClear: boolean }) =>
      setState((current) =>
        current.hasValue === next.hasValue && current.canClear === next.canClear ? current : next
      ),
    []
  );
  const inheritedSize =
    buttonGroup?.size && !buttonGroup.size.startsWith('icon-') ? (buttonGroup.size as InputSize) : undefined;
  const size: InputSize = sizeProp ?? inheritedSize ?? 'md';
  const variant: InputVariant = variantProp ?? (buttonGroup?.variant === 'ghost' ? 'ghost' : 'outlined');
  const grouped = buttonGroup !== undefined;

  const context: InputGroupContextValue = {
    size,
    control,
    hasValue: state.hasValue,
    canClear: state.canClear,
    setControlState,
    clear() {
      const element = control.current;
      if (!element) return;
      setNativeValue?.call(element, '');
      element.dispatchEvent(new Event('input', { bubbles: true }));
      queueMicrotask(() => element.focus());
    },
    focus: () => control.current?.focus(),
  };

  return (
    <InputGroupContext.Provider value={context}>
      <div
        data-slot="input-group"
        data-size={size}
        data-variant={variant}
        data-grouped={grouped ? '' : undefined}
        role="group"
        {...props}
        className={cn(
          inputGroupVariants({ size, variant }),
          grouped &&
            'flex-1 rounded-none border-0 bg-transparent has-[[data-slot=input-group-control]:focus-visible]:ring-0',
          className
        )}
      >
        {children}
      </div>
    </InputGroupContext.Provider>
  );
}

export type InputGroupInputProps = Omit<InputProps, 'size' | 'variant'>;

function InputGroupInput({ className, disabled, readOnly, ref, value, onInput, ...props }: InputGroupInputProps) {
  const group = useInputGroupContext();
  const [hasUncontrolledValue, setHasUncontrolledValue] = useState(false);
  const hasValue = value === undefined ? hasUncontrolledValue : String(value).length > 0;
  const canClear = !disabled && !readOnly;
  const { setControlState } = group;
  useLayoutEffect(() => setControlState({ hasValue, canClear }), [hasValue, canClear, setControlState]);

  const attach = useCallback(
    (element: HTMLInputElement | null) => {
      group.control.current = element;
      if (element) setHasUncontrolledValue(element.value.length > 0);
      assignRef(ref, element);
    },
    [group.control, ref]
  );

  return (
    <Input
      {...props}
      ref={attach}
      value={value}
      disabled={disabled}
      readOnly={readOnly}
      size={group.size}
      variant="ghost"
      data-slot="input-group-control"
      onInput={(event) => {
        setHasUncontrolledValue(event.currentTarget.value.length > 0);
        onInput?.(event);
      }}
      className={cn(
        'h-full flex-1 rounded-none border-0 bg-transparent px-2 focus-visible:ring-0 aria-invalid:ring-0 [&::-webkit-search-cancel-button]:hidden',
        className
      )}
    />
  );
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') ref(value);
  else if (ref) ref.current = value;
}

export type InputGroupAddonProps = ComponentProps<'div'> & {
  align?: InputGroupAddonAlign;
};

function InputGroupAddon({ align = 'inline-start', children, className, onClick, ...props }: InputGroupAddonProps) {
  const group = useInputGroupContext();
  const padding = INPUT_GROUP_ADDON_PADDING[group.size];

  return (
    <div
      data-slot="input-group-addon"
      data-align={align}
      {...props}
      className={cn(
        'flex shrink-0 items-center justify-center text-ink-subtle [&>svg]:pointer-events-none [&>svg]:shrink-0 [&>svg:not([class*=size-])]:size-[1em]',
        align === 'inline-start'
          ? cn('order-first pe-0', padding.start)
          : cn('order-last ps-0', padding.end, padding.buttonEnd),
        className
      )}
      onClick={(event) => {
        onClick?.(event);
        if ((event.target as HTMLElement).closest('button')) return;
        group.focus();
      }}
    >
      {children}
    </div>
  );
}

export type InputGroupButtonProps = ButtonProps;

function InputGroupButton({ className, noTouchResize, size, square, variant, ...props }: InputGroupButtonProps) {
  const group = useInputGroupContext();
  return (
    <Button
      {...props}
      variant={variant ?? 'ghost'}
      size={size ?? INPUT_GROUP_BUTTON_SIZE[group.size]}
      square={square}
      noTouchResize={noTouchResize ?? true}
      className={cn('rounded-sm', className)}
    />
  );
}

export type InputGroupClearButtonProps = { className?: string };

function InputGroupClearButton({ className }: InputGroupClearButtonProps) {
  const group = useInputGroupContext();
  if (!group.hasValue || !group.canClear) return null;
  return (
    <InputGroupButton
      type="button"
      square
      aria-label="Clear input"
      className={className}
      onPointerDown={(event) => event.preventDefault()}
      onClick={() => group.clear()}
    >
      <X />
    </InputGroupButton>
  );
}

/**
 * A shared input frame for icons, inline actions, and adjacent Buttons.
 *
 * @do Put exactly one `InputGroup.Input` inside the root.
 * @do Put icons and actions in `InputGroup.Addon` and set their visual edge
 *   with `align`; DOM order does not determine placement.
 * @do Use `InputGroup.ClearButton` for the standard reactive clear action.
 * @do Nest the root in `ButtonGroup` when it must share a frame with sibling
 *   Buttons; size and framing are inherited by the group, not the input.
 */
export const InputGroup = Object.assign(InputGroupRoot, {
  Addon: InputGroupAddon,
  Button: InputGroupButton,
  ClearButton: InputGroupClearButton,
  Input: InputGroupInput,
});
