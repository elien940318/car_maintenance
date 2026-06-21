'use client';
import { usePanelStore } from '../../store/panelStore';
import type { PartWithSchedule, Vehicle } from '../../lib/types';

interface AlertCardsProps {
  parts: PartWithSchedule[];
  vehicle: Vehicle;
}

function formatDate(iso: string | null): string {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

export function AlertCards({ parts, vehicle }: AlertCardsProps) {
  const { openPanel } = usePanelStore();

  // urgent·soon 항목만, nextDate 오름차순 (AC-VZ9)
  const alerts = parts
    .filter((p) => p.schedule.status === 'urgent' || p.schedule.status === 'soon')
    .sort((a, b) => {
      const da = a.schedule.nextDate ?? '';
      const db = b.schedule.nextDate ?? '';
      return da < db ? -1 : da > db ? 1 : 0;
    });

  if (alerts.length === 0) return null; // AC-VZ10

  return (
    <div className="px-4 py-3">
      <div className="flex gap-3 overflow-x-auto pb-1">
        {alerts.map((p) => {
          const isUrgent = p.schedule.status === 'urgent';
          const color = isUrgent ? '#f87171' : '#fbbf24';
          const label = isUrgent ? '임박' : '주의';
          const days = p.schedule.daysRemaining;
          const daysText =
            days === null
              ? '-'
              : days < 0
              ? `${Math.abs(days)}일 초과`
              : `${days}일 후`;

          return (
            <button
              key={p.id}
              onClick={() => openPanel(p, vehicle)}
              className="flex-shrink-0 rounded-lg p-3 text-left min-w-[140px] transition-opacity hover:opacity-80"
              style={{
                background: 'var(--bg2)',
                borderTop: `3px solid ${color}`,
                border: `1px solid var(--border)`,
                borderTopColor: color,
              }}
            >
              <div className="flex items-center gap-1 mb-1">
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded font-semibold"
                  style={{ background: color + '22', color }}
                >
                  {label}
                </span>
              </div>
              <p className="text-sm font-semibold mb-0.5" style={{ color }}>
                {p.name}
              </p>
              <p className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
                {formatDate(p.schedule.nextDate)}
              </p>
              <p className="text-xs" style={{ color }}>
                {daysText}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
