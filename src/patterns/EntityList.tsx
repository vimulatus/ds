import { X } from '@phosphor-icons/react';
import { Fragment, type KeyboardEvent, type ReactNode, useId, useRef, useState } from 'react';
import { Scroll } from '@/components/Scroll';
import { EmptyStatePanel, type EmptyStatePanelProps } from '@/components/EmptyStatePanel';
import { Toolbar } from '@/components/Toolbar';
import { cn } from '@/lib/cn';
import { type ListDensity, ListEntity, type ListEntityProps } from './ListEntity';

export type EntityListItem = Omit<
  ListEntityProps,
  'active' | 'selected' | 'onSelectedChange' | 'selecting' | 'onOpen' | 'density'
> & {
  id: string;
  /** Rows with the same group sit under one sticky header, in the order the groups first appear. */
  group?: string;
};

export type EntityListProps = {
  items: EntityListItem[];
  /** The accessible name of the list. */
  label: string;
  density?: ListDensity;
  /** The open row. */
  activeId?: string;
  onOpen?: (id: string) => void;
  /** The selected rows. Pass `onSelectedChange` too and the rows become selectable. */
  selected?: ReadonlySet<string>;
  onSelectedChange?: (selected: Set<string>) => void;
  /** Toolbar.Buttons for the selection, shown in a floating bar while rows are selected. */
  selectionActions?: ReactNode;
  /** Wraps each row, for example in a SwipableRow. */
  renderRow?: (item: EntityListItem, row: ReactNode) => ReactNode;
  /** What shows when there are no items. */
  empty?: EmptyStatePanelProps;
  className?: string;
};

function groupItems(items: EntityListItem[]) {
  const groups = new Map<string | undefined, EntityListItem[]>();
  for (const item of items) {
    const rows = groups.get(item.group);
    if (rows) rows.push(item);
    else groups.set(item.group, [item]);
  }
  return [...groups];
}

/**
 * A scrolling list of ListEntity rows, optionally under sticky group
 * headers. It is one tab stop: arrow keys move focus, Home and End jump,
 * Enter opens, x toggles the focused row's selection and Escape clears it.
 * While rows are selected a floating bar counts them and holds the bulk
 * actions. With no items it shows an EmptyStatePanel.
 */
export function EntityList({
  items,
  label,
  density = 'sm',
  activeId,
  onOpen,
  selected,
  onSelectedChange,
  selectionActions,
  renderRow,
  empty = { title: 'Nothing here yet' },
  className,
}: EntityListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const headerId = useId();
  const groups = groupItems(items);
  const flat = groups.flatMap(([, rows]) => rows);
  const [focusId, setFocusId] = useState<string | undefined>();
  const tabStop = flat.find((item) => item.id === focusId)?.id ?? activeId ?? flat[0]?.id;
  const count = selected?.size ?? 0;

  const toggle = (id: string, on: boolean) => {
    if (!onSelectedChange) return;
    const next = new Set(selected);
    if (on) next.add(id);
    else next.delete(id);
    onSelectedChange(next);
  };

  const focusRow = (index: number) => {
    const item = flat[Math.max(0, Math.min(flat.length - 1, index))];
    if (!item) return;
    setFocusId(item.id);
    listRef.current?.querySelector<HTMLElement>(`[data-row-id="${CSS.escape(item.id)}"]`)?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = flat.findIndex((item) => item.id === tabStop);
    const current = flat[index];
    if (event.key === 'ArrowDown') focusRow(index + 1);
    else if (event.key === 'ArrowUp') focusRow(index - 1);
    else if (event.key === 'Home') focusRow(0);
    else if (event.key === 'End') focusRow(flat.length - 1);
    else if (event.key === 'Enter' && current) onOpen?.(current.id);
    else if (event.key === 'x' && current && onSelectedChange) toggle(current.id, !selected?.has(current.id));
    else if (event.key === 'Escape' && count > 0) onSelectedChange?.(new Set());
    else return;
    event.preventDefault();
  };

  if (items.length === 0) {
    return (
      <div className={cn('flex min-h-0 flex-1 flex-col', className)}>
        <EmptyStatePanel centered {...empty} />
      </div>
    );
  }

  return (
    <div className={cn('relative flex min-h-0 flex-1 flex-col', className)}>
      <Scroll className="flex-1">
        <div
          ref={listRef}
          role="listbox"
          aria-label={label}
          aria-multiselectable={onSelectedChange ? true : undefined}
          className={cn('p-1 touch:p-0', count > 0 && 'pb-16 touch:pb-16')}
          onKeyDown={onKeyDown}
        >
          {groups.map(([group, rows], groupIndex) => (
            <div
              key={group ?? ''}
              role="group"
              aria-labelledby={group ? `${headerId}-${groupIndex}` : undefined}
            >
              {group && (
                <div
                  id={`${headerId}-${groupIndex}`}
                  role="presentation"
                  className={cn(
                    'sticky top-0 z-10 bg-panel px-2 pb-1 text-xs font-medium text-ink-subtle touch:px-4 touch:text-sm',
                    groupIndex === 0 ? 'pt-1' : 'pt-3'
                  )}
                >
                  {group}
                </div>
              )}
              {rows.map(({ id, group: _group, ...item }) => {
                const row = (
                  <ListEntity
                    key={id}
                    {...item}
                    data-row-id={id}
                    tabIndex={id === tabStop ? 0 : -1}
                    density={density}
                    active={id === activeId}
                    selected={selected?.has(id)}
                    selecting={count > 0}
                    onSelectedChange={onSelectedChange && ((on) => toggle(id, on))}
                    onOpen={() => onOpen?.(id)}
                    onFocus={() => setFocusId(id)}
                  />
                );
                return renderRow ? <Fragment key={id}>{renderRow({ id, ...item }, row)}</Fragment> : row;
              })}
            </div>
          ))}
        </div>
      </Scroll>

      {count > 0 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-3 z-action-menu flex justify-center transition-[opacity,translate] duration-200 ease-out starting:translate-y-2 starting:opacity-0">
          <Toolbar.Root aria-label="Selection" className="pointer-events-auto">
            <span className="px-2 text-xs font-medium text-ink tabular-nums">{count} selected</span>
            {selectionActions && (
              <>
                <Toolbar.Separator />
                <Toolbar.Group>{selectionActions}</Toolbar.Group>
              </>
            )}
            <Toolbar.Separator />
            <Toolbar.Button label="Clear selection" shortcut="Esc" onClick={() => onSelectedChange?.(new Set())}>
              <X />
            </Toolbar.Button>
          </Toolbar.Root>
        </div>
      )}
    </div>
  );
}
