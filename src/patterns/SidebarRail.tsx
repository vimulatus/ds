import { Toolbar } from '@base-ui/react/toolbar';
import type { Icon } from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Menu, MenuContent, MenuTrigger } from '@/components/Menu';
import { cn } from '@/lib/cn';

export type RailItem = {
  id: string;
  label: string;
  icon: Icon;
  /** A key shown in the tooltip, such as "G D". */
  hotkey?: string;
  /** A dot on the glyph: something new waits in that view. */
  unread?: boolean;
};

/** A glyph in the rail's footer: settings, help. It joins the rail's arrow-key order. */
export function RailButton(props: Omit<Parameters<typeof Button>[0], 'size' | 'variant' | 'tooltipPlacement'>) {
  return (
    <Toolbar.Button
      render={<Button {...props} variant="ghost" size="icon-md" tooltipPlacement="right" />}
    />
  );
}

/**
 * The account at the foot of the rail: the person's avatar, opening a menu
 * to its right. `children` are the menu's rows.
 */
export function RailAccount({ name, src, children }: { name: string; src?: string; children: ReactNode }) {
  return (
    <Menu>
      <Toolbar.Button
        render={<MenuTrigger variant="ghost" size="icon-md" label={name} tooltipSide="right" />}
      >
        <Avatar name={name} src={src} aria-hidden />
      </Toolbar.Button>
      <MenuContent side="right" align="end">
        {children}
      </MenuContent>
    </Menu>
  );
}

export type SidebarRailProps = {
  items: RailItem[];
  activeId: string;
  onSelect: (id: string) => void;
  /** The workspace mark at the top. */
  mark?: ReactNode;
  /** The bottom of the rail: settings, then the account. Compose `RailButton` and `RailAccount`. */
  footer?: ReactNode;
  className?: string;
};

/**
 * The app's one navigation: a narrow column of glyphs on the page
 * background, left of the canvas. Labels live in tooltips on the right; the
 * active view fills its glyph in accent with a marker flush to the edge.
 * Arrow keys move between glyphs. On touch the rail sheds and the canvas
 * takes the screen.
 */
export function SidebarRail({ items, activeId, onSelect, mark, footer, className }: SidebarRailProps) {
  return (
    <nav
      aria-label="Main"
      className={cn('flex h-full w-14 shrink-0 flex-col bg-page touch:hidden', className)}
    >
      {mark && (
        <div className="flex h-12 shrink-0 items-center justify-center [&_svg]:size-6">{mark}</div>
      )}
      <Toolbar.Root
        orientation="vertical"
        aria-label="Views"
        className="flex min-h-0 flex-1 flex-col items-center gap-1 pb-3"
      >
        {items.map((item) => {
          const active = item.id === activeId;
          const Glyph = item.icon;
          return (
            <div key={item.id} className="relative flex w-full justify-center">
              {active && (
                <span
                  aria-hidden
                  className="absolute top-1/2 left-0 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-accent"
                />
              )}
              <Toolbar.Button
                render={
                  <Button
                    variant="ghost"
                    size="icon-md"
                    label={item.label}
                    shortcut={item.hotkey}
                    tooltipPlacement="right"
                    aria-current={active ? 'page' : undefined}
                    onClick={() => onSelect(item.id)}
                    className={cn(
                      'relative [&_svg]:size-5',
                      active && 'text-accent hover:text-accent'
                    )}
                  />
                }
              >
                <Glyph weight={active ? 'fill' : 'regular'} />
                {item.unread && (
                  <span
                    aria-hidden
                    className="absolute top-1 right-1 size-1.5 rounded-full bg-accent ring-2 ring-page"
                  />
                )}
              </Toolbar.Button>
            </div>
          );
        })}
        <span aria-hidden className="flex-1" />
        {footer}
      </Toolbar.Root>
    </nav>
  );
}
