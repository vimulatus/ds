# base-ds

A React design system on Base UI, documented in Storybook: tokens, two themes,
primitives, forms, menus, small parts, lists, charts, the app shell and the
resource detail pattern.

## Product

A Storybook of Vasu's visual language, built on Base UI, that he studies and reuses in his own projects.

**Stage:** new. The React and Base UI successor to Vasu's Solid prototype, kept on disk until he deletes it. It keeps the prototype's custom API and its styling; the TypeScript is written fresh. Vasu's own designs replace the prototype's where they differ. Nothing consumes it yet.

- **Users** — ? Vasu, as a reference while he designs his own projects. His shadcn/Radix system in `~/Documents/projects/design-system` is separate.
- **Works when** — ? every story renders in both themes and at iPhone 14 where it has a phone form, and a pattern story composes the components instead of redrawing them
- **Non-goals** — branding from the product that inspired the look, and its component code: write the TypeScript fresh on Base UI, and take only the API names, the class strings and the tokens (copied as is) from the prototype. Splits and a second per-view sidebar. Email and channel rows. A published package: local only, no remote. The touch press shimmer.

## Ship

- **Run** — `bun run storybook`, port 6006. The toolbar "Theme" menu switches `dark` and `light` (`data-theme` on `<html>`). A phone or tablet viewport sets `data-touch-device="true"` on `<html>`.
- **Gate** — `bun run typecheck` and `bun run build-storybook` pass. A change to `Chart` also passes `node checks/chart.check.mjs` against the running Storybook, a change to `RankedBars` passes `node checks/ranked-bars.check.mjs`, a change to `Donut` passes `node checks/donut.check.mjs`, and a change to a focus outline or to the layers in `src/styles` passes `node checks/focus-ring.check.mjs`. Look at a changed story in Dark and Light, and at iPhone 14 when it has a phone form.
- **Ship** — none. Local only; land on `main`.

## Where things live

```
src/styles/     palette.css (raw colors) -> themes.css (roles per theme) -> tokens.css (Tailwind @theme, layers, glass,
                motion, touch), copied as is from the prototype; base-ui.css adds what Base UI needs, chart.css the series colors
src/lib/        cn (clsx + tailwind-merge), touch (data-touch-device, useTouch), mobile (useMobile), hue,
                variants (createVariants), placement, chart (window math; ring.ts, the donut's maths; parts.tsx, the key, legend and
                tooltip body charts share; tanstack*, the only files that import TanStack Charts)
src/components/ one file per component. Base UI parts styled with Tailwind, or plain elements
src/patterns/   compositions of components: ResourceDetail, PropertyGrid, AppShell (SidebarRail, BottomNav, Canvas),
                EntityList, ListEntity, EntityIcon, SwipableRow
src/stories/    one folder per Storybook section; a pattern story composes src/patterns
                (patterns/lead-detail/ is the lead's domain, composed on ResourceDetail)
```

## Conventions

- Import by path: `@/components/Button`, `@/patterns/ResourceDetail`. No barrel file.
- A component keeps the prototype's API and look, written fresh on Base UI. Vasu's own designs are the exceptions: MaskReveal, Hotkey, EmptyStatePanel and its drawings, RadioGroup, the EntityList and ListEntity row look, the app shell, the tinted swipe actions, Chart, RankedBars and Donut.
- A component wraps Base UI when Base UI has the behavior. Base UI docs ship in `node_modules/@base-ui/react/docs`.
- Colors come from role utilities only: `bg-page|panel|surface|hover|input|menu|dialog|tooltip`, `text-ink|ink-muted|ink-subtle|ink-extra-muted|ink-placeholder|ink-disabled`, `border-edge|edge-muted`, `accent`, and `<hue>`, `<hue>-ink`, `<hue>-bg` for the 12 hues plus `success`, `failure`, `warning`, `write`. Never a raw palette color. A class built at runtime needs a literal class map such as `src/lib/hue.ts`, because Tailwind only emits classes it finds in the source.
- A floating surface is `glass bg-menu-glass`, and animates with `menu-open-animation`, `dialog-content-open-animation` or `dialog-overlay-open-animation`; a scrim is `scrim-glass`. Stacking uses `z-modal-overlay|modal|action-menu|tool-tip|toast-region`.
- `Layer depth={n}` sets `bg-surface` to surface step n. `Card` takes the depth around it unless you pass `depth` or `offset`.
- Button variants are `ghost`, `outlined`, `accent`, `danger`, `cta`; sizes are `sm` (24px) and `md` (32px), with `icon-sm` and `icon-md`. A screen has at most one `cta`.
- `touch:` and `not-touch:` variants style touch mode; `useTouch()` reads it in React.
- Icons are `@phosphor-icons/react`. A component sizes them with `[&_svg]:size-*`.
- A story file opens with a doc comment that says what the component is for.
- A detail page composes `ResourceDetail` and `PropertyGrid`; extend a part with a prop or slot rather than redrawing the layout.
