// Behaviour checks for the Charts/Donut stories, run against a live Storybook.
//   bun run storybook            (port 6006)
//   node checks/donut.check.mjs
import { browser, finish, origin, test } from './harness.mjs';

// The stories' sample data, so the expected angles, totals and shares are worked out here and not copied from the screen.
const MODES = [
  ['UPI', 38.4],
  ['Cash', 27.9],
  ['Card', 14.2],
  ['Fleet card', 9.6],
  ['Credit', 5.1],
];
const money = (n) => `₹${n.toFixed(1)} L`;
const valueOf = (name) => MODES.find(([mode]) => mode === name)[1];
const sum = (hidden = []) => MODES.filter(([name]) => !hidden.includes(name)).reduce((t, [, value]) => t + value, 0);
const share = (name, hidden) => `${Math.round((valueOf(name) / sum(hidden)) * 100)}% of sales`;

/** Where a mode's slice starts, ends and has its middle, in turns clockwise from 12 o'clock. */
function span(name, hidden = []) {
  let from = 0;
  for (const [mode, value] of MODES) {
    if (hidden.includes(mode)) continue;
    const to = from + value / sum(hidden);
    if (mode === name) return { from, to, middle: (from + to) / 2 };
    from = to;
  }
  throw new Error(`${name} is hidden`);
}

const DEFAULT = 'charts-donut--default';
const PHONE = 'charts-donut--phone';

const RING = '[data-slot=donut-ring]';
const HOLE = '[data-slot=donut-hole]';
const UNPIN = 'button:has-text("Unpin")';

const unrendered = new Set();

async function open(story, { phone = false } = {}) {
  if (unrendered.has(story)) throw new Error(`${story} does not render`);
  const page = await browser.newPage(
    phone ? { viewport: { width: 390, height: 844 }, hasTouch: true } : { viewport: { width: 1000, height: 640 } },
  );
  await page.goto(`${origin}/iframe.html?id=${story}&viewMode=story`);
  try {
    await page.waitForSelector(`${RING} svg path`, { timeout: 15000 });
  } catch {
    unrendered.add(story);
    await page.close();
    throw new Error(`${story} does not render`);
  }
  await page.waitForTimeout(400);
  const ring = await (await page.$(RING)).boundingBox();
  const outer = ring.width / 2 - 10;
  const inner = outer - (phone ? 30 : 34);
  const middle = (outer + inner) / 2;
  const point = (turn, radius = middle) => ({
    x: ring.x + ring.width / 2 + radius * Math.sin(turn * 2 * Math.PI),
    y: ring.y + ring.height / 2 - radius * Math.cos(turn * 2 * Math.PI),
  });
  /** The slice painted at a point: its fill and opacity, or null on bare surface. */
  const paintAt = ({ x, y }) =>
    page.evaluate(([x, y]) => {
      const path = document.elementsFromPoint(x, y).find((el) => el.tagName === 'path');
      if (!path) return null;
      const style = getComputedStyle(path);
      return { fill: style.fill, opacity: Number(style.opacity) };
    }, [x, y]);
  const settle = () => page.waitForTimeout(220);
  return {
    page, ring, outer, inner, middle, point, paintAt,
    hole: () => page.$$eval(`${HOLE} > *`, (els) => els.map((el) => el.textContent)),
    hover: async (name, hidden) => { const p = point(span(name, hidden).middle); await page.mouse.move(p.x, p.y); await settle(); },
    away: async () => { await page.mouse.move(ring.x - 20, ring.y - 20); await settle(); },
    click: async (name, hidden) => { const p = point(span(name, hidden).middle); await page.mouse.click(p.x, p.y); await settle(); },
    doubleClick: async (name) => { const p = point(span(name).middle); await page.mouse.dblclick(p.x, p.y); await settle(); },
    clickAt: async (p) => { await page.mouse.click(p.x, p.y); await settle(); },
    tap: async (p) => { await page.touchscreen.tap(p.x, p.y); await settle(); },
    centre: () => point(0, 0),
    corner: () => ({ x: ring.x + 4, y: ring.y + 4 }),
    unpins: () => page.$$eval(UNPIN, (els) => els.length),
    /** Every visible mode's paint at the middle of its slice. */
    paints: async (hidden = []) => {
      const got = {};
      for (const [name] of MODES) if (!hidden.includes(name)) got[name] = await paintAt(point(span(name, hidden).middle));
      return got;
    },
    /** Whether a mode's slice reaches past the ring's edge, and whether the pin arc sits outside it. */
    reach: async (name, hidden) => ({
      grown: (await paintAt(point(span(name, hidden).middle, outer + 2))) !== null,
      pinArc: (await paintAt(point(span(name, hidden).middle, outer + 8))) !== null,
    }),
    legendKeys: () =>
      page.$$eval('[role=group] button[aria-pressed]', (els) =>
        Object.fromEntries(els.map((el) => [el.textContent, getComputedStyle(el.querySelector('span')).backgroundColor])),
      ),
    toggle: async (name) => { await page.click(`button[aria-pressed]:has-text("${name}")`); await settle(); },
    overLegend: async (name) => { await page.hover(`button[aria-pressed]:has-text("${name}")`); await settle(); },
    focusRing: async () => { await page.focus(`${RING} button`); },
    press: async (key) => { await page.keyboard.press(key); await settle(); },
    close: () => page.close(),
  };
}

