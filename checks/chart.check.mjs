// Behaviour checks for Charts/Line, Charts/Area and Charts/Bar, run against a live Storybook.
//   bun run storybook            (port 6006)
//   bunx playwright install chromium   (once)
//   node checks/chart.check.mjs
import { browser, check, finish, origin } from './harness.mjs';

async function open(story) {
  const page = await browser.newPage({ viewport: { width: 1000, height: 640 } });
  await page.goto(`${origin}/iframe.html?id=${story}&viewMode=story`);
  await page.waitForSelector('.chart svg');
  await page.waitForTimeout(600);
  const svg = await (await page.$('.chart svg')).boundingBox();
  // The plot is inside the svg's margins; these fractions stay clear of them.
  const x = (f) => svg.x + 60 + (svg.width - 60 - 90) * f;
  const y = svg.y + svg.height * 0.45;
  return {
    page, x, y,
    click: async (f) => { await page.mouse.move(x(f), y); await page.mouse.down(); await page.mouse.up(); await page.waitForTimeout(120); },
    drag: async (from, to, keys = []) => {
      for (const k of keys) await page.keyboard.down(k);
      await page.mouse.move(x(from), y); await page.mouse.down();
      await page.mouse.move(x((from + to) / 2), y, { steps: 5 }); await page.mouse.move(x(to), y, { steps: 5 });
      await page.mouse.up();
      for (const k of keys) await page.keyboard.up(k);
      await page.waitForTimeout(120);
    },
    pinned: () => page.$$eval('[role=status][data-chart-ui]', (els) => els.map((el) => el.querySelector('span')?.textContent)),
    hoverTip: () => page.$$eval('.chart-tooltip', (els) => els.filter((el) => el.textContent && getComputedStyle(el).visibility !== 'hidden' && getComputedStyle(el).display !== 'none').map((el) => el.textContent)),
    range: () => page.$$eval('[data-chart-ui] > span.whitespace-nowrap', (els) => els.map((el) => el.textContent)[0] ?? null),
    ticks: () => page.$$eval('.chart svg text', (els) => els.map((el) => el.textContent).filter((t) => /Aug/.test(t ?? ''))),
    yTicks: () => page.$$eval('.chart svg text', (els) => els.map((el) => el.textContent).filter((t) => /^0$|k$/.test(t ?? ''))),
    resetEnabled: () => page.$eval('button:has-text("Reset zoom")', (el) => !el.disabled),
    hover: async (f) => { await page.mouse.move(x(f), y); await page.waitForTimeout(250); },
    count: (selector) => page.$$eval(selector, (els) => els.length),
  };
}

const CROSSHAIR = '.chart span.border-l';
const DOT = '.chart span.rounded-full.ring-2';
const AXIS_CHIP = '.chart span.bg-menu';

