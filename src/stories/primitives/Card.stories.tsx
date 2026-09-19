import { FileText } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '@/components/Button';
import { Card, type CardVariant } from '@/components/Card';

/**
 * An intrinsic-height frame for rich content. It composes the same Title,
 * Description and Metadata slots as list rows, so a card and a row carry
 * one hierarchy. Radius is `xl` (12px); the edge is a hairline.
 */
const meta = {
  title: 'Primitives/Card',
  component: Card,
  args: { variant: 'outlined' },
  argTypes: {
    variant: { control: 'select', options: ['ghost', 'outlined', 'filled'] },
    depth: { control: 'select', options: [0, 1, 2, 3, 4] },
  },
  render: (args) => (
    <Card {...args} className="max-w-96">
      <Card.Header>
        <Card.Row>
          <Card.Tile className="text-write">
            <FileText />
          </Card.Tile>
          <Card.Content>
            <Card.Title>Launch plan</Card.Title>
            <Card.Metadata>
              <span>Edited 2h ago</span>
              <span>4 comments</span>
            </Card.Metadata>
          </Card.Content>
        </Card.Row>
      </Card.Header>
      <Card.Body className="text-ink-muted">
        The rollout ships behind a flag on Monday. Support gets the new replies on Friday.
      </Card.Body>
      <Card.Footer>
        <span className="text-xs text-ink-subtle">Shared with 6 people</span>
        <Button variant="outlined" size="sm">
          Open
        </Button>
      </Card.Footer>
    </Card>
  ),
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** `ghost` has no frame, `outlined` a muted edge, `filled` the layer surface. */
export const Variants: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      {(['ghost', 'outlined', 'filled'] as CardVariant[]).map((variant) => (
        <Card key={variant} variant={variant} depth={1}>
          <Card.Header>
            <Card.Title>{variant}</Card.Title>
            <Card.Description>Same slots, a different frame.</Card.Description>
          </Card.Header>
        </Card>
      ))}
    </div>
  ),
};
