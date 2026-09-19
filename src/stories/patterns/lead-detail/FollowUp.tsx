import { Check, Clock, WarningCircle } from '@phosphor-icons/react';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Menu, MenuContent, MenuGroup, MenuItem, MenuLabel, MenuTrigger } from '@/components/Menu';
import type { FollowUp } from './data';
import { TintRow } from './TintRow';

const MOVE_OPTIONS = ['Tomorrow, 10:00 am', 'Sep 21, 4:30 pm', 'Sep 25, 11:00 am'];

/**
 * The next follow-up, under the lead's name: `accent` when due, `warning`
 * once missed. Its Done is the page's one `cta`; Move offers the next slots.
 */
export function FollowUpRow({
  followUp,
  onDone,
  onMove,
}: {
  followUp: FollowUp;
  onDone: () => void;
  onMove: (when: string) => void;
}) {
  const missed = followUp.state === 'missed';
  return (
    <TintRow
      tone={missed ? 'warning' : 'accent'}
      icon={missed ? <WarningCircle /> : <Clock />}
      label={missed ? 'Follow-up missed' : 'Follow-up'}
      aria-label={missed ? 'Missed follow-up' : 'Next follow-up'}
      actions={
        <>
          <Menu>
            <MenuTrigger variant="ghost" size="sm">
              Move
            </MenuTrigger>
            <MenuContent align="end">
              <MenuGroup>
                <MenuLabel>Move to</MenuLabel>
                {MOVE_OPTIONS.map((when) => (
                  <MenuItem key={when} onClick={() => onMove(when)}>
                    {when}
                  </MenuItem>
                ))}
              </MenuGroup>
            </MenuContent>
          </Menu>
          <Button variant="cta" size="sm" onClick={onDone}>
            <Check />
            Done
          </Button>
        </>
      }
    >
      {followUp.when}
      <span className="text-ink-muted"> · {followUp.remarks}</span>
    </TintRow>
  );
}

const STATE: Record<FollowUp['state'], { label: string; className: string }> = {
  due: { label: 'Due', className: 'border-transparent bg-accent-bg text-accent-ink' },
  missed: { label: 'Missed', className: 'border-transparent bg-warning-bg text-warning-ink' },
  done: { label: 'Done', className: 'border-transparent bg-success-bg text-success-ink' },
};

/** Every follow-up on the lead, newest first, each with its state. */
export function FollowUpList({ followUps }: { followUps: FollowUp[] }) {
  return (
    <ul className="flex flex-col divide-y divide-edge-muted">
      {followUps.map((followUp) => (
        <li key={followUp.id} className="flex items-center gap-3 py-2.5 first:pt-0">
          <Badge className={`w-16 ${STATE[followUp.state].className}`}>
            {STATE[followUp.state].label}
          </Badge>
          <span className="min-w-0 flex-1 truncate text-sm text-ink">
            {followUp.when}
            <span className="text-ink-muted"> · {followUp.remarks}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
