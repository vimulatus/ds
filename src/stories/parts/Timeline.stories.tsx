import type { Meta, StoryObj } from '@storybook/react-vite';
import { Timeline, TimelineEvent } from '@/components/Timeline';

/**
 * A vertical list of events, newest first. `TimelineEvent` (also
 * `Timeline.Event`) takes a `title`, a `time`, an optional `description`, and
 * an optional `meta` line for who did it. The hairline runs from each dot to
 * the next; the last event ends it.
 *
 * - **Do** put only `TimelineEvent`s inside a `Timeline`.
 * - **Do** keep `time` short and relative when it is recent: "2 h ago".
 * - **Don't** use it for a list the user acts on row by row; that is a list.
 */
const meta = {
  title: 'Parts/Timeline',
  component: Timeline,
} satisfies Meta<typeof Timeline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Timeline className="w-120">
      <TimelineEvent
        title="Follow-up scheduled"
        time="2 h ago"
        description="Today, 4:30 pm · Confirm Saturday site visit"
        meta="Ananya Iyer · Telecaller"
      />
      <TimelineEvent
        title="Stage moved"
        time="Yesterday"
        description="Skyline Heights: Enquiry → Qualification"
        meta="Ananya Iyer · Telecaller"
      />
      <TimelineEvent title="Enquiry received" time="Aug 20" meta="System" />
    </Timeline>
  ),
};

/** Title and time only. */
export const Minimal: Story = {
  render: () => (
    <Timeline className="w-120">
      <TimelineEvent title="Created" time="Sep 18" />
      <TimelineEvent title="Shared with Rahul" time="Sep 17" />
    </Timeline>
  ),
};
