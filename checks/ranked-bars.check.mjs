// Behaviour checks for the horizontal stories of Charts/Bar, run against a live Storybook.
//   bun run storybook            (port 6006)
//   node checks/ranked-bars.check.mjs
import { browser, finish, origin, test } from './harness.mjs';

// The stories' sample data, so the expected ranking is worked out here and not copied from the screen.
const PUMPS = {
  'Pump 1': { petrol: 151.9, diesel: 187.3, cng: 84.5 },
  'Pump 2': { petrol: 121.7, diesel: 158.6, cng: 40.3 },
  'Pump 3': { petrol: 168.4, diesel: 204.1, cng: 61.2 },
  'Pump 4': { petrol: 84.6, diesel: 96.2, cng: 38.1 },
  'Pump 5': { petrol: 139.2, diesel: 142.8, cng: 72.9 },
  'Pump 6': { petrol: 98.3, diesel: 117.4, cng: 55.8 },
};
const ranked = (score) => Object.keys(PUMPS).sort((a, b) => score(PUMPS[b]) - score(PUMPS[a]));
const total = (row, series = ['petrol', 'diesel', 'cng']) => series.reduce((sum, id) => sum + row[id], 0);
const kl = (n) => `${n.toFixed(1)} kL`;

const GROUPED = 'charts-bar--horizontal';
const STACKED = 'charts-bar--horizontal-stacked';
const PHONE = 'charts-bar--horizontal-phone';

const NAME = '[data-slot=ranked-bars-name]';
const TOTAL = '[data-slot=ranked-bars-total]';
const TOOLTIP = '[data-slot=ranked-bars-tooltip]';
const PINNED = '[role=status][data-chart-ui]';
const WASH = '.chart span.bg-ink\\/6';

const unrendered = new Set();

async function open(story, { phone = false } = {}) {
  if (unrendered.has(story)) throw new Error(`${story} does not render`);
  const page = await browser.newPage(
    phone ? { viewport: { width: 390, height: 844 }, hasTouch: true } : { viewport: { width: 1000, height: 640 } },
  );
  await page.goto(`${origin}/iframe.html?id=${story}&viewMode=story`);
  try {
    await page.waitForSelector(`.chart svg >> nth=0`, { timeout: 15000 });
    await page.waitForSelector(NAME, { timeout: 5000 });
  } catch {
    unrendered.add(story);
    await page.close();
    throw new Error(`${story} does not render`);
  }
  await page.waitForTimeout(500);
  const svg = await (await page.$('.chart svg')).boundingBox();
  const box = (selector) => page.$$eval(selector, (els) => els.map((el) => { const r = el.getBoundingClientRect(); return { text: el.textContent, left: r.left, right: r.right, top: r.top, bottom: r.bottom }; }));
  const names = async () => (await box(NAME)).sort((a, b) => a.top - b.top);
  // On a phone the name sits above its bar, so the bar is a little under it.
  const rowPoint = async (i) => { const n = (await names())[i]; return { x: svg.x + svg.width * 0.4, y: phone ? n.bottom + 12 : (n.top + n.bottom) / 2 }; };
  return {
    page, box, names,
    order: async () => (await names()).map((n) => n.text),
    hover: async (i) => { const p = await rowPoint(i); await page.mouse.move(p.x, p.y); await page.waitForTimeout(200); },
    click: async (i) => { const p = await rowPoint(i); await page.mouse.move(p.x, p.y); await page.mouse.down(); await page.mouse.up(); await page.waitForTimeout(150); },
    doubleClick: async (i) => { const p = await rowPoint(i); await page.mouse.dblclick(p.x, p.y); await page.waitForTimeout(150); },
    tap: async (i) => { const p = await rowPoint(i); await page.touchscreen.tap(p.x, p.y); await page.waitForTimeout(200); },
    tips: () => box(TOOLTIP),
    pinned: () => page.$$eval(PINNED, (els) => els.map((el) => el.querySelector('span')?.textContent)),
    wash: () => box(WASH),
    toggle: async (series) => { await page.click(`button[aria-pressed]:has-text("${series}")`); await page.waitForTimeout(250); },
    close: () => page.close(),
  };
}

const apart = (a, b) => a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top;

/** Opens a story, runs one check on it and closes the page whatever happens. */
const on = (story, name, run, options) =>
  test(name, async () => {
    const c = await open(story, options);
    try { return await run(c); } finally { await c.close(); }
  });