/** Opens a story, runs one check on it and closes the page whatever happens. */
const on = (story, name, run, options) =>
  test(name, async () => {
    const c = await open(story, options);
    try { return await run(c); } finally { await c.close(); }
  });

const dimmedExcept = (paints, ...bright) =>
  Object.entries(paints).every(([name, paint]) => paint && Math.abs(paint.opacity - (bright.includes(name) ? 1 : 0.35)) < 0.01);
const same = (a, b) => a.join('|') === b.join('|');

// ---- the ring
await on(DEFAULT, 'idle: the hole shows the label, the total and the note', async (c) => {
  const hole = await c.hole();
  return [same(hole, ['Sales', money(sum()), 'August 2026']), hole];
});
await on(DEFAULT, 'the total is 24px, semibold and tabular', async (c) => {
  const type = await c.page.$eval(`${HOLE} > :nth-child(2)`, (el) => { const s = getComputedStyle(el); return [s.fontSize, s.fontWeight, s.fontVariantNumeric]; });
  return [same(type, ['24px', '600', 'tabular-nums']), type];
});
await on(DEFAULT, 'the ring is 260px, starts at 12 o\'clock and runs clockwise in data order, in the legend\'s colours', async (c) => {
  const keys = await c.legendKeys();
  const paints = await c.paints();
  const justAfterTwelve = await c.paintAt(c.point(0.01));
  const ok = c.ring.width === 260 && MODES.every(([name]) => paints[name]?.fill === keys[name]) && justAfterTwelve?.fill === keys.UPI && new Set(Object.values(keys)).size === MODES.length;
  return [ok, { width: c.ring.width, paints, keys }];
});
await on(DEFAULT, 'slices are 2px apart at the middle of the ring', async (c) => {
  const edge = span('UPI').to;
  const turnsPerPx = 1 / (2 * Math.PI * c.middle);
  const between = await c.paintAt(c.point(edge));
  const before = await c.paintAt(c.point(edge - 2.5 * turnsPerPx));
  const after = await c.paintAt(c.point(edge + 2.5 * turnsPerPx));
  return [between === null && before !== null && after !== null && before.fill !== after.fill, { between, before, after }];
});
await on(DEFAULT, 'the legend is centred under the ring and shows no values or shares', async (c) => {
  const legend = await c.page.$eval('[role=group]:has(button[aria-pressed])', (el) => {
    const buttons = [...el.querySelectorAll('button')].map((b) => b.getBoundingClientRect());
    return { text: el.textContent, left: Math.min(...buttons.map((b) => b.left)), right: Math.max(...buttons.map((b) => b.right)), top: buttons[0].top };
  });
  const centred = Math.abs((legend.left + legend.right) / 2 - (c.ring.x + c.ring.width / 2)) < 1.5;
  return [centred && legend.top >= c.ring.y + c.ring.height && !/[₹%\d]/.test(legend.text), legend];
});

