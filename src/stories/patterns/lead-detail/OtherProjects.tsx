import { Collapsible } from '@base-ui/react/collapsible';
import { CaretRight, Plus, Prohibit, WhatsappLogo } from '@phosphor-icons/react';
import { useState } from 'react';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Dropdown } from '@/components/Dropdown';
import { cn } from '@/lib/cn';
import { Property, PropertyGrid } from '@/patterns/PropertyGrid';
import { type Enquiry, type Project, SOURCES, STAGE_LABEL, type Source } from './data';
import { TintRow } from './TintRow';

/** A description this long clamps to two lines behind "Show more". */
const CLAMP_AT = 120;

function Description({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const long = text.length > CLAMP_AT;
  return (
    <div className="flex flex-col items-start gap-1">
      <p className={cn('text-sm text-ink-muted', long && !expanded && 'line-clamp-2')}>{text}</p>
      {long && (
        <Button
          size="sm"
          className="-mx-2"
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Show less' : 'Show more'}
        </Button>
      )}
    </div>
  );
}

/** Opens an enquiry for the project, asking first where the lead came from. */
function AddEnquiry({ onAdd }: { onAdd: (source: Source) => void }) {
  return (
    <Dropdown placement="bottom-end">
      <Dropdown.Trigger variant="outlined" size="sm">
        <Plus />
        Add enquiry
      </Dropdown.Trigger>
      <Dropdown.Content>
        <Dropdown.Group>
          <Dropdown.GroupLabel>Source</Dropdown.GroupLabel>
          {SOURCES.map((source) => (
            <Dropdown.Item key={source} onClick={() => onAdd(source)}>
              {source}
            </Dropdown.Item>
          ))}
        </Dropdown.Group>
      </Dropdown.Content>
    </Dropdown>
  );
}

type Row = { project: Project; closed?: Enquiry };

/**
 * A project the lead has no open enquiry for, as a disclosure row. Open, it
 * shows the project's facts, a share button, and "Add enquiry". A project
 * the lead turned down shows the outcome and offers "Reopen enquiry".
 */
function ProjectRow({
  project,
  closed,
  onAdd,
  onReopen,
}: Row & { onAdd: (project: Project, source: Source) => void; onReopen: (enquiry: Enquiry) => void }) {
  const fit = !closed && project.fit;
  return (
    <Collapsible.Root render={<li />} className="flex flex-col">
      <Collapsible.Trigger className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-2.5 text-left hover:bg-hover focus-visible:outline-2 focus-visible:outline-accent touch:min-h-11">
        <CaretRight className="size-3 shrink-0 text-ink-subtle transition-transform in-data-panel-open:rotate-90" />
        <span className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-sm font-medium text-ink">{project.name}</span>
          <span className="text-xs text-ink-subtle">
            {project.locality} · from {project.from}
          </span>
        </span>
        {closed?.closed ? (
          <Badge size="sm" className="border-transparent bg-red-bg text-red-ink">
            Not interested
            <span className="hidden @[560px]/article:inline">· {closed.closed.reason}</span>
          </Badge>
        ) : fit ? (
          <Badge size="sm" className="border-transparent bg-green-bg text-green-ink hidden @[560px]/article:inline-flex">
            {fit}
          </Badge>
        ) : undefined}
      </Collapsible.Trigger>
      <Collapsible.Panel className="flex flex-col gap-3 pt-1 pb-4 pl-6">
        {closed?.closed && (
          <TintRow tone="red" icon={<Prohibit />} label="Not interested">
            {closed.closed.reason}
            <span className="text-ink-muted">
              {' '}
              · {closed.closed.on} · {closed.assigned.name} · at {STAGE_LABEL[closed.stage]}
            </span>
          </TintRow>
        )}
        <Description text={project.description} />
        <PropertyGrid className="gap-y-1.5">
          <Property label="Type">
            <span className="text-ink">{project.type}</span>
          </Property>
          <Property label="Amenities">
            <span className="text-ink">{project.amenities.join(', ')}</span>
          </Property>
          <Property label="RERA">
            <span className="text-ink tabular-nums">{project.rera}</span>
          </Property>
        </PropertyGrid>
        <div className="flex flex-wrap items-center gap-2">
          {fit && (
            <Badge size="sm" className="border-transparent bg-green-bg text-green-ink @[560px]/article:hidden">
              {fit}
            </Badge>
          )}
          <span className="ml-auto flex">
            <Button variant="ghost" size="icon-md" label="Share on WhatsApp">
              <WhatsappLogo />
            </Button>
          </span>
          {closed ? (
            <Button variant="outlined" size="sm" onClick={() => onReopen(closed)}>
              Reopen enquiry
            </Button>
          ) : (
            <AddEnquiry onAdd={(source) => onAdd(project, source)} />
          )}
        </div>
      </Collapsible.Panel>
    </Collapsible.Root>
  );
}

/**
 * The company's projects without an open enquiry for this lead, so the
 * executive can pitch the next one without leaving the call.
 */
export function OtherProjects({
  rows,
  onAdd,
  onReopen,
}: {
  rows: Row[];
  onAdd: (project: Project, source: Source) => void;
  onReopen: (enquiry: Enquiry) => void;
}) {
  if (rows.length === 0) {
    return <p className="py-2 text-sm text-ink-subtle">This lead has an open enquiry for every project.</p>;
  }
  return (
    <ul className="flex flex-col divide-y divide-edge-muted">
      {rows.map((row) => (
        <ProjectRow key={row.project.id} {...row} onAdd={onAdd} onReopen={onReopen} />
      ))}
    </ul>
  );
}
