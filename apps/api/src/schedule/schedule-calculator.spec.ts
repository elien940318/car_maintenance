import {
  VehicleSnap,
  adjustCurrentKm,
  calcPkmNextDate,
  calcPkmNextKm,
  calcPmoNextDate,
  classifyStatus,
  computePartSchedule,
  resolveBaseline,
} from './schedule-calculator';

// test_strategy.md 핵심 케이스 기준 날짜
const TODAY = new Date('2026-06-21T00:00:00.000Z');
const BASE_VEHICLE: VehicleSnap = {
  current_km: 89660,
  reference_date: TODAY,
  monthly_km: 750,
};

// ────────────────────────────────────────────────────────────────────
// adjustCurrentKm
// ────────────────────────────────────────────────────────────────────
describe('adjustCurrentKm', () => {
  it('today === referenceDate면 보정 없음', () => {
    expect(adjustCurrentKm(89660, TODAY, TODAY, 750)).toBe(89660);
  });

  it('30일 경과 시 monthly_km 가산 (×30/30 = 1개월분)', () => {
    const ref = new Date('2026-05-22T00:00:00.000Z'); // TODAY - 30 days
    expect(adjustCurrentKm(89660, ref, TODAY, 750)).toBe(90410); // 89660 + 750
  });
});

// ────────────────────────────────────────────────────────────────────
// resolveBaseline
// ────────────────────────────────────────────────────────────────────
describe('resolveBaseline', () => {
  it('이력 있으면 recorded 반환', () => {
    const result = resolveBaseline(89485, new Date('2026-03-01'), BASE_VEHICLE);
    expect(result.baseline).toBe('recorded');
    expect(result.lastKm).toBe(89485);
  });

  it('이력 없으면 vehicle 기준점으로 estimated 폴백 (#6)', () => {
    const result = resolveBaseline(null, null, BASE_VEHICLE);
    expect(result.baseline).toBe('estimated');
    expect(result.lastKm).toBe(89660);
    expect(result.lastDate).toEqual(TODAY);
  });
});

// ────────────────────────────────────────────────────────────────────
// classifyStatus — 경계값 (AC-M8, M9)
// ────────────────────────────────────────────────────────────────────
describe('classifyStatus', () => {
  it('days=89 → urgent', () => expect(classifyStatus(89, false, 750)).toBe('urgent'));
  it('days=90 → soon', () => expect(classifyStatus(90, false, 750)).toBe('soon'));
  it('days=179 → soon', () => expect(classifyStatus(179, false, 750)).toBe('soon'));
  it('days=180 → ok', () => expect(classifyStatus(180, false, 750)).toBe('ok'));
  it('days=-1 → urgent (초과, AC-M9)', () =>
    expect(classifyStatus(-1, false, 750)).toBe('urgent'));
  it('is_chain=true → chain (AC-M2)', () =>
    expect(classifyStatus(200, true, 750)).toBe('chain'));
  it('monthly_km=0 → unknown (#8)', () =>
    expect(classifyStatus(100, false, 0)).toBe('unknown'));
});

