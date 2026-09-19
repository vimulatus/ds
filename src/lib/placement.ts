export type Side = 'top' | 'right' | 'bottom' | 'left';
export type Align = 'start' | 'center' | 'end';

/** A side, optionally with `-start` or `-end`: `bottom`, `bottom-start`. */
export type Placement = Side | `${Side}-start` | `${Side}-end`;

/** Splits a placement into the `side` and `align` a Base UI positioner takes. */
export function fromPlacement(placement: Placement): { side: Side; align: Align } {
  const [side, align = 'center'] = placement.split('-') as [Side, Align?];
  return { side, align };
}
