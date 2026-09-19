import { Check } from '@phosphor-icons/react';
import { useState } from 'react';
import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { Item } from '@/components/Item';
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
              <Item
                key={candidate.name}
                icon={<Avatar name={candidate.name} size="md" aria-hidden />}
                label={<span className="text-ink">{candidate.name}</span>}
                description={candidate.role}
                meta={current ? <Check className="size-3.5 text-accent" /> : undefined}
                aria-current={current || undefined}
                onClick={() => {
                  onAssign(candidate);
                  setOpen(false);
                }}
              />
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
