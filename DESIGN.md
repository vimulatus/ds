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

## Chart

`src/components/Chart.tsx` draws a time series, with the behaviour every chart
shares. A mark says what is drawn: `line()`, `area()` or `bar()`. A chart has
marks of one kind. `stacked` belongs to the chart, not to a mark, and a line
chart ignores it.

- **Hover.** One dashed crosshair, a dot on every series, the day in a chip
  on the axis, and one glass tooltip that lists every series at that day.
  Values lead and names follow. Rows sort by value, so they read in the
  order the dots stack.
- **Pin.** A click pins the day: the crosshair turns solid and a panel holds
  the top of the plot. A click on another day moves the pin. A click on the
  pinned day, Escape or Unpin lets it go. A double click pins once. The panel
  owns the pointer and its text selects.
- **Outside.** A press anywhere outside the chart lets go of the pin and the
  range. The zoom and the hidden series stay: they are the view, not a
  selection. The chart's own header and legend count as inside.
- **Compare.** Hover stays live while a day is pinned. Its tooltip hangs from
  the bottom of the plot, names the pinned day and adds each series' change
  from it.
- **Range.** A drag selects a range that snaps to days. Its handles drag
  across the whole window, flip when they cross, and take the arrow keys. A
  glass bar names the range and offers "Zoom in". With a range selected a
  click only clears it.
- **Zoom.** ⌘ or Ctrl and scroll zooms around the pointer, and so does a
  pinch. A plain scroll is left to the page. Zoomed, Shift and drag or a
  sideways scroll moves the window. It stops at three days and at the full
  range. "Reset zoom" is ⌘0. The header hint names the gesture that applies.
- **Y axis.** It ends on a round maximum, 1, 1.2, 1.6, 2, 4, 5 or 8 times a
  power of ten, and ticks at its quarters. Stacked, it covers the largest
  total.
- **Legend.** A legend entry hides its series. The others keep their colours
  and the y axis keeps its scale, so nothing jumps. Lines also carry their
  name at their end, so a series never rests on colour alone.
- **Colour.** Series take blue, orange, violet, lime, pink, cyan, in that
  order. Red, green and amber stay with status, and neighbours stay apart for
  red-green colour blindness. In light the hue's lightness is capped at 0.62:
  lime and cyan at their light values read under 2:1 as a 2px line on white.
- **Key.** A legend, tooltip or readout key mirrors the mark: a short line
  for lines and side-by-side areas, a block for stacked areas and bars. A
  hidden series shows its key hollow.
- **Area.** Side by side, each series is a 2px line over a fill of its colour
  that fades from 28% at the line to nothing at the baseline. Past three
  series the fills turn to mud, so the chart draws lines only.
- **Stacked area.** Bands that add up, each filled from 42% at its top edge to
  10% at its bottom. Dots sit on the top edges, and the names sit at the
  middle of each band.
- **Bar.** Each day is a band, and the axis grows half a band at each end.
  Side by side, a day's bars take 80% of the band up to 96px, 2px apart.
  Stacked, one bar takes 60% up to 56px, with 2px of surface between
  segments. Only the free end of a bar is rounded, by 4px. Bars carry no
  names at their ends, so the plot runs to the right edge.
- **Bar focus.** No crosshair and no dots. Hover washes the day's band with 6%
  ink, and a pinned day adds an `edge` border. The day chip stays on the axis.
  A range covers whole bands, edge to edge. Zoom stops at two bands. Every
  band is labelled while the labels fit, and thinned evenly once they collide.
- **Stack.** The tooltip reads top to bottom as the stack is drawn, then a
  hairline and "Total"; against a pinned day the total shows its change too.
  Hiding a series lets the rest settle onto the baseline while the y axis
  keeps its scale.
- **Phone.** No floating tooltip, because a finger would cover it. A tap
  fills a readout above the plot, and the legend moves below. No range
  selection. The readout runs left to right, so a stack keeps the legend's
  order there.
- **Parts.** `src/lib/chart/parts.tsx` holds what other charts reuse: the
  hues and their colours, the series key, the legend, the tooltip body and
  the change formatter.
- **Vendor.** Only the files named `src/lib/chart/tanstack*` import TanStack
  Charts, pinned at an exact version while it is Alpha. `tanstack.tsx` draws
  marks, axes and the hover tooltip, and reports focus, clicks and the
  resolved scale. `tanstack-bars.ts` is a custom mark: the vendor's own bars
  group only on a band scale, and a time axis is continuous. The component owns pin, range and zoom: the vendor's zoom
  and range controls each take the pointer from its tooltip, and cannot share
  a plot.

## Ranked bars

`src/components/RankedBars.tsx` ranks categories by value, as horizontal
bars. It is its own component because it has no time axis: nothing zooms, no
range is selected, and the header carries no hints. It takes the same `bar()`
marks and the same `stacked` as `Chart`.

- **Rank.** Rows sort by the total of what is showing, stacked or side by
  side, so both forms list the rows in one order. Hiding a series can reorder
  the rows, so it also lets go of the pin. The value axis covers every series
  and holds still.
