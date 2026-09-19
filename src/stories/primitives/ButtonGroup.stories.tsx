import { CaretLeft, CaretRight, ListBullets, SquaresFour } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '@/components/Button';
import { ButtonGroup } from '@/components/ButtonGroup';

/**
 * Buttons joined into one frame. The group owns the rim, the rounding and
 * the glass; its buttons take its `variant` and `size`. `ButtonGroup.Divider`
 * draws the rule between two buttons. Use it for a few actions on one thing,
 * such as previous and next.
 */
const meta = {
  title: 'Primitives/ButtonGroup',
  component: ButtonGroup,
  args: { variant: 'outlined', size: 'md' },
  argTypes: {
    variant: { control: 'select', options: ['ghost', 'outlined', 'accent', 'danger', 'cta'] },
    size: { control: 'select', options: ['sm', 'md'] },
  },
  render: (args) => (
    <ButtonGroup {...args} aria-label="Range">
      <Button>Day</Button>
      <ButtonGroup.Divider />
      <Button>Week</Button>
      <ButtonGroup.Divider />
      <Button>Month</Button>
    </ButtonGroup>
  ),
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = {};

/** Icon-only buttons carry a `label`; the tooltip does not break the join. */
export const Icons: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <ButtonGroup variant="outlined" size="icon-md" aria-label="Pages">
        <Button label="Previous">
          <CaretLeft />
        </Button>
        <ButtonGroup.Divider />
        <Button label="Next">
          <CaretRight />
        </Button>
      </ButtonGroup>
      <ButtonGroup variant="outlined" size="icon-sm" aria-label="Layout">
        <Button label="List">
          <ListBullets />
        </Button>
        <ButtonGroup.Divider />
        <Button label="Grid">
          <SquaresFour />
        </Button>
      </ButtonGroup>
    </div>
  ),
};

/** `vertical` stacks the buttons. */
export const Vertical: Story = {
  render: () => (
    <ButtonGroup variant="outlined" size="icon-md" orientation="vertical" aria-label="Zoom">
      <Button label="Previous">
        <CaretLeft />
      </Button>
      <ButtonGroup.Divider />
      <Button label="Next">
        <CaretRight />
      </Button>
    </ButtonGroup>
  ),
};