// ---- ranking
await on(GROUPED, 'grouped: rows are ranked by their total', async (c) => {
  const order = await c.order();
  return [order.join() === ranked(total).join(), order];
});
await on(STACKED, 'stacked: rows are ranked by their total', async (c) => {
  const order = await c.order();
  return [order.join() === ranked(total).join(), order];
});
await on(GROUPED, 'there is no zoom to reset', async (c) => {
  const n = await c.page.$$eval('button', (els) => els.filter((el) => /zoom/i.test(el.textContent)).length);
  return [n === 0, n];
});

// ---- hover
await on(GROUPED, 'hover shows one tooltip that names the row', async (c) => {
  await c.hover(1);
  const tips = await c.tips();
  return [tips.length === 1 && tips[0].text.startsWith(ranked(total)[1]), tips.map((t) => t.text)];
});
await on(GROUPED, 'hover washes the whole row and brightens its name', async (c) => {
  await c.hover(1);
  const wash = await c.wash();
  const name = (await c.names())[1];
  const colours = await c.page.$$eval(NAME, (els) => els.map((el) => getComputedStyle(el).color));
  const covers = wash.length === 1 && wash[0].top <= name.top && wash[0].bottom >= name.bottom && wash[0].left <= name.left;
  return [covers && new Set(colours).size === 2, { wash: wash.length, colours }];
});
for (const story of [GROUPED, STACKED]) {
  await on(story, `${story}: the tooltip never covers the hovered row`, async (c) => {
    const got = [];
    for (let i = 0; i < 6; i++) {
      await c.hover(i);
      const [tip] = await c.tips();
      const [wash] = await c.wash();
      got.push(Boolean(tip && wash && apart(tip, wash)));
    }
    return [got.every(Boolean), got];
  });
}
await on(GROUPED, 'the tooltip opens below a row in the top half and above one in the bottom half', async (c) => {
  const sides = [];
  for (const i of [0, 5]) {
    await c.hover(i);
    const [tip] = await c.tips();
    const [wash] = await c.wash();
    sides.push(tip.top >= wash.bottom - 4 ? 'below' : tip.bottom <= wash.top + 4 ? 'above' : 'over');
  }
  return [sides.join() === 'below,above', sides];
});
await on(GROUPED, 'grouped rows carry no total, and the tooltip has no Total row', async (c) => {
  await c.hover(0);
  const [tip] = await c.tips();
  const totals = await c.box(TOTAL);
  return [totals.length === 0 && !/Total/.test(tip.text), { totals: totals.length, tip: tip.text }];
});

// ---- pin
await on(GROUPED, 'a click pins the row, with a border and an Unpin button', async (c) => {
  await c.click(1);
  const pinned = await c.pinned();
  const bordered = await c.page.$$eval(WASH, (els) => els.filter((el) => el.classList.contains('border-edge')).length);
  const unpin = await c.page.$$eval('button[aria-label="Unpin"]', (els) => els.length);
  return [pinned.length === 1 && pinned[0] === ranked(total)[1] && bordered === 1 && unpin === 1, { pinned, bordered, unpin }];
});
await on(GROUPED, 'a click elsewhere moves the pin', async (c) => {
  await c.click(1);
  await c.click(4);
  const pinned = await c.pinned();
  return [pinned.length === 1 && pinned[0] === ranked(total)[4], pinned];
});
await on(GROUPED, 'a click on the pinned row lets it go', async (c) => {
  await c.click(1);
  await c.page.waitForTimeout(500);
  await c.click(1);
  return [(await c.pinned()).length === 0, await c.pinned()];
});
await on(GROUPED, 'a double click pins once', async (c) => {
  await c.doubleClick(2);
  const pinned = await c.pinned();
  return [pinned.length === 1 && pinned[0] === ranked(total)[2], pinned];
});
await on(GROUPED, 'Unpin lets it go', async (c) => {
  await c.click(1);
  await c.page.click('button[aria-label="Unpin"]');
  await c.page.waitForTimeout(120);
  return [(await c.pinned()).length === 0, await c.pinned()];
});
await on(GROUPED, 'a press outside the chart lets it go', async (c) => {
  await c.click(1);
  const before = (await c.pinned()).length;
  await c.page.mouse.click(4, 4);
  await c.page.waitForTimeout(150);
  return [before === 1 && (await c.pinned()).length === 0, { before, after: await c.pinned() }];
});
await on(GROUPED, 'a press on the chart\'s own legend is not outside it', async (c) => {
  await c.click(1);
  await c.page.hover('button:has-text("CNG")');
  await c.page.mouse.down(); await c.page.waitForTimeout(100);
  const held = (await c.pinned()).length;
  await c.page.mouse.up();
  return [held === 1, { held }];
});
await on(GROUPED, 'Escape lets it go', async (c) => {
  await c.click(1);
  await c.page.keyboard.press('Escape');
  await c.page.waitForTimeout(120);
  return [(await c.pinned()).length === 0, await c.pinned()];
});

