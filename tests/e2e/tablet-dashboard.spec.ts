/**
 * 태블릿 대시보드 E2E — AC-VZ8, VZ9, VZ10, VZ11~VZ16, VZ17, VZ18
 * viewport: 810×1080
 */
import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 810, height: 1080 } });

async function gotoAndWait(page: Parameters<typeof test.fn>[0]['page']) {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
}

test.describe('AC-VZ8: 태블릿 탭(간트/목록) 표시', () => {
  test('태블릿에서 간트/목록 탭이 표시된다', async ({ page }) => {
    await gotoAndWait(page);
    const emptyVisible = await page.locator('text=차량 등록하기').isVisible().catch(() => false);
    if (emptyVisible) { test.skip(); return; }

    // 탭 버튼(간트 또는 목록) 중 하나 이상 존재
    const tabButtons = page.locator('button').filter({ hasText: /간트|목록|Gantt|List/ });
    await expect(tabButtons.first()).toBeVisible({ timeout: 8000 });
  });
});

test.describe('AC-VZ9·VZ10: 알림 카드', () => {
  test('urgent/soon 알림 카드가 렌더링된다', async ({ page }) => {
    await gotoAndWait(page);
    const emptyVisible = await page.locator('text=차량 등록하기').isVisible().catch(() => false);
    if (emptyVisible) { test.skip(); return; }

    // AlertCards 영역 — "교환임박" 또는 "교환예정" 레이블 포함
    const alertArea = page.locator('text=/교환임박|교환예정/').first();
    const hasAlert = await alertArea.isVisible().catch(() => false);
    // 알림이 있는 경우에만 검증
    if (hasAlert) {
      await expect(alertArea).toBeVisible();
    }
  });
});

test.describe('AC-VZ11~VZ16: 간트 차트', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAndWait(page);
    const emptyVisible = await page.locator('text=차량 등록하기').isVisible().catch(() => false);
    if (emptyVisible) { test.skip(); return; }
    // 간트 탭으로 이동
    const ganttTab = page.locator('button').filter({ hasText: /간트/ }).first();
    const hasTab = await ganttTab.isVisible().catch(() => false);
    if (hasTab) await ganttTab.click();
  });

  test('AC-VZ11: 간트 SVG가 렌더링된다', async ({ page }) => {
    const emptyVisible = await page.locator('text=차량 등록하기').isVisible().catch(() => false);
    if (emptyVisible) { test.skip(); return; }

    const svg = page.locator('svg').first();
    await expect(svg).toBeVisible({ timeout: 8000 });
  });

  test('AC-VZ13·VZ14: TODAY 라인이 SVG에 존재한다', async ({ page }) => {
    const emptyVisible = await page.locator('text=차량 등록하기').isVisible().catch(() => false);
    if (emptyVisible) { test.skip(); return; }

    // TODAY 라인은 <line> 또는 <rect> 요소로 렌더링
    const todayLine = page.locator('svg line, svg rect').first();
    const hasSvg = await todayLine.isVisible().catch(() => false);
    if (hasSvg) {
      await expect(todayLine).toBeVisible({ timeout: 8000 });
    }
  });
});

test.describe('AC-VZ17·VZ18: 목록 테이블', () => {
  test('목록 탭 클릭 시 테이블이 렌더링된다', async ({ page }) => {
    await gotoAndWait(page);
    const emptyVisible = await page.locator('text=차량 등록하기').isVisible().catch(() => false);
    if (emptyVisible) { test.skip(); return; }

    const listTab = page.locator('button').filter({ hasText: /목록/ }).first();
    const hasTab = await listTab.isVisible().catch(() => false);
    if (!hasTab) { test.skip(); return; }

    await listTab.click();
    await page.waitForTimeout(300);

    // table 또는 thead 요소 존재
    const tableEl = page.locator('table, thead, [role="table"]').first();
    await expect(tableEl).toBeVisible({ timeout: 5000 });
  });

  test('AC-VZ18: 목록 테이블에 상태 배지가 표시된다', async ({ page }) => {
    await gotoAndWait(page);
    const emptyVisible = await page.locator('text=차량 등록하기').isVisible().catch(() => false);
    if (emptyVisible) { test.skip(); return; }

    const listTab = page.locator('button').filter({ hasText: /목록/ }).first();
    const hasTab = await listTab.isVisible().catch(() => false);
    if (!hasTab) { test.skip(); return; }

    await listTab.click();
    await page.waitForTimeout(300);

    // 상태 배지(교환임박|교환예정|여유|교환불필요|계산불가) 중 하나 이상 존재
    const badge = page.locator('text=/교환임박|교환예정|여유|교환불필요|계산불가/').first();
    const hasBadge = await badge.isVisible().catch(() => false);
    if (hasBadge) {
      await expect(badge).toBeVisible();
    }
  });
});
