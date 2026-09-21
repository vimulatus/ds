import type { Meta, StoryObj } from '@storybook/react-vite';
import { line } from '@/components/Chart';
import { PHONE } from '../phone';
import { FuelSold, fuelSales, type Day } from './sample';

/**
 * A line per series over time, with the behaviour every chart shares. Hover
 * reads all series at one position. A click pins that position, and the next
 * hover compares against it. A drag selects a range; its handles drag and take
 * arrow keys. Hold ⌘ or Ctrl and scroll, or pinch, to zoom; hold ⇧ and drag, or
 * scroll sideways, to move. On a phone a tap fills the readout above the plot,
 * because a finger would cover a tooltip.
 */
const meta = {
  title: 'Charts/Line',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const SALES = fuelSales(31);

const MARKS = [
  line<Day>({ y: 'petrol', label: 'Petrol' }),
  line<Day>({ y: 'diesel', label: 'Diesel' }),
  line<Day>({ y: 'cng', label: 'CNG' }),
];

export const Default: Story = { render: () => <FuelSold data={SALES} marks={MARKS} /> };

export const Phone: Story = { ...PHONE, render: () => <FuelSold data={SALES} marks={MARKS} /> };