// ---- hover
await on(DEFAULT, 'hover: the hole shows the slice\'s name, value and share', async (c) => {
  await c.hover('UPI');
  const hole = await c.hole();
  return [same(hole, ['UPI', money(38.4), share('UPI')]) && share('UPI') === '40% of sales', hole];
});
await on(DEFAULT, 'hover: the slice grows 4px and the others dim to 35%', async (c) => {
  const idle = await c.reach('Cash');
  await c.hover('Cash');
  const paints = await c.paints();
  const reach = await c.reach('Cash');
  const past = await c.paintAt(c.point(span('Cash').middle, c.outer + 5));
  return [!idle.grown && reach.grown && past === null && !reach.pinArc && dimmedExcept(paints, 'Cash'), { idle, reach, past, paints }];
});
await on(DEFAULT, 'hover: the surface between two slices counts as the nearer one', async (c) => {
  const edge = span('UPI').to;
  const halfPx = 0.5 / (2 * Math.PI * c.middle);
  const seen = [];
  for (const turn of [edge - halfPx, edge + halfPx]) {
    const p = c.point(turn);
    await c.page.mouse.move(p.x, p.y);
    await c.page.waitForTimeout(220);
    seen.push({ painted: (await c.paintAt(p)) !== null, hole: (await c.hole())[0] });
  }
  return [same(seen.map((s) => s.hole), ['UPI', 'Cash']) && seen.every((s) => !s.painted), seen];
});
await on(DEFAULT, 'hover: nothing floats, the hole is the readout', async (c) => {
  await c.hover('Card');
  const floating = await c.page.$$eval('[role=tooltip], [role=status].glass, .glass.absolute', (els) => els.length);
  return [floating === 0, floating];
});
await on(DEFAULT, 'leaving the ring brings the total back and undims', async (c) => {
  await c.hover('Card');
  const over = await c.hole();
  await c.away();
  const hole = await c.hole();
  const paints = await c.paints();
  return [over[0] === 'Card' && hole[0] === 'Sales' && Object.values(paints).every((p) => p.opacity === 1), { over, hole, paints }];
});

// ---- pin
await on(DEFAULT, 'a click pins the slice: Unpin shows, a muted arc sits outside it, and it holds when the pointer leaves', async (c) => {
  const before = await c.unpins();
  await c.click('UPI');
  await c.away();
  const hole = await c.hole();
  const reach = await c.reach('UPI');
  const arc = await c.paintAt(c.point(span('UPI').middle, c.outer + 8));
  const inkMuted = await c.page.evaluate(() => { const el = document.createElement('span'); el.className = 'text-ink-muted'; document.body.append(el); const color = getComputedStyle(el).color; el.remove(); return color; });
  const paints = await c.paints();
  const ok = before === 0 && (await c.unpins()) === 1 && hole[0] === 'UPI' && reach.grown && reach.pinArc && arc.fill === inkMuted && dimmedExcept(paints, 'UPI');
  return [ok, { before, unpins: await c.unpins(), hole, reach, arc, inkMuted }];
});
await on(DEFAULT, 'a click on another slice moves the pin', async (c) => {
  await c.click('UPI');
  await c.click('Card');
  await c.away();
  const reach = { upi: await c.reach('UPI'), card: await c.reach('Card') };
  return [(await c.hole())[0] === 'Card' && reach.card.pinArc && !reach.upi.pinArc && !reach.upi.grown, { hole: await c.hole(), reach }];
});
await on(DEFAULT, 'a click on the pinned slice lets it go', async (c) => {
  await c.click('UPI');
  const pinned = await c.unpins();
  await c.page.waitForTimeout(500);
  await c.click('UPI');
  await c.away();
  return [pinned === 1 && (await c.unpins()) === 0 && (await c.hole())[0] === 'Sales', { pinned, unpins: await c.unpins(), hole: await c.hole() }];
});
await on(DEFAULT, 'a double click pins once', async (c) => {
  await c.doubleClick('Card');
  await c.away();
  return [(await c.unpins()) === 1 && (await c.hole())[0] === 'Card', { unpins: await c.unpins(), hole: await c.hole() }];
});
for (const [how, release] of [
  ['a click in the hole', (c) => c.clickAt(c.centre())],
  ['a click outside the ring', (c) => c.clickAt(c.corner())],
  ['Escape', (c) => c.press('Escape')],
  ['Unpin', async (c) => { await c.page.click(UNPIN); await c.page.waitForTimeout(220); }],
]) {
  await on(DEFAULT, `${how} lets the pin go`, async (c) => {
    await c.click('UPI');
    const pinned = await c.unpins();
    await release(c);
    await c.away();
    const reach = await c.reach('UPI');
    return [pinned === 1 && (await c.unpins()) === 0 && (await c.hole())[0] === 'Sales' && !reach.pinArc && !reach.grown, { pinned, unpins: await c.unpins(), hole: await c.hole(), reach }];
  });
}