// ---- compare
await on(GROUPED, 'hover stays live while pinned, names the pinned row and shows arrows', async (c) => {
  await c.click(1);
  await c.hover(3);
  const tips = await c.tips();
  const order = ranked(total);
  const ok = tips.length === 1 && tips[0].text.startsWith(order[3]) && tips[0].text.includes(`vs ${order[1]}`) && /[↑↓] [\d.]+/.test(tips[0].text) && !/[+-]\d/.test(tips[0].text);
  return [ok, tips.map((t) => t.text)];
});
await on(GROUPED, 'over the pinned row only the pinned panel shows', async (c) => {
  await c.click(1);
  await c.hover(1);
  return [(await c.tips()).length === 0 && (await c.pinned()).length === 1, { tips: (await c.tips()).length }];
});
await on(GROUPED, 'while pinned the tooltip opens away from the pinned row, clear of the panel and of both rows', async (c) => {
  const got = [];
  for (const [pin, hover] of [[1, 3], [3, 2], [2, 3], [0, 3]]) {
    await c.click(pin);
    await c.hover(hover);
    const [tip] = await c.tips();
    const [panel] = await c.box(PINNED);
    const rows = await c.wash();
    const away = hover < pin ? tip.bottom <= Math.min(...rows.map((r) => r.bottom)) : tip.top >= Math.max(...rows.map((r) => r.top));
    got.push({ pin, hover, away, clearOfPanel: apart(tip, panel), clearOfRows: rows.every((r) => apart(tip, r)) });
    await c.page.keyboard.press('Escape');
  }
  return [got.every((g) => g.away && g.clearOfPanel && g.clearOfRows), got];
});
await on(GROUPED, 'with no room on the far side the tooltip takes the near one, and still leaves the hovered row clear', async (c) => {
  const got = [];
  for (const [pin, hover] of [[0, 5], [5, 0], [3, 1], [1, 4]]) {
    await c.click(pin);
    await c.hover(hover);
    const [tip] = await c.tips();
    const [panel] = await c.box(PINNED);
    const name = (await c.names())[hover];
    const hovered = (await c.wash()).find((r) => r.top <= name.top && r.bottom >= name.bottom);
    got.push({ pin, hover, clearOfPanel: apart(tip, panel), clearOfRow: Boolean(hovered) && apart(tip, hovered) });
    await c.page.keyboard.press('Escape');
  }
  return [got.every((g) => g.clearOfPanel && g.clearOfRow), got];
});
await on(GROUPED, 'the pinned panel keeps the right edge and stays off its row', async (c) => {
  await c.click(1);
  const [panel] = await c.box(PINNED);
  const row = (await c.wash()).find((w) => w.bottom - w.top > 20);
  return [Math.abs(panel.right - row.right) < 1.5 && apart(panel, row), { panel, row }];
});

// ---- legend
for (const [story, score, label] of [[GROUPED, total, 'grouped'], [STACKED, total, 'stacked']]) {
  await on(story, `${label}: hiding a series re-ranks the rows and clears the pin`, async (c) => {
    await c.click(0);
    const before = await c.order();
    await c.toggle('Diesel');
    const after = await c.order();
    const want = ranked((row) => score(row, ['petrol', 'cng']));
    return [after.join() === want.join() && after.join() !== before.join() && (await c.pinned()).length === 0, { before, after, pinned: await c.pinned() }];
  });
}
await on(STACKED, 'hiding a series keeps the value axis', async (c) => {
  const ticks = () => c.page.$$eval('.chart svg text', (els) => els.map((el) => el.textContent).filter((t) => /^0$|kL$/.test(t ?? '')));
  const before = await ticks();
  await c.toggle('Diesel');
  const after = await ticks();
  return [before.length > 2 && before.join() === after.join(), { before, after }];
});

