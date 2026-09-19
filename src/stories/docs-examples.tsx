import {
  DotsThree,
  FileText,
  MagnifyingGlass,
  PencilSimple,
  Plus,
  ShareNetwork,
  Trash,
  Tray,
} from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ConfirmHost, confirm } from '@/components/ConfirmDialog';
import { EmptyStatePanel } from '@/components/EmptyStatePanel';
import { Layer } from '@/components/Layer';
import { ToastProvider, ToastViewport, toast } from '@/components/Toast';
import { cn } from '@/lib/cn';
import { HUE_CLASSES, HUES } from '@/lib/hue';

/**
 * A framed example on a docs page. It opts out of the docs typography and
 * takes the toolbar theme. Examples here render only on MDX pages, which
 * run no decorators, so an example that needs a host mounts its own.
 */
export function Example({
  children,
  className,
  caption,
}: {
  children: ReactNode;
  className?: string;
  caption?: ReactNode;
}) {
  return (
    <figure className="sb-unstyled my-4 flex flex-col gap-2">
      <div
        className={cn(
          'flex flex-wrap items-center gap-3 rounded-xl border border-edge-muted bg-panel p-4 text-ink',
          className,
        )}
      >
        {children}
      </div>
      {caption && <figcaption className="text-xs text-ink-subtle">{caption}</figcaption>}
    </figure>
  );
}

/** A "do" and a "don't" rendered side by side. */
export function DoDont({ good, bad }: { good: ReactNode; bad: ReactNode }) {
  return (
    <div className="sb-unstyled my-4 grid gap-3 sm:grid-cols-2">
      {(
        [
          ['Do', good, 'border-success/40', 'text-success-ink'],
          ['Do not', bad, 'border-failure/40', 'text-failure-ink'],
        ] as const
      ).map(([label, body, edge, ink]) => (
        <div
          key={label}
          className={cn('flex flex-col gap-2 rounded-xl border bg-panel p-4 text-ink', edge)}
        >
          <span className={cn('text-xs font-medium', ink)}>{label}</span>
          <div className="flex flex-wrap items-center gap-3">{body}</div>
        </div>
      ))}
    </div>
  );
}

// Principles

export function QuietChrome() {
  return (
    <Example
      className="flex-col items-stretch gap-0 p-0"
      caption="The chrome is ghost glyphs in muted ink. The document holds the only strong type."
    >
      <div className="flex h-11 items-center gap-1 border-b border-edge-muted px-3 text-sm">
        <span className="text-ink-subtle">Product</span>
        <span className="text-ink-subtle">/</span>
        <span className="flex items-center gap-1.5">
          <FileText className="size-4 text-write" />
          Launch plan
        </span>
        <span className="ml-auto flex gap-1">
          <Button size="icon-sm" label="Share">
            <ShareNetwork />
          </Button>
          <Button size="icon-sm" label="More actions">
            <DotsThree />
          </Button>
        </span>
      </div>
      <div className="flex flex-col gap-2 px-6 py-5">
        <h3 className="text-xl font-semibold tracking-tight">Launch plan</h3>
        <p className="text-sm leading-6 text-ink-muted">
          The rollout ships behind a flag on Monday. Support gets the new replies on Friday.
        </p>
      </div>
    </Example>
  );
}

export function DepthLadder() {
  return (
    <Example
      className="bg-page"
      caption="Page, panel, then a card at depth 1 and a card at depth 2. No color was picked by hand."
    >
      <div className="rounded-xl border border-edge-muted bg-panel p-3">
        <span className="text-xs text-ink-subtle">bg-panel</span>
        <div className="mt-2">
          <Card title="Depth 1">
            <Layer depth={2}>
              <div className="rounded-lg border border-edge-muted bg-surface p-3 text-xs text-ink-muted">
                Depth 2: one shade nearer
              </div>
            </Layer>
          </Card>
        </div>
      </div>
    </Example>
  );
}

export function HueRow() {
  return (
    <Example caption="Twelve hues at one lightness and chroma. Each label is the hue's ink on the hue's own tint.">
      {HUES.map((hue) => (
        <span
          key={hue}
          className={cn('rounded-full px-2 py-0.5 text-xs font-medium', HUE_CLASSES[hue].tint)}
        >
          {hue}
        </span>
      ))}
    </Example>
  );
}

