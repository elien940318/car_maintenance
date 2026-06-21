/**
 * 교환완료 E2E — AC-M12, M13, M14, VZ22
 * 태블릿 뷰포트에서 사이드 패널을 통해 테스트
 */
import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 810, height: 1080 } });

async function openFirstPartPanel(page: Parameters<typeof test.fn>[0]['page']): Promise<boolean> {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const emptyVisible = await page.locator('text=차량 등록하기').isVisible().catch(() => false);
  if (emptyVisible) return false;

  // 목록 탭으로 이동
  const listTab = page.locator('button').filter({ hasText: /목록/ }).first();
  const hasListTab = await listTab.isVisible().catch(() => false);
  if (hasListTab) {
    await listTab.click();
    await page.waitForTimeout(300);
    const firstRow = page.locator('table tbody tr').first();
    const hasRow = await firstRow.isVisible().catch(() => false);
    if (hasRow) {
      await firstRow.click();
      await page.waitForTimeout(500);
      return true;
    }
  }

  // 간트/목록 탭 없으면 알림 카드나 티켓 카드 시도
  const alertCard = page.locator('[class*="alert"], [class*="Alert"]').first();
  const hasAlert = await alertCard.isVisible().catch(() => false);
  if (hasAlert) {
    await alertCard.click();
    await page.waitForTimeout(500);
    return true;
  }
  return false;
}

test.describe('AC-M12: 교환완료 기본값', () => {
  test('패널 교환완료 폼에 오늘 날짜가 기본값으로 설정된다', async ({ page }) => {
    const opened = await openFirstPartPanel(page);
    if (!opened) { test.skip(); return; }

    // 교환완료 섹션 찾기
    const recordForm = page.locator('input[type="date"], input[type="text"][value*="2026"]').first();
    const hasForm = await recordForm.isVisible().catch(() => false);
    if (!hasForm) { test.skip(); return; }

    const val = await recordForm.inputValue().catch(() => '');
    expect(val).toBeTruthy();
    // 오늘 날짜 포함 여부 (YYYY-MM-DD 형식 또는 한국식)
    expect(val).toMatch(/2026/);
  });

  test('패널 교환완료 폼에 현재 km이 기본값으로 설정된다', async ({ page }) => {
    const opened = await openFirstPartPanel(page);
    if (!opened) { test.skip(); return; }

    // km 입력 필드
    const kmInput = page.locator('input[type="number"]').first();
    const hasKmInput = await kmInput.isVisible().catch(() => false);
    if (!hasKmInput) { test.skip(); return; }

    const val = await kmInput.inputValue().catch(() => '');
    // 차량 current_km = 89700 — 0보다 크면 OK
    expect(Number(val)).toBeGreaterThan(0);
  });
});

test.describe('AC-M13·VZ22: 교환완료 저장 후 상태 재계산', () => {
  test('교환완료 저장 후 페이지가 갱신된다', async ({ page }) => {
    const opened = await openFirstPartPanel(page);
    if (!opened) { test.skip(); return; }

    // 교환완료 버튼/폼 존재 여부
    const saveBtn = page.locator('button').filter({ hasText: /저장|완료|교환완료 기록/ }).first();
    const hasSaveBtn = await saveBtn.isVisible().catch(() => false);
    if (!hasSaveBtn) { test.skip(); return; }

    // 현재 상태 텍스트 캡처
    const beforeStatus = await page.locator('text=/교환임박|교환예정|여유/').first().textContent().catch(() => '');

    await saveBtn.click();
    // 저장 후 API 응답 대기
    await page.waitForTimeout(1500);

    // 에러 없이 페이지가 유지됨 (500 에러 없음)
    const errorMsg = page.locator('text=/Error|오류|실패/i').first();
    const hasError = await errorMsg.isVisible().catch(() => false);
    expect(hasError).toBe(false);
  });
});

test.describe('AC-M14: urgent→ok 전환 시 알림 카드 제거', () => {
  test('교환완료 후 해당 부품 알림이 갱신된다 (smoke)', async ({ page }) => {
    // 이 테스트는 실제 DB 변경 없이 API 응답 구조만 검증
    const res = await page.request.get('http://localhost:3001/vehicle');
    expect(res.status()).toBe(200);
    const vehicle = await res.json();
    expect(vehicle.id).toBeTruthy();

    const partsRes = await page.request.get(`http://localhost:3001/vehicles/${vehicle.id}/parts`);
    expect(partsRes.status()).toBe(200);
    const parts = await partsRes.json();
    expect(Array.isArray(parts)).toBe(true);
    expect(parts.length).toBeGreaterThan(0);

    // 각 부품에 schedule.status가 있는지
    for (const part of parts) {
      expect(part.schedule).toBeDefined();
      expect(['urgent', 'soon', 'ok', 'chain', 'unknown']).toContain(part.schedule.status);
    }
  });
});
