// 키 비주얼을 라이트·다크 PNG로 찍는다: node docs/keyvisual/render.mjs
import path from 'node:path';
import { chromium } from 'playwright';

const dir = import.meta.dirname;
const browser = await chromium.launch({ channel: 'chrome' });
for (const theme of ['light', 'dark']) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 640 }, deviceScaleFactor: 2 });
  await page.goto(`file://${path.join(dir, 'keyvisual.html')}`);
  await page.evaluate(t => { document.documentElement.dataset.theme = t; }, theme);
  await page.waitForSelector('body[data-ready="1"]');
  await page.screenshot({ path: path.join(dir, `keyvisual-${theme}.png`) });
}
await browser.close();