// ---- what every mark shares
for (const kind of ['line', 'area', 'bar']) {
  const story = `charts-${kind}--default`;
  const ok = (name, pass, got) => check(`${kind}: ${name}`, pass, got);

  // ---- pin, re-pin and compare
  {
    const c = await open(story);
    await c.click(0.2);
    const first = await c.pinned();
    ok('a click pins', first.length === 1, first);
    await c.page.mouse.move(c.x(0.7), c.y); await c.page.waitForTimeout(250);
    const tip = await c.hoverTip();
    ok('hover stays live while pinned, and compares', tip.length === 1 && /vs /.test(tip[0]), tip);
    await c.click(0.7);
    const second = await c.pinned();
    ok('a click elsewhere moves the pin', second.length === 1 && second[0] !== first[0], second);
    await c.page.mouse.dblclick(c.x(0.4), c.y); await c.page.waitForTimeout(150);
    const third = await c.pinned();
    ok('a double click pins once', third.length === 1 && third[0] !== second[0], third);
    const panel = await (await c.page.$('[role=status][data-chart-ui]')).boundingBox();
    await c.page.mouse.move(panel.x + panel.width / 2, panel.y + panel.height / 2, { steps: 4 }); await c.page.waitForTimeout(250);
    ok('over the pinned panel the hover tooltip rests', (await c.hoverTip()).length === 0, await c.hoverTip());
    await c.page.mouse.down(); await c.page.mouse.up(); await c.page.waitForTimeout(120);
    ok('a click inside the panel keeps the pin', (await c.pinned()).length === 1, await c.pinned());
    await c.page.click('button[aria-label="Unpin"]'); await c.page.waitForTimeout(120);
    ok('Unpin lets it go', (await c.pinned()).length === 0, await c.pinned());
    await c.page.close();
  }

  // ---- range selection
  {
    const c = await open(story);
    await c.drag(0.35, 0.55);
    const made = await c.range();
    ok('a drag selects a range', /\d+ – \d+ Aug · \d+ days/.test(made ?? ''), made);
    ok('a drag does not pin', (await c.pinned()).length === 0, await c.pinned());
    const end = await (await c.page.$('button[aria-label="Range end"]')).boundingBox();
    await c.page.mouse.move(end.x + end.width / 2, c.y); await c.page.mouse.down();
    await c.page.mouse.move(c.x(0.75), c.y, { steps: 8 }); await c.page.mouse.up(); await c.page.waitForTimeout(120);
    const longer = await c.range();
    ok('the end handle drags', longer !== made && parseInt(longer.split('· ')[1]) > parseInt(made.split('· ')[1]), longer);
    const start = await (await c.page.$('button[aria-label="Range start"]')).boundingBox();
    await c.page.mouse.move(start.x + start.width / 2, c.y); await c.page.mouse.down();
    await c.page.mouse.move(c.x(0.9), c.y, { steps: 10 }); await c.page.mouse.up(); await c.page.waitForTimeout(120);
    const flipped = await c.range();
    ok('a handle dragged past the other flips the range', /\d+ – \d+ Aug/.test(flipped ?? '') && flipped !== longer, flipped);
    await c.page.focus('button[aria-label="Range end"]'); await c.page.keyboard.press('ArrowLeft'); await c.page.waitForTimeout(100);
    ok('arrow keys move a handle', (await c.range()) !== flipped, await c.range());
    await c.click(0.1);
    ok('a click clears the range', (await c.range()) === null, await c.range());
    ok('and does not pin', (await c.pinned()).length === 0, await c.pinned());
    await c.click(0.1);
    ok('the next click pins', (await c.pinned()).length === 1, await c.pinned());
    await c.page.close();
  }

  // ---- zoom and pan
  {
    const c = await open(story);
    const full = await c.ticks();
    await c.page.mouse.move(c.x(0.5), c.y);
    await c.page.mouse.wheel(0, -120); await c.page.waitForTimeout(100);
    ok('a plain scroll leaves the chart alone', !(await c.resetEnabled()), await c.ticks());
    await c.page.keyboard.down('Control');
    for (let i = 0; i < 5; i++) { await c.page.mouse.wheel(0, -120); await c.page.waitForTimeout(40); }
    await c.page.keyboard.up('Control'); await c.page.waitForTimeout(150);
    const zoomed = await c.ticks();
    ok('modifier + scroll zooms', (await c.resetEnabled()) && zoomed.join() !== full.join(), zoomed);
    const prevented = await c.page.evaluate(() => {
      const el = document.querySelector('.chart svg'); const r = el.getBoundingClientRect();
      const ev = new WheelEvent('wheel', { deltaY: -40, ctrlKey: true, bubbles: true, cancelable: true, clientX: r.x + r.width / 2, clientY: r.y + r.height / 2 });
      el.dispatchEvent(ev); return ev.defaultPrevented;
    });
    ok('the zoom gesture does not also zoom the page', prevented === true, prevented);
    await c.page.mouse.wheel(260, 0); await c.page.waitForTimeout(150);
    const panned = await c.ticks();
    ok('a sideways scroll pans', panned.join() !== zoomed.join(), panned);
    await c.drag(0.7, 0.3, ['Shift']);
    const dragged = await c.ticks();
    ok('shift + drag pans, and selects nothing', dragged.join() !== panned.join() && (await c.range()) === null, dragged);
    await c.page.keyboard.down('Control');
    for (let i = 0; i < 30; i++) await c.page.mouse.wheel(0, 120);
    await c.page.keyboard.up('Control'); await c.page.waitForTimeout(200);
    ok('zooming out stops at the full range', !(await c.resetEnabled()), await c.ticks());
    await c.drag(0.35, 0.55);
    await c.page.click('button:has-text("Zoom in")'); await c.page.waitForTimeout(200);
    ok('Zoom in takes the range', (await c.resetEnabled()) && (await c.range()) === null, await c.ticks());
    await c.page.click('button:has-text("Reset zoom")'); await c.page.waitForTimeout(200);
    ok('Reset zoom restores the full range', !(await c.resetEnabled()), await c.ticks());
    await c.page.close();
  }

  // ---- a press outside the chart
  {
    const c = await open(story);
    const outside = async () => { await c.page.mouse.click(4, 4); await c.page.waitForTimeout(150); };
    await c.click(0.2);
    await outside();
    ok('a press outside the chart lets go of the pin', (await c.pinned()).length === 0, await c.pinned());
    await c.drag(0.35, 0.55);
    await outside();
    ok('a press outside the chart clears the range', (await c.range()) === null, await c.range());
    await c.page.mouse.move(c.x(0.5), c.y);
    await c.page.keyboard.down('Control');
    for (let i = 0; i < 4; i++) { await c.page.mouse.wheel(0, -120); await c.page.waitForTimeout(40); }
    await c.page.keyboard.up('Control'); await c.page.waitForTimeout(150);
    await c.click(0.4);
    await outside();
    ok('a press outside the chart keeps the zoom', (await c.resetEnabled()) && (await c.pinned()).length === 0, { zoomed: await c.resetEnabled(), pinned: await c.pinned() });
    await c.click(0.3);
    await c.page.click('button:has-text("Petrol")'); await c.page.waitForTimeout(150);
    ok('a press on the chart\'s own legend keeps the pin', (await c.pinned()).length === 1, await c.pinned());
    await c.page.close();
  }
}

