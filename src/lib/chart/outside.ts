import { useEffect, useRef, type RefObject } from 'react';

/** Calls `onPress` when a pointer press lands outside the element. A chart uses it to let go of its pin and its range. */
export function useOutsidePress(element: RefObject<Element | null>, onPress: () => void) {
  const latest = useRef(onPress);
  latest.current = onPress;

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (e.target instanceof Node && !element.current?.contains(e.target)) latest.current();
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [element]);
}