// ---- compare
await on(DEFAULT, 'a press outside the chart lets go of the pin and the focus', async (c) => {
  await c.click('UPI');
  const before = await c.unpins();
  await c.page.mouse.click(4, 4);
  await c.page.waitForTimeout(220);
  const hole = await c.hole();
  return [before === 1 && (await c.unpins()) === 0 && hole[0] === 'Sales', { before, unpins: await c.unpins(), hole }];
});
await on(DEFAULT, 'hover while pinned: the hole adds the change against the pin, with an arrow and "vs"', async (c) => {
  await c.click('UPI');
  await c.hover('Card');
  const down = await c.hole();
  const paints = await c.paints();
  const reach = { upi: await c.reach('UPI'), card: await c.reach('Card') };
  await c.click('Credit');
  await c.hover('Cash');
  const up = await c.hole();
  const ok =
    same(down, ['Card', money(14.2), share('Card'), '↓ ₹24.2 L vs UPI']) &&
    same(up, ['Cash', money(27.9), share('Cash'), '↑ ₹22.8 L vs Credit']) &&
    dimmedExcept(paints, 'UPI', 'Card') && reach.upi.grown && reach.upi.pinArc && reach.card.grown && !reach.card.pinArc;
  return [ok, { down, up, reach, paints }];
});
await on(DEFAULT, 'over the pinned slice the hole has no change line', async (c) => {
  await c.click('UPI');
  await c.hover('Card');
  await c.hover('UPI');
  const hole = await c.hole();
  return [same(hole, ['UPI', money(38.4), share('UPI')]), hole];
});

// ---- legend
await on(DEFAULT, 'hiding a slice re-sums the total and the shares and re-proportions the ring', async (c) => {
  await c.toggle('Cash');
  await c.away();
  const idle = await c.hole();
  const keys = await c.legendKeys();
  const paints = await c.paints(['Cash']);
  await c.hover('UPI', ['Cash']);
  const hole = await c.hole();
  const ok =
    same(idle, ['Sales', money(sum(['Cash'])), 'August 2026']) && money(sum(['Cash'])) === '₹67.3 L' &&
    same(hole, ['UPI', money(38.4), '57% of sales']) &&
    ['UPI', 'Card', 'Fleet card', 'Credit'].every((name) => paints[name]?.fill === keys[name]);
  return [ok, { idle, hole, paints }];
});
await on(DEFAULT, 'a hidden slice keeps its legend entry, hollow and disabled, and comes back on a second click', async (c) => {
  await c.toggle('Cash');
  const off = await c.page.$eval('button[aria-pressed]:has-text("Cash")', (el) => [el.getAttribute('aria-pressed'), getComputedStyle(el.querySelector('span')).backgroundColor]);
  await c.toggle('Cash');
  await c.away();
  const hole = await c.hole();
  return [off[0] === 'false' && /rgba\(0, 0, 0, 0\)|transparent/.test(off[1]) && hole[1] === money(sum()), { off, hole }];
});
await on(DEFAULT, 'slice colours follow the category when another slice is hidden', async (c) => {
  const before = await c.paints();
  await c.toggle('UPI');
  await c.away();
  const after = await c.paints(['UPI']);
  const kept = ['Cash', 'Card', 'Fleet card', 'Credit'].every((name) => after[name] && after[name].fill === before[name].fill);
  return [kept, { before, after }];
});
await on(DEFAULT, 'hiding the pinned slice releases the pin; hiding another keeps it', async (c) => {
  await c.click('UPI');
  await c.toggle('Cash');
  await c.away();
  const kept = { unpins: await c.unpins(), hole: await c.hole() };
  await c.toggle('UPI');
  await c.away();
  const released = { unpins: await c.unpins(), hole: await c.hole() };
  const ok = kept.unpins === 1 && kept.hole[0] === 'UPI' && released.unpins === 0 && same(released.hole, ['Sales', money(sum(['Cash', 'UPI'])), 'August 2026']);
  return [ok, { kept, released }];
});
await on(DEFAULT, 'hovering a legend entry puts its slice in focus and brightens its name', async (c) => {
  const nameColour = () => c.page.$eval('button[aria-pressed]:has-text("Card") span:last-child', (el) => getComputedStyle(el).color);
  const idle = await nameColour();
  await c.overLegend('Card');
  const hole = await c.hole();
  const paints = await c.paints();
  const reach = await c.reach('Card');
  return [same(hole, ['Card', money(14.2), share('Card')]) && dimmedExcept(paints, 'Card') && reach.grown && (await nameColour()) !== idle, { hole, paints, reach }];
});
await on(DEFAULT, 'hovering a hidden legend entry focuses nothing', async (c) => {
  await c.overLegend('Card');
  const shown = await c.hole();
  await c.toggle('Card');
  await c.away();
  await c.overLegend('Card');
  const hole = await c.hole();
  return [shown[0] === 'Card' && hole[0] === 'Sales', { shown, hole }];
});

