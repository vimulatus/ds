# base-ds

A React design system on Base UI, documented in Storybook: tokens, two themes,
primitives, forms, menus, small parts, lists, the app shell and the resource
detail pattern.

## Product

A Storybook of Vasu's visual language, built on Base UI, that he studies and reuses in his own projects.

**Stage:** new. A clean-room rebuild of an earlier Solid prototype, in React and Base UI. Nothing consumes it yet.

- **Users** — ? Vasu, as a reference while he designs his own projects. His shadcn/Radix system in `~/Documents/projects/design-system` is separate.
- **Works when** — ? every story renders in both themes and at iPhone 14 where it has a phone form, and a pattern story composes the components instead of redrawing them
- **Non-goals** — code or branding from the product that inspired the look: write every component fresh, never port or transliterate. Splits and a second per-view sidebar. Email and channel rows. A published package: local only, no remote. The touch press shimmer.

## Ship

- **Run** — `bun run storybook`, port 6006. The toolbar "Theme" menu switches `dark` and `light` (`data-theme` on `<html>`). A phone or tablet viewport sets `data-touch` on `<html>`.
- **Gate** — `bun run typecheck` and `bun run build-storybook` pass. Look at a changed story in Dark and Light, and at iPhone 14 when it has a phone form.
- **Ship** — none. Local only; land on `main`.

## Where things live

```
src/styles/     palette.css (raw colors) -> themes.css (roles per theme) -> tokens.css (Tailwind @theme, layers, glass, motion, touch)
src/lib/        cn (clsx + tailwind-merge), touch (data-touch, useTouch)
src/components/ one file per component. Base UI parts styled with Tailwind, or plain elements
src/patterns/   compositions of components: ResourceDetail, PropertyGrid, AppShell (SidebarRail, Canvas),
                EntityList, ListEntity, EntityIcon, SwipableRow
src/stories/    one folder per Storybook section; a pattern story composes src/patterns
                (patterns/lead-detail/ is the lead's domain, composed on ResourceDetail)
```

## Conventions

- Import by path: `@/components/Button`, `@/patterns/ResourceDetail`. No barrel file.
- A component wraps Base UI when Base UI has the behavior. Base UI docs ship in `node_modules/@base-ui/react/docs`.
- Colors come from role utilities only: `bg-page|panel|surface|hover|input|menu|dialog|tooltip`, `text-ink|ink-muted|ink-subtle|ink-extra-muted|ink-placeholder|ink-disabled`, `border-edge|edge-muted`, `accent`, and `<hue>`, `<hue>-ink`, `<hue>-bg` for the 12 hues plus `success`, `failure`, `warning`, `write`. Never a raw palette color.
- A floating surface is `glass bg-menu-glass` with `border-edge-muted`, and animates with `motion-pop`, `motion-dialog` or `motion-fade`. Stacking uses `z-sticky|action-menu|popover|dialog|toast|tooltip`.
- `Layer depth={n}` steps `bg-surface` one shade per depth. `Card` sets depth 1.
- Variants are `ghost`, `outlined`, `accent`, `danger`, `cta`; sizes are `sm` (24px) and `md` (32px), with `icon-sm` and `icon-md`. A screen has at most one `cta`.
- `touch:` and `not-touch:` variants style touch mode; `useTouch()` reads it in React.
- Icons are `@phosphor-icons/react`. A component sizes them with `[&_svg]:size-*`.
- A story file opens with a doc comment that says what the component is for.
- A detail page composes `ResourceDetail` and `PropertyGrid`; extend a part with a prop or slot rather than redrawing the layout.
