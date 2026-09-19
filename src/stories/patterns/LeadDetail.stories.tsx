import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { PHONE } from '../phone';
import { LEAD, NEW_LEAD } from './lead-detail/data';
import { LeadDetail } from './lead-detail/LeadDetail';

/**
 * A sales lead, built on the resource detail pattern: the lead in the
 * middle, its properties in the aside, one hairline between them. Every
 * open enquiry sits on the page with its own stage rail, so nothing hides
 * behind a project tab. The next follow-up sits under the name and carries
 * the page's one `cta`. Budget, location and custom fields edit in place;
 * the Changes bar saves them, and Enter and Escape work from any field.
 */
const meta = {
  title: 'Patterns/Lead detail',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj;

function Frame({ children, width }: { children: ReactNode; width?: string }) {
  return (
    <div className="h-screen min-h-160 bg-page p-2 touch:p-0">
      <div
        className="mx-auto size-full overflow-hidden rounded-xl border border-edge-muted touch:rounded-none touch:border-0"
        style={{ maxWidth: width }}
      >
        {children}
      </div>
    </div>
  );
}

/** A follow-up due today, one open enquiry, and one project closed as not interested. */
export const Default: Story = {
  render: () => (
    <Frame>
      <LeadDetail />
    </Frame>
  ),
};

/**
 * Below 1224px the aside hides. The properties fold into Details at the top
 * of the body, with a one-line summary while closed.
 */
export const Narrow: Story = {
  render: () => (
    <Frame width="960px">
      <LeadDetail />
    </Frame>
  ),
};

/** The follow-up passed: the row turns to the warning tint and says so. */
export const MissedFollowUp: Story = {
  name: 'Missed follow-up',
  render: () => (
    <Frame>
      <LeadDetail
        lead={{
          ...LEAD,
          followUps: LEAD.followUps.map((f, i) =>
            i === 0 ? { ...f, when: 'Yesterday, 4:30 pm', state: 'missed' } : f
          ),
        }}
      />
    </Frame>
  ),
};

/** A lead with no project yet. The header offers "Schedule follow-up" in place of the row. */
export const NoEnquiries: Story = {
  name: 'No enquiries',
  render: () => (
    <Frame>
      <LeadDetail lead={NEW_LEAD} />
    </Frame>
  ),
};

/** On a phone the canvas fills the screen and the properties fold into Details. */
export const Phone: Story = {
  ...PHONE,
  render: () => (
    <Frame>
      <LeadDetail />
    </Frame>
  ),
};
