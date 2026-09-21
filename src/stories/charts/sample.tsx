import { Card } from '@/components/Card';
import { Chart, type ChartMark } from '@/components/Chart';
import { Donut } from '@/components/Donut';
import { RankedBars } from '@/components/RankedBars';

export type Day = { date: Date; petrol: number; diesel: number; cng: number };

/** Sample data for the chart stories: litres sold per day in August, steady enough to read and uneven enough to compare. */
export function fuelSales(days: number): Day[] {
  let seed = 7;
  const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(2026, 7, i + 1);
    const weekend = date.getDay() === 0 || date.getDay() === 6 ? 1 : 0;
    return {
      date,
      petrol: Math.round(4700 + 900 * weekend + 500 * Math.sin(i / 4.5) + 420 * random()),
      diesel: Math.round(6300 - 1100 * weekend + 420 * Math.cos(i / 6) + 520 * random()),
      cng: Math.round(1900 + 38 * i + 300 * random()),
    };
  });
}

const date = (row: Day) => row.date;
const litres = new Intl.NumberFormat('en-IN');
const day = new Intl.DateTimeFormat('en-IN', { day: 'numeric' });
const dayMonth = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' });
const weekday = new Intl.DateTimeFormat('en-IN', { weekday: 'short' });

/** The fuel chart every chart story draws, on a card, with the marks the story is about. */
export function FuelSold({ data, marks, stacked }: { data: readonly Day[]; marks: readonly ChartMark<Day>[]; stacked?: boolean }) {
  return (
    <div className="bg-panel p-8 touch:p-4">
      <Card className="p-4">
        <Chart
          data={data}
          x={date}
          marks={marks}
          stacked={stacked}
          label="Fuel sold, litres per day"
          title="Fuel sold"
          description="Litres per day · sample data"
          height={360}
          formatX={(at) => `${weekday.format(at)} ${dayMonth.format(at)}`}
          formatTick={(at) => dayMonth.format(at)}
          formatValue={(value) => `${litres.format(value)} L`}
          formatValueTick={(value) => (value === 0 ? '0' : `${value / 1000}k`)}
          formatRange={(start, end, count) => `${day.format(start)} – ${dayMonth.format(end)} · ${count} days`}
        />
      </Card>
    </div>
  );
}

export type Pump = { name: string; petrol: number; diesel: number; cng: number };

/** Sample data for the ranked bars: kilolitres sold by each pump in August, close enough that hiding a fuel reorders them. */
export const PUMP_SALES: readonly Pump[] = [
  { name: 'Pump 1', petrol: 151.9, diesel: 187.3, cng: 84.5 },
  { name: 'Pump 2', petrol: 121.7, diesel: 158.6, cng: 40.3 },
  { name: 'Pump 3', petrol: 168.4, diesel: 204.1, cng: 61.2 },
  { name: 'Pump 4', petrol: 84.6, diesel: 96.2, cng: 38.1 },
  { name: 'Pump 5', petrol: 139.2, diesel: 142.8, cng: 72.9 },
  { name: 'Pump 6', petrol: 98.3, diesel: 117.4, cng: 55.8 },
];

const pumpName = (row: Pump) => row.name;

/** The pump ranking the horizontal bar stories draw, on a card. */
export function FuelSoldByPump({ marks, stacked }: { marks: readonly ChartMark<Pump>[]; stacked?: boolean }) {
  return (
    <div className="bg-panel p-8 touch:p-4">
      <Card className="p-4">
        <RankedBars
          data={PUMP_SALES}
          category={pumpName}
          marks={marks}
          stacked={stacked}
          label="Fuel sold by pump, in kilolitres"
          title="Fuel sold by pump"
          description="Kilolitres · August 2026 · sample data"
          formatValue={(value) => `${value.toFixed(1)} kL`}
          formatValueTick={(value) => (value === 0 ? '0' : `${value} kL`)}
        />
      </Card>
    </div>
  );
}

export type PaymentMode = { mode: string; lakhs: number };

/** Sample data for the donut: a month's sales by payment mode, in lakh rupees. */
export const PAYMENT_MODES: readonly PaymentMode[] = [
  { mode: 'UPI', lakhs: 38.4 },
  { mode: 'Cash', lakhs: 27.9 },
  { mode: 'Card', lakhs: 14.2 },
  { mode: 'Fleet card', lakhs: 9.6 },
  { mode: 'Credit', lakhs: 5.1 },
];

const modeName = (row: PaymentMode) => row.mode;
const modeSales = (row: PaymentMode) => row.lakhs;

/** The payment mode donut both donut stories draw, on a card as wide as its board. */
export function SalesByPaymentMode() {
  return (
    <div className="bg-panel p-8 touch:p-4">
      <Card className="max-w-100 p-4 touch:max-w-none">
        <Donut
          data={PAYMENT_MODES}
          category={modeName}
          value={modeSales}
          label="Sales by payment mode, in lakh rupees"
          title="Sales by payment mode"
          description="Lakh rupees · August 2026 · sample data"
          total="Sales"
          note="August 2026"
          formatValue={(value) => `₹${value.toFixed(1)} L`}
        />
      </Card>
    </div>
  );
}
