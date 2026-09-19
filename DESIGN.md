# Design decisions

The rules live in Storybook. `src/stories/Principles.mdx` holds the design
principles. `src/stories/Writing.mdx` holds the rules for copy. This file
records the decisions for each pattern.

## Resource detail

`src/patterns/ResourceDetail.tsx` shows one resource: a document, a task or a
record. The resource sits in the middle. Its properties sit in an aside on the
right.

- **Structure.** `Root` holds `Main` and `Aside`. `Main` holds a `Header` and
  a `Body`. `Changes` floats above both.
- **Header.** A 48px bar with a breadcrumb trail on the left and the actions on
  the right. The last crumb is the resource, in full ink. The earlier crumbs
  are subtle.
- **Body.** It scrolls. It centres an article of up to 42rem. The article
  starts with a `Title`: the name, then one line of facts. `Block` sections
  follow, each with a quiet `xs` heading.
- **Aside.** A 320px column of `Section` cards. It shows only when the root is
  at least 1224px wide. The width comes from a container query on the root,
  not from the viewport, so the pattern works inside any pane.
- **Fold.** Below 1224px the aside hides. A `Fold` at the top of the body
  carries the same properties. Closed, it shows a one-line summary beside its
  trigger.
- **Changes.** A glass bar at the bottom. It appears when an edit differs from
  the saved resource, and it counts the unsaved changes. Save is the page's
  one `cta` while the bar is up. Discard sits beside it. In touch mode the bar
  clears the safe area.
- **Grain.** `Root grain` adds film grain to the panel. Cards on top stay
  clean.

## Lead detail

The lead detail story composes the resource detail pattern.
