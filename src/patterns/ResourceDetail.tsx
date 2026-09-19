import { Collapsible } from '@base-ui/react/collapsible';
import { CaretDown, CaretRight } from '@phosphor-icons/react';
import { Fragment, type ComponentProps, type ReactNode } from 'react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { cn } from '@/lib/cn';

/**
 * The resource detail pattern: one resource in the middle, its properties in
 * an aside on the right. Below 1224px of the root's width the aside hides,
 * and a `Fold` in the body carries the same properties.
 *
 *   <Root>
 *     <Main>
 *       <Header crumbs actions />
 *       <Body> <Fold summary>…</Fold> …article… </Body>
 *     </Main>
 *     <Aside> <Section title>…</Section> </Aside>
 *     <Changes />
 *   </Root>
 */

/** The page. Fills its container; `grain` adds film grain to the panel. */
function Root({ grain, className, ...props }: ComponentProps<'div'> & { grain?: boolean }) {
  return (
    <div
      {...props}
      className={cn(
        '@container/detail flex size-full min-h-0 min-w-0 bg-panel',
        grain && 'grain',
        className
      )}
    />
  );
}

function Main({ className, ...props }: ComponentProps<'main'>) {
  return <main {...props} className={cn('flex min-w-0 flex-1 flex-col', className)} />;
}

export type Crumb = { label: ReactNode; icon?: ReactNode };

/** The top bar: a breadcrumb trail, then the actions on the right. The last crumb is the resource. */
function Header({ crumbs, actions }: { crumbs: Crumb[]; actions?: ReactNode }) {
  return (
    <div className="flex h-12 shrink-0 items-center gap-1 border-b border-edge-muted px-2 pl-3">
      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1 text-sm">
        {crumbs.map((crumb, index) => {
          const last = index === crumbs.length - 1;
          return (
            <Fragment key={index}>
              {index > 0 && <CaretRight aria-hidden className="size-3 shrink-0 text-ink-subtle" />}
              <span
                aria-current={last ? 'page' : undefined}
                className={cn(
                  'flex min-w-0 items-center gap-1.5 [&_svg]:size-4 [&_svg]:shrink-0',
                  last ? 'text-ink' : 'text-ink-subtle'
                )}
              >
                {crumb.icon}
                <span className="truncate">{crumb.label}</span>
              </span>
            </Fragment>
          );
        })}
      </nav>
      {actions && <div className="ml-auto flex shrink-0 items-center gap-1">{actions}</div>}
    </div>
  );
}

/** The scrolling body. Centres an article of up to 42rem. */
function Body({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 justify-center overflow-auto px-4 py-8 @[720px]/detail:px-8">
      <article className={cn('@container/article flex w-full max-w-2xl flex-col gap-6', className)}>
        {children}
      </article>
    </div>
  );
}

/** The title block at the top of the article: the name, then a line of facts. */
function Title({
  children,
  meta,
  footer,
}: {
  children: ReactNode;
  meta?: ReactNode;
  /** Under the facts, inside the block: the resource's next step, such as a due follow-up. */
  footer?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-3">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">{children}</h1>
      {meta && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-muted">
          {meta}
        </div>
      )}
      {footer}
    </header>
  );
}

/** The properties column. Hidden below 1224px of the root's width. */
function Aside({ children }: { children: ReactNode }) {
  return (
    <aside className="hidden w-80 shrink-0 flex-col gap-2 overflow-auto border-l border-edge-muted p-2 @[1224px]/detail:flex">
      {children}
    </aside>
  );
}

/** A card in the aside. */
function Section({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <Card variant="outlined" depth={1} className="gap-3 bg-surface p-3">
      <span className="text-xs font-medium text-ink-muted">{title}</span>
      {children}
    </Card>
  );
}

/**
 * The aside's content folded into the body, for widths below 1224px. Closed,
 * it shows `summary` on one line beside the trigger.
 */
function Fold({
  label = 'Details',
  summary,
  children,
}: {
  label?: string;
  summary?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Collapsible.Root className="group/fold @[1224px]/detail:hidden">
      <div className="flex h-7 min-w-0 items-center gap-2">
        <Collapsible.Trigger className="-mx-1 flex shrink-0 items-center gap-1 rounded-md px-1 text-xs font-medium text-ink-muted outline-none transition-colors hover:text-ink focus-visible:focus-ring">
          {label}
          <CaretDown className="size-2.5 -rotate-90 text-ink-extra-muted transition-transform duration-200 group-has-data-panel-open/fold:rotate-0" />
        </Collapsible.Trigger>
        {summary && (
          <span className="truncate text-xs text-ink-subtle group-has-data-panel-open/fold:hidden">
            {summary}
          </span>
        )}
      </div>
      <Collapsible.Panel className="pt-2 pb-1">{children}</Collapsible.Panel>
    </Collapsible.Root>
  );
}

/** A section of the article with a quiet `xs` heading. */
function Block({
  title,
  className,
  children,
}: {
  title: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn('flex flex-col gap-2', className)}>
      <h2 className="text-xs font-medium text-ink-muted">{title}</h2>
      {children}
    </section>
  );
}

/**
 * Floats at the bottom once an edit differs from the saved resource, and
 * above the app shell's bottom bar on touch. Save is the page's one `cta`
 * while it is up. Enter and Escape belong to the form:
 * pass the same handlers to `PropertyGrid`'s `onSave` and `onDiscard`.
 */
function Changes({
  count,
  saving,
  onSave,
  onDiscard,
}: {
  count: number;
  saving?: boolean;
  onSave: () => void;
  onDiscard: () => void;
}) {
  if (count === 0) return null;
  return (
    <div
      role="region"
      aria-label="Unsaved changes"
      className="glass fixed bottom-4 left-1/2 z-action-menu flex -translate-x-1/2 items-center gap-3 rounded-xl border border-edge-muted bg-menu-glass py-2 pr-2 pl-4 text-sm touch:bottom-[max(calc(var(--bottom-nav-height,0px)+1rem),var(--safe-bottom))]"
    >
      <span className="whitespace-nowrap text-ink">
        {count} unsaved {count === 1 ? 'change' : 'changes'}
      </span>
      <span className="flex items-center gap-1">
        <Button size="sm" disabled={saving} onClick={onDiscard}>
          Discard
        </Button>
        <Button variant="cta" size="sm" disabled={saving} onClick={onSave}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </span>
    </div>
  );
}

export const ResourceDetail = {
  Root,
  Main,
  Header,
  Body,
  Title,
  Block,
  Fold,
  Aside,
  Section,
  Changes,
};