// ---- keyboard
await on(DEFAULT, 'keyboard: the ring is one control, and the arrows walk the slices and wrap', async (c) => {
  const controls = await c.page.$$eval(`${RING} button, ${RING} [tabindex]`, (els) => els.length);
  await c.focusRing();
  const seen = [];
  for (const key of ['ArrowRight', 'ArrowRight', 'ArrowLeft', 'ArrowLeft', 'ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp']) {
    await c.press(key);
    seen.push((await c.hole())[0]);
  }
  return [controls === 1 && same(seen, ['UPI', 'Cash', 'UPI', 'Credit', 'Fleet card', 'Credit', 'UPI', 'Credit']), { controls, seen }];
});
await on(DEFAULT, 'keyboard: the arrows skip a hidden slice', async (c) => {
  await c.toggle('Cash');
  await c.focusRing();
  const seen = [];
  for (const key of ['ArrowRight', 'ArrowRight', 'ArrowLeft', 'ArrowLeft']) {
    await c.press(key);
    seen.push((await c.hole())[0]);
  }
  return [same(seen, ['UPI', 'Card', 'UPI', 'Credit']), seen];
});
await on(DEFAULT, 'keyboard: Enter and Space pin and unpin, Escape lets go of pin and focus', async (c) => {
  await c.focusRing();
  await c.press('ArrowRight');
  await c.press('ArrowRight');
  await c.press('Enter');
  const afterEnter = { unpins: await c.unpins(), arc: (await c.reach('Cash')).pinArc };
  await c.press(' ');
  const afterSpace = await c.unpins();
  await c.press(' ');
  const afterSecondSpace = await c.unpins();
  await c.press('ArrowRight');
  const compared = await c.hole();
  await c.press('Escape');
  const afterEscape = { unpins: await c.unpins(), hole: await c.hole() };
  const ok = afterEnter.unpins === 1 && afterEnter.arc && afterSpace === 0 && afterSecondSpace === 1 && compared[0] === 'Card' && /vs Cash$/.test(compared[3] ?? '') && afterEscape.unpins === 0 && afterEscape.hole[0] === 'Sales';
  return [ok, { afterEnter, afterSpace, afterSecondSpace, compared, afterEscape }];
});
await on(DEFAULT, 'keyboard focus rings the control, and a click does not', async (c) => {
  const outline = () => c.page.$eval(`${RING} button`, (el) => getComputedStyle(el).outlineStyle);
  await c.click('UPI');
  const clicked = await outline();
  await c.page.keyboard.press('Tab');
  await c.page.keyboard.press('Shift+Tab');
  const tabbed = await outline();
  return [clicked === 'none' && tabbed === 'solid', { clicked, tabbed }];
});
await on(DEFAULT, 'the ring carries the chart\'s accessible name', async (c) => {
  const name = await c.page.$eval(`${RING} button`, (el) => el.getAttribute('aria-label'));
  return [/^Sales by payment mode/.test(name ?? ''), name];
});

// ---- phone
await on(PHONE, 'phone: the ring is 232px and legend entries are at touch height', async (c) => {
  const heights = await c.page.$$eval('button[aria-pressed]', (els) => els.map((el) => el.getBoundingClientRect().height));
  return [c.ring.width === 232 && heights.length === MODES.length && heights.every((h) => h >= 36), { width: c.ring.width, heights }];
}, { phone: true });
await on(PHONE, 'phone: a tap focuses a slice and it holds, with no pin and nothing floating', async (c) => {
  await c.tap(c.point(span('Cash').middle));
  const hole = await c.hole();
  const paints = await c.paints();
  const reach = await c.reach('Cash');
  const floating = await c.page.$$eval('[role=tooltip], .glass.absolute', (els) => els.length);
  const ok = same(hole, ['Cash', money(27.9), share('Cash')]) && dimmedExcept(paints, 'Cash') && reach.grown && !reach.pinArc && (await c.unpins()) === 0 && floating === 0;
  return [ok, { hole, reach, unpins: await c.unpins(), floating }];
}, { phone: true });
await on(PHONE, 'phone: a tap on another slice moves the focus, and a tap in the hole clears it', async (c) => {
  await c.tap(c.point(span('Cash').middle));
  await c.tap(c.point(span('UPI').middle));
  const moved = await c.hole();
  await c.tap(c.centre());
  const cleared = await c.hole();
  return [moved[0] === 'UPI' && cleared[0] === 'Sales', { moved, cleared }];
}, { phone: true });

await finish();
