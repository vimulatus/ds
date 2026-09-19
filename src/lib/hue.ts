export const HUES = [
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'teal',
  'cyan',
  'blue',
  'violet',
  'purple',
  'pink',
] as const;

export type Hue = (typeof HUES)[number];

/**
 * The classes of each hue, spelled out so Tailwind emits them. `fill` is the
 * hue itself, `tint` its 15% background with readable ink.
 */
export const HUE_CLASSES: Record<Hue, { fill: string; tint: string }> = {
  red: { fill: 'bg-red', tint: 'bg-red-bg text-red-ink' },
  orange: { fill: 'bg-orange', tint: 'bg-orange-bg text-orange-ink' },
  amber: { fill: 'bg-amber', tint: 'bg-amber-bg text-amber-ink' },
  yellow: { fill: 'bg-yellow', tint: 'bg-yellow-bg text-yellow-ink' },
  lime: { fill: 'bg-lime', tint: 'bg-lime-bg text-lime-ink' },
  green: { fill: 'bg-green', tint: 'bg-green-bg text-green-ink' },
  teal: { fill: 'bg-teal', tint: 'bg-teal-bg text-teal-ink' },
  cyan: { fill: 'bg-cyan', tint: 'bg-cyan-bg text-cyan-ink' },
  blue: { fill: 'bg-blue', tint: 'bg-blue-bg text-blue-ink' },
  violet: { fill: 'bg-violet', tint: 'bg-violet-bg text-violet-ink' },
  purple: { fill: 'bg-purple', tint: 'bg-purple-bg text-purple-ink' },
  pink: { fill: 'bg-pink', tint: 'bg-pink-bg text-pink-ink' },
};

/** The hues in the stable order the hash indexes into. */
export const PALETTE_COLORS = HUES;
export type PaletteColor = Hue;

/**
 * A stable hue for a string (FNV-1a over its char codes): the same name gets
 * the same color everywhere, with nothing stored.
 */
export function getHashedPaletteColor(value: string): PaletteColor;
export function getHashedPaletteColor<const Color extends string>(
  value: string,
  options: { palette: readonly [Color, ...Color[]] }
): Color;
export function getHashedPaletteColor(value: string, options?: { palette: readonly string[] }): string {
  const palette = options?.palette ?? PALETTE_COLORS;
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return palette[(hash >>> 0) % palette.length] as string;
}

export const hashHue = (seed: string): Hue => getHashedPaletteColor(seed);
