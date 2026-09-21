import type { Meta, StoryObj } from '@storybook/react-vite';
import { area } from '@/components/Chart';
import { PHONE } from '../phone';
import { FuelSold, fuelSales, type Day } from './sample';

/**
 * An area per series over time, for volume. Side by side, each series is a
 * line over a fill that fades to the baseline, so the series can cross and
 * still read. Stacked, the series are bands that add up: the top edge is the
 * total, and the tooltip ends with it. Hover, pin and compare, range and zoom
 * work as they do on the line chart.
 */
const meta = {
  title: 'Charts/Area',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const SALES = fuelSales(31);

const MARKS = [
  area<Day>({ y: 'petrol', label: 'Petrol' }),
  area<Day>({ y: 'diesel', label: 'Diesel' }),
  area<Day>({ y: 'cng', label: 'CNG' }),
];

export const Default: Story = { render: () => <FuelSold data={SALES} marks={MARKS} /> };

export const Stacked: Story = { render: () => <FuelSold data={SALES} marks={MARKS} stacked /> };

export const Phone: Story = { ...PHONE, render: () => <FuelSold data={SALES} marks={MARKS} /> };
