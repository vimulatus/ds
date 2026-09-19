import { useSyncExternalStore } from 'react';

/**
 * Touch mode lives on <html data-touch>. The app sets it from
 * `pointer: coarse`; Storybook sets it from the viewport. CSS reads it
 * through the `touch:` variant, React through `useTouch()`.
 */
export function setTouch(touch: boolean) {
  const html = document.documentElement;
  if (touch) html.dataset.touch = '';
  else delete html.dataset.touch;
}

export function detectTouch() {
  setTouch(window.matchMedia('(pointer: coarse)').matches);
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributeFilter: ['data-touch'] });
  return () => observer.disconnect();
}

const read = () => document.documentElement.hasAttribute('data-touch');

export function useTouch() {
  return useSyncExternalStore(subscribe, read, () => false);
}
