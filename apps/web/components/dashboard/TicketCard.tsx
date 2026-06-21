'use client';
import { STATUS_ICONS, STATUS_LABELS } from '../../lib/codes';
import type { PartWithSchedule } from '../../lib/types';

interface TicketCardProps {
  part: PartWithSchedule;
  onClick: () => void;
}

function formatDate(iso: string | null): string {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  });
}

function intervalText(part: PartWithSchedule): string {
  if (part.is_chain) return '교환 불필요';
  if (part.interval_km) return `${part.interval_km.toLocaleString()} km마다`;
  if (part.interval_months) return `${part.interval_months}개월마다`;
  return '-';
}

export function TicketCard({ part, onClick }: TicketCardProps) {
  const { schedule } = part;
  const status = schedule.status;

  const statusColors: Record<string, string> = {
    urgent: '#f87171',
    soon: '#fbbf24',
    ok: '#22c55e',
    chain: '#38bdf8',
    unknown: '#6b7a99',
  };
  const strokeColor = statusColors[status] ?? '#6b7a99';
  const nameColor = status === 'ok' ? 'var(--text)' : strokeColor;

  let ddayText = '';
  if (status !== 'chain' && status !== 'unknown' && schedule.daysRemaining !== null) {
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
      {/* 1행: 부품명 + 태그 | D-day + 상태 */}
      <div className="flex items-center justify-between gap-2 mb-3">
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
        <div className="flex items-center gap-1 shrink-0">
          {ddayText && (
            <span className="text-xs font-mono" style={{ color: strokeColor }}>
              {ddayText}
            </span>
          )}
          {STATUS_ICONS[status] && (
            <span className="text-[11px]">{STATUS_ICONS[status]}</span>
          )}
          {status !== 'chain' && (
            <span className="text-xs font-medium" style={{ color: strokeColor }}>
              {STATUS_LABELS[status]}
            </span>
          )}
          {status === 'chain' && (
            <span className="text-xs" style={{ color: '#38bdf8' }}>교체 불필요</span>
          )}
        </div>
      </div>

      {/* 2행: 교체 예정일(크게, 좌) + 교체 주기(작게, 우하단) */}
      {status === 'unknown' ? (
        <div className="text-base font-semibold" style={{ color: 'var(--muted)' }}>
          계산 불가
        </div>
      ) : status !== 'chain' ? (
        <div className="flex items-end justify-between">
          <div className="text-xl font-bold" style={{ color: 'var(--text)' }}>
            {schedule.nextDate ? formatDate(schedule.nextDate) : '-'}
          </div>
          <div className="text-[11px]" style={{ color: 'var(--muted)' }}>
            {intervalText(part)}
          </div>
        </div>
      ) : null}
    </button>
  );
}