// ---- stacked
await on(STACKED, 'stacked: every row shows its total past the end of its bar', async (c) => {
  const totals = (await c.box(TOTAL)).sort((a, b) => a.top - b.top);
  const want = ranked(total).map((name) => kl(total(PUMPS[name])));
  const bars = await c.page.$$eval('.chart svg path', (els) => Math.max(...els.map((el) => el.getBoundingClientRect().right)));
  return [totals.map((t) => t.text).join() === want.join() && totals[0].left >= bars, totals.map((t) => t.text)];
});
await on(STACKED, 'stacked: the tooltip ends with Total', async (c) => {
  await c.hover(0);
  const [tip] = await c.tips();
  const first = ranked(total)[0];
  return [tip.text.endsWith(`Total${kl(total(PUMPS[first]))}`), tip.text];
});
await on(STACKED, 'stacked: pinned, the Total row shows its change', async (c) => {
  await c.click(1);
  await c.hover(3);
  const [tip] = await c.tips();
  return [/Total[\d.]+ kL[↑↓] [\d.]+$/.test(tip.text), tip.text];
});

// ---- keyboard
await on(GROUPED, 'keyboard: Down, Up, End and Home move between rows', async (c) => {
  const order = ranked(total);
  await c.page.focus('.chart svg');
  const seen = [];
  for (const key of ['ArrowDown', 'ArrowDown', 'ArrowUp', 'End', 'Home']) {
    await c.page.keyboard.press(key);
    await c.page.waitForTimeout(120);
    const [tip] = await c.tips();
    seen.push(order.find((name) => tip?.text.startsWith(name)) ?? null);
  }
  return [seen.join() === [order[1], order[2], order[1], order[5], order[0]].join(), seen];
});
await on(GROUPED, 'keyboard: Enter pins, Space unpins, Escape unpins', async (c) => {
  await c.page.focus('.chart svg');
  await c.page.keyboard.press('ArrowDown');
  await c.page.keyboard.press('Enter');
  await c.page.waitForTimeout(500);
  const afterEnter = await c.pinned();
  await c.page.keyboard.press(' ');
  await c.page.waitForTimeout(500);
  const afterSpace = await c.pinned();
  await c.page.keyboard.press('Enter');
  await c.page.waitForTimeout(120);
  await c.page.keyboard.press('Escape');
  await c.page.waitForTimeout(120);
  const afterEscape = await c.pinned();
  return [afterEnter[0] === ranked(total)[1] && afterSpace.length === 0 && afterEscape.length === 0, { afterEnter, afterSpace, afterEscape }];
});

// ---- phone
await on(PHONE, 'phone: the readout waits with a placeholder that names no pump', async (c) => {
  const text = await c.page.$eval('[data-slot=ranked-bars]', (el) => el.textContent);
  return [/Tap a row/.test(text) && !/Tap a pump/i.test(text), text.slice(0, 80)];
}, { phone: true });
await on(PHONE, 'phone: a tap fills the readout and floats nothing', async (c) => {
  await c.tap(1);
  const name = ranked(total)[1];
  const text = await c.page.$eval('[data-slot=ranked-bars]', (el) => el.textContent);
  const values = ['petrol', 'diesel', 'cng'].map((id) => kl(PUMPS[name][id]));
  return [values.every((v) => text.includes(v)) && !/Tap a row/.test(text) && (await c.tips()).length === 0 && (await c.pinned()).length === 0, text.slice(0, 120)];
}, { phone: true });
await on(PHONE, 'phone: the name sits above its bar and the legend below the plot', async (c) => {
  const [legend] = await c.box('[role=group][aria-label=Series]');
  const [plot] = await c.box('.chart');
  const names = await c.names();
  const bars = await c.page.$$eval('.chart svg path', (els) => els.map((el) => el.getBoundingClientRect()).filter((r) => r.height > 8 && r.height < 40).map((r) => r.top));
  return [legend.top >= plot.bottom && names[0].bottom <= Math.min(...bars) + 0.5 && names[0].left - plot.left < 2, { legend: legend.top, plot: plot.bottom, name: names[0], bar: Math.min(...bars) }];
}, { phone: true });

await finish();
