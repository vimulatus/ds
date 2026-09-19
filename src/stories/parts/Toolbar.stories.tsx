import {
  ArrowClockwise,
  ArrowCounterClockwise,
  Copy,
  LinkSimple,
  MagnifyingGlassMinus,
  MagnifyingGlassPlus,
  TextB,
  TextItalic,
  TextUnderline,
  Trash,
} from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Toolbar } from '@/components/Toolbar';

/**
 * A floating bar of compact actions. It owns its frame (glass, a hairline,
 * rounded-xl), and its buttons are ghost `icon-sm` unless told otherwise.
 * Arrow keys move between them.
 *
 * - **Do** cluster related buttons in a `Group` and part distinct sets with
 *   a `Separator`.
 * - **Do** give every icon-only button a `label`: its name and tooltip.
 * - **Don't** restyle the frame at the call site.
 */
const meta = {
  title: 'Parts/Toolbar',
  component: Toolbar.Root,
} satisfies Meta<typeof Toolbar.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => (
    <Toolbar.Root aria-label="Selection">
      <Toolbar.Button label="Undo" shortcut="⌘Z">
        <ArrowCounterClockwise />
      </Toolbar.Button>
      <Toolbar.Separator />
      <Toolbar.Group>
        <Toolbar.Button label="Copy">
          <Copy />
        </Toolbar.Button>
        <Toolbar.Button label="Copy link">
          <LinkSimple />
        </Toolbar.Button>
      </Toolbar.Group>
      <Toolbar.Separator />
      <Toolbar.Button label="Delete" className="text-failure-ink hover:text-failure-ink">
        <Trash />
      </Toolbar.Button>
    </Toolbar.Root>
  ),
};

/** `md` buttons carry text beside icons. */
export const WithText: Story = {
  render: () => {
    const [zoom, setZoom] = useState(100);
    return (
      <Toolbar.Root aria-label="Zoom">
        <Toolbar.Button size="md" onClick={() => setZoom(100)}>
          Fit to screen
        </Toolbar.Button>
        <Toolbar.Separator />
        <Toolbar.Group>
          <Toolbar.Button size="icon-md" label="Zoom out" onClick={() => setZoom((v) => Math.max(25, v - 25))}>
            <MagnifyingGlassMinus />
          </Toolbar.Button>
          <span className="w-12 text-center text-sm text-ink tabular-nums">{zoom}%</span>
          <Toolbar.Button size="icon-md" label="Zoom in" onClick={() => setZoom((v) => Math.min(200, v + 25))}>
            <MagnifyingGlassPlus />
          </Toolbar.Button>
        </Toolbar.Group>
      </Toolbar.Root>
    );
  },
};

/** `vertical` stacks the buttons; separators turn to match. */
export const Vertical: Story = {
  render: () => (
    <Toolbar.Root orientation="vertical" aria-label="Format">
      <Toolbar.Group>
        <Toolbar.Button label="Bold">
          <TextB />
        </Toolbar.Button>
        <Toolbar.Button label="Italic">
          <TextItalic />
        </Toolbar.Button>
        <Toolbar.Button label="Underline">
          <TextUnderline />
        </Toolbar.Button>
      </Toolbar.Group>
      <Toolbar.Separator />
      <Toolbar.Button label="Delete" className="text-failure-ink hover:text-failure-ink">
        <Trash />
      </Toolbar.Button>
    </Toolbar.Root>
  ),
};

/** `Spacer` pushes what follows to the far end. */
export const WithSpacer: Story = {
  render: () => (
    <Toolbar.Root className="w-80" aria-label="History">
      <Toolbar.Group>
        <Toolbar.Button label="Undo">
          <ArrowCounterClockwise />
        </Toolbar.Button>
        <Toolbar.Button label="Redo">
          <ArrowClockwise />
        </Toolbar.Button>
      </Toolbar.Group>
      <Toolbar.Spacer />
      <Toolbar.Button size="sm" variant="outlined">
        Done
      </Toolbar.Button>
    </Toolbar.Root>
  ),
};
