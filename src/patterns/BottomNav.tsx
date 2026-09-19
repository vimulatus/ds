import { DotsThreeOutline } from '@phosphor-icons/react';
import { createContext, type ReactNode, useState } from 'react';
import { MobileDrawer } from '@/components/MobileDrawer';
import { cn } from '@/lib/cn';
import type { RailItem } from './SidebarRail';

/** Where the rail's footer renders: in the rail, or as rows in the More sheet. */
export const RailFormContext = createContext<'rail' | 'sheet'>('rail');

const TAB_COUNT = 4;

export type BottomNavProps = {
  items: RailItem[];
  activeId: string;
  onSelect: (id: string) => void;
  mark?: ReactNode;
  footer?: ReactNode;
};

function UnreadDot() {
  return (
    <span aria-hidden className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-accent ring-2 ring-page" />
  );
}

function Tab({
  label,
  icon,
  active,
  unread,
  onClick,
}: {
  label: string;
  icon: RailItem['icon'];
  active: boolean;
  unread?: boolean;
  onClick: () => void;
}) {
  const Glyph = icon;
  return (
    <button
      type="button"
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
      className={cn(
        'flex min-h-12 min-w-11 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg text-xxs font-medium outline-none focus-visible:outline-2 focus-visible:outline-accent',
        active ? 'text-accent' : 'text-ink-muted'
      )}
    >
      <span className="relative [&_svg]:size-6">
        <Glyph weight={active ? 'fill' : 'regular'} />
        {unread && <UnreadDot />}
      </span>
      {label}
    </button>
  );
}

/**
 * The rail's phone form: the first four views as tabs along the bottom of
 * the screen, then More. More opens a sheet with the other views, the
 * workspace mark and the rail's footer. `SidebarRail` renders it on touch.
 */
export function BottomNav({ items, activeId, onSelect, mark, footer }: BottomNavProps) {
  const [open, setOpen] = useState(false);
  const tabs = items.slice(0, TAB_COUNT);
  const rest = items.slice(TAB_COUNT);
  const moreActive = rest.some((item) => item.id === activeId);

  return (
    <nav aria-label="Main" className="flex shrink-0 bg-page px-2 pb-[max(--spacing(1),var(--safe-bottom))]">
      {tabs.map((item) => (
        <Tab
          key={item.id}
          label={item.label}
          icon={item.icon}
          active={item.id === activeId}
          unread={item.unread}
          onClick={() => onSelect(item.id)}
        />
      ))}
      <Tab
        label="More"
        icon={DotsThreeOutline}
        active={moreActive}
        unread={rest.some((item) => item.unread)}
        onClick={() => setOpen(true)}
      />
      <MobileDrawer open={open} onOpenChange={setOpen}>
        <MobileDrawer.Portal>
          <MobileDrawer.Overlay />
          <MobileDrawer.Content>
            <MobileDrawer.Handle />
            <div className="flex items-center gap-2 px-6 pb-3 [&_svg]:size-5">
              {mark}
              <MobileDrawer.Title className="text-sm font-medium text-ink">More</MobileDrawer.Title>
            </div>
            <MobileDrawer.ScrollBody className="gap-3">
              {rest.length > 0 && (
                <MobileDrawer.Section>
                  {rest.map((item) => {
                    const active = item.id === activeId;
                    const Glyph = item.icon;
                    return (
                      <MobileDrawer.Item
                        key={item.id}
                        aria-current={active ? 'page' : undefined}
                        onClick={() => {
                          onSelect(item.id);
                          setOpen(false);
                        }}
                        className={cn('[&_svg]:size-5', active && 'text-accent')}
                      >
                        <span className={cn('relative', !active && 'text-ink-muted')}>
                          <Glyph weight={active ? 'fill' : 'regular'} />
                          {item.unread && <UnreadDot />}
                        </span>
                        {item.label}
                      </MobileDrawer.Item>
                    );
                  })}
                </MobileDrawer.Section>
              )}
              {footer && (
                <RailFormContext.Provider value="sheet">
                  <MobileDrawer.Section>{footer}</MobileDrawer.Section>
                </RailFormContext.Provider>
              )}
            </MobileDrawer.ScrollBody>
          </MobileDrawer.Content>
        </MobileDrawer.Portal>
      </MobileDrawer>
    </nav>
  );
}
