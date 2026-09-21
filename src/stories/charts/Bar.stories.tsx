import type { Meta, StoryObj } from '@storybook/react-vite';
import { bar } from '@/components/Chart';
import { PHONE } from '../phone';
import { FuelSold, FuelSoldByPump, fuelSales, type Day, type Pump } from './sample';

/**
 * Bars over time, for counts per day. Each day is a band: its bars stand side
 * by side, or stack into one bar whose tooltip ends with the total. Hover
 * washes the day's band in place of a crosshair, and a selected range covers
 * whole bands. Pin and compare, range and zoom work as they do on the line
 * chart. Two weeks of days keep a bar wide enough to read.
 *
 * The horizontal stories rank categories instead: `RankedBars` sorts its rows
 * by what is showing, so hiding a series can reorder them. Hover reads a row
 * and a click pins it for comparison. With no time axis there is no range and
 * no zoom.
 */
const meta = {
  title: 'Charts/Bar',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const SALES = fuelSales(14);

const MARKS = [
  bar<Day>({ y: 'petrol', label: 'Petrol' }),
  bar<Day>({ y: 'diesel', label: 'Diesel' }),
  bar<Day>({ y: 'cng', label: 'CNG' }),
];

export const Default: Story = { render: () => <FuelSold data={SALES} marks={MARKS} /> };

export const Stacked: Story = { render: () => <FuelSold data={SALES} marks={MARKS} stacked /> };

export const Phone: Story = { ...PHONE, render: () => <FuelSold data={SALES} marks={MARKS} stacked /> };

const PUMP_MARKS = [
  bar<Pump>({ y: 'petrol', label: 'Petrol' }),
  bar<Pump>({ y: 'diesel', label: 'Diesel' }),
  bar<Pump>({ y: 'cng', label: 'CNG' }),
];

export const Horizontal: Story = { render: () => <FuelSoldByPump marks={PUMP_MARKS} /> };

export const HorizontalStacked: Story = { render: () => <FuelSoldByPump marks={PUMP_MARKS} stacked /> };

export const HorizontalPhone: Story = { ...PHONE, render: () => <FuelSoldByPump marks={PUMP_MARKS} stacked /> };
