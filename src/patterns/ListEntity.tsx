import { DotsThree } from '@phosphor-icons/react';
import { type ComponentProps, type KeyboardEvent, type ReactNode, useRef, useState } from 'react';
import { AvatarGroup } from '@/components/Avatar';
import { Checkbox } from '@/components/Checkbox';
import { Menu, MenuContent, MenuTrigger } from '@/components/Menu';
import { cn } from '@/lib/cn';
import { useTouch } from '@/lib/touch';
import { EntityIcon, type EntityKind } from './EntityIcon';

export type ListDensity = 'sm' | 'md';

const LONG_PRESS_MS = 450;

export type ListEntityProps = Omit<ComponentProps<'div'>, 'title'> & {
  kind: EntityKind;
  title: ReactNode;
  /** A quieter line: a folder, a size, who changed it. Inline at `sm`, under the title at `md` and on touch. */
  secondary?: ReactNode;
  /** When it last changed: "2m", "Tue", "Sep 12". The last column to go. */
  time?: ReactNode;
  /** Who is on it: owners, assignees, attendees. */
  people?: { name: string; src?: string }[];
  /** Short labels: Badges and TagDots. The first column to go. */
  badges?: ReactNode;
  unread?: boolean;
  /** The row that is open, or that Enter would open. */
  active?: boolean;
  /** Part of the multi-select. */
  selected?: boolean;
  /** Makes the row selectable: a checkbox on hover, Cmd-click, and long press on touch. */
  onSelectedChange?: (selected: boolean) => void;
  /** Some row in the list is selected, so every checkbox shows, touch included. */
  selecting?: boolean;
  onOpen?: () => void;
  /** MenuItems for the row's actions menu. It opens from the trailing button, a right click, or Shift+F10. */
  actions?: ReactNode;
  density?: ListDensity;
};

/**
 * One row of an entity list: the kind's icon, a title and a quieter line,
 * then badges, people and a time. The leading column holds the unread dot
 * until the row is hovered or a selection is under way, when it becomes the
 * checkbox.
 *
 * The row is a container: as it narrows it drops badges under 32rem, people
 * under 28rem and the inline secondary line under 24rem; the title and the
 * time stay. On touch it grows to 56px, puts the icon on a round tile, stacks
 * the secondary line and keeps nothing behind hover: long press selects, and
 * the actions live in a SwipableRow.
 */
