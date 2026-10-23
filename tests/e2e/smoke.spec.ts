import { expect, test, type Page } from '@playwright/test';

function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  return errors;
}

test('대시보드에 다섯 탭 카드가 보인다', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto('/');
  await expect(page.locator('a.mapcard')).toHaveCount(5);
  await expect(page.locator('.overall .sub-line')).toContainText('858');
  expect(errors).toEqual([]);
});

test('마인드맵에서 개념을 누르면 카드가 뜨고 주소가 바뀐다', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto('/net');
  await expect(page.locator('.stat')).toHaveText('6개 주제 · 31개 묶음 · 110개 개념 (심화 35)');
  await page.locator('g.group', { hasText: '전송 계층' }).click();
  await page.locator('g.concept', { hasText: 'TCP' }).first().click();
  await expect(page).toHaveURL(/\/net\/tcp$/);
  // 이전 화면이 숨겨진 채 남으므로(React Activity) 보이는 카드만 본다
  const panel = page.locator('aside.panel:visible');
  await expect(panel.locator('h2')).toHaveText('TCP');
  await expect(page.locator('.notes-head')).toBeVisible(); // 노트는 그대로 남아 있다

  await panel.getByRole('tab', { name: '면접' }).click();
  await expect(panel).toContainText('30초 답변');
  await panel.getByRole('link', { name: '다음 →' }).click();
  await expect(panel.locator('h2')).toHaveText('UDP');

  await page.keyboard.press('Escape');
  await expect(page).toHaveURL(/\/net$/);
  await expect(panel).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('개념 주소로 바로 들어오면 단독 페이지가 열린다', async ({ page }) => {
  await page.goto('/net/tcp');
  await expect(page.locator('article.concept-page h2')).toHaveText('TCP');
  await expect(page.locator('aside.panel')).toHaveCount(0);
  await expect(page).toHaveTitle('TCP · 네트워크 | 마인드맵');
  await page.goto('/ds/must-ds-1');
  await expect(page.locator('article.concept-page h2')).toHaveText('트리 · 힙에서 알아둘 것');
});

test('완료 체크와 자기 점검 모드가 동작한다', async ({ page }) => {
  await page.goto('/net/tcp');
  await page.locator('article .done-btn').click();
  await expect(page.locator('a.mapcard', { hasText: '네트워크' })).toContainText('개념 1/110');
  await page.locator('article .quiz-toggle').click();
  await expect(page.locator('article details.reveal').first()).toBeVisible();
  await page.reload();
  await expect(page.locator('article .done-btn')).toHaveAttribute('aria-pressed', 'true');
});

test('v1 정적 사이트의 완료 기록을 옮긴다', async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem('mindmap-progress-v2')) localStorage.setItem('mindmap-done', JSON.stringify([
      'cs|네트워크|전송 계층|TCP', 'cs|자료구조|해시|해시 테이블', 'cs|자료구조|알아둘 것', 'cs|알고리즘|탐색|이분 탐색', 'spring|IoC · DI|알아둘 것',
    ]));
  });
  await page.goto('/');
  await expect(page.locator('.overall .sub-line')).toContainText('5 / ');
  const ids = await page.evaluate(() => JSON.parse(localStorage.getItem('mindmap-progress-v2') || '[]').sort());
  expect(ids).toEqual(['algo/ibun-tamsaek', 'ds/haesi-teibeul', 'ds/~ds-0', 'net/tcp', 'spring/~spring-0']);
});

test('다른 탭의 관련 개념으로 이동한다', async ({ page }) => {
  await page.goto('/net/http-keulraieonteu-taimaut');
  await page.locator('.rels a', { hasText: '서킷 브레이커' }).click();
  await expect(page).toHaveURL(/\/cs\//);
  await expect(page.locator('.tabs:visible a[aria-current="page"]')).toHaveText('CS 기초');
  await expect(page.locator('article.concept-page h2')).toHaveText('서킷 브레이커');
});

test('검색', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('searchbox').fill('트랜잭션 격리');
  await page.getByRole('searchbox').press('Enter');
  await expect(page).toHaveURL(/\/search\?q=/);
  await expect(page.locator('.results li').first()).toContainText('격리');
});

test('휴대폰 너비에서 가로 스크롤이 생기지 않는다', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  for (const url of ['/', '/algo', '/algo/lis', '/search?q=tcp']) {
    await page.goto(url);
    expect(await page.evaluate(() => document.documentElement.scrollWidth), url).toBeLessThanOrEqual(390);
  }
});
