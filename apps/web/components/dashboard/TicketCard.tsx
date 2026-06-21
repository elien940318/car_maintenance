'use client';
import { CATEGORY_COLORS, STATUS_ICONS, STATUS_LABELS } from '../../lib/codes';
import type { PartWithSchedule, Vehicle } from '../../lib/types';

interface TicketCardProps {
  part: PartWithSchedule;
  vehicle: Vehicle;
  onClick: () => void;
}

function formatDate(iso: string | null): string {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  });
}

function formatKm(km: number | null): string {
  if (km === null) return '-';
  return `${km.toLocaleString()} km`;
}

function intervalText(part: PartWithSchedule): string {
  if (part.is_chain) return '교환 불필요';
  if (part.interval_km) return `${part.interval_km.toLocaleString()} km마다`;
  if (part.interval_months) return `${part.interval_months}개월마다`;
  return '-';
}

export function TicketCard({ part, vehicle, onClick }: TicketCardProps) {
  const { schedule, lastRecord } = part;
  const status = schedule.status;
  const catColor = CATEGORY_COLORS[part.category] ?? '#6b7a99';

  const statusColors: Record<string, string> = {
    urgent: '#f87171',
    soon: '#fbbf24',
    ok: '#22c55e',
    chain: '#38bdf8',
    unknown: '#6b7a99',
  };
  const strokeColor = statusColors[status] ?? '#6b7a99';
  const nameColor = status === 'ok' ? 'var(--text)' : strokeColor;

  // D-day 텍스트
  let ddayText = '';
  if (status === 'chain') {
    ddayText = '';
  } else if (status === 'unknown') {
    ddayText = '계산 불가';
  } else if (schedule.daysRemaining !== null) {
    if (schedule.daysRemaining < 0) {
      ddayText = `D+${Math.abs(schedule.daysRemaining)}`;
    } else if (schedule.daysRemaining === 0) {
      ddayText = 'D-day';
    } else {
      ddayText = `D-${schedule.daysRemaining}`;
    }
  }

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-[10px] p-4 transition-opacity hover:opacity-90 active:opacity-70"
      style={{
        background: 'var(--bg2)',
        border: `1.5px solid ${strokeColor}`,
        marginBottom: '8px',
      }}
    >
      {/* 1행: 부품명 + 태그 + D-day */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm" style={{ color: nameColor }}>
            {part.name}
          </span>
          {part.is_vehicle_specific && (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded font-mono"
              style={{ background: 'var(--bg3)', color: 'var(--amber)', border: '1px solid var(--border)' }}
            >
              차량 전용
            </span>
          )}
          {status === 'chain' && (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded font-mono"
              style={{ background: 'var(--bg3)', color: '#38bdf8', border: '1px solid var(--border)' }}
            >
              CHAIN
            </span>
          )}
        </div>
        {ddayText && (
          <span className="text-xs font-mono whitespace-nowrap" style={{ color: strokeColor }}>
            {ddayText}
            {STATUS_ICONS[status] && ` ${STATUS_ICONS[status]}`}
            {' '}
            {STATUS_LABELS[status]}
          </span>
        )}
        {status === 'chain' && (
          <span className="text-xs" style={{ color: '#38bdf8' }}>교체 불필요</span>
        )}
      </div>

      {/* 2행: 주기 → 예정일 */}
      {status !== 'chain' && (
        <div className="text-xs mb-1" style={{ color: catColor }}>
          {intervalText(part)}
          {schedule.nextDate && (
            <span style={{ color: 'var(--muted)' }}>
              {' → '}
              <span style={{ color: catColor }}>{formatDate(schedule.nextDate)}</span>
              {schedule.nextKm && (
                <span style={{ color: 'var(--muted)' }}> · {formatKm(schedule.nextKm)}</span>
              )}
            </span>
          )}
          {status === 'unknown' && (
            <span style={{ color: 'var(--muted)' }}> → 계산 불가</span>
          )}
        </div>
      )}

      {/* 3행: 최근 교환 */}
      {status !== 'chain' && lastRecord && (lastRecord.record_date || lastRecord.record_km) && (
        <div className="text-xs" style={{ color: 'var(--muted)' }}>
          최근: {formatDate(lastRecord.record_date)}
          {lastRecord.record_km && ` · ${formatKm(lastRecord.record_km)}`}
        </div>
      )}
      {status !== 'chain' && !lastRecord && schedule.baseline === 'estimated' && (
        <div className="text-xs" style={{ color: 'var(--muted)' }}>
          기준: {formatDate(vehicle.reference_date)} · {formatKm(vehicle.current_km)} (추정)
        </div>
      )}
    </button>
  );
}
