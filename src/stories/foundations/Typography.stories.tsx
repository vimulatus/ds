import type { Meta, StoryObj } from '@storybook/react-vite';

const SAMPLE = 'The rollout ships behind a flag on Monday.';

/**
 * Size sets scale, ink sets hierarchy. Between them they cover nearly every
 * text decision in the system. Reach for a different weight only when both
 * are already right.
 *
 * Do: default to `text-sm` for interface text and `text-base` for content.
 * Signal hierarchy with ink first, then size, then weight. Keep metadata and
 * labels at `text-xs text-ink-subtle`.
 *
 * Don't: introduce sizes outside this scale. Stack low-contrast ink on a small
 * size for anything a user must read.
 */
const meta = {
  title: 'Foundations/Typography',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const SIZES = [
  { className: 'text-xs', note: 'Labels, badges, captions' },
  { className: 'text-sm', note: 'Default UI text' },
  { className: 'text-base', note: 'Body copy, reading surfaces' },
  { className: 'text-lg', note: 'Section headings' },
  { className: 'text-xl', note: 'Page headings' },
  { className: 'text-2xl', note: 'Page titles' },
];

/** `text-sm` is the default for UI chrome; `text-base` (15px) is for reading surfaces such as documents and messages. */
export const Sizes: Story = {
  render: () => (
    <div className="flex w-full flex-col gap-4">
      {SIZES.map((size) => (
        <div key={size.className} className="flex flex-col gap-1">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-xs text-ink-subtle">{size.className}</span>
            <span className="text-xs text-ink-subtle">{size.note}</span>
          </div>
          <p className={`${size.className} text-ink`}>{SAMPLE}</p>
        </div>
      ))}
    </div>
  ),
};

const INKS = [
  { className: 'text-ink', note: 'Primary content' },
  { className: 'text-ink-muted', note: 'Supporting content' },
  { className: 'text-ink-subtle', note: 'Labels and metadata' },
  { className: 'text-ink-disabled', note: 'Unavailable controls' },
  { className: 'text-ink-placeholder', note: 'Empty input hints' },
];

/** Establish rank with ink before size or weight. Two ink steps read as a clear hierarchy at the same size. */
export const Hierarchy: Story = {
  render: () => (
    <div className="flex w-full flex-col gap-4">
      {INKS.map((ink) => (
        <div key={ink.className} className="flex flex-col gap-1">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-xs text-ink-subtle">{ink.className}</span>
            <span className="text-xs text-ink-subtle">{ink.note}</span>
          </div>
          <p className={`text-base ${ink.className}`}>{SAMPLE}</p>
        </div>
      ))}
    </div>
  ),
};

/** Every combination at a glance. Check the low-contrast inks stay legible when you switch themes. */
export const SizeByInk: Story = {
  name: 'Size × ink',
  render: () => {
    const sizes = ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl'];
    const inks = INKS.map((ink) => ink.className);
    return (
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border-b border-edge-muted p-2 text-left text-xs text-ink-subtle">Size / Ink</th>
            {inks.map((ink) => (
              <th key={ink} className="border-b border-edge-muted p-2 text-left font-mono text-xs text-ink-subtle">
                {ink.replace('text-ink', '') || 'ink'}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sizes.map((size) => (
            <tr key={size}>
              <td className="border-b border-edge-muted p-2 font-mono text-xs text-ink-subtle">{size}</td>
              {inks.map((ink) => (
                <td key={ink} className={`border-b border-edge-muted p-2 ${size} ${ink}`}>
                  Aa
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  },
};

const FAMILIES = [
  { className: 'font-sans', note: 'SF on Apple, Inter elsewhere' },
  { className: 'font-serif', note: 'Playfair Display' },
  { className: 'font-mono', note: 'Roboto Mono' },
];

/**
 * Three families. Apple devices get the system font (SF); everywhere else
 * gets Inter. Windows never renders Segoe for text. Playfair Display is the
 * serif; Roboto Mono is for code.
 */
export const Families: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {FAMILIES.map((family) => (
        <div key={family.className} className="flex flex-col gap-1">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-xs text-ink-subtle">{family.className}</span>
            <span className="text-xs text-ink-subtle">{family.note}</span>
          </div>
          <p className={`${family.className} text-2xl text-ink`}>{SAMPLE}</p>
        </div>
      ))}
    </div>
  ),
};
