import { Switch } from '@base-ui/react/switch';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

export type ToggleSwitchProps = {
  onChange?: (checked: boolean) => void;
  defaultChecked?: boolean;
  labelClass?: string;
  label?: ReactNode;
  disabled?: boolean;
  checked?: boolean;
  /** Visual size. `md` (default) sits in settings rows; `sm` is the compact
   *  toolbar size. */
  size?: 'sm' | 'md';
  className?: string;
  controlClass?: string;
  name?: string;
  'aria-label'?: string;
};

const SWITCH_SIZES = {
  sm: {
    control: 'h-4 w-6',
    thumb: 'top-0.5 left-0.5 h-3',
    stretched: 'w-4 data-checked:translate-x-1',
    normal: 'w-3 data-checked:translate-x-2',
  },
  md: {
    control: 'h-5 w-9',
    thumb: 'top-0.5 left-0.5 h-4',
    stretched: 'w-5 data-checked:translate-x-3',
    normal: 'w-4 data-checked:translate-x-4',
  },
} as const;

/**
 * An on/off switch for a setting that applies immediately. If the change
 * needs a save step, use a Checkbox instead.
 *
 * @do Use a switch only when the change takes effect immediately.
 * @do Label the setting in its on-state ("Read receipts", not "Disable read
 *   receipts").
 * @do Use `size="md"` in settings and `size="sm"` in toolbars.
 * @dont Do not put a switch in a form that has a Save button — use a Checkbox.
 * @dont Do not pair a switch with an on/off text label; the control already
 *   says it.
 */
export function ToggleSwitch({
  onChange,
  defaultChecked,
  labelClass,
  label,
  disabled,
  checked,
  size = 'md',
  className,
  controlClass,
  ...props
}: ToggleSwitchProps) {
  const sizing = SWITCH_SIZES[size];
  const [isStretched, setIsStretched] = useState(false);
  const stretchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(stretchTimeout.current), []);

  const handleChange = (next: boolean) => {
    setIsStretched(true);
    clearTimeout(stretchTimeout.current);
    stretchTimeout.current = setTimeout(() => setIsStretched(false), 75);
    onChange?.(next);
  };

  // The root is a label, so its gap and padding toggle the switch too: one hit target.
  return (
    <label className={cn('inline-flex items-center gap-2', className)}>
      <Switch.Root
        {...props}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={handleChange}
        disabled={disabled}
        className={cn(
          'relative rounded-full bg-ink-muted/40 transition-colors duration-100 data-checked:bg-accent',
          sizing.control,
          controlClass
        )}
      >
        <Switch.Thumb
          className={cn(
            'absolute rounded-full bg-surface transition-all duration-100 ease-in-out',
            sizing.thumb,
            isStretched ? sizing.stretched : sizing.normal
          )}
        />
      </Switch.Root>
      {label != null && <span className={cn(labelClass)}>{label}</span>}
    </label>
  );
}