export function GlassSample() {
  return (
    <Example
      className="relative h-40 overflow-hidden"
      caption="A menu over content. Only surfaces that float are glass."
    >
      <div className="absolute inset-0 grid grid-cols-6 gap-2 p-4 opacity-80">
        {HUES.map((hue) => (
          <div key={hue} className={cn('rounded-md', HUE_CLASSES[hue].fill)} />
        ))}
      </div>
      <div className="glass relative ml-6 flex w-48 flex-col rounded-lg border border-edge-muted bg-menu-glass p-1 text-sm">
        {[
          [PencilSimple, 'Rename'],
          [ShareNetwork, 'Share'],
          [Trash, 'Delete'],
        ].map(([Icon, label]) => {
          const I = Icon as typeof Trash;
          return (
            <span
              key={label as string}
              className="flex h-7 items-center gap-2 rounded-md px-2 hover:bg-hover"
            >
              <I className="size-3.5 text-ink-muted" />
              {label as string}
            </span>
          );
        })}
      </div>
    </Example>
  );
}

export function EmphasisLadder() {
  return (
    <DoDont
      good={
        <>
          <Button>Cancel</Button>
          <Button variant="outlined">Save draft</Button>
          <Button variant="cta">Publish</Button>
        </>
      }
      bad={
        <>
          <Button variant="cta">Save draft</Button>
          <Button variant="accent">Preview</Button>
          <Button variant="cta">Publish</Button>
        </>
      }
    />
  );
}

export function CenterLine() {
  return (
    <Example caption="A 24px button, a 32px button, a badge and an avatar-sized dot share one center line.">
      <div className="relative flex items-center gap-3">
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-accent/50" />
        <Button size="sm" variant="outlined">
          <Plus />
          New
        </Button>
        <Button variant="outlined">
          <MagnifyingGlass />
          Search
        </Button>
        <Badge hue="green">Live</Badge>
        <span className="size-6 rounded-full bg-violet-bg" />
        <span className="text-sm">Launch plan</span>
      </div>
    </Example>
  );
}

// Copy

export function ButtonLabels() {
  return (
    <DoDont
      good={
        <>
          <Button variant="outlined">New document</Button>
          <Button variant="outlined">Move to folder</Button>
          <Button variant="danger">Delete task</Button>
        </>
      }
      bad={
        <>
          <Button variant="outlined">New Document</Button>
          <Button variant="outlined">Folder</Button>
          <Button variant="danger">OK</Button>
        </>
      }
    />
  );
}

export function EmptyStates() {
  return (
    <DoDont
      good={
        <EmptyStatePanel
          centered
          className="min-h-40 w-full"
          illustration={<Tray className="size-8 text-ink-extra-muted" />}
          title="No files yet"
          description="Upload a file or drop one here."
          action={<Button variant="outlined">Upload file</Button>}
        />
      }
      bad={
        <EmptyStatePanel
          centered
          className="min-h-40 w-full"
          illustration={<Tray className="size-8 text-ink-extra-muted" />}
          title="Nothing to see here!"
          description="It looks like you haven't uploaded anything yet."
        />
      }
    />
  );
}

export function Toasts() {
  return (
    <ToastProvider>
      <Example caption="Press each button. A success toast is past tense and short; a failure names the action and the fix.">
        <Button variant="outlined" onClick={() => toast.success('Task created')}>
          Success
        </Button>
        <Button
          variant="outlined"
          onClick={() =>
            toast.failure('Could not move the file', {
              description: 'The folder was deleted. Choose another folder.',
            })
          }
        >
          Failure
        </Button>
      </Example>
      <ToastViewport />
    </ToastProvider>
  );
}

export function Confirmation() {
  return (
    <Example caption="The title asks the question. The body names what goes away. The button repeats the verb.">
      <Button
        variant="danger"
        onClick={() =>
          confirm({
            title: 'Delete "Q4 launch"?',
            description: 'This deletes the folder and its 12 files. You cannot undo this.',
            confirmLabel: 'Delete folder',
            destructive: true,
          })
        }
      >
        Delete folder
      </Button>
      <ConfirmHost />
    </Example>
  );
}

export function IconLabels() {
  return (
    <Example caption="Hover or focus a button. An icon-only control still has a name: its tooltip and its accessible label.">
      <Button size="icon-md" variant="outlined" label="Search" shortcut="⌘K">
        <MagnifyingGlass />
      </Button>
      <Button size="icon-md" variant="outlined" label="New document">
        <Plus />
      </Button>
      <Button size="icon-md" variant="danger" label="Delete">
        <Trash />
      </Button>
    </Example>
  );
}

export function Badges() {
  return (
    <Example caption="A badge is a state in one or two words, never a sentence.">
      <Badge hue="amber">In review</Badge>
      <Badge hue="green">Done</Badge>
      <Badge hue="red">Overdue</Badge>
      <Badge variant="outlined">Draft</Badge>
    </Example>
  );
}
