import { Avatar as Base } from '@base-ui/react/avatar';
import { type ComponentProps, createContext, type ReactNode, useContext } from 'react';
import { cn } from '@/lib/cn';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'fill';
export type AvatarShape = 'rounded' | 'square';
export type AvatarVariantProps = { size?: AvatarSize; shape?: AvatarShape };

const SIZE: Record<AvatarSize, string> = {
  sm: 'size-4 [&>svg]:size-2',
  md: 'size-6 [&>svg]:size-3',
  lg: 'size-10 [&>svg]:size-5',
  fill: 'size-full @container [&>svg]:size-1/2',
};

/** A square avatar's corner steps with its size; a circle does not vary. */
const SQUARE_RADIUS: Record<AvatarSize, string> = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  fill: 'rounded-lg',
};

/** The root's base and variant classes, without the size-dependent square radius. */
export function avatarVariants({ size = 'sm', shape = 'rounded' }: AvatarVariantProps = {}) {
  return cn(
    'group/avatar relative flex shrink-0 select-none items-center justify-center overflow-hidden',
    'bg-ink-extra-muted has-[img:not([data-failed])]:bg-transparent text-surface',
    SIZE[size],
    shape === 'rounded' && 'rounded-full'
  );
}

/** The radius alone, for anything that has to trace the avatar's silhouette. */
export function avatarShapeClasses(size: AvatarSize = 'sm', shape: AvatarShape = 'rounded') {
  return shape === 'rounded' ? 'rounded-full' : SQUARE_RADIUS[size];
}

export type AvatarClassOptions = AvatarVariantProps & {
  highlightEdge?: boolean;
  className?: string;
};

/** The classes of the avatar root. */
export function avatarClasses({
  size = 'sm',
  shape = 'rounded',
  highlightEdge = false,
  className,
}: AvatarClassOptions = {}) {
  return cn(
    avatarVariants({ size, shape }),
    shape === 'square' && SQUARE_RADIUS[size],
    // An outline paints over every descendant and ignores overflow, so the
    // edge lands on top of a covering image.
    highlightEdge && 'avatar-edge',
    className
  );
}

const AvatarContext = createContext<Required<AvatarVariantProps>>({ size: 'sm', shape: 'rounded' });

export type AvatarProps = Omit<ComponentProps<typeof Base.Root>, 'className'> & {
  size?: AvatarSize;
  /** `rounded` is a circle; `square` uses a radius stepped to the size. */
  shape?: AvatarShape;
  /** Draws the edge hairline. Off by default. */
  highlightEdge?: boolean;
  className?: string;
};

/**
 * A person: an image, initials or an icon. Set `size` and `shape` on the
 * root; `Avatar.Image` and `Avatar.Fallback` inherit them.
 */
function AvatarRoot({ size = 'sm', shape = 'rounded', highlightEdge, className, ...props }: AvatarProps) {
  return (
    <AvatarContext.Provider value={{ size, shape }}>
      <Base.Root
        render={<div />}
        data-slot="avatar"
        data-size={size}
        data-shape={shape}
        {...props}
        className={avatarClasses({ size, shape, highlightEdge, className })}
      />
    </AvatarContext.Provider>
  );
}

export type AvatarImageProps = Omit<ComponentProps<typeof Base.Image>, 'className'> & {
  className?: string;
  /** Overrides the size inherited from the enclosing `Avatar`. */
  size?: AvatarSize;
  /** Overrides the shape inherited from the enclosing `Avatar`. */
  shape?: AvatarShape;
};

/**
 * Covers the avatar once its source loads. A source that fails never shows,
 * so the fallback stays visible instead of a broken-image glyph.
 */
function AvatarImage({ size, shape, className, ...props }: AvatarImageProps) {
  const context = useContext(AvatarContext);
  return (
    <Base.Image
      {...props}
      className={cn(
        'absolute inset-0 size-full object-cover',
        avatarShapeClasses(size ?? context.size, shape ?? context.shape),
        className
      )}
    />
  );
}

const FALLBACK_TEXT: Record<AvatarSize, string> = {
  sm: 'text-[8px]',
  md: 'text-xs',
  lg: 'text-lg',
  fill: 'text-[min(50cqw,3rem)]',
};

export type AvatarFallbackProps = {
  className?: string;
  children?: ReactNode;
  /** Overrides the size inherited from the enclosing `Avatar`. */
  size?: AvatarSize;
};

/**
 * Initials or an icon. It stays mounted under the image, which covers it once
 * loaded, so it shows while loading and after a failure. Text scales with the size.
 */
function AvatarFallback({ size, className, children }: AvatarFallbackProps) {
  const context = useContext(AvatarContext);
  return (
    <span
      className={cn(
        'leading-none select-none flex items-center justify-center',
        FALLBACK_TEXT[size ?? context.size],
        className
      )}
    >
      {children}
    </span>
  );
}

export const Avatar = Object.assign(AvatarRoot, { Image: AvatarImage, Fallback: AvatarFallback });

export type AvatarGroupSize = 'sm' | 'md' | 'lg';

const GROUP_OVERLAP: Record<AvatarGroupSize, string> = {
  sm: '-space-x-1.5',
  md: '-space-x-2',
  lg: '-space-x-3',
};

const GROUP_RING: Record<AvatarGroupSize, string> = {
  sm: '**:data-[slot=avatar]:ring-1',
  md: '**:data-[slot=avatar]:ring-2',
  lg: '**:data-[slot=avatar]:ring-2',
};

export type AvatarGroupProps = ComponentProps<'div'> & { size?: AvatarGroupSize };

/**
 * Avatars overlapped, each parted from the one under it by a ring in
 * `--avatar-group-separator` (the surface color by default). Point that
 * variable at a row's hover color so the ring keeps disappearing into it.
 */
function AvatarGroupRoot({ size = 'sm', className, ...props }: AvatarGroupProps) {
  return (
    <div
      data-slot="avatar-group"
      data-size={size}
      {...props}
      className={cn(
        'isolate flex w-fit shrink-0 items-center',
        GROUP_OVERLAP[size],
        GROUP_RING[size],
        '**:data-[slot=avatar]:ring-(--avatar-group-separator,var(--color-surface))',
        className
      )}
    />
  );
}

const GROUP_COUNT: Record<AvatarGroupSize, string> = {
  sm: 'size-4 text-[9px] ring-1',
  md: 'size-6 text-xs ring-2',
  lg: 'size-10 text-base ring-2',
};

export type AvatarGroupCountProps = {
  size?: AvatarGroupSize;
  className?: string;
  children?: ReactNode;
};

/** The overflow count that closes a group: "+3". */
function AvatarGroupCount({ size = 'sm', className, children }: AvatarGroupCountProps) {
  return (
    <div
      data-slot="avatar-group-count"
      className={cn(
        'relative z-10 flex shrink-0 select-none items-center justify-center rounded-full bg-surface text-ink leading-none',
        'ring-(--avatar-group-separator,var(--color-surface))',
        GROUP_COUNT[size],
        className
      )}
    >
      {children}
    </div>
  );
}

export const AvatarGroup = Object.assign(AvatarGroupRoot, { Count: AvatarGroupCount });