export function ListEntity({
  kind,
  title,
  secondary,
  time,
  people,
  badges,
  unread,
  active,
  selected = false,
  onSelectedChange,
  selecting,
  onOpen,
  actions,
  density = 'sm',
  className,
  onClick,
  onKeyDown,
  onContextMenu,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  ref,
  ...props
}: ListEntityProps) {
  const touch = useTouch();
  const [menuOpen, setMenuOpen] = useState(false);
  const rowRef = useRef<HTMLDivElement | null>(null);
  const press = useRef<{ x: number; y: number; timer: number; fired: boolean } | null>(null);
  const selectable = !!onSelectedChange;
  const showCheck = selected || selecting;

  const cancelPress = () => {
    if (press.current) window.clearTimeout(press.current.timer);
  };

  return (
    <div
      role="option"
      aria-selected={selectable ? selected : undefined}
      aria-current={active || undefined}
      data-active={active || undefined}
      data-selected={selected || undefined}
      {...props}
      ref={(node) => {
        rowRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      className={cn(
        'group/row @container relative flex w-full min-w-0 cursor-default select-none items-center gap-2 rounded-md px-2 text-sm outline-none transition-colors',
        density === 'sm' ? 'h-8' : 'min-h-11 py-1.5',
        'not-touch:hover:bg-hover data-active:bg-hover',
        'data-selected:bg-accent-bg not-touch:data-selected:hover:bg-accent/20 data-selected:data-active:bg-accent/20',
        'focus-visible:outline-2 focus-visible:outline-solid focus-visible:-outline-offset-2 focus-visible:outline-accent',
        'touch:h-auto touch:min-h-14 touch:gap-3 touch:rounded-none touch:px-4 touch:py-2 touch:[-webkit-touch-callout:none]',
        'touch:after:absolute touch:after:right-0 touch:after:bottom-0 touch:after:h-px touch:after:bg-edge-muted',
        showCheck ? 'touch:after:left-[6.25rem]' : 'touch:after:left-[5.375rem]',
        className
      )}
      onClick={(event) => {
        onClick?.(event);
        if (press.current?.fired) {
          press.current = null;
          return;
        }
        if (selectable && (event.metaKey || event.ctrlKey || (touch && selecting))) {
          onSelectedChange(!selected);
          return;
        }
        onOpen?.();
      }}
      onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
        onKeyDown?.(event);
        if (!actions || event.defaultPrevented) return;
        if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10')) {
          event.preventDefault();
          setMenuOpen(true);
        }
      }}
      onContextMenu={(event) => {
        onContextMenu?.(event);
        if (!actions || touch) return;
        event.preventDefault();
        setMenuOpen(true);
      }}
      onPointerDown={(event) => {
        onPointerDown?.(event);
        if (!touch || !selectable) return;
        cancelPress();
        const state = { x: event.clientX, y: event.clientY, fired: false, timer: 0 };
        state.timer = window.setTimeout(() => {
          state.fired = true;
          onSelectedChange(!selected);
        }, LONG_PRESS_MS);
        press.current = state;
      }}
      onPointerMove={(event) => {
        onPointerMove?.(event);
        const state = press.current;
        if (state && Math.hypot(event.clientX - state.x, event.clientY - state.y) > 8) cancelPress();
      }}
      onPointerUp={(event) => {
        onPointerUp?.(event);
        cancelPress();
      }}
      onPointerCancel={(event) => {
        onPointerCancel?.(event);
        cancelPress();
      }}
    >
      <span
        className={cn(
          'relative flex size-4 shrink-0 items-center justify-center',
          showCheck ? 'touch:size-5' : 'touch:w-1.5'
        )}
      >
        {unread && (
          <span
            role="img"
            aria-label="Unread"
            className={cn(
              'size-1.5 rounded-full bg-accent',
              selectable && 'not-touch:group-hover/row:invisible group-focus-visible/row:invisible',
              selectable && showCheck && 'invisible'
            )}
          />
        )}
        {selectable && (
          <Checkbox
            checked={selected}
            onCheckedChange={(next) => onSelectedChange(next)}
            onClick={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
            tabIndex={-1}
            aria-label="Select"
            className={cn(
              'absolute',
              !showCheck && 'invisible not-touch:group-hover/row:visible group-focus-visible/row:visible'
            )}
          />
        )}
      </span>

      <EntityIcon kind={kind} variant={touch ? 'tile' : 'glyph'} />

      <span
        className={cn(
          'flex min-w-0 flex-1',
          density === 'sm' ? 'items-baseline gap-2' : 'flex-col',
          'touch:flex-col touch:items-stretch touch:gap-0.5'
        )}
      >
        <span
          className={cn(
            'truncate text-ink touch:text-base',
            unread ? 'font-medium' : 'font-normal',
            density === 'sm' && 'shrink-0 max-w-full touch:shrink'
          )}
        >
          {title}
        </span>
        {secondary && (
          <span
            className={cn(
              'min-w-0 truncate text-ink-subtle',
              density === 'sm' ? 'text-sm @max-sm:hidden touch:@max-sm:block' : 'text-xs',
              'touch:text-sm'
            )}
          >
            {secondary}
          </span>
        )}
      </span>

      {badges && <span className="flex shrink-0 items-center gap-1 @max-lg:hidden">{badges}</span>}
      {people && people.length > 0 && <AvatarGroup people={people} size="sm" className="shrink-0 @max-md:hidden" />}
      {time && (
        <span className="shrink-0 whitespace-nowrap text-xs text-ink-subtle tabular-nums touch:self-start touch:pt-0.5">
          {time}
        </span>
      )}

      {actions && (
        <span
          className="flex shrink-0 touch:hidden"
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <Menu open={menuOpen} onOpenChange={setMenuOpen}>
            <MenuTrigger
              variant="ghost"
              size="icon-sm"
              label="More actions"
              tabIndex={-1}
              className="-mr-1 opacity-0 group-hover/row:opacity-100 group-focus-visible/row:opacity-100 data-popup-open:opacity-100"
            >
              <DotsThree weight="bold" />
            </MenuTrigger>
            <MenuContent align="end" finalFocus={rowRef}>{actions}</MenuContent>
          </Menu>
        </span>
      )}
    </div>
  );
}
