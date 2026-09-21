// Checks that a control which asks for a keyboard focus outline gets one, run against a live Storybook.
//   bun run storybook            (port 6006)
//   node checks/focus-ring.check.mjs
import { browser, finish, origin, test } from './harness.mjs';

// One story per way a component asks for the outline.
const STORIES = [
  ['MaskReveal, focus-ring utility', 'parts-maskreveal--playground', '[class*="focus-visible:focus-ring"]'],
  ['Resource detail fold, focus-ring utility', 'patterns-resource-detail--default', '[class*="focus-visible:focus-ring"]'],
  ['EntityList row, outline utilities', 'lists-entitylist--default', '[tabindex="0"][class*="focus-visible:outline-2"]'],
];

const context = await browser.newContext({ viewport: { width: 1100, height: 800 } });

for (const [name, id, selector] of STORIES) {
  await test(`${name}: keyboard focus draws a 2px solid outline`, async () => {
    const page = await context.newPage();
    await page.goto(`${origin}/iframe.html?id=${id}&viewMode=story&globals=theme:dark`);
    const control = page.locator(selector).first();
    await control.waitFor();
    // Focus from script counts as keyboard focus only after a key press.
    await page.keyboard.press('Tab');
    const got = await control.evaluate((element) => {
      element.focus();
      const style = getComputedStyle(element);
      return { keyboard: element.matches(':focus-visible'), style: style.outlineStyle, width: style.outlineWidth };
    });
    await page.close();
    return [got.keyboard && got.style === 'solid' && got.width === '2px', got];
  });

  await test(`${name}: a pointer press draws none`, async () => {
    const page = await context.newPage();
    await page.goto(`${origin}/iframe.html?id=${id}&viewMode=story&globals=theme:dark`);
    const control = page.locator(selector).first();
    await control.waitFor();
    await control.click();
    const got = await control.evaluate((element) => getComputedStyle(element).outlineStyle);
    await page.close();
    return [got === 'none', got];
  });
}

await finish();
