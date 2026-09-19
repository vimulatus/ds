import type { Meta, StoryObj } from '@storybook/react-vite';
import { Progress } from '@/components/Progress';

const STAGES = [
  { value: 'enquiry', label: 'Enquiry' },
  { value: 'qualification', label: 'Qualification' },
  { value: 'prospect', label: 'Prospect' },
  { value: 'site_visit', label: 'Site visit' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'booking', label: 'Booking' },
];

/**
 * Steps as dots on one hairline. Current: `accent` fill with a 20% accent
 * ring. Done: `accent-bg` fill, `accent` border. Pending: `edge` border.
 * Below 560px of its own width only the current label renders.
 *
 * - **Do** change the step from a menu or a button beside the rail, and
 *   confirm it.
 * - **Don't** make a dot a target: it is too small on touch.
 */
const meta = {
  title: 'Parts/Progress',
  component: Progress,
  args: { steps: STAGES, value: 'qualification', label: 'Stages' },
  argTypes: {
    value: { control: 'select', options: STAGES.map((stage) => stage.value) },
  },
  render: (args) => (
    <div className="w-160">
      <Progress {...args} />
    </div>
  ),
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** The first step, the middle, and the last. */
export const Steps: Story = {
  render: () => (
    <div className="flex w-160 flex-col gap-8">
      <Progress steps={STAGES} value="enquiry" />
      <Progress steps={STAGES} value="site_visit" />
      <Progress steps={STAGES} value="booking" />
    </div>
  ),
};

/** Under 560px wide, only the current label shows. */
export const Narrow: Story = {
  render: () => (
    <div className="w-80">
      <Progress steps={STAGES} value="prospect" />
    </div>
  ),
};
