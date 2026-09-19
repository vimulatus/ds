import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import { Progress, ProgressBar } from '@/components/Progress';

const STAGES = [
  { value: 'draft', label: 'Draft' },
  { value: 'review', label: 'Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'live', label: 'Live' },
  { value: 'wrapped', label: 'Wrapped' },
];

/**
 * A stage rail: dots on one hairline. Current: `accent` fill with a 20%
 * accent ring. Done: `accent-bg` fill, `accent` edge. Pending: `edge` edge.
 * Labels are `xs` and render only above 560px of the rail's own width.
 *
 * - **Do** change the stage from a menu or button beside the rail, and
 *   confirm it.
 * - **Don't** make a dot a target: it is too small to hit on touch.
 */
const meta = {
  title: 'Parts/Progress',
  component: Progress,
  args: { steps: STAGES, value: 'review', label: 'Launch stages' },
  argTypes: { value: { control: 'select', options: STAGES.map((stage) => stage.value) } },
  render: (args) => (
    <div className="w-160 max-w-full">
      <Progress {...args} />
    </div>
  ),
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** The first stage, a middle one, the last. The hairline turns accent up to the current dot. */
export const Stages: Story = {
  render: () => (
    <div className="flex w-160 max-w-full flex-col gap-8">
      {['draft', 'scheduled', 'wrapped'].map((value) => (
        <Progress key={value} steps={STAGES} value={value} label="Launch stages" />
      ))}
    </div>
  ),
};

/** Below 560px of its own width the rail drops its labels; a screen reader still hears them. */
export const Narrow: Story = {
  render: () => (
    <div className="w-80">
      <Progress steps={STAGES} value="approved" label="Launch stages" />
    </div>
  ),
};

/** The plain bar, for work that fills up. `null` is indeterminate. */
export const Bar: Story = {
  render: () => {
    const [value, setValue] = useState(20);
    useEffect(() => {
      const id = setInterval(() => setValue((v) => (v >= 100 ? 10 : Math.min(100, v + 15))), 900);
      return () => clearInterval(id);
    }, []);
    return (
      <div className="flex w-72 flex-col gap-6">
        <ProgressBar value={value} label="Uploading assets" showValue />
        <ProgressBar value={null} label="Preparing export" />
      </div>
    );
  },
};
