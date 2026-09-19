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

/** A stable hue for a string: the same name gets the same color everywhere, with nothing stored. */
export function hashHue(seed: string): Hue {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return HUES[Math.abs(hash) % HUES.length] ?? 'blue';
}
