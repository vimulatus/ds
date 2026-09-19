import { Plus } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Section } from './Swatch';

/**
 * Sizes are few and shared. Buttons, inputs and badges use one control
 * scale, so anything on a toolbar lines up. Body text is 15px, one step
 * under the browser default, and every border is a 0.5px hairline.
 */
const meta = {
  title: 'Foundations/Sizing',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const CONTROLS = [
  { size: 'sm', height: 24 },
  { size: 'md', height: 32 },
] as const;

/** A Button and an Input of one size share a height, so they sit on one line. */
export const ControlHeights: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {CONTROLS.map((control) => (
        <div key={control.size} className="grid grid-cols-[3rem_4rem_1fr] items-center gap-3">
          <span className="font-mono text-xs text-ink">{control.size}</span>
          <span className="text-xs text-ink-subtle">{control.height}px</span>
          <div className="flex max-w-md items-center gap-2">
            <Input size={control.size} placeholder="Title" />
            <Button variant="outlined" size={control.size}>
              <Plus />
              Add
            </Button>
          </div>
        </div>
      ))}
    </div>
  ),
};

const RADII = [
  { name: 'rounded-sm', px: 4, use: 'chips inside controls' },
  { name: 'rounded-md', px: 6, use: 'buttons, inputs, surfaces' },
  { name: 'rounded-lg', px: 8, use: 'sidebar rows, menu rows' },
  { name: 'rounded-xl', px: 12, use: 'cards, menus, popovers, dialogs' },
  { name: 'rounded-full', px: 999, use: 'pills, avatars, tab labels' },
];

/** Radius grows with the size of the thing: a row is 8px, the menu around it 12px. */
export const Radius: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      {RADII.map((radius) => (
        <div key={radius.name} className="flex w-36 flex-col gap-1.5">
          <div className="h-16 border border-edge bg-surface-2" style={{ borderRadius: `${radius.px}px` }} />
          <span className="font-mono text-xs text-ink">{radius.name}</span>
          <span className="text-xs text-ink-subtle">{radius.use}</span>
        </div>
      ))}
    </div>
  ),
};

const TYPE = [
  { name: 'text-xxs', size: '10px', use: 'keyboard hints' },
  { name: 'text-xs', size: '12px', use: 'metadata, tab labels, captions' },
  { name: 'text-sm', size: '14px', use: 'UI text, rows, menus' },
  { name: 'text-base', size: '15px', use: 'reading text, inputs' },
];

/** Inter (SF on Apple), with Playfair for display and Roboto Mono for code. */
export const Type: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {TYPE.map((type) => (
        <div key={type.name} className="grid grid-cols-[6rem_3rem_1fr] items-baseline gap-3">
          <span className="font-mono text-xs text-ink">{type.name}</span>
          <span className="text-xs text-ink-subtle">{type.size}</span>
          <span className={`${type.name} text-ink`}>The quick brown fox, for {type.use}</span>
        </div>
      ))}
    </div>
  ),
};

const LAYOUT = [
  ['Hairline border', '0.5px', '1px on iOS'],
  ['Panel header', '40px min', 'aligns side-by-side panels'],
  ['Title bar', '48px', 'view top bar and sidebar header'],
  ['Side panel', '320 to 380px', 'details and properties'],
  ['Side panel label column', '5.5rem', '--sidepanel-label-width'],
  ['Dialog', '800px max', 'w-200, 8px viewport gutter'],
  ['Focus ring', '2px accent, 1px offset', 'focus-ring, for Base UI controls'],
];

export const Layout: Story = {
  render: () => (
    <Section title="Fixed measures">
      <table className="w-full max-w-xl text-sm">
        <tbody>
          {LAYOUT.map(([name, value, note]) => (
            <tr key={name} className="border-b border-edge-muted">
              <td className="py-1.5 text-xs text-ink">{name}</td>
              <td className="py-1.5 font-mono text-xs text-ink-muted">{value}</td>
              <td className="py-1.5 text-xs text-ink-subtle">{note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Section>
  ),
};
