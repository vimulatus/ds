import { Check } from '@phosphor-icons/react';
import { useState } from 'react';
import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from '@/components/Popover';
import { PEOPLE, type Person, SOURCE_HUE, type Source } from './data';

/** A lead source on its own hue. */
export function SourceBadge({ source }: { source: Source }) {
  return (
    <Badge size="sm" hue={SOURCE_HUE[source]} className="w-fit">
      {source}
    </Badge>
  );
}

/** A person on one line: avatar, then name. */
export function PersonLine({ person }: { person: Person }) {
  return (
    <span className="flex items-center gap-1.5">
      <Avatar name={person.name} size="sm" aria-hidden />
      {person.name}
    </span>
  );
}

/** Who owns the lead. Opens a short list of the team; each enquiry keeps its own owner. */
export function AssignPopover({
  person,
  onAssign,
}: {
  person: Person;
  onAssign: (person: Person) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger variant="ghost" size="sm" className="-mx-1.5 w-fit text-sm font-normal text-ink">
        <PersonLine person={person} />
      </PopoverTrigger>
      <PopoverContent className="w-60 gap-2 p-1.5">
        <PopoverTitle className="px-1.5 pt-1 text-xs text-ink-muted">Assign lead</PopoverTitle>
        <div className="flex flex-col">
          {PEOPLE.map((candidate) => {
            const current = candidate.name === person.name;
            return (
              <button
                key={candidate.name}
                type="button"
                aria-current={current || undefined}
                onClick={() => {
                  onAssign(candidate);
                  setOpen(false);
                }}
                className="flex items-center gap-2 rounded-md px-1.5 py-1.5 text-left text-sm hover:bg-hover focus-visible:outline-2 focus-visible:outline-accent touch:min-h-11"
              >
                <Avatar name={candidate.name} size="md" aria-hidden />
                <span className="flex min-w-0 flex-1 flex-col leading-tight">
                  <span className="text-ink">{candidate.name}</span>
                  <span className="text-xs text-ink-subtle">{candidate.role}</span>
                </span>
                {current && <Check className="size-3.5 text-accent" />}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
