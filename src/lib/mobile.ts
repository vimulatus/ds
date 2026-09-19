import { useSyncExternalStore } from 'react';

const NARROW = '(max-width: 639px)';

/** True on a phone: a narrow screen in touch mode. Reads the page now, for code outside React. */
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return document.documentElement.dataset.touchDevice === 'true' && window.matchMedia(NARROW).matches;
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributeFilter: ['data-touch-device'] });
  const query = window.matchMedia(NARROW);
  query.addEventListener('change', onChange);
  return () => {
    observer.disconnect();
    query.removeEventListener('change', onChange);
  };
}

/** `isMobile()`, re-rendering when touch mode or the width changes. */
export function useMobile(): boolean {
  return useSyncExternalStore(subscribe, isMobile, () => false);
}
