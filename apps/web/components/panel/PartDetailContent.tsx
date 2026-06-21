'use client';
import { CATEGORY_COLORS, STATUS_LABELS } from '../../lib/codes';
import type { PartWithSchedule, Vehicle } from '../../lib/types';

interface PartDetailContentProps {
  part: PartWithSchedule;
  vehicle: Vehicle;
}

function fmt(iso: string | null) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function fmtKm(km: number | null) {
  if (km === null) return '-';
  return `${km.toLocaleString()} km`;
}

export function PartDetailContent({ part, vehicle }: PartDetailContentProps) {
  const { schedule, lastRecord } = part;
  const catColor = CATEGORY_COLORS[part.category] ?? '#6b7a99';

  const statusColors: Record<string, string> = {
    urgent: '#f87171', soon: '#fbbf24', ok: '#22c55e', chain: '#38bdf8', unknown: '#6b7a99',
  };
  const stColor = statusColors[schedule.status] ?? '#6b7a99';

  const days = schedule.daysRemaining;
  const ddayText =
    schedule.status === 'chain'
      ? '교환 불필요'
      : schedule.status === 'unknown'
      ? '계산 불가'
      : days === null
      ? '-'
      : days < 0
      ? `${Math.abs(days)}일 초과`
      : days === 0
      ? 'D-day'
      : `${days}일 후`;

  const interval = part.is_chain
    ? '교환 불필요'
    : part.interval_km
    ? `${part.interval_km.toLocaleString()} km`
    : part.interval_months
    ? `${part.interval_months}개월`
    : '-';

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
      {/* 부품명 + D-day */}
      <div>
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span
            className="text-[10px] px-2 py-0.5 rounded"
            style={{ background: catColor + '22', color: catColor, border: `1px solid ${catColor}44` }}
          >
            {part.category}
          </span>
          {part.is_vehicle_specific && (
            <span
              className="text-[10px] px-2 py-0.5 rounded"
              style={{ background: 'var(--bg3)', color: 'var(--amber)', border: '1px solid var(--border)' }}
            >
              차량 전용
            </span>
          )}
        </div>
        <h3 className="text-lg font-bold mb-0.5" style={{ color: catColor }}>{part.name}</h3>
        {part.sub_name && (
          <p className="text-xs" style={{ color: 'var(--muted)' }}>{part.sub_name}</p>
        )}
        <p className="text-sm font-semibold mt-1" style={{ color: stColor }}>
          {ddayText}
          <span className="ml-2 text-xs font-normal" style={{ color: 'var(--muted)' }}>
            {STATUS_LABELS[schedule.status]}
          </span>
        </p>
      </div>

      {/* SVG 플레이스홀더 */}
      <div
        className="w-full h-32 rounded-lg flex items-center justify-center"
        style={{ background: 'var(--bg3)', border: '1px solid var(--border)' }}
      >
        <span className="text-3xl opacity-40">🔧</span>
      </div>

      {/* 교환 정보 2×2 그리드 */}
      <div>
        <p className="text-xs font-semibold mb-2 flex items-center gap-1" style={{ color: 'var(--muted)' }}>
          📅 교환 정보
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: '교환 주기', value: interval },
            { label: '다음 교환', value: fmt(schedule.nextDate) },
            { label: '예상 km', value: fmtKm(schedule.nextKm) },
            { label: '남은 날짜', value: ddayText },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg p-3"
              style={{ background: 'var(--bg3)', border: '1px solid var(--border)' }}>
              <p className="text-[10px] mb-1" style={{ color: 'var(--muted)' }}>{label}</p>
              <p className="text-sm font-mono font-semibold" style={{ color: 'var(--text)' }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 최근 교환 이력 */}
      {lastRecord && (
        <div>
          <p className="text-xs font-semibold mb-1" style={{ color: 'var(--muted)' }}>
            🕐 최근 교환
          </p>
          <div className="rounded-lg p-3 text-sm"
            style={{ background: 'var(--bg3)', border: '1px solid var(--border)' }}>
            <span className="font-mono" style={{ color: 'var(--text)' }}>
              {fmt(lastRecord.record_date)}
              {lastRecord.record_km && ` · ${fmtKm(lastRecord.record_km)}`}
            </span>
            {lastRecord.memo && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{lastRecord.memo}</p>
            )}
          </div>
        </div>
      )}

      {/* 정비 팁 */}
      {part.tip && (
        <div>
          <p className="text-xs font-semibold mb-1" style={{ color: 'var(--muted)' }}>💡 정비 팁</p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text)' }}>{part.tip}</p>
        </div>
      )}
    </div>
  );
}
