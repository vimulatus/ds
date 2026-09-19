import type { Meta, StoryObj } from '@storybook/react-vite';
import { cn } from '@/lib/cn';

/**
 * Three families. Inter sets the interface, Playfair Display sets display
 * type, and Roboto Mono sets code and utility names. `text-sm` is the
 * default for interface text; `text-base` is for reading.
 */
const meta = {
  title: 'Foundations/Typography',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const SAMPLE = 'The team ships the launch plan on Friday.';

const FAMILIES = [
  { name: 'font-sans', className: 'font-sans', family: 'Inter', use: 'Every interface string' },
  { name: 'font-serif', className: 'font-serif', family: 'Playfair Display', use: 'Display titles' },
  { name: 'font-mono', className: 'font-mono', family: 'Roboto Mono', use: 'Code, keys, utility names' },
];

export const Families: Story = {
  render: () => (
    <div className="flex flex-col gap-5">
      {FAMILIES.map((font) => (
        <div key={font.name} className="flex flex-col gap-1">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-xs text-ink">{font.name}</span>
            <span className="text-xs text-ink-subtle">
              {font.family}, {font.use}
            </span>
          </div>
          <p className={cn('text-2xl text-ink', font.className)}>{SAMPLE}</p>
        </div>
      ))}
    </div>
  ),
};

const SCALE = [
  { name: 'text-xxs', className: 'text-xxs', px: 10, use: 'Keyboard hints, tiny counts' },
  { name: 'text-xs', className: 'text-xs', px: 12, use: 'Labels, captions, section titles' },
  { name: 'text-sm', className: 'text-sm', px: 14, use: 'Interface text, rows, menus' },
  { name: 'text-base', className: 'text-base', px: 16, use: 'Reading text' },
  { name: 'text-lg', className: 'text-lg', px: 18, use: 'A heading inside a page' },
  { name: 'text-xl', className: 'text-xl', px: 20, use: 'A dialog title' },
  { name: 'text-2xl', className: 'text-2xl', px: 24, use: 'A page title' },
];

/** The scale, smallest first. `text-xxs` is the one step this system adds. */
export const Scale: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {SCALE.map((type) => (
        <div key={type.name} className="grid grid-cols-[6rem_3rem_1fr] items-baseline gap-3">
          <span className="font-mono text-xs text-ink">{type.name}</span>
          <span className="text-xs text-ink-subtle">{type.px}px</span>
          <span className={cn('text-ink', type.className)}>
            {SAMPLE} <span className="text-ink-subtle">{type.use}</span>
          </span>
        </div>
      ))}
    </div>
  ),
};

/**
 * Rank comes from ink before size or weight. A title uses `font-semibold`;
 * a section label is `text-xs font-medium text-ink-muted`.
 */
export const Hierarchy: Story = {
  render: () => (
    <article className="flex max-w-xl flex-col gap-6">
      <header className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Spring product launch</h1>
        <div className="flex gap-3 text-sm text-ink-muted">
          <span>Owned by Priya</span>
          <span>Due May 12</span>
        </div>
      </header>
      <section className="flex flex-col gap-2">
        <h2 className="text-xs font-medium text-ink-muted">Summary</h2>
        <p className="text-base text-ink">
          The team ships the new onboarding flow and a pricing page. Design review is on Tuesday.
        </p>
        <p className="text-sm text-ink-subtle">Last edited by Sam 2 hours ago</p>
      </section>
    </article>
  ),
};
