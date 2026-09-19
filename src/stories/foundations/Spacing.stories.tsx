import type { Meta, StoryObj } from '@storybook/react-vite';
import { cn } from '@/lib/cn';
import { Section } from './Swatch';

/**
 * Spacing is Tailwind's 4px (`0.25rem`) step, in rem so it tracks the
 * user's text size. The system leans on a short run of it: 4, 6, 8 and 12px
 * inside components, 16 and 24px between regions. Sidebars get their own
 * named tokens so every icon lands on the same rail.
 */
const meta = {
  title: 'Foundations/Spacing',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const SCALE = [
  { step: '0.5', px: 2, use: 'row gap in sidebars' },
  { step: '1', px: 4, use: 'icon to label (sm), button gap' },
  { step: '1.5', px: 6, use: 'menu padding, icon-label gap' },
  { step: '2', px: 8, use: 'control padding, panel gutter' },
  { step: '3', px: 12, use: 'card and item padding' },
  { step: '4', px: 16, use: 'view header, dialog padding' },
  { step: '6', px: 24, use: 'sidebar section gap' },
  { step: '8', px: 32, use: 'sidebar row height' },
];

export const Scale: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      {SCALE.map((entry) => (
        <div key={entry.step} className="grid grid-cols-[4rem_3rem_1fr_14rem] items-center gap-3 text-sm">
          <span className="font-mono text-xs text-ink">{entry.step}</span>
          <span className="text-xs text-ink-subtle">{entry.px}px</span>
          <div className="h-3 rounded-sm bg-accent" style={{ width: `${entry.px * 4}px` }} />
          <span className="text-xs text-ink-muted">{entry.use}</span>
        </div>
      ))}
    </div>
  ),
};

const SIDEBAR_TOKENS = [
  ['--sidebar-gutter', '8px', 'outer gutter'],
  ['--sidebar-item-inset', '8px', 'row inset'],
  ['--sidebar-icon-slot', '20px', 'icon slot (glyph 16px)'],
  ['--sidebar-control-size', '24px', 'trailing control (36px on touch)'],
  ['--sidebar-row-height', '32px', 'row height (44px on touch)'],
  ['--sidebar-row-gap', '2px', 'gap between rows'],
  ['--sidebar-label-gap', '6px', 'icon to label'],
  ['--sidebar-section-gap', '24px', 'gap between sections'],
];

/**
 * Both icon rails sit `gutter + inset + slot / 2 = 26px` from the sidebar
 * edge. Controls align by their centers, never by their outer edges.
 */
export const SidebarGeometry: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="relative w-72 rounded-lg border border-edge-muted bg-panel px-(--sidebar-gutter) py-3">
        <div className="pointer-events-none absolute inset-y-0 w-px bg-accent/60" style={{ left: '26px' }} />
        <div className="pointer-events-none absolute inset-y-0 w-px bg-accent/60" style={{ right: '26px' }} />
        {['Home', 'Documents', 'Tasks'].map((label, index) => (
          <div
            key={label}
            className={cn(
              'flex h-(--sidebar-row-height) items-center gap-(--sidebar-label-gap) rounded-lg px-(--sidebar-item-inset) text-sm',
              index === 1 ? 'bg-active text-ink' : 'text-ink-muted'
            )}
          >
            <span className="flex size-(--sidebar-icon-slot) items-center justify-center">
              <span className="size-(--sidebar-icon-size) rounded-sm border border-current" />
            </span>
            {label}
            <span className="ml-auto flex size-(--sidebar-icon-slot) items-center justify-center">
              <span className="size-1.5 rounded-full bg-current" />
            </span>
          </div>
        ))}
        <span className="absolute -bottom-5 left-0 text-xxs text-ink-subtle">accent lines: the 26px rails</span>
      </div>
      <Section title="Tokens">
        <table className="w-full max-w-xl text-sm">
          <tbody>
            {SIDEBAR_TOKENS.map(([name, value, use]) => (
              <tr key={name} className="border-b border-edge-muted">
                <td className="py-1.5 font-mono text-xs text-ink">{name}</td>
                <td className="py-1.5 text-xs text-ink-muted">{value}</td>
                <td className="py-1.5 text-xs text-ink-subtle">{use}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
    </div>
  ),
};
