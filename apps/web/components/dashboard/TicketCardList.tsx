'use client';
import { usePanelStore } from '../../store/panelStore';
import type { PartWithSchedule, Vehicle } from '../../lib/types';
import { CATEGORY_GROUPS } from '../../lib/codes';
import { TicketCard } from './TicketCard';

interface TicketCardListProps {
  parts: PartWithSchedule[];
  vehicle: Vehicle;
}

export function TicketCardList({ parts, vehicle }: TicketCardListProps) {
  const { openPanel } = usePanelStore();

  return (
    <div className="px-4 py-4">
      {CATEGORY_GROUPS.map(({ label, categories }) => {
        const groupParts = parts.filter((p) => categories.includes(p.category));
        if (groupParts.length === 0) return null;

        return (
          <div key={label} className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              <span className="text-[11px] px-2" style={{ color: 'var(--muted)' }}>{label}</span>
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            </div>
            {groupParts.map((p) => (
              <TicketCard
                key={p.id}
                part={p}
                vehicle={vehicle}
                onClick={() => openPanel(p, vehicle)}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
