import { FileText, ShareNetwork } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '@/components/Button';
import { Property, PropertyGrid } from '@/patterns/PropertyGrid';
import { ResourceDetail } from '@/patterns/ResourceDetail';

/**
 * One resource in the middle, its properties on the right, both on
 * `bg-panel`. A hairline alone divides them. Below 1224px the aside hides
 * and the `Fold` in the body carries the same properties.
 */
const meta = {
  title: 'Patterns/Resource detail',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj;

const Chip = ({ className, children }: { className: string; children: string }) => (
  <span className={`w-fit rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>
    {children}
  </span>
);

function Properties() {
  return (
    <PropertyGrid>
      <Property label="Status">
        <Chip className="bg-amber-bg text-amber-ink">In review</Chip>
      </Property>
      <Property label="Owner">
        <span className="text-ink">Priya Shah</span>
      </Property>
      <Property label="Due">
        <span className="text-ink">Oct 4</span>
      </Property>
      <Property label="Labels">
        <span className="flex flex-wrap gap-1">
          <Chip className="bg-violet-bg text-violet-ink">launch</Chip>
          <Chip className="bg-teal-bg text-teal-ink">q4</Chip>
        </span>
      </Property>
      <Property label="Created">
        <span className="text-ink-muted">Sep 2, 2026</span>
      </Property>
    </PropertyGrid>
  );
}

const MILESTONES = [
  ['Internal dogfood', 'bg-success'],
  ['Beta to 10% of teams', 'bg-accent'],
  ['General availability', 'bg-edge'],
] as const;

export const Default: Story = {
  render: () => (
    <div className="h-screen min-h-160 bg-page p-2">
      <div className="size-full overflow-hidden rounded-xl border border-edge-muted">
        <ResourceDetail.Root grain>
          <ResourceDetail.Main>
            <ResourceDetail.Header
              crumbs={[
                { label: 'Product' },
                { label: 'Launch plan', icon: <FileText className="text-write" /> },
              ]}
              actions={
                <Button variant="outlined" size="sm">
                  <ShareNetwork />
                  Share
                </Button>
              }
            />
            <ResourceDetail.Body>
              <ResourceDetail.Title meta="Priya Shah · updated 2 hours ago">
                Launch plan
              </ResourceDetail.Title>
              <ResourceDetail.Fold summary="In review · Priya Shah · Oct 4">
                <Properties />
              </ResourceDetail.Fold>
              <p className="text-base leading-7 text-ink-muted">
                The rollout ships behind a flag on Monday. Support gets the new
                replies on Friday, and the pricing page updates when the flag
                reaches everyone.
              </p>
              <ResourceDetail.Block title="Milestones">
                <ul className="flex flex-col gap-2 text-base text-ink-muted">
                  {MILESTONES.map(([item, dot]) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className={`size-1.5 rounded-full ${dot}`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </ResourceDetail.Block>
            </ResourceDetail.Body>
          </ResourceDetail.Main>
          <ResourceDetail.Aside>
            <ResourceDetail.Section title="Properties">
              <Properties />
            </ResourceDetail.Section>
            <ResourceDetail.Section title="Activity">
              <p className="text-sm text-ink-muted">
                <span className="text-ink">Priya</span> moved this to review
              </p>
              <p className="text-xs text-ink-subtle">2 hours ago</p>
            </ResourceDetail.Section>
          </ResourceDetail.Aside>
        </ResourceDetail.Root>
      </div>
    </div>
  ),
};
