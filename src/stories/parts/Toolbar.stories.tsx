import {
  ArrowClockwise,
  ArrowCounterClockwise,
  Copy,
  Link,
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
 * A floating surface for compact actions. It owns its frame (`rounded-xl`,
 * padding, border, surface and shadow) and sets the default size and variant
 * for its `Toolbar.Button` children, so callers compose controls without
 * restyling them. Arrow keys move between the buttons.
 *
 * - **Do** cluster related controls with `Toolbar.Group` and separate distinct
 *   action sets with `Toolbar.Divider`.
 * - **Do** set shared button size and variant on the Toolbar root.
 * - **Don't** recreate the toolbar's background, border, padding, or shadow
 *   at the call site.
 */
const meta = {
  title: 'Parts/Toolbar',
  component: Toolbar,
} satisfies Meta;

export default meta;
type Story = StoryObj;

/** Group related buttons and separate distinct action sets with `Toolbar.Divider`. */
export const Basic: Story = {
  render: () => (
    <Toolbar size="icon-sm">
      <Toolbar.Group>
        <Toolbar.Button label="Undo">
          <ArrowCounterClockwise />
        </Toolbar.Button>
      </Toolbar.Group>
      <Toolbar.Divider />
      <Toolbar.Group>
        <Toolbar.Button label="Copy">
          <Copy />
        </Toolbar.Button>
        <Toolbar.Button label="Copy link">
          <Link />
        </Toolbar.Button>
      </Toolbar.Group>
      <Toolbar.Divider />
      <Toolbar.Button label="Delete" className="text-failure-ink">
        <Trash />
      </Toolbar.Button>
    </Toolbar>
  ),
};

function ZoomToolbar() {
  const [zoom, setZoom] = useState(100);
  return (
    <Toolbar size="md">
      <Toolbar.Button onClick={() => setZoom(100)}>Fit to screen</Toolbar.Button>
      <Toolbar.Divider />
      <Toolbar.Group>
        <Toolbar.Button size="icon-md" label="Zoom out" onClick={() => setZoom((value) => Math.max(25, value - 25))}>
          <MagnifyingGlassMinus />
        </Toolbar.Button>
        <Toolbar.Button className="w-14 tabular-nums" onClick={() => setZoom(100)}>
          {zoom}%
        </Toolbar.Button>
        <Toolbar.Button size="icon-md" label="Zoom in" onClick={() => setZoom((value) => Math.min(200, value + 25))}>
          <MagnifyingGlassPlus />
        </Toolbar.Button>
      </Toolbar.Group>
    </Toolbar>
  );
}

/** The `md` size supports text actions and compact widgets alongside icon controls. */
export const MediumWithText: Story = {
  render: () => <ZoomToolbar />,
};

/** `vertical` stacks the controls; dividers turn horizontal to match. */
export const Vertical: Story = {
  render: () => (
    <Toolbar size="icon-sm" orientation="vertical">
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
      <Toolbar.Divider />
      <Toolbar.Button label="Delete" className="text-failure-ink">
        <Trash />
      </Toolbar.Button>
    </Toolbar>
  ),
};

/** `Toolbar.Spacer` pushes the controls after it to the far end. */
export const WithSpacer: Story = {
  render: () => (
    <Toolbar size="icon-sm" className="w-80">
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
    </Toolbar>
  ),
};
