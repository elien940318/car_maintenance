'use client';
import { usePanelStore } from '../../store/panelStore';
import { CATEGORY_COLORS, STATUS_LABELS } from '../../lib/codes';
import type { PartWithSchedule, Vehicle } from '../../lib/types';

interface PartTableProps {
  parts: PartWithSchedule[];
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

export function PartTable({ parts, vehicle }: PartTableProps) {
  const { openPanel } = usePanelStore();

  const statusColors: Record<string, string> = {
    urgent: '#f87171', soon: '#fbbf24', ok: '#22c55e', chain: '#38bdf8', unknown: '#6b7a99',
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            {['항목', '주기', '최근 교환', '다음 예정일', '예상 km', '상태'].map((h) => (
              <th key={h} className="px-3 py-2 text-left text-xs whitespace-nowrap"
                style={{ color: 'var(--muted)' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {parts.map((p) => {
            const { schedule } = p;
            const catColor = CATEGORY_COLORS[p.category] ?? '#6b7a99';
            const stColor = statusColors[schedule.status] ?? '#6b7a99';
            const interval = p.is_chain
              ? '교환 불필요'
              : p.interval_km
              ? `${p.interval_km.toLocaleString()} km`
              : p.interval_months
              ? `${p.interval_months}개월`
              : '-';

            return (
              <tr
                key={p.id}
                onClick={() => openPanel(p, vehicle)}
                className="cursor-pointer transition-colors hover:opacity-80"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <td className="px-3 py-3">
                  <span className="font-medium" style={{ color: catColor }}>{p.name}</span>
                  {p.is_vehicle_specific && (
                    <span className="ml-1 text-[10px] px-1 rounded"
                      style={{ background: 'var(--bg3)', color: 'var(--amber)' }}>전용</span>
                  )}
                </td>
                <td className="px-3 py-3 text-xs font-mono whitespace-nowrap"
                  style={{ color: 'var(--muted)' }}>{interval}</td>
                <td className="px-3 py-3 text-xs font-mono whitespace-nowrap"
                  style={{ color: 'var(--muted)' }}>
                  {p.lastRecord?.record_date ? fmt(p.lastRecord.record_date) : '-'}
                </td>
                <td className="px-3 py-3 text-xs font-mono whitespace-nowrap"
                  style={{ color: stColor }}>{fmt(schedule.nextDate)}</td>
                <td className="px-3 py-3 text-xs font-mono whitespace-nowrap"
                  style={{ color: 'var(--muted)' }}>{fmtKm(schedule.nextKm)}</td>
                <td className="px-3 py-3">
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: stColor + '22', color: stColor }}
                  >
                    {STATUS_LABELS[schedule.status]}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
