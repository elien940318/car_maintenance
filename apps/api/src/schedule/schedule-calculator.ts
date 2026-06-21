// 순수 도메인 함수 모음 — Spring의 static utility 메서드와 유사.
// @Injectable() 없이 export 함수로 작성해 단위 테스트가 쉽도록 한다.
import { addMonths, differenceInDays } from 'date-fns';

export type PartStatus = 'urgent' | 'soon' | 'ok' | 'chain' | 'unknown';
export type Baseline = 'recorded' | 'estimated';

export interface ScheduleResult {
  nextKm: number | null;
  nextDate: Date | null;
  daysRemaining: number | null;
  status: PartStatus;
  baseline: Baseline;
}

export interface VehicleSnap {
  current_km: number;
  reference_date: Date;
  monthly_km: number;
}

export interface PartSnap {
  interval_km: number | null;
  interval_months: number | null;
  is_chain: boolean;
}

export interface RecordSnap {
  record_km: number | null;
  record_date: Date | null;
}

/**
 * referenceDate 이후 경과일만큼 km를 보정해 "오늘 기준 현재 주행거리"를 반환.
 * CLAUDE.md 기준일 보정 정책 (#5)
 */
export function adjustCurrentKm(
  currentKm: number,
  referenceDate: Date,
  today: Date,
  monthlyKm: number,
): number {
  // 30일을 1개월 단위로 취급 (CLAUDE.md 공식: × 30)
  const days = differenceInDays(today, referenceDate);
  return Math.round(currentKm + (days / 30) * monthlyKm);
}

/**
 * 교환 이력을 기반으로 lkm(lastKm)·ldt(lastDate)를 결정.
 * - 둘 다 null → estimated 폴백: vehicle.current_km + vehicle.reference_date (#6)
 * - 하나라도 존재 → recorded: 없는 축만 vehicle 값으로 보완
 *   (예: pmo 기록은 record_km이 없을 수 있음, pkm 기록은 record_date가 없을 수 있음)
 */
export function resolveBaseline(
  lastKm: number | null,
  lastDate: Date | null,
  vehicle: VehicleSnap,
): { lastKm: number; lastDate: Date; baseline: Baseline } {
  const baseline: Baseline =
    lastKm !== null || lastDate !== null ? 'recorded' : 'estimated';
  return {
    lastKm: lastKm ?? vehicle.current_km,
    lastDate: lastDate ?? vehicle.reference_date,
    baseline,
  };
}

/** pkm 방식: next_km = lkm + pkm */
export function calcPkmNextKm(lkm: number, pkm: number): number {
  return lkm + pkm;
}

/** pkm 방식: next_date = today + (nextKm - curKmToday) / monthlyKm × 30 */
export function calcPkmNextDate(
  nextKm: number,
  curKmToday: number,
  monthlyKm: number,
  today: Date,
): Date {
  const daysUntil = ((nextKm - curKmToday) / monthlyKm) * 30;
  const result = new Date(today);
  result.setDate(result.getDate() + Math.round(daysUntil));
  return result;
}

/** pmo 방식: next_date = ldt + pmo개월 (date-fns addMonths) */
export function calcPmoNextDate(ldt: Date, pmo: number): Date {
  return addMonths(ldt, pmo);
}

/** pmo 방식: next_km = curKmToday + (nextDate - today의 일수 / 30) × monthlyKm */
export function calcPmoNextKm(
  curKmToday: number,
  monthlyKm: number,
  nextDate: Date,
  today: Date,
): number {
  const days = differenceInDays(nextDate, today);
  return Math.round(curKmToday + (days / 30) * monthlyKm);
}

/**
 * 상태 분류 (CLAUDE.md 색상 기준):
 *   chain → 교환 불필요 | unknown → monthly_km < 1 계산 불가 (#8)
 *   urgent: days < 90 또는 초과(음수) | soon: 90~179일 | ok: 180일+
 */
export function classifyStatus(
  daysRemaining: number,
  isChain: boolean,
  monthlyKm: number,
): PartStatus {
  if (isChain) return 'chain';
  if (monthlyKm < 1) return 'unknown';
  if (daysRemaining < 90) return 'urgent';
  if (daysRemaining < 180) return 'soon';
  return 'ok';
}

/**
 * 하나의 부품에 대한 완전한 정비 일정을 계산.
 * 처리 순서: chain → unknown → 기준일 보정 → 이력 폴백 → pkm/pmo 분기 → 상태 분류
 */
export function computePartSchedule(
  part: PartSnap,
  lastRecord: RecordSnap | null,
  vehicle: VehicleSnap,
  today: Date = new Date(),
): ScheduleResult {
  if (part.is_chain) {
    return {
      nextKm: null,
      nextDate: null,
      daysRemaining: null,
      status: 'chain',
      baseline: 'recorded',
    };
  }

  if (vehicle.monthly_km < 1) {
    return {
      nextKm: null,
      nextDate: null,
      daysRemaining: null,
      status: 'unknown',
      baseline: 'estimated',
    };
  }

  const curKmToday = adjustCurrentKm(
    vehicle.current_km,
    vehicle.reference_date,
    today,
    vehicle.monthly_km,
  );

  const { lastKm, lastDate, baseline } = resolveBaseline(
    lastRecord?.record_km ?? null,
    lastRecord?.record_date ? new Date(lastRecord.record_date) : null,
    vehicle,
  );

  if (part.interval_km !== null) {
    const nextKm = calcPkmNextKm(lastKm, part.interval_km);
    const nextDate = calcPkmNextDate(nextKm, curKmToday, vehicle.monthly_km, today);
    const daysRemaining = differenceInDays(nextDate, today);
    return {
      nextKm,
      nextDate,
      daysRemaining,
      status: classifyStatus(daysRemaining, false, vehicle.monthly_km),
      baseline,
    };
  }

  if (part.interval_months !== null) {
    const nextDate = calcPmoNextDate(lastDate, part.interval_months);
    const nextKm = calcPmoNextKm(curKmToday, vehicle.monthly_km, nextDate, today);
    const daysRemaining = differenceInDays(nextDate, today);
    return {
      nextKm,
      nextDate,
      daysRemaining,
      status: classifyStatus(daysRemaining, false, vehicle.monthly_km),
      baseline,
    };
  }

  // interval_km, interval_months 모두 null인 비정상 데이터
  return {
    nextKm: null,
    nextDate: null,
    daysRemaining: null,
    status: 'unknown',
    baseline,
  };
}