// ---- stacked: a Total row, and a y axis that holds still
for (const kind of ['area', 'bar']) {
  const ok = (name, pass, got) => check(`${kind}, stacked: ${name}`, pass, got);
  const plain = await open(`charts-${kind}--default`);
  await plain.hover(0.5);
  const plainTip = await plain.hoverTip();
  ok('side by side, the tooltip has no Total row', plainTip.length === 1 && !/Total/.test(plainTip[0]), plainTip);
  await plain.page.close();

  const c = await open(`charts-${kind}--stacked`);
  await c.hover(0.5);
  const tip = await c.hoverTip();
  ok('the tooltip ends with a Total row', tip.length === 1 && /Total[\d,]+ L$/.test(tip[0]), tip);
  ok('rows read top to bottom as the bands are drawn', tip.length === 1 && /CNG.*Diesel.*Petrol.*Total/.test(tip[0]), tip);
  await c.click(0.2);
  await c.hover(0.7);
  const compared = await c.hoverTip();
  ok('pinned, the Total row shows its change', compared.length === 1 && /Total[\d,]+ L[↑↓] [\d,]+$/.test(compared[0]), compared);
  await c.page.click('button[aria-label="Unpin"]'); await c.page.waitForTimeout(120);
  const before = await c.yTicks();
  ok('the y axis covers the stacked total', before.at(-1) === '16k', before);
  await c.page.click('button[aria-pressed]:has-text("Diesel")'); await c.page.waitForTimeout(200);
  const after = await c.yTicks();
  ok('hiding a series keeps the y axis ticks', before.length > 1 && after.join() === before.join(), after);
  await c.hover(0.5);
  const without = await c.hoverTip();
  ok('and drops it from the tooltip', without.length === 1 && !/Diesel/.test(without[0]) && /Total/.test(without[0]), without);
  await c.page.close();
}

// ---- bars: a washed band in place of the crosshair, and ranges that cover whole bands
{
  const ok = (name, pass, got) => check(`bar: ${name}`, pass, got);
  const l = await open('charts-line--default');
  await l.hover(0.5);
  ok('a line has a crosshair and dots (the selectors hold)', (await l.count(CROSSHAIR)) === 1 && (await l.count(DOT)) === 3, [await l.count(CROSSHAIR), await l.count(DOT)]);
  await l.page.close();

  const c = await open('charts-bar--default');
  const centre = (label) => c.page.$$eval('.chart svg text', (els, label) => {
    const el = els.find((e) => e.textContent === label); if (!el) return null;
    const r = el.getBoundingClientRect(); return r.x + r.width / 2;
  }, label);
  const band = (await centre('2 Aug')) - (await centre('1 Aug'));
  await c.hover(0.5);
  ok('hover draws no crosshair and no dots', (await c.count(CROSSHAIR)) === 0 && (await c.count(DOT)) === 0, [await c.count(CROSSHAIR), await c.count(DOT)]);
  ok('the day chip stays on the axis', (await c.count(AXIS_CHIP)) === 1, await c.count(AXIS_CHIP));
  const wash = await c.page.$$eval('.chart span.bg-ink\\/6', (els) => els.map((el) => el.getBoundingClientRect().width));
  ok('hover washes one whole band', wash.length === 1 && Math.abs(wash[0] - band) < 1.5, { wash, band });
  await c.drag(0.35, 0.55);
  const text = await c.range();
  const [, from, to, days] = /(\d+) – (\d+) Aug · (\d+) days/.exec(text ?? '') ?? [];
  const box = await c.page.$eval('.chart .bg-accent-bg', (el) => { const r = el.getBoundingClientRect(); return { left: r.left, right: r.right }; });
  const want = { left: (await centre(`${from} Aug`)) - band / 2, right: (await centre(`${to} Aug`)) + band / 2 };
  ok('a range covers whole bands, edge to edge', Number(days) >= 2 && Math.abs(box.left - want.left) < 1.5 && Math.abs(box.right - want.right) < 1.5, { text, box, want });
  await c.page.click('button:has-text("Zoom in")'); await c.page.waitForTimeout(200);
  await c.page.mouse.move(c.x(0.5), c.y);
  await c.page.keyboard.down('Control');
  for (let i = 0; i < 30; i++) await c.page.mouse.wheel(0, -120);
  await c.page.keyboard.up('Control'); await c.page.waitForTimeout(200);
  ok('zoom stops at 2 bands', (await c.ticks()).length === 2, await c.ticks());
  await c.page.close();
}

await finish();
