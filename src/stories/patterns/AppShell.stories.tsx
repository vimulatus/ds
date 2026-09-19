import {
  Buildings,
  CalendarBlank,
  ChatsCircle,
  Cube,
  FileText,
  FolderSimple,
  GearSix,
  House,
  Keyboard,
  ListChecks,
  ShareNetwork,
  SignOut,
  Sparkle,
  UserCircle,
} from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ReactNode, useState } from 'react';
import { Button } from '@/components/Button';
import { EmptyStatePanel } from '@/components/EmptyStatePanel';
import { Dropdown } from '@/components/Dropdown';
import { AppShell } from '@/patterns/AppShell';
import { ResourceDetail } from '@/patterns/ResourceDetail';
import { RailAccount, RailButton, type RailItem, SidebarRail } from '@/patterns/SidebarRail';
import { PHONE } from '../phone';
import { LeadDetail } from './lead-detail/LeadDetail';

/**
 * The window: the sidebar rail, then the canvas, both on the page
 * background. The rail is 56px of `ink-muted` glyphs under the workspace
 * mark; labels live in tooltips on the right, and the active view fills its
 * glyph in accent with a marker flush to the edge. The canvas is one
 * rounded `bg-panel` pane on a hairline, 8px in from the window. One rail,
 * one canvas: no splits and no second sidebar.
 */
const meta = {
  title: 'Patterns/App shell',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj;

const ITEMS: RailItem[] = [
  { id: 'home', label: 'Home', icon: House, hotkey: 'G H' },
  { id: 'files', label: 'Files', icon: FolderSimple, hotkey: 'G F' },
  { id: 'chat', label: 'Chat', icon: ChatsCircle, hotkey: 'G C', unread: true },
  { id: 'tasks', label: 'Tasks', icon: ListChecks, hotkey: 'G T', unread: true },
  { id: 'calendar', label: 'Calendar', icon: CalendarBlank, hotkey: 'G R' },
  { id: 'agents', label: 'Agents', icon: Sparkle, hotkey: 'G A' },
  { id: 'leads', label: 'Leads', icon: Buildings, hotkey: 'G L' },
];

function Rail({ initial }: { initial: string }) {
  const [active, setActive] = useState(initial);
  return (
    <SidebarRail
      items={ITEMS}
      activeId={active}
      onSelect={setActive}
      mark={<Cube weight="fill" className="text-accent" aria-label="Northwind" />}
      footer={
        <>
          <RailButton label="Settings">
            <GearSix />
          </RailButton>
          <RailAccount name="Priya Shah">
            <Dropdown.Group>
              <Dropdown.Item>
                <UserCircle className="size-3.5 text-ink-muted" />
                Profile
              </Dropdown.Item>
              <Dropdown.Item>
                <Keyboard className="size-3.5 text-ink-muted" />
                Keyboard shortcuts
              </Dropdown.Item>
            </Dropdown.Group>
            <Dropdown.Group>
              <Dropdown.Item>
                <SignOut className="size-3.5 text-ink-muted" />
                Sign out
              </Dropdown.Item>
            </Dropdown.Group>
          </RailAccount>
        </>
      }
    />
  );
}

function LaunchPlan() {
  return (
    <ResourceDetail.Root grain>
      <ResourceDetail.Main>
        <ResourceDetail.Header
          crumbs={[
            { label: 'Product' },
            { label: 'Launch plan', icon: <FileText className="text-write" /> },
          ]}
          actions={
            <Button variant="outlined" size="sm">
              <ShareNetwork />
              Share
            </Button>
          }
        />
        <ResourceDetail.Body>
          <ResourceDetail.Title meta="Priya Shah · updated 2 hours ago">Launch plan</ResourceDetail.Title>
          <p className="text-base leading-7 text-ink-muted">
            The rollout ships behind a flag on Monday. Support gets the new replies on Friday, and
            the pricing page updates when the flag reaches everyone.
          </p>
          <ResourceDetail.Block title="Milestones">
            <ul className="flex flex-col gap-2 text-base text-ink-muted">
              {[
                ['Internal dogfood', 'bg-success'],
                ['Beta to 10% of teams', 'bg-accent'],
                ['General availability', 'bg-edge'],
              ].map(([item, dot]) => (
                <li key={item} className="flex items-center gap-2">
                  <span className={`size-1.5 rounded-full ${dot}`} />
                  {item}
                </li>
              ))}
            </ul>
          </ResourceDetail.Block>
        </ResourceDetail.Body>
      </ResourceDetail.Main>
    </ResourceDetail.Root>
  );
}

function Shell({ view, children }: { view: string; children: ReactNode }) {
  return (
    <AppShell rail={<Rail initial={view} />} className="min-h-160 touch:min-h-0">
      {children}
    </AppShell>
  );
}

/** A resource open in the canvas. Chat and Tasks carry unread dots. Arrow keys walk the rail. */
export const Default: Story = {
  render: () => (
    <Shell view="files">
      <LaunchPlan />
    </Shell>
  ),
};

/** A list view in the canvas. The list stands empty here; the canvas holds whatever the view renders. */
/** A lead in the canvas, with Leads active on the rail. */
export const Lead: Story = {
  render: () => (
    <Shell view="leads">
      <LeadDetail />
    </Shell>
  ),
};

export const List: Story = {
  render: () => (
    <Shell view="tasks">
      <EmptyStatePanel
        centered
        kind="no-items"
        title="No tasks"
        description="Tasks assigned to you show up here."
      />
    </Shell>
  ),
};

/** On a phone the rail sheds and the canvas fills the screen edge to edge, with no radius. */
export const Phone: Story = {
  ...PHONE,
  render: () => (
    <Shell view="files">
      <LaunchPlan />
    </Shell>
  ),
};
