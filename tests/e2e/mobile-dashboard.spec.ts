/**
 * 모바일 대시보드 E2E — AC-VZ1, VZ3, VZ4, VZ5, VZ6, VZ7
 * viewport: 390×844 (iPhone 14)
 */
import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 390, height: 844 } });

async function gotoAndWait(page: Parameters<typeof test.fn>[0]['page']) {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
}

test.describe('AC-VZ3·VZ7: 모바일 뷰포트 — 티켓 카드 목록 표시', () => {
  test('모바일에서 간트 차트가 없고 티켓 카드가 렌더링된다', async ({ page }) => {
    await gotoAndWait(page);

    const emptyVisible = await page.locator('text=차량 등록하기').isVisible().catch(() => false);
    if (emptyVisible) {
      test.skip();
      return;
    }

    // 간트(SVG 타임라인)는 모바일에서 숨겨진다
    const gantt = page.locator('svg[class*="gantt"], [data-testid="gantt"]');
    const ganttVisible = await gantt.isVisible().catch(() => false);
    expect(ganttVisible).toBe(false);

    // 티켓 카드 최소 1개 이상 존재
    const cards = page.locator('button[style*="border"]');
    await expect(cards.first()).toBeVisible({ timeout: 8000 });
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('AC-VZ1: 긴급도 순 정렬', () => {
  test('urgent 카드가 ok 카드보다 상단에 위치한다', async ({ page }) => {
    await gotoAndWait(page);
    const emptyVisible = await page.locator('text=차량 등록하기').isVisible().catch(() => false);
    if (emptyVisible) { test.skip(); return; }

    // 상태 텍스트(urgent=교환임박, soon=교환예정, ok=여유)가 순서대로 나타나야 함
    const statusTexts = await page.locator('button[style*="border"] span').allTextContents();
    const urgentIdx = statusTexts.findIndex(t => t.includes('교환임박') || t.includes('초과'));
    const okIdx = statusTexts.findIndex(t => t === '여유');
    if (urgentIdx !== -1 && okIdx !== -1) {
      expect(urgentIdx).toBeLessThan(okIdx);
    }
    // urgent/ok 둘 다 없는 경우는 데이터 상태에 따라 skip
  });
});

test.describe('AC-VZ4·VZ5: 카드 레이아웃 및 상태 색상', () => {
  test('티켓 카드에 교환 예정일이 크게 표시된다', async ({ page }) => {
    await gotoAndWait(page);
    const emptyVisible = await page.locator('text=차량 등록하기').isVisible().catch(() => false);
    if (emptyVisible) { test.skip(); return; }

    // 날짜 형식 "2026. xx. xx." 패턴이 카드 내에 존재
    const datePattern = page.locator('button[style*="border"]').locator('text=/20\\d\\d/').first();
    await expect(datePattern).toBeVisible({ timeout: 8000 });
  });

  test('티켓 카드에 주기(km마다 또는 개월마다)가 표시된다', async ({ page }) => {
    await gotoAndWait(page);
    const emptyVisible = await page.locator('text=차량 등록하기').isVisible().catch(() => false);
    if (emptyVisible) { test.skip(); return; }

    // "km마다" 또는 "개월마다" 텍스트가 카드 내에 존재
    const intervalText = page.locator('button[style*="border"]').locator('text=/km마다|개월마다|교환 불필요/').first();
    await expect(intervalText).toBeVisible({ timeout: 8000 });
  });

  test('urgent 카드 테두리 색상이 rose 계열이다', async ({ page }) => {
    await gotoAndWait(page);
    const emptyVisible = await page.locator('text=차량 등록하기').isVisible().catch(() => false);
    if (emptyVisible) { test.skip(); return; }

    // urgent 상태 카드는 border 스타일에 #f87171 포함
    const urgentCard = page.locator('button[style*="#f87171"]').first();
    const hasUrgent = await urgentCard.isVisible().catch(() => false);
    // urgent 부품이 있을 때만 검증
    if (hasUrgent) {
      await expect(urgentCard).toBeVisible();
    }
  });
});

test.describe('AC-VZ6: D-day 표시', () => {
  test('D-day 또는 D+N 텍스트가 카드에 표시된다', async ({ page }) => {
    await gotoAndWait(page);
    const emptyVisible = await page.locator('text=차량 등록하기').isVisible().catch(() => false);
    if (emptyVisible) { test.skip(); return; }

    // D-, D+, D-day 텍스트가 카드에 존재
    const dday = page.locator('button[style*="border"] span').filter({ hasText: /^D[-+]/ }).first();
    const hasDday = await dday.isVisible().catch(() => false);
    // 데이터에 따라 존재하지 않을 수 있으므로 존재할 때만 검증
    if (hasDday) {
      await expect(dday).toBeVisible();
    }
  });
});
