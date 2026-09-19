import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

const merge = extendTailwindMerge({
  extend: { theme: { text: ['xxs'] } },
});

/** Joins class names; a later Tailwind class wins over an earlier one it conflicts with. */
export function cn(...inputs: ClassValue[]) {
  return merge(clsx(inputs));
}
