import { CaretLeft, CaretRight, ListBullets, SquaresFour } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '@/components/Button';
import { ButtonGroup } from '@/components/ButtonGroup';

/**
 * Outlined buttons joined into one control: they share hairlines and only
 * the ends are rounded. Use it for a few actions on one thing, such as
 * previous and next.
 *
 * - **Do** name the group with `aria-label`.
 * - **Do** keep every button `outlined` and one size.
 * - **Don't** join unrelated actions; space them apart instead.
 */
const meta = {
  title: 'Primitives/ButtonGroup',
  component: ButtonGroup,
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = {
  render: () => (
    <ButtonGroup aria-label="Range">
      <Button variant="outlined">Day</Button>
      <Button variant="outlined">Week</Button>
      <Button variant="outlined">Month</Button>
    </ButtonGroup>
  ),
};

/** Icon-only buttons carry a `label`; the tooltip does not break the join. */
export const Icons: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <ButtonGroup aria-label="Pages">
        <Button variant="outlined" size="icon-md" label="Previous">
          <CaretLeft />
        </Button>
        <Button variant="outlined" size="icon-md" label="Next">
          <CaretRight />
        </Button>
      </ButtonGroup>
      <ButtonGroup aria-label="Layout">
        <Button variant="outlined" size="icon-sm" label="List">
          <ListBullets />
        </Button>
        <Button variant="outlined" size="icon-sm" label="Grid">
          <SquaresFour />
        </Button>
      </ButtonGroup>
    </div>
  ),
};

/** `sm` for a dense header. */
export const Small: Story = {
  render: () => (
    <ButtonGroup aria-label="Pages">
      <Button variant="outlined" size="sm">
        <CaretLeft />
        Previous
      </Button>
      <Button variant="outlined" size="sm">
        Next
        <CaretRight />
      </Button>
    </ButtonGroup>
  ),
};
