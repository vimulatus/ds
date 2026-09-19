import type { ComponentType, ReactNode } from 'react';
import {
  ErrorGraphic,
  NoFilterResultsGraphic,
  NoSearchResultsGraphic,
  NotFoundGraphic,
} from '@/components/EmptyStateGraphics';
import { PillButton } from '@/components/PillButton';
import { cn } from '@/lib/cn';

export type EmptyStateKind = 'no-search-results' | 'no-filter-results' | 'not-found' | 'error';

export type EmptyStateTone = 'neutral' | 'accent' | 'warning' | 'danger';

type Graphic = ComponentType<{ className?: string }>;

/** The graphic draws in currentColor, so the tone is its text color. */
const TONE_CLASS: Record<EmptyStateTone, string> = {
  neutral: 'text-ink-muted',
  accent: 'text-accent',
  warning: 'text-warning',
  danger: 'text-failure',
};

/** The graphic, tone and default copy of each kind. Props override them. */
const KINDS: Record<EmptyStateKind, { graphic: Graphic; tone: EmptyStateTone; title: string; description: string }> = {
  'no-search-results': {
    graphic: NoSearchResultsGraphic,
    tone: 'accent',
    title: 'No results',
    description: 'Try a different search.',
  },
  'no-filter-results': {
    graphic: NoFilterResultsGraphic,
    tone: 'accent',
    title: 'Nothing matches these filters',
    description: 'Change or clear the filters to see more.',
  },
  'not-found': {
    graphic: NotFoundGraphic,
    tone: 'warning',
    title: 'Page not found',
    description: 'The link may be out of date, or the page was deleted.',
  },
  error: {
    graphic: ErrorGraphic,
    tone: 'danger',
    title: 'Something went wrong',
    description: 'This view did not load.',
  },
};

export type EmptyStateAction = {
  label: string;
  onClick: () => void;
  /** A leading icon, such as a plus for a "create" action. */
  icon?: Graphic;
};

export type EmptyStatePanelProps = {
  /** Picks the graphic and default copy, and centers the panel. */
  kind?: EmptyStateKind;
  graphic?: Graphic;
  /** Tints the graphic. Defaults to the kind's tone, or `neutral`. */
  tone?: EmptyStateTone;
  graphicClassName?: string;
  title?: string;
  titleClassName?: string;
  description?: ReactNode;
  descriptionClassName?: string;
  topSpacerClassName?: string;
  primaryAction?: EmptyStateAction;
  actionsClassName?: string;
  /** Adds a secondary "Documentation" button that opens this URL in a new tab. */
  documentationUrl?: string;
  documentationLabel?: string;
  documentationIcon?: Graphic;
  /**
   * Centers the column, for bare states that are a graphic and a line. The
   * default is a left-aligned column. A `kind` centers it unless this is false.
   */
  centered?: boolean;
  children?: ReactNode;
  className?: string;
};

/**
 * What a view shows when it has nothing to show: a graphic, a title, one
 * sentence on what belongs here, and at most one way forward. A fixed top
 * spacer puts the title on the same baseline in every state.
 */
export function EmptyStatePanel({
  kind,
  graphic,
  tone,
  graphicClassName,
  title,
  titleClassName,
  description,
  descriptionClassName,
  topSpacerClassName,
  primaryAction,
  actionsClassName,
  documentationUrl,
  documentationLabel = 'Documentation',
  documentationIcon,
  centered,
  children,
  className,
}: EmptyStatePanelProps) {
  const preset = kind ? KINDS[kind] : undefined;
  const Graphic = graphic ?? preset?.graphic;
  const heading = title ?? preset?.title;
  const body = description ?? preset?.description;
  const center = centered ?? kind !== undefined;
  return (
    <div
      role="status"
      className={cn(
        'flex size-full flex-col overflow-y-auto px-10 pb-8 @4xl:px-2',
        'touch:pt-(--mobile-content-inset-top)',
        center && 'items-center text-center',
        className
      )}
    >
      <div aria-hidden className={cn('shrink-0 basis-[28%] mobile:basis-[8%]', topSpacerClassName)} />
      <div
        className={cn(
          'mx-auto flex w-full shrink-0 flex-col',
          center ? 'max-w-md items-center' : 'max-w-3xl items-start'
        )}
      >
        {Graphic && (
          <div
            aria-hidden
            className={cn(
              'h-48 w-64',
              TONE_CLASS[tone ?? preset?.tone ?? 'neutral'],
              'empty-state-graphic mb-2 opacity-70',
              graphicClassName
            )}
          >
            <Graphic className="size-full" />
          </div>
        )}
        {heading && <h2 className={cn('text-base font-semibold text-ink', titleClassName)}>{heading}</h2>}
        {body && <p className={cn('mt-3 text-sm/6 text-ink-muted', descriptionClassName)}>{body}</p>}
        {(primaryAction || documentationUrl) && (
          <div
            className={cn(
              'mt-3 flex flex-wrap gap-2 @max-sm:w-full @max-sm:flex-col',
              center ? 'justify-center' : 'justify-start',
              actionsClassName
            )}
          >
            {primaryAction && (
              <PillButton tone="cta" icon={primaryAction.icon} onClick={primaryAction.onClick}>
                {primaryAction.label}
              </PillButton>
            )}
            {documentationUrl && (
              <PillButton
                tone="subtle"
                icon={documentationIcon}
                onClick={() => window.open(documentationUrl, '_blank', 'noopener,noreferrer')}
              >
                {documentationLabel}
              </PillButton>
            )}
          </div>
        )}
        {children && <div className={cn('mt-5 w-full', center && 'flex flex-col items-center')}>{children}</div>}
      </div>
      <div aria-hidden className="grow" />
    </div>
  );
}
