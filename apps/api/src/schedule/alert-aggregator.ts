import { ScheduleResult } from './schedule-calculator';

export interface PartAlertItem {
  id: string;
  name: string;
  category: string;
  schedule: ScheduleResult;
}

/**
 * urgent/soon 항목만 예정일 오름차순으로 반환 (AC-M10).
 * urgent 상태에서 nextDate가 null이면 맨 앞에 정렬.
 */
export function aggregateAlerts(parts: PartAlertItem[]): PartAlertItem[] {
  return parts
    .filter(
      (p) => p.schedule.status === 'urgent' || p.schedule.status === 'soon',
    )
    .sort((a, b) => {
      const da = a.schedule.nextDate?.getTime() ?? -Infinity;
      const db = b.schedule.nextDate?.getTime() ?? -Infinity;
      return da - db;
    });
}
