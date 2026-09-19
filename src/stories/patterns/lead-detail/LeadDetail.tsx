import { CalendarBlank, DotsThree, Link, PencilSimple, Phone, Plus, Users } from '@phosphor-icons/react';
import { useId, useState } from 'react';
import { Button, buttonClasses } from '@/components/Button';
import { EmptyStatePanel } from '@/components/EmptyStatePanel';
import { Input } from '@/components/Input';
import { MaskReveal } from '@/components/MaskReveal';
import { Menu, MenuContent, MenuItem, MenuTrigger } from '@/components/Menu';
import { cn } from '@/lib/cn';
import { EditableProperty, editablePropertyClasses, Property, PropertyGrid } from '@/patterns/PropertyGrid';
import { ResourceDetail } from '@/patterns/ResourceDetail';
import { Activity } from './Activity';
import { AssignPopover, SourceBadge } from './Assign';
import {
  changedFields,
  type Draft,
  type Enquiry,
  LEAD,
  type Lead,
  moment,
  type Person,
  PROJECTS,
  type Project,
  STAGE_LABEL,
  type Source,
  tidyFields,
  toDraft,
} from './data';
import { EnquiryRow } from './Enquiry';
import { FollowUpRow } from './FollowUp';
import { OtherProjects } from './OtherProjects';

type PropertiesProps = {
  lead: Lead;
  draft: Draft;
  onDraft: (draft: Draft) => void;
  onAssign: (person: Person) => void;
  onSave: () => void;
  onDiscard: () => void;
};

/**
 * The lead's properties. Rendered twice, in the aside and in the fold, so
 * every id takes a prefix of its own.
 */
function Properties({ lead, draft, onDraft, onAssign, onSave, onDiscard }: PropertiesProps) {
  const id = useId();
  const setField = (index: number, part: 0 | 1, text: string) =>
    onDraft({
      ...draft,
      fields: draft.fields.map((row, i) =>
        i === index ? (part === 0 ? [text, row[1]] : [row[0], text]) : row
      ),
    });
  return (
    <PropertyGrid onSave={onSave} onDiscard={onDiscard}>
      <Property label="Assigned">
        <AssignPopover person={lead.assigned} onAssign={onAssign} />
      </Property>
      <Property label="Source">
        <SourceBadge source={lead.source} />
      </Property>
      <EditableProperty
        id={`${id}-budget`}
        label="Budget"
        className="tabular-nums"
        value={draft.budget}
        onChange={(event) => onDraft({ ...draft, budget: event.currentTarget.value })}
      />
      <EditableProperty
        id={`${id}-location`}
        label="Location"
        value={draft.location}
        onChange={(event) => onDraft({ ...draft, location: event.currentTarget.value })}
      />
      <Property label="Created">
        <span className="text-ink-muted">{lead.created}</span>
      </Property>
      {draft.fields.map(([label, value], index) => (
        <FieldRow
          key={index}
          label={label}
          value={value}
          onLabel={(text) => setField(index, 0, text)}
          onValue={(text) => setField(index, 1, text)}
        />
      ))}
      <Property label={null}>
        <Button
          size="sm"
          className="-mx-2"
          onClick={() => onDraft({ ...draft, fields: [...draft.fields, ['', '']] })}
        >
          <Plus />
          Add field
        </Button>
      </Property>
    </PropertyGrid>
  );
}

/** A custom field: its name and its value are both ghost inputs. */
function FieldRow({
  label,
  value,
  onLabel,
  onValue,
}: {
  label: string;
  value: string;
  onLabel: (text: string) => void;
  onValue: (text: string) => void;
}) {
  return (
    <>
      <Input
        variant="ghost"
        size="sm"
        aria-label="Field name"
        placeholder="Field"
        className={cn(editablePropertyClasses, 'text-ink-subtle')}
        value={label}
        onChange={(event) => onLabel(event.currentTarget.value)}
      />
      <Input
        variant="ghost"
        size="sm"
        aria-label={label || 'Field value'}
        placeholder="Value"
        className={editablePropertyClasses}
        value={value}
        onChange={(event) => onValue(event.currentTarget.value)}
      />
    </>
  );
}

/**
 * A lead on the resource detail pattern: the lead in the middle, its
 * properties in the aside, folded into the body below 1224px. Every open
 * enquiry stacks under the title with its own stage rail; the next
 * follow-up sits under the name with the page's one `cta`. Budget, location
 * and the custom fields edit in place and save through the Changes bar.
 */
