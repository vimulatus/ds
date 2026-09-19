import { Avatar as Base } from '@base-ui/react/avatar';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';
import { HUE_CLASSES, hashHue } from '@/lib/hue';

export type AvatarSize = 'sm' | 'md' | 'lg';

const SIZE: Record<AvatarSize, string> = {
  sm: 'size-4 text-[7px]',
  md: 'size-6 text-[10px]',
  lg: 'size-10 text-sm',
};

const RADIUS: Record<AvatarSize, string> = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
};

/** The first letter of the first two words: "Ada Okafor" is "AO". */
export function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}

export type AvatarProps = Omit<ComponentProps<typeof Base.Root>, 'className'> & {
  className?: string;
  /** The person's name: the fallback's initials, its color, and the image's alt. */
  name: string;
  src?: string;
  size?: AvatarSize;
  shape?: 'circle' | 'square';
};

/**
 * A person. Shows the image once it loads; until then, or when it fails,
 * the initials on a color hashed from the name, so a person keeps one
 * color everywhere with nothing stored.
 */
export function Avatar({ name, src, size = 'md', shape = 'circle', className, ...props }: AvatarProps) {
  return (
    <Base.Root
      role="img"
      aria-label={name}
      {...props}
      className={cn(
        'relative inline-flex shrink-0 select-none overflow-hidden bg-surface align-middle',
        SIZE[size],
        shape === 'circle' ? 'rounded-full' : RADIUS[size],
        className
      )}
    >
      <Base.Fallback
        aria-hidden
        className={cn(
          'absolute inset-0 flex items-center justify-center font-medium leading-none',
          HUE_CLASSES[hashHue(name)].tint
        )}
      >
        {initials(name)}
      </Base.Fallback>
      {src && (
        <Base.Image
          src={src}
          alt=""
          className="absolute inset-0 size-full object-cover data-error:invisible data-loading:invisible"
        />
      )}
    </Base.Root>
  );
}

export type AvatarGroupProps = ComponentProps<'div'> & {
  people: { name: string; src?: string }[];
  size?: AvatarSize;
  /** How many avatars show before the rest collapse into a count. */
  max?: number;
};

/**
 * People stacked with a slight overlap. A ring in the surface color parts
 * each avatar from the one under it; past `max` the rest become "+n".
 */
export function AvatarGroup({ people, size = 'md', max = 3, className, ...props }: AvatarGroupProps) {
  const shown = people.slice(0, max);
  const rest = people.length - shown.length;
  return (
    <div
      role="group"
      aria-label={people.map((person) => person.name).join(', ')}
      {...props}
      className={cn(
        'flex items-center *:ring-2 *:ring-surface',
        size === 'lg' ? '-space-x-2' : '-space-x-1',
        className
      )}
    >
      {shown.map((person) => (
        <Avatar key={person.name} name={person.name} src={person.src} size={size} aria-hidden />
      ))}
      {rest > 0 && (
        <span
          aria-hidden
          className={cn(
            'relative inline-flex shrink-0 items-center justify-center rounded-full bg-hover font-medium text-ink-muted tabular-nums',
            SIZE[size]
          )}
        >
          +{rest}
        </span>
      )}
    </div>
  );
}
