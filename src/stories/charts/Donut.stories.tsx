import type { Meta, StoryObj } from '@storybook/react-vite';
import { PHONE } from '../phone';
import { SalesByPaymentMode } from './sample';

/**
 * Parts of one whole, for up to six categories; fold the rest into "Other"
 * before passing data in. The hole is the readout: the total while idle, then
 * the slice in focus with its share. Nothing floats, so a tap reads a slice
 * on a phone. A click pins a slice, and the next hover adds its change
 * against the pin. Hiding a slice from the legend re-sums the whole. A
 * slice's colour follows its category, never its rank or its size.
 */
const meta = {
  title: 'Charts/Donut',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { render: () => <SalesByPaymentMode /> };

export const Phone: Story = { ...PHONE, render: () => <SalesByPaymentMode /> };