// ────────────────────────────────────────────────────────────────────
// computePartSchedule — 핵심 케이스 (AC-M2, M5, M6, 이력 0건)
// ────────────────────────────────────────────────────────────────────
describe('computePartSchedule', () => {
  it('pkm 정상: lkm=89485, pkm=7500 → next_km=96985 (AC-M5)', () => {
    const part = { interval_km: 7500, interval_months: null, is_chain: false };
    const record = { record_km: 89485, record_date: TODAY };
    const result = computePartSchedule(part, record, BASE_VEHICLE, TODAY);
    expect(result.nextKm).toBe(96985);
    expect(result.baseline).toBe('recorded');
  });

  it('pmo 정상: ldt=2026-06-07, pmo=6 → next_date=2026-12-07 (AC-M6)', () => {
    const part = { interval_km: null, interval_months: 6, is_chain: false };
    const record = { record_km: null, record_date: new Date('2026-06-07T00:00:00.000Z') };
    const result = computePartSchedule(part, record, BASE_VEHICLE, TODAY);
    expect(result.nextDate?.toISOString().slice(0, 10)).toBe('2026-12-07');
  });

  it('is_chain=true → status=chain, nextKm·nextDate null (AC-M2)', () => {
    const part = { interval_km: null, interval_months: null, is_chain: true };
    const result = computePartSchedule(part, null, BASE_VEHICLE, TODAY);
    expect(result.status).toBe('chain');
    expect(result.nextKm).toBeNull();
    expect(result.nextDate).toBeNull();
  });

  it('이력 0건 폴백 (pkm): cur=89660, pkm=7500 → next_km=97160, baseline=estimated', () => {
    const part = { interval_km: 7500, interval_months: null, is_chain: false };
    const result = computePartSchedule(part, null, BASE_VEHICLE, TODAY);
    expect(result.nextKm).toBe(97160); // 89660 + 7500
    expect(result.baseline).toBe('estimated');
  });

  it('이력 0건 폴백 (pmo): ref=2026-06-15, pmo=6 → next_date=2026-12-15', () => {
    const vehicle: VehicleSnap = {
      current_km: 89660,
      reference_date: new Date('2026-06-15T00:00:00.000Z'),
      monthly_km: 750,
    };
    const part = { interval_km: null, interval_months: 6, is_chain: false };
    const result = computePartSchedule(part, null, vehicle, TODAY);
    expect(result.nextDate?.toISOString().slice(0, 10)).toBe('2026-12-15');
    expect(result.baseline).toBe('estimated');
  });

  it('next_date 과거 → status=urgent, daysRemaining < 0 (AC-M9)', () => {
    const part = { interval_km: null, interval_months: 1, is_chain: false };
    const record = { record_km: null, record_date: new Date('2025-12-01T00:00:00.000Z') };
    const result = computePartSchedule(part, record, BASE_VEHICLE, TODAY);
    expect(result.status).toBe('urgent');
    expect(result.daysRemaining).not.toBeNull();
    expect(result.daysRemaining!).toBeLessThan(0);
  });

  it('monthly_km=0 → status=unknown (#8)', () => {
    const vehicle: VehicleSnap = { current_km: 89660, reference_date: TODAY, monthly_km: 0 };
    const part = { interval_km: 7500, interval_months: null, is_chain: false };
    const result = computePartSchedule(part, null, vehicle, TODAY);
    expect(result.status).toBe('unknown');
    expect(result.nextDate).toBeNull();
  });
});

// ────────────────────────────────────────────────────────────────────
// calcPkmNextKm / calcPkmNextDate
// ────────────────────────────────────────────────────────────────────
describe('calcPkmNextKm', () => {
  it('96985 = 89485 + 7500', () => {
    expect(calcPkmNextKm(89485, 7500)).toBe(96985);
  });
});

describe('calcPkmNextDate', () => {
  it('(nextKm - curKm) / monthly × 30 일 뒤 반환', () => {
    // (96985 - 89660) / 750 * 30 ≈ 293일
    const result = calcPkmNextDate(96985, 89660, 750, TODAY);
    const expectedDays = Math.round(((96985 - 89660) / 750) * 30);
    const expected = new Date(TODAY);
    expected.setDate(expected.getDate() + expectedDays);
    expect(result.toISOString().slice(0, 10)).toBe(expected.toISOString().slice(0, 10));
  });
});

// ────────────────────────────────────────────────────────────────────
// calcPmoNextDate
// ────────────────────────────────────────────────────────────────────
describe('calcPmoNextDate', () => {
  it('2026-06-07 + 6개월 = 2026-12-07', () => {
    const ldt = new Date('2026-06-07T00:00:00.000Z');
    expect(calcPmoNextDate(ldt, 6).toISOString().slice(0, 10)).toBe('2026-12-07');
  });
});
