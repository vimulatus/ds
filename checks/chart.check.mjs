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

// ---- curves: a line bends between its rows, passes through each one, and never leaves the two rows it joins
/** Reads every series path: whether it is all curve segments, how far it strays outside the rows it joins, and its samples. */
const readPaths = (page) =>
  page.$$eval('.chart-plot svg path[data-ts-key]', (paths) =>
    paths.map((path) => {
      const d = path.getAttribute('d');
      const numbers = (text) => text.split(/[ ,]+/).filter(Boolean).map(Number);
      const commands = [...d.matchAll(/([MLCZ])([^MLCZ]*)/g)].map(([, letter, rest]) => ({ letter, at: numbers(rest).slice(-2) }));
      const anchors = commands.filter((c) => c.at.length === 2).map((c) => c.at);
      const length = path.getTotalLength();
      const samples = Array.from({ length: 801 }, (_, i) => path.getPointAtLength((i / 800) * length)).map((p) => [p.x, p.y]);
      let stray = 0;
      for (const [x, y] of samples) {
        const i = anchors.findIndex((a, n) => n + 1 < anchors.length && x >= a[0] && x <= anchors[n + 1][0]);
        if (i < 0) continue;
        const low = Math.min(anchors[i][1], anchors[i + 1][1]), high = Math.max(anchors[i][1], anchors[i + 1][1]);
        stray = Math.max(stray, low - y, y - high);
      }
      return { key: path.getAttribute('data-ts-key'), filled: path.getAttribute('fill') !== 'none', d, letters: [...new Set(commands.map((c) => c.letter))].join(''), stray, samples };
    }),
  );

for (const story of ['charts-line--default', 'charts-area--default', 'charts-area--stacked']) {
  const c = await open(story);
  const paths = await readPaths(c.page);
  const lines = paths.filter((path) => !path.filled);
  check(`${story}: every line is drawn as curves`, lines.length === 3 && lines.every((path) => path.letters === 'MC'), lines.map((path) => path.letters));
  check(`${story}: no curve leaves the two rows it joins`, lines.every((path) => path.stray < 0.5), lines.map((path) => Number(path.stray.toFixed(2))));
  if (story === 'charts-area--default') {
    const fills = paths.filter((path) => path.filled);
    check('area: a fill follows its line along the top', fills.length === 3 && fills.every((fill, i) => fill.d.startsWith(lines[i].d)), fills.map((fill) => fill.d.slice(0, 24)));
  }
  await c.click(0.5);
  const svg = await (await c.page.$('.chart-plot svg')).boundingBox();
  const dots = await c.page.$$eval(DOT, (els) => els.map((el) => { const r = el.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }));
  const off = dots.map(([x, y]) => Math.min(...lines.flatMap((path) => path.samples.map(([px, py]) => Math.hypot(px + svg.x - x, py + svg.y - y)))));
  check(`${story}: a pinned dot sits on its line`, dots.length === 3 && off.every((distance) => distance < 1.5), off.map((distance) => Number(distance.toFixed(2))));
  await c.page.close();
}

