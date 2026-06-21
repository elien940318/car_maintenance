import { Page } from '@playwright/test';

export const API_BASE = 'http://localhost:3001';

/** 차량이 등록된 상태인지 확인 */
export async function ensureVehicleExists(page: Page): Promise<boolean> {
  const res = await page.request.get(`${API_BASE}/vehicle`);
  return res.status() === 200;
}

/** 첫 번째 부품 ID 반환 */
export async function getFirstPartId(page: Page, vehicleId: string): Promise<string> {
  const res = await page.request.get(`${API_BASE}/vehicles/${vehicleId}/parts`);
  const parts = await res.json();
  return parts[0]?.id ?? '';
}

/** 차량 ID 반환 */
export async function getVehicleId(page: Page): Promise<string> {
  const res = await page.request.get(`${API_BASE}/vehicle`);
  const v = await res.json();
  return v.id ?? '';
}
