import { type FormEvent, useState } from 'react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Tabs } from '@/components/Tabs';
import { Timeline, TimelineEvent } from '@/components/Timeline';
import type { FollowUp, Moment, Note } from './data';
import { FollowUpList } from './FollowUp';

/** A one-line note composer. Save stays off until there is text. */
function NoteComposer({ onSave }: { onSave: (content: string) => void }) {
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content || saving) return;
    setSaving(true);
    window.setTimeout(() => {
      onSave(content);
      setDraft('');
      setSaving(false);
    }, 400);
  };
  return (
    <form className="flex items-center gap-2" onSubmit={submit}>
      <Input
        aria-label="Add a note"
        placeholder="Add a note"
        value={draft}
        onChange={(event) => setDraft(event.currentTarget.value)}
        className="flex-1"
      />
      <Button type="submit" variant="outlined" disabled={!draft.trim() || saving}>
        {saving ? 'Saving…' : 'Save'}
      </Button>
    </form>
  );
}

function NoteList({ notes }: { notes: Note[] }) {
  return (
    <ul className="flex flex-col divide-y divide-edge-muted">
      {notes.map((note) => (
        <li key={note.id} className="flex flex-col gap-1 py-3 first:pt-0">
          <p className="text-sm text-ink">{note.content}</p>
          <p className="text-xs text-ink-subtle">
            {note.author} · {note.when}
          </p>
        </li>
      ))}
    </ul>
  );
}

function MomentList({ moments }: { moments: Moment[] }) {
  return (
    <Timeline>
      {moments.map((moment) => (
        <TimelineEvent
          key={moment.id}
          title={moment.title}
          time={moment.when}
          description={moment.description}
          meta={moment.role ? `${moment.actor} · ${moment.role}` : moment.actor}
        />
      ))}
    </Timeline>
  );
}

/**
 * The lead's history in three tabs: every moment on a timeline, the notes,
 * and the follow-ups. The note composer sits above the timeline and the
 * notes, so a note is one line away while the call runs.
 */
export function Activity({
  moments,
  notes,
  followUps,
  onNote,
}: {
  moments: Moment[];
  notes: Note[];
  followUps: FollowUp[];
  onNote: (content: string) => void;
}) {
  const open = followUps.filter((followUp) => followUp.state !== 'done').length;
  const [tab, setTab] = useState('timeline');
  return (
    <section className="flex flex-col gap-4" aria-label="Activity">
      <Tabs
        list={[
          { value: 'timeline', label: 'Timeline' },
          { value: 'notes', label: `Notes · ${notes.length}` },
          { value: 'followups', label: `Follow-ups · ${open}` },
        ]}
        value={tab}
        onChange={setTab}
        className="-mx-4"
      />
      {tab !== 'followups' && <NoteComposer onSave={onNote} />}
      {tab === 'timeline' && <MomentList moments={moments} />}
      {tab === 'notes' && <NoteList notes={notes} />}
      {tab === 'followups' && <FollowUpList followUps={followUps} />}
    </section>
  );
}