// ---- motion: the entrance and discrete jumps glide, the hand's own zoom and pan do not, and reduced motion snaps
/** Opens a story recording, per frame from before its first paint, the first series group's transform and path. */
async function openRecording(story, contextOptions = {}) {
  const context = await browser.newContext({ viewport: { width: 1000, height: 640 }, ...contextOptions });
  const page = await context.newPage();
  await page.addInitScript(() => {
    window.frames_ = [];
    const tick = () => {
      const path = document.querySelector('.chart-plot svg path[data-ts-key], .chart-plot svg rect[data-ts-key]');
      if (path) {
        const labels = [...document.querySelectorAll('.chart > span.text-ink-muted')].map((el) => `${el.textContent}:${getComputedStyle(el).opacity}`).join(' ');
        const dash = getComputedStyle(path).strokeDashoffset;
        window.frames_.push({ dash, t: performance.now(), transform: path.closest('g[transform]')?.getAttribute('transform') ?? null, d: [...document.querySelectorAll('.chart-plot svg [data-ts-key]')].map((el) => `${el.getAttribute('d') ?? el.getAttribute('height')}${el.closest('g[transform]')?.getAttribute('transform') ?? ''}${getComputedStyle(el.parentElement).opacity}`).join('|'), labels });
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  await page.goto(`${origin}/iframe.html?id=${story}&viewMode=story`);
  await page.waitForSelector('.chart-plot svg path[data-ts-key], .chart-plot svg rect[data-ts-key]');
  const take = () => page.evaluate(() => window.frames_.splice(0));
  return { context, page, take };
}
const distinct = (frames, key) => new Set(frames.map((frame) => frame[key])).size;

for (const kind of ['line', 'area', 'bar']) {
  const r = await openRecording(`charts-${kind}--default`);
  await r.page.waitForTimeout(900);
  const entrance = await r.take();
  if (kind === 'line') check('line: the lines draw on from the left on first paint', distinct(entrance, 'dash') > 4 && distinct(entrance, 'transform') === 1, [distinct(entrance, 'dash'), distinct(entrance, 'transform')]);
  else check(`${kind}: the marks grow in on first paint`, distinct(entrance, kind === 'bar' ? 'd' : 'transform') > 4, distinct(entrance, kind === 'bar' ? 'd' : 'transform'));
  if (kind !== 'bar') {
    // The names at the line ends: with an area they fade in as the fills grow; with a line they wait for the pen to reach the end.
    const showing = (frame) => frame.labels.split(' ').some((label) => Number(label.split(':')[1]) > 0.05);
    const first = entrance.findIndex(showing);
    const named = first >= 0 && entrance.slice(first).every((frame) => frame.labels.split(' ').every((label) => Number(label.split(':')[1]) > 0));
    if (kind === 'area') check('area: the names fade in while the fills are still growing', named && entrance[first].transform !== null && entrance[first].transform !== entrance[entrance.length - 1].transform, [first, entrance[first]?.transform]);
    else check('line: the names appear once the pen has reached the end', named && parseFloat(entrance[first].dash) < 0.15, [first, entrance[first]?.dash]);
  }
  await r.page.waitForTimeout(200);
  check(`${kind}: and come to rest`, distinct(await r.take(), 'd') === 1 , 'rest');

  const svg = await (await r.page.$('.chart-plot svg')).boundingBox();
  const at = (f) => svg.x + 60 + (svg.width - 150) * f;
  await r.page.mouse.move(at(0.35), svg.y + 150); await r.page.mouse.down(); await r.page.mouse.move(at(0.55), svg.y + 150, { steps: 6 }); await r.page.mouse.up();
  await r.page.waitForTimeout(150); await r.take();
  await r.page.click('button:has-text("Zoom in")'); await r.page.waitForTimeout(700);
  check(`${kind}: Zoom in glides to the new window`, distinct(await r.take(), 'd') > 4, 'frames');

  await r.page.mouse.move(at(0.5), svg.y + 150); await r.page.waitForTimeout(100); await r.take();
  await r.page.keyboard.down('Control'); await r.page.mouse.wheel(0, 300); await r.page.keyboard.up('Control');
  await r.page.waitForTimeout(700);
  const wheel = await r.take();
  check(`${kind}: a wheel zoom lands at once`, distinct(wheel, 'd') <= 2, distinct(wheel, 'd'));

  if (kind !== 'bar') {
    await r.page.click('button[aria-pressed]:has-text("Diesel")'); await r.page.waitForTimeout(700);
    const hide = await r.take();
    await r.page.click('button[aria-pressed]:has-text("Diesel")'); await r.page.waitForTimeout(900);
    const show = await r.take();
    // The last frame on which anything still moved, counted from the click.
    const settles = (frames, key) => { const last = frames[frames.length - 1][key]; const i = frames.findIndex((frame) => frame[key] === last); return Math.round(frames[i].t - frames[0].t); };
    check(`${kind}: a series hidden from the legend has gone in under 220ms`, hide.length > 1 && settles(hide, 'd') < 220, settles(hide, 'd'));
    check(`${kind}: and is back in under 220ms`, show.length > 1 && settles(show, 'd') < 220, settles(show, 'd'));
    check(`${kind}: with its name at the line end`, settles(show, 'labels') < 220, settles(show, 'labels'));
  }

  if (kind === 'bar') {
    await r.context.close();
    // Stacked, the top series shrinks into the one below, which holds still: a fade would cross the segment under it.
    const context = await browser.newContext({ viewport: { width: 1000, height: 640 } });
    const page = await context.newPage();
    await page.addInitScript(() => {
      window.frames_ = [];
      const tick = () => {
        const bars = [...document.querySelectorAll('.chart-plot svg [data-ts-key^="CNG:"], .chart-plot svg [data-ts-key^="Diesel:"]')];
        if (bars.length) {
          const box = (prefix) => bars.filter((bar) => bar.getAttribute('data-ts-key').startsWith(prefix)).map((bar) => { const b = bar.getBBox(); return `${Math.round(b.x)},${Math.round(b.y)},${Math.round(b.width)},${Math.round(b.height)}`; }).join('|');
          window.frames_.push({ cng: box('CNG'), diesel: box('Diesel'), opacity: Math.min(...bars.map((bar) => Number(getComputedStyle(bar).opacity))) });
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    await page.goto(`${origin}/iframe.html?id=charts-bar--stacked&viewMode=story`);
    await page.waitForSelector('.chart-plot svg [data-ts-key]');
    await page.waitForTimeout(1500); await page.evaluate(() => window.frames_.splice(0));
    await page.click('button[aria-pressed]:has-text("CNG")'); await page.waitForTimeout(600);
    const frames = await page.evaluate(() => window.frames_.splice(0));
    const last = frames[frames.length - 1];
    check('stacked bars: hiding the top series shrinks its segments to nothing, without fading', distinct(frames, 'cng') > 4 && frames.every((frame) => frame.opacity === 1) && /,0\|/.test(last.cng + '|'), [distinct(frames, 'cng'), last.cng.slice(0, 30)]);
    const drift = Math.max(...frames.map((frame) => Math.max(...frame.diesel.split(/[|,]/).map((n, i) => Math.abs(Number(n) - Number(frames[0].diesel.split(/[|,]/)[i]))))));
    check('stacked bars: the segments below hold still', drift <= 1, drift);
    await context.close();
    continue;
  }

  await r.page.mouse.click(at(0.5), svg.y + 120);
  await r.page.click('button:has-text("Reset zoom")'); await r.page.mouse.move(5, 5); await r.page.waitForTimeout(500);
  check(`${kind}: a pin that rode a view change is still drawn once`, (await r.page.$$(AXIS_CHIP)).length === 1, (await r.page.$$(AXIS_CHIP)).length);
  await r.context.close();
}

{
  const r = await openRecording('charts-line--default', { reducedMotion: 'reduce' });
  await r.page.waitForTimeout(900);
  const frames = await r.take();
  check('reduced motion: nothing grows in', distinct(frames, 'transform') === 1 && distinct(frames, 'd') === 1, [distinct(frames, 'transform'), distinct(frames, 'd')]);
  await r.context.close();
}

await finish();