- **Row.** 56px. Side by side, the bars share 36px, 2px apart. Stacked, one
  24px bar with 2px of surface between segments, and the row's total just past
  its end in `ink-muted`. Only the free end of a bar is rounded, by 4px. The
  name sits left of the plot, and the plot starts where the longest name ends.
- **Axis.** Values along the bottom, ending on 1, 2, 2.5 or 5 times a power of
  ten and ticked at its fifths. Vertical hairlines: the zero line is `edge`,
  the rest `edge-muted`.
- **Hover.** The whole row washes with 6% ink under its bars, radius 8, and
  its name brightens to `ink`. One glass tooltip names the row. Side by side
  its rows sort by value; stacked they keep the legend's order and end with
  "Total".
- **Pin.** A click pins the row: the wash gains an `edge` border and a panel
  with Unpin holds the right edge. A click on another row moves the pin. A
  click on the pinned row, Escape, Unpin or a press outside the chart lets it
  go. A double click pins once.
- **Compare.** Hover stays live while a row is pinned. Its tooltip names the
  pinned row and adds each series' change from it, and the total's when
  stacked.
- **Placement.** A tooltip sits beside its row and never over it, so the bar
  and its total stay readable. It opens below a row in the top half and above
  one in the bottom half, centred on the bar's end and kept inside the chart.
  While a row is pinned it opens away from that row, and steps left of the
  pinned panel when the two would meet. When the side it wants has no room it
  takes the other, which can cover a neighbour but not the hovered row.
- **Keyboard.** The plot is one control. Up and Down move between rows, Home
  and End jump, Enter or Space pins, Escape unpins.
- **Phone.** The name moves above its bar and the plot starts at the edge.
  Rows are 58px with a 22px bar, and the axis labels every other tick. No
  floating tooltip: a tap fills a readout above the plot, and the legend moves
  below.
- **Vendor.** `src/lib/chart/tanstack-ranked.tsx` draws the bars with the
  vendor's own horizontal bar on a band scale, whose paddings are worked out
  from the row's pixels. Stacked segments are authored as intervals, so the
  2px between them is turned into a value at the plot's width. Focus is a
  custom strategy: the vendor's grouped focus keys a group by pixel, which
  splits side-by-side bars, and walks the keyboard by bar length. The
  component draws the wash, names, totals and both tooltips from the reported
  geometry, because the vendor's tooltip takes one placement for the whole
  chart and these open per row.

## Donut

`src/components/Donut.tsx` shows parts of one whole: one measure, a handful
of categories. It takes `data`, `category` and `value`, and no marks. Past six
categories the caller folds the tail into "Other" first.

- **Ring.** 260px square, 34px thick, with 10px around it for a slice to grow
  into. It starts at 12 o'clock and runs clockwise in data order, with 2px of
  surface between slices, measured at the ring's middle radius.
- **Colour.** Hues in data order. A slice keeps its hue when another is
  hidden, so colour means the category and never its rank or its size.
- **Hole.** The readout. Idle: the `total` label in `ink-subtle`, the sum at
  24px semibold tabular, and the `note` in `ink-muted`. With a slice in focus:
  its name, its value and its share, worded from the label as "40% of sales".
  Nothing floats anywhere.
- **Focus.** Hover, the arrow keys or a legend entry put a slice in focus. It
  grows 4px outward and the others drop to 35% over 120ms. Its legend name
  brightens to `ink`. The surface between two slices counts as the nearer one,
  so focus does not blink on the way across.
- **Pin.** A click pins a slice: it keeps its growth, gains a 2px arc in
  `ink-muted` 7px outside the ring, and Unpin shows in the header. A click on
  another slice moves the pin. A click on the pinned slice, in the hole or
  beside the ring, Escape, Unpin or a press outside the chart lets it go. A
  double click pins once.
- **Compare.** Hover stays live while a slice is pinned. The hole adds a
  fourth line in `ink-subtle`: the change against the pin with an arrow, then
  the pin's name, as "↓ ₹24.2 L vs UPI". Both slices stay bright.
- **Legend.** The toggle row the other charts use, block keys, centred under
  the ring. It carries names only, because the hole already reads values and
  shares. Hiding a slice re-proportions the ring and re-sums the total and
  every share. It lets go of a pin on that slice and keeps any other.
- **Keyboard.** The ring is one control. The arrow keys move between visible
  slices and wrap, Enter or Space pins, Escape lets go of pin and focus.
- **Phone.** The same layout with a 232px ring, 30px thick, and legend entries
  at touch height. A tap puts a slice in focus and it holds until the next
  tap; a tap in the hole clears it. Nothing pins, and no readout strip is
  needed, because the hole is one.
- **Vendor.** None. The vendor's polar entry takes one outer radius and one
  opacity per mark, so growing and dimming a slice means a mark per slice and
  a chart rebuilt on every hover. Its keyboard stops at the ends where this
  one wraps, and its pointer focus ends at the painted shape, so the surface
  between slices belongs to no slice. With the keyboard and the hit test
  replaced it would draw five paths. `src/lib/chart/ring.ts` holds the maths
  instead: the spans, the sector path and the hit test.
