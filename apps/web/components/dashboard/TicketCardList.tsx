'use client';
import { usePanelStore } from '../../store/panelStore';
import type { PartWithSchedule, Vehicle } from '../../lib/types';
import { TicketCard } from './TicketCard';

// 상태 우선순위: 임박 → 주의 → 여유 → 계산불가 → 체인(교체불필요)
const STATUS_ORDER: Record<string, number> = { urgent: 0, soon: 1, ok: 2, unknown: 3, chain: 4 };

interface TicketCardListProps {
  parts: PartWithSchedule[];
  vehicle: Vehicle;
}

export function TicketCardList({ parts, vehicle }: TicketCardListProps) {
  const { openPanel } = usePanelStore();

  const sorted = [...parts].sort((a, b) => {
    const sa = STATUS_ORDER[a.schedule.status] ?? 3;
    const sb = STATUS_ORDER[b.schedule.status] ?? 3;
    if (sa !== sb) return sa - sb;
    // 같은 상태 내에서는 daysRemaining 오름차순 (음수가 클수록 더 오래 초과 → 먼저 표시)
    const da = a.schedule.daysRemaining ?? Infinity;
    const db = b.schedule.daysRemaining ?? Infinity;
    return da - db;
  });

  return (
    <div className="px-4 py-4">
      {sorted.map((p) => (
        <TicketCard
          key={p.id}
          part={p}
          onClick={() => openPanel(p, vehicle)}
        />
      ))}
    </div>
  );
}
