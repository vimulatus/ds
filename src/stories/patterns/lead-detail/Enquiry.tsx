import { Button } from '@/components/Button';
import { confirm } from '@/components/ConfirmDialog';
import {
  Menu,
  MenuContent,
  MenuGroup,
  MenuLabel,
  MenuRadioGroup,
  MenuRadioItem,
  MenuTrigger,
} from '@/components/Menu';
import { Progress } from '@/components/Progress';
import { cn } from '@/lib/cn';
import { PersonLine, SourceBadge } from './Assign';
import { type Enquiry, PROJECTS, STAGE_LABEL, STAGES, type Stage } from './data';

const STEPS = STAGES.map((stage) => ({ value: stage, label: STAGE_LABEL[stage] }));

/** The stage, on an outlined chip. Picking another stage asks first, naming the project and the stage. */
function StageMenu({ enquiry, onMove }: { enquiry: Enquiry; onMove: (stage: Stage) => void }) {
  const move = async (stage: Stage) => {
    if (stage === enquiry.stage) return;
    const ok = await confirm({
      title: `Move ${enquiry.project} to ${STAGE_LABEL[stage]}?`,
      description: `The stage moves from ${STAGE_LABEL[enquiry.stage]}. The timeline records the change.`,
      confirmLabel: 'Move',
    });
    if (ok) onMove(stage);
  };
  return (
    <Menu>
      <MenuTrigger variant="outlined" size="sm">
        {STAGE_LABEL[enquiry.stage]}
      </MenuTrigger>
      <MenuContent align="end">
        <MenuGroup>
          <MenuLabel>Move to</MenuLabel>
          <MenuRadioGroup value={enquiry.stage} onValueChange={(value) => void move(value as Stage)}>
            {STAGES.map((stage) => (
              <MenuRadioItem key={stage} value={stage} closeOnClick>
                {STAGE_LABEL[stage]}
              </MenuRadioItem>
            ))}
          </MenuRadioGroup>
        </MenuGroup>
      </MenuContent>
    </Menu>
  );
}

/**
 * One open enquiry: the project, who owns it and where it came from, the
 * stage chip and "Not interested", the stage rail, then the unit types the
 * lead wants. Every enquiry stacks on the page; none hides behind a tab.
 */
export function EnquiryRow({
  enquiry,
  onChange,
}: {
  enquiry: Enquiry;
  onChange: (enquiry: Enquiry) => void;
}) {
  const units = PROJECTS.find((project) => project.name === enquiry.project)?.units ?? [];

  const notInterested = async () => {
    const ok = await confirm({
      title: `Mark ${enquiry.project} not interested?`,
      description: 'The enquiry closes at its current stage. The lead and its other enquiries stay open.',
      confirmLabel: 'Mark not interested',
      destructive: true,
    });
    if (ok) onChange({ ...enquiry, closed: { on: 'Today', reason: 'Other' } });
  };

  const toggle = (unit: string, pressed: boolean) =>
    onChange({
      ...enquiry,
      wants: pressed ? [...enquiry.wants, unit] : enquiry.wants.filter((want) => want !== unit),
    });

  return (
    <section aria-label={enquiry.project} className="flex flex-col gap-4 py-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 basis-60 flex-col gap-1">
          <h3 className="flex items-baseline gap-2 text-base font-medium text-ink">
            <span className="truncate">{enquiry.project}</span>
            <span className="text-sm font-normal text-ink-subtle">{enquiry.locality}</span>
          </h3>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
            <PersonLine person={enquiry.assigned} />
            <SourceBadge source={enquiry.source} />
            <span>Opened {enquiry.opened}</span>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Button variant="danger" size="sm" onClick={notInterested}>
            Not interested
          </Button>
          <StageMenu enquiry={enquiry} onMove={(stage) => onChange({ ...enquiry, stage })} />
        </div>
      </div>

      <Progress steps={STEPS} value={enquiry.stage} label={`${enquiry.project} stages`} />

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-xs text-ink-subtle">Preferences</span>
        {units.map((unit) => (
          <button
            key={unit}
            type="button"
            aria-pressed={enquiry.wants.includes(unit)}
            onClick={() => toggle(unit, !enquiry.wants.includes(unit))}
            className={cn(
              'rounded-full border px-2 py-0.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-60 touch:min-h-9 touch:px-3',
              enquiry.wants.includes(unit)
                ? 'border-transparent bg-accent-bg text-accent'
                : 'border-edge-muted text-ink-muted hover:bg-hover'
            )}
          >
            {unit}
          </button>
        ))}
      </div>
    </section>
  );
}
