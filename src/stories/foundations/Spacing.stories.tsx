import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * Spacing is Tailwind's 4px step, in rem so it tracks the reader's text
 * size. Components use a short run of it: 4 to 12px inside a control or a
 * card, and 16 to 32px between regions.
 */
const meta = {
  title: 'Foundations/Spacing',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const STEPS = [
  { step: '1', px: 4, use: 'Icon to label in sm, a row of actions' },
  { step: '1.5', px: 6, use: 'Icon to label in md, input padding in sm' },
  { step: '2', px: 8, use: 'A card in an aside, a header inset' },
  { step: '2.5', px: 10, use: 'Input padding in md' },
  { step: '3', px: 12, use: 'Card padding, gaps inside a card' },
  { step: '4', px: 16, use: 'Page gutter on a narrow screen' },
  { step: '6', px: 24, use: 'Gap between article sections' },
  { step: '8', px: 32, use: 'Article padding on a wide screen' },
];

/** The steps the components use. Reach for one of these before a new value. */
export const Scale: Story = {
  render: () => (
    <div className="flex max-w-3xl flex-col gap-2">
      {STEPS.map((entry) => (
        <div
          key={entry.step}
          className="grid grid-cols-[3rem_3rem_9rem_1fr] items-center gap-3 text-sm"
        >
          <span className="font-mono text-xs text-ink">{entry.step}</span>
          <span className="text-xs text-ink-subtle">{entry.px}px</span>
          <div className="h-3 rounded-sm bg-accent" style={{ width: entry.px * 4 }} />
          <span className="text-xs text-ink-muted">{entry.use}</span>
        </div>
      ))}
    </div>
  ),
};

/** Space grows with the container: tight inside a control, looser inside a card, loosest between sections. */
export const InUse: Story = {
  render: () => (
    <div className="flex max-w-md flex-col gap-6">
      <section className="flex flex-col gap-2">
        <h2 className="text-xs font-medium text-ink-muted">Launch plan · gap-2</h2>
        <div className="flex flex-col gap-3 rounded-xl border border-edge-muted bg-surface p-3">
          <span className="text-sm text-ink">Card · p-3, gap-3</span>
          <div className="flex gap-1">
            {['Draft', 'Review', 'Ship'].map((label) => (
              <span key={label} className="rounded-md bg-hover px-2 py-0.5 text-xs text-ink-muted">
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="text-xs font-medium text-ink-muted">Sections · gap-6 between</h2>
        <p className="text-sm text-ink-subtle">Each section keeps its own gap-2 inside.</p>
      </section>
    </div>
  ),
};
