import type { Meta, StoryObj } from '@storybook/react-vite';
import { Timeline, TimelineEvent } from '@/components/Timeline';

/**
 * A vertical list of events, newest first. Each event has a title and a
 * time, and may add a description and a meta line for who did it. The
 * hairline runs from each dot to the next; the last event ends it.
 *
 * - **Do** keep `time` short and relative when it is recent: "2 h ago".
 * - **Don't** use it for rows the user acts on one by one; that is a list.
 */
const meta = {
  title: 'Parts/Timeline',
  component: Timeline,
} satisfies Meta<typeof Timeline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Timeline className="w-120 max-w-full">
      <TimelineEvent
        title="Review scheduled"
        time="2 h ago"
        description="Thursday, 3:00 pm · Walk through the launch checklist"
        meta="Nina Park · Design"
      />
      <TimelineEvent
        title="Stage moved"
        time="Yesterday"
        description="Spring launch: Draft → Review"
        meta="Omar Haddad · Product"
      />
      <TimelineEvent title="Project created" time="Sep 2" meta="Lena Novak" />
    </Timeline>
  ),
};

/** Title and time alone. */
export const Minimal: Story = {
  render: () => (
    <Timeline className="w-120 max-w-full">
      <TimelineEvent title="Created" time="Sep 18" />
      <TimelineEvent title="Shared with Jonas" time="Sep 17" />
    </Timeline>
  ),
};
