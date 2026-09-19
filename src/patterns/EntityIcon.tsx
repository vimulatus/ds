import {
  Bell,
  CheckSquare,
  File,
  FilePdf,
  FileText,
  Folder,
  type Icon,
  Image,
  LinkSimple,
  Phone,
  Table,
  VideoCamera,
  Waveform,
} from '@phosphor-icons/react';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

export const ENTITY_KINDS = [
  'document',
  'file',
  'image',
  'video',
  'audio',
  'folder',
  'task',
  'call',
  'reminder',
  'pdf',
  'spreadsheet',
  'link',
] as const;

export type EntityKind = (typeof ENTITY_KINDS)[number];

/**
 * Each kind's glyph, name and color. The classes are spelled out so Tailwind
 * emits them: `ink` colors the glyph, `tile` the round tile it sits on.
 * A plain file stays neutral.
 */
export const ENTITY: Record<EntityKind, { icon: Icon; name: string; ink: string; tile: string }> = {
  document: { icon: FileText, name: 'Document', ink: 'text-blue', tile: 'bg-blue-bg text-blue-ink' },
  file: { icon: File, name: 'File', ink: 'text-ink-muted', tile: 'bg-hover text-ink-muted' },
  image: { icon: Image, name: 'Image', ink: 'text-orange', tile: 'bg-orange-bg text-orange-ink' },
  video: { icon: VideoCamera, name: 'Video', ink: 'text-violet', tile: 'bg-violet-bg text-violet-ink' },
  audio: { icon: Waveform, name: 'Audio', ink: 'text-pink', tile: 'bg-pink-bg text-pink-ink' },
  folder: { icon: Folder, name: 'Folder', ink: 'text-amber', tile: 'bg-amber-bg text-amber-ink' },
  task: { icon: CheckSquare, name: 'Task', ink: 'text-green', tile: 'bg-green-bg text-green-ink' },
  call: { icon: Phone, name: 'Call', ink: 'text-teal', tile: 'bg-teal-bg text-teal-ink' },
  reminder: { icon: Bell, name: 'Reminder', ink: 'text-yellow', tile: 'bg-yellow-bg text-yellow-ink' },
  pdf: { icon: FilePdf, name: 'PDF', ink: 'text-red', tile: 'bg-red-bg text-red-ink' },
  spreadsheet: { icon: Table, name: 'Spreadsheet', ink: 'text-lime', tile: 'bg-lime-bg text-lime-ink' },
  link: { icon: LinkSimple, name: 'Link', ink: 'text-cyan', tile: 'bg-cyan-bg text-cyan-ink' },
};

export type EntityIconProps = ComponentProps<'span'> & {
  kind: EntityKind;
  /** `glyph` is the bare 16px icon of a desktop row; `tile` is a 40px round tile for a touch row. */
  variant?: 'glyph' | 'tile';
};

/**
 * What kind of thing a row holds, at a glance: one glyph per kind, in the
 * kind's own color, so a document never reads as a PDF. The kind's name is
 * the accessible label.
 */
export function EntityIcon({ kind, variant = 'glyph', className, ...props }: EntityIconProps) {
  const { icon: Glyph, name, ink, tile } = ENTITY[kind];
  return (
    <span
      role="img"
      aria-label={name}
      {...props}
      className={cn(
        'inline-flex shrink-0 items-center justify-center',
        variant === 'glyph' ? cn('size-4 [&_svg]:size-4', ink) : cn('size-10 rounded-full [&_svg]:size-5', tile),
        className
      )}
    >
      <Glyph weight={variant === 'tile' ? 'duotone' : 'regular'} />
    </span>
  );
}
