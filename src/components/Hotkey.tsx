import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

const MODIFIER_GLYPHS = '⌘⇧⌥⌃';

const MAC: Record<string, string> = {
  mod: '⌘',
  meta: '⌘',
  cmd: '⌘',
  ctrl: '⌃',
  alt: '⌥',
  opt: '⌥',
  shift: '⇧',
};

const OTHER: Record<string, string> = {
  mod: 'Ctrl',
  meta: 'Win',
  cmd: 'Ctrl',
  ctrl: 'Ctrl',
  alt: 'Alt',
  opt: 'Alt',
  shift: 'Shift',
};

const NAMED: Record<string, string> = {
  enter: '↵',
  return: '↵',
  escape: 'Esc',
  esc: 'Esc',
  backspace: '⌫',
  delete: '⌦',
  tab: '⇥',
  space: 'Space',
  arrowup: '↑',
  arrowdown: '↓',
  arrowleft: '←',
  arrowright: '→',
};

function isMac() {
  if (typeof navigator === 'undefined') return true;
  return /mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent);
}

/**
 * Splits a shortcut into the keys a person presses, for this platform.
 * Takes `mod+shift+k` (mod is ⌘ on a Mac, Ctrl elsewhere) or glyphs such
 * as `⌘K`.
 */
export function hotkeyKeys(shortcut: string): string[] {
  const mac = isMac();
  if (!shortcut.includes('+') || shortcut === '+') {
    const chars = Array.from(shortcut);
    const split = chars.findIndex((char) => !MODIFIER_GLYPHS.includes(char));
    if (split < 0) return chars;
    return [...chars.slice(0, split), chars.slice(split).join('')];
  }
  return shortcut.split('+').map((part) => {
    const key = part.trim().toLowerCase();
    const modifier = (mac ? MAC : OTHER)[key];
    if (modifier) return modifier;
    return NAMED[key] ?? (key.length === 1 ? key.toUpperCase() : part.trim());
  });
}

/** The shortcut as one string, for a title or `aria-keyshortcuts`. */
export function hotkeyText(shortcut: string) {
  return hotkeyKeys(shortcut).join(isMac() ? '' : '+');
}

export type HotkeyProps = ComponentProps<'kbd'> & {
  shortcut: string;
  /** `keycap` draws each key as a small cap; `inline` is bare glyphs that take the text color. */
  variant?: 'keycap' | 'inline';
};

/**
 * A key combination: `mod+k` renders ⌘ K on a Mac and Ctrl K elsewhere.
 * Keycaps sit beside a label; `inline` sits in a menu row or a tooltip.
 */
export function Hotkey({ shortcut, variant = 'keycap', className, ...props }: HotkeyProps) {
  const keys = hotkeyKeys(shortcut);
  return (
    <kbd
      {...props}
      className={cn(
        'inline-flex shrink-0 items-center font-sans',
        variant === 'keycap' ? 'gap-0.5' : 'gap-0.5 text-xs text-ink-subtle',
        className
      )}
    >
      <span className="sr-only">{hotkeyText(shortcut)}</span>
      {keys.map((key, index) =>
        variant === 'keycap' ? (
          <span
            key={index}
            aria-hidden
            className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded border border-edge bg-surface px-1 text-xxs font-medium text-ink-muted"
          >
            {key}
          </span>
        ) : (
          <span key={index} aria-hidden>
            {key}
          </span>
        )
      )}
    </kbd>
  );
}
