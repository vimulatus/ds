# Design decisions

The rules live in Storybook. `src/stories/Principles.mdx` holds the design
principles. `src/stories/Copy.mdx` holds the rules for copy. This file
records the decisions for each pattern.

## App shell

`src/patterns/AppShell.tsx` is the window: one rail and one canvas on the
page background.

- **Desktop.** `SidebarRail` is a 56px column of glyphs on the left. The
  canvas is a rounded `bg-panel` pane, 8px in from the page on the other
  three sides, so a strip of page floats it off the rail.
- **Phone.** On touch the same rail renders as `BottomNav`: a bar of tabs
  under the canvas, built from the rail's `items`, so a screen defines its
  navigation once. The canvas keeps its radius and floats 8px in on all four
  sides, clear of the top safe area.
- **Tabs.** The first four items, then More. Each tab is a glyph over a
  short label, at least 44px. The active tab is `accent` with a filled
  glyph; the rest are `ink-muted`. Unread is the rail's dot.
- **More.** A `MobileDrawer` sheet: the workspace mark, the other items, then
  the rail's footer. `RailButton` and `RailAccount` render there as rows.
  More reads active when the active item lives in the sheet.
- **Bar.** On the page colour, not glass. It clears the bottom safe area.

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
  clears the safe area, and inside `AppShell` it floats 16px above the bottom
  bar, which the shell publishes as `--bottom-nav-height`.
- **Grain.** `Root grain` adds film grain to the panel. Cards on top stay
  clean.

## Lead detail

`src/stories/patterns/lead-detail/` shows a sales lead. It composes the
resource detail pattern: `Header`, `Body`, `Title`, `Block`, `Fold`, `Aside`,
`Section` and `Changes` from `ResourceDetail`, and `PropertyGrid` for the
properties. It draws no layout of its own.

- **Shape.** The lead sits in the article and its properties sit in the
  aside. There is no list of leads beside it; views of many leads belong to
  the list, not the detail. Below 1224px the properties move into the
  `Fold`, closed, with the owner, source and budget as its summary. On a
  phone the lead sits in the app shell's floating canvas, above the bottom
  bar.
- **Contact.** The masked number and the email sit under the name, and the
  number is a `MaskReveal`: the value is its own reveal control. The aside
  holds facts, not contact details. "Call" is an `accent` link that leads
  the header's actions and dials with `tel:`. WhatsApp and email get no
  buttons.
- **Follow-up.** The next open follow-up sits in the title block, through
  `Title`'s `footer`. It is tinted `accent` when due and `warning` once
  missed. Its "Done" is the page's one `cta`. Without an open follow-up,
  "Schedule follow-up" moves into the header as an `outlined` button.
- **Enquiries stack.** Every open enquiry is its own section under the
  title, split by hairlines. None hides behind a tab, and closed enquiries
  leave this list.
- **Stage rail.** Each enquiry shows its stage on `Progress`. The dots are
  never targets. The stage changes from an outlined chip's menu, and a
  confirm names the project and the new stage before the move.
- **Not interested.** A `danger` button beside the stage chip, behind a
  confirm. When the title room runs out, both controls wrap under the project
  name.
- **Preferences.** One `PillButton` per unit type the project sells. A
  pressed pill is a unit the lead wants. There is no "add": the project
  defines its units, and the executive only marks them.
- **Other projects.** Projects without an open enquiry sit under the
  enquiries as disclosure rows: name, locality, starting price, and a
  `green` fit badge when the project suits the lead. Open, a row shows the
  description clamped to two lines behind "Show more", then type, amenities
  and RERA number, then a share button and "Add enquiry". "Add enquiry" asks
  for the source and opens the enquiry in place, so the pitch continues on
  the same call. A project the lead turned down keeps its row with a `red`
  "Not interested" badge, which adds the reason when the article is at least
  560px wide. Open, it shows a `red` outcome row with the reason,
  the date, who closed it and the last stage, and offers "Reopen enquiry"
  in place of "Add enquiry".
- **Edit in place.** Budget, location and custom fields are ghost inputs in
  the property grid, with no pencil and no edit state. "Add field" appends
  a row whose name and value are both inputs. Once a value differs from the
  saved lead, `Changes` counts the edits. Enter in a field saves and Escape
  discards, through `PropertyGrid`'s `onSave` and `onDiscard`. While the bar
  is up, Save is a second `cta` beside the follow-up's Done. The bar is
  transient, so the page keeps its one lasting `cta`.
- **Assign.** The owner opens a popover that lists the team, each with an
  avatar, name and role. An enquiry keeps its own owner.
- **Source hue.** Facebook blue, Website teal, Walk-in green, Broker amber,
  99acres orange, MagicBricks violet. Each renders as ink on its own tint.
- **Activity.** Three tabs: the timeline of moments, the notes and the
  follow-ups. A one-line note composer sits above the timeline and the
  notes. Every action on the page adds a moment.
- **Words.** Lead, enquiry, stage, preference, follow-up, timeline, moment,
  assigned. Sentence case, verbs first.
