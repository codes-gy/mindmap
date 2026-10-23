// 키 비주얼을 README용 라이트·다크 PNG와 사이트 미리보기(Open Graph) PNG로 찍는다: node docs/keyvisual/render.mjs
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
// 링크 미리보기는 1배 크기로 충분하다 (app/ 아래에 두면 모든 페이지에 적용된다)
const og = await browser.newPage({ viewport: { width: 1280, height: 640 } });
await og.goto(`file://${path.join(dir, 'keyvisual.html')}`);
await og.waitForSelector('body[data-ready="1"]');
for (const name of ['opengraph-image', 'twitter-image']) await og.screenshot({ path: path.join(dir, '..', '..', 'app', `${name}.png`) });
await browser.close();
