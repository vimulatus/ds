import { type PointerEvent, type ReactNode, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { useTouch } from '@/lib/touch';

export type SwipeTone = 'accent' | 'success' | 'failure' | 'warning' | 'neutral';

/** What the swipe paints behind the row. `neutral` is the quiet grey, a step darker on the leading side. */
const TONE: Record<Exclude<SwipeTone, 'neutral'>, string> = {
  accent: 'bg-accent',
  success: 'bg-success',
  failure: 'bg-failure',
  warning: 'bg-warning',
};
const toneClass = (tone: SwipeTone, side: 'leading' | 'trailing') =>
  tone === 'neutral' ? (side === 'leading' ? 'bg-edge' : 'bg-edge-muted') : TONE[tone];

export type SwipeAction = {
  /** The accessible name. The action shows its icon alone. */
  label: string;
  icon: ReactNode;
  tone?: SwipeTone;
  onAction: () => void;
  /** The row leaves the list after this action: it slides out and collapses before `onAction` runs. */
  dismiss?: boolean;
};

export type SwipableRowProps = {
  children: ReactNode;
  /** Revealed by a swipe left. The first sits at the edge and is the one a full swipe commits. */
  trailing?: SwipeAction[];
  /** Revealed by a swipe right, and committed by a long one. */
  leading?: SwipeAction;
  className?: string;
};

const ACTION_WIDTH = 72;
const SLOP = 8;
const SETTLE_MS = 250;

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Swipe actions for a row on touch. The swipe paints the side it opens in
 * the action's color, quiet grey by default, and each action shows its icon
 * alone, growing from half size once letting go would act. Swipe left to reveal the trailing
 * actions; let go past half their width and they stay open, swipe past half
 * the row and the first one commits. Swipe right past a third of the row to
 * commit the leading action. A short drag springs back. A vertical drag
 * scrolls the list as usual. Off touch it renders the row alone: the row's
 * menu carries the same actions.
 */
export function SwipableRow({ children, trailing = [], leading, className }: SwipableRowProps) {
  const touch = useTouch();
  const root = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; start: number; axis?: 'x' | 'y'; moved: boolean } | null>(null);
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [gone, setGone] = useState(false);

  if (!touch) return <>{children}</>;

  const width = () => root.current?.offsetWidth ?? 390;
  const revealWidth = trailing.length * ACTION_WIDTH;
  const armedLeft = trailing.length > 0 && -offset > width() / 2;
  const armedRight = !!leading && offset > width() / 3;

  const run = (action: SwipeAction) => {
    if (!action.dismiss) {
      setOffset(0);
      action.onAction();
      return;
    }
    const wait = reducedMotion() ? 0 : SETTLE_MS;
    setOffset(offset < 0 ? -width() : width());
    window.setTimeout(() => setGone(true), wait);
    window.setTimeout(action.onAction, wait * 2);
  };

  const release = () => {
    setDragging(false);
    if (armedLeft && trailing[0]) run(trailing[0]);
    else if (armedRight && leading) run(leading);
    else if (trailing.length > 0 && -offset > revealWidth / 2) setOffset(-revealWidth);
    else setOffset(0);
  };

  const onPointerDown = (event: PointerEvent) => {
    drag.current = { x: event.clientX, y: event.clientY, start: offset, moved: false };
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    if (!state) return;
    const dx = event.clientX - state.x;
    const dy = event.clientY - state.y;
    if (!state.axis) {
      if (Math.abs(dx) < SLOP && Math.abs(dy) < SLOP) return;
      state.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      if (state.axis === 'x') {
        event.currentTarget.setPointerCapture(event.pointerId);
        setDragging(true);
      }
    }
    if (state.axis !== 'x') return;
    state.moved = true;
    let next = state.start + dx;
    if (next > 0 && !leading) next = next / 4;
    if (next < 0 && trailing.length === 0) next = next / 4;
    setOffset(next);
  };

  const onPointerUp = () => {
    const state = drag.current;
    if (state?.axis === 'x') release();
  };

  const side = offset < 0 ? 'trailing' : 'leading';
  const behind = offset < 0 ? trailing : leading ? [leading] : [];
  // The icons grow from half size once letting go would do something: keep the actions open, or commit.
  const past = offset < 0 ? armedLeft || -offset > revealWidth / 2 : armedRight;

  return (
    <div
      ref={root}
      className={cn(
        'grid transition-[grid-template-rows] duration-200 ease-out',
        gone ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]',
        className
      )}
    >
      <div className="relative min-h-0 overflow-hidden">
        {offset !== 0 && (
          <div
            className={cn('absolute inset-y-0 flex', offset < 0 ? 'right-0 flex-row-reverse' : 'left-0')}
            style={{ width: Math.abs(offset) }}
          >
            {behind.map((action, index) => {
              const armed = index === 0 && (offset < 0 ? armedLeft : armedRight);
              return (
                <button
                  key={action.label}
                  type="button"
                  aria-label={action.label}
                  tabIndex={-1}
                  onClick={() => run(action)}
                  className={cn(
                    'flex min-w-0 basis-0 items-center justify-center overflow-hidden transition-[flex-grow] duration-200 ease-out',
                    toneClass(action.tone ?? 'neutral', side),
                    armed ? 'grow-[99]' : 'grow'
                  )}
                >
                  <span
                    className={cn(
                      'flex text-panel [&_svg]:size-8 transition-transform duration-300 ease-in-out',
                      past ? 'scale-100' : 'scale-50'
                    )}
                  >
                    {action.icon}
                  </span>
                </button>
              );
            })}
          </div>
        )}
        <div
          className={cn(
            'relative touch-pan-y bg-panel',
            !dragging && 'transition-transform duration-300 ease-drawer'
          )}
          style={{ transform: `translateX(${offset}px)` }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={() => {
            drag.current = null;
            setDragging(false);
            setOffset(0);
          }}
          onClickCapture={(event) => {
            if (drag.current?.moved || (offset !== 0 && !dragging)) {
              event.stopPropagation();
              event.preventDefault();
              if (!drag.current?.moved) setOffset(0);
            }
            drag.current = null;
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