export function LeadDetail({ lead: initial = LEAD }: { lead?: Lead }) {
  const [lead, setLead] = useState(initial);
  const [draft, setDraft] = useState(() => toDraft(initial));
  const [saving, setSaving] = useState(false);
  const changed = changedFields(lead, draft);

  const log = (next: Partial<Lead>, ...moments: ReturnType<typeof moment>[]) =>
    setLead((current) => ({ ...current, ...next, moments: [...moments, ...current.moments] }));

  const discard = () => setDraft(toDraft(lead));
  const save = () => {
    if (changed.length === 0 || saving) return;
    setSaving(true);
    window.setTimeout(() => {
      const next: Lead = {
        ...lead,
        budget: draft.budget.trim(),
        location: draft.location.trim(),
        fields: tidyFields(draft.fields),
        moments: [moment('Details updated', changed.join(', ')), ...lead.moments],
      };
      setLead(next);
      setDraft(toDraft(next));
      setSaving(false);
    }, 400);
  };

  const properties: PropertiesProps = {
    lead,
    draft,
    onDraft: setDraft,
    onAssign: (person) =>
      log({ assigned: person }, moment('Lead assigned', person.name)),
    onSave: save,
    onDiscard: discard,
  };

  const followUp = lead.followUps.find((f) => f.state !== 'done');
  const settleFollowUp = (title: string, patch: { when?: string; state: 'due' | 'done' }) => {
    if (!followUp) return;
    log(
      { followUps: lead.followUps.map((f) => (f.id === followUp.id ? { ...f, ...patch } : f)) },
      moment(title, patch.when ? `${patch.when} · ${followUp.remarks}` : followUp.remarks)
    );
  };

  const updateEnquiry = (next: Enquiry) => {
    const prev = lead.enquiries.find((e) => e.id === next.id);
    const events =
      !prev ? []
      : next.closed && !prev.closed ? [moment('Not interested', `${next.project}: ${next.closed.reason.toLowerCase()}`)]
      : !next.closed && prev.closed ? [moment('Enquiry reopened', next.project)]
      : next.stage !== prev.stage
        ? [moment('Stage moved', `${next.project}: ${STAGE_LABEL[prev.stage]} → ${STAGE_LABEL[next.stage]}`)]
        : [];
    log({ enquiries: lead.enquiries.map((e) => (e.id === next.id ? next : e)) }, ...events);
  };

  const addEnquiry = (project: Project, source: Source) =>
    log(
      {
        enquiries: [
          ...lead.enquiries,
          {
            id: `e-${project.id}`,
            project: project.name,
            locality: project.locality,
            assigned: lead.assigned,
            source,
            opened: 'Today',
            stage: 'enquiry',
            wants: [],
          },
        ],
      },
      moment('Enquiry opened', `${project.name}, via ${source}`)
    );

  const openEnquiries = lead.enquiries.filter((e) => !e.closed);
  const otherProjects = PROJECTS.flatMap((project) => {
    const enquiry = lead.enquiries.find((e) => e.project === project.name);
    return enquiry && !enquiry.closed ? [] : [{ project, closed: enquiry }];
  });

  return (
    <ResourceDetail.Root grain>
      <ResourceDetail.Main>
        <ResourceDetail.Header
          crumbs={[{ label: 'Leads', icon: <Users /> }, { label: lead.name }]}
          actions={
            <>
              <a
                href={`tel:${lead.phone.full.replace(/\s/g, '')}`}
                className={buttonClasses({ variant: 'accent', size: 'sm' })}
              >
                <Phone />
                Call
              </a>
              {!followUp && (
                <Button variant="outlined" size="sm">
                  <CalendarBlank />
                  Schedule follow-up
                </Button>
              )}
              <Menu>
                <MenuTrigger variant="ghost" size="icon-md" label="More actions">
                  <DotsThree />
                </MenuTrigger>
                <MenuContent align="end">
                  <MenuItem icon={<PencilSimple />}>Edit lead</MenuItem>
                  <MenuItem icon={<Link />}>Copy link</MenuItem>
                </MenuContent>
              </Menu>
            </>
          }
        />
        <ResourceDetail.Body>
          <ResourceDetail.Title
            meta={
              <>
                <MaskReveal masked={lead.phone.masked} value={lead.phone.full} label="phone number" />
                <span className="truncate">{lead.email}</span>
              </>
            }
            footer={
              followUp && (
                <FollowUpRow
                  followUp={followUp}
                  onDone={() => settleFollowUp('Follow-up done', { state: 'done' })}
                  onMove={(when) => settleFollowUp('Follow-up moved', { when, state: 'due' })}
                />
              )
            }
          >
            {lead.name}
          </ResourceDetail.Title>

          <ResourceDetail.Fold summary={`${lead.assigned.name} · ${lead.source} · ${draft.budget}`}>
            <Properties {...properties} />
          </ResourceDetail.Fold>

          <ResourceDetail.Block title="Enquiries" className="gap-0">
            {openEnquiries.length > 0 ? (
              <div className="flex flex-col divide-y divide-edge-muted">
                {openEnquiries.map((enquiry) => (
                  <EnquiryRow key={enquiry.id} enquiry={enquiry} onChange={updateEnquiry} />
                ))}
              </div>
            ) : (
              <EmptyStatePanel
                centered
                tone="neutral"
                title={lead.enquiries.length > 0 ? 'No open enquiries' : 'No enquiries yet'}
                description="Open one from the projects below. The stage rail starts at Enquiry."
                className="min-h-32 px-0"
              />
            )}
          </ResourceDetail.Block>

          <ResourceDetail.Block title="Other projects" className="gap-1">
            <OtherProjects
              rows={otherProjects}
              onAdd={addEnquiry}
              onReopen={(enquiry) =>
                updateEnquiry({ ...enquiry, closed: undefined, stage: 'enquiry', opened: 'Today' })
              }
            />
          </ResourceDetail.Block>

          <Activity
            moments={lead.moments}
            notes={lead.notes}
            followUps={lead.followUps}
            onNote={(content) =>
              log(
                {
                  notes: [
                    { id: `n-${crypto.randomUUID()}`, author: 'You', when: 'Just now', content },
                    ...lead.notes,
                  ],
                },
                moment('Note added', content)
              )
            }
          />
        </ResourceDetail.Body>
      </ResourceDetail.Main>
      <ResourceDetail.Aside>
        <ResourceDetail.Section title="Properties">
          <Properties {...properties} />
        </ResourceDetail.Section>
      </ResourceDetail.Aside>
      <ResourceDetail.Changes
        count={changed.length}
        saving={saving}
        onSave={save}
        onDiscard={discard}
      />
    </ResourceDetail.Root>
  );
}
