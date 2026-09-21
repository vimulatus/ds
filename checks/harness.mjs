// What the check scripts share: the browser, the Storybook origin, and the PASS/FAIL tally.
// PLAYWRIGHT points at a playwright install outside the repo; STORYBOOK at another origin.
const { chromium } = await import(process.env.PLAYWRIGHT ?? 'playwright');

export const origin = process.env.STORYBOOK ?? 'http://localhost:6006';
export const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});

let failed = 0;
export const check = (name, pass, got) => {
  console.log(`${pass ? 'PASS' : 'FAIL'} ${name} -> ${JSON.stringify(got)}`);
  if (!pass) failed++;
};

/** Runs one check that returns `[pass, got]`. A throw, such as a story that never renders, is that check's FAIL. */
export async function test(name, run) {
  try {
    const [pass, got] = await run();
    check(name, pass, got);
  } catch (error) {
    check(name, false, String(error.message).split('\n')[0]);
  }
}

export async function finish() {
  await browser.close();
  process.exit(failed ? 1 : 0);
}
