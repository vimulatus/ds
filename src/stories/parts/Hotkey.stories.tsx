import type { Meta, StoryObj } from '@storybook/react-vite';
import { Hotkey, hotkeyText } from '@/components/Hotkey';

const SHORTCUTS = ['mod+k', 'mod+shift+p', 'alt+n', 'shift+enter', 'escape', 'arrowup', 'backspace', '⌘K'];

/**
 * A key combination as small keycaps. Write it as `mod+shift+k`: `mod` is
 * ⌘ on a Mac and Ctrl elsewhere. Glyphs such as `⌘K` pass through.
 * `hotkeyText` gives the same combination as one string, for a title or
 * `aria-keyshortcuts`.
 */
const meta = {
  title: 'Parts/Hotkey',
  component: Hotkey,
  args: { shortcut: 'mod+shift+k', variant: 'keycap' },
  argTypes: { variant: { control: 'select', options: ['keycap', 'inline'] } },
} satisfies Meta<typeof Hotkey>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Modifiers come first; named keys become symbols. */
export const Keys: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      {SHORTCUTS.map((shortcut) => (
        <div key={shortcut} className="flex items-center gap-3">
          <span className="w-28 font-mono text-xs text-ink-subtle">{shortcut}</span>
          <Hotkey shortcut={shortcut} />
          <span className="font-mono text-xs text-ink-muted">"{hotkeyText(shortcut)}"</span>
        </div>
      ))}
    </div>
  ),
};

/** `inline` drops the caps and takes the row's quiet ink, as in a menu. */
export const Inline: Story = {
  render: () => (
    <div className="flex w-64 flex-col gap-0.5 rounded-lg border border-edge-muted p-1">
      {(
        [
          ['New document', 'mod+n'],
          ['Search', 'mod+k'],
          ['Close', 'escape'],
        ] as const
      ).map(([label, shortcut]) => (
        <div
          key={label}
          className="flex items-center justify-between rounded-md px-2 py-1 text-sm text-ink hover:bg-hover"
        >
          {label}
          <Hotkey variant="inline" shortcut={shortcut} />
        </div>
      ))}
    </div>
  ),
};
