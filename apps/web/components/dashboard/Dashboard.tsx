'use client';
// 메인 대시보드 — 모바일(<640px): 티켓 카드 / 태블릿+(≥640px): 간트+테이블 탭 + 알림 카드
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Header } from '../Header';
import { api } from '../../lib/api';
import { usePanelStore } from '../../store/panelStore';
import type { Vehicle } from '../../lib/types';
import { AlertCards } from './AlertCards';
import { GanttChart } from './GanttChart';
import { PartTable } from './PartTable';
import { TicketCardList } from './TicketCardList';
import { PartDetailPanel } from '../panel/PartDetailPanel';
import { PartDetailSheet } from '../panel/PartDetailSheet';

interface DashboardProps {
  vehicle: Vehicle;
}

export function Dashboard({ vehicle }: DashboardProps) {
  const [tab, setTab] = useState<'gantt' | 'table'>('gantt');
  const { setVehicle } = usePanelStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    setVehicle(vehicle);
  }, [vehicle, setVehicle]);

  const { data: parts = [], isLoading } = useQuery({
    queryKey: ['parts', vehicle.id],
    queryFn: () => api.parts.list(vehicle.id),
  });

  const invalidateParts = () => queryClient.invalidateQueries({ queryKey: ['parts', vehicle.id] });

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Header vehicle={vehicle} />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-sm" style={{ color: 'var(--muted)' }}>정비 항목 불러오는 중...</p>
        </div>
      ) : (
        <>
          {/* 모바일: 티켓 카드 목록 (AC-VZ3·VZ7) */}
          <div className="sm:hidden">
            <TicketCardList parts={parts} vehicle={vehicle} />
          </div>

          {/* 태블릿+: 탭 + 알림 카드 + 간트/테이블 (AC-VZ8~VZ18) */}
          <div className="hidden sm:block">
            {/* 알림 카드 (AC-VZ9) */}
            <AlertCards parts={parts} vehicle={vehicle} />

            {/* 뷰 탭 */}
            <div
              className="flex gap-1 px-4 py-2 border-b"
              style={{ borderColor: 'var(--border)' }}
            >
              <button
                onClick={() => setTab('gantt')}
                className="px-4 py-1.5 rounded text-sm font-medium transition-colors"
                style={{
                  background: tab === 'gantt' ? 'var(--bg2)' : 'transparent',
                  color: tab === 'gantt' ? 'var(--mint)' : 'var(--muted)',
                  border: tab === 'gantt' ? '1px solid var(--border)' : '1px solid transparent',
                }}
              >
                📊 간트 차트
              </button>
              <button
                onClick={() => setTab('table')}
                className="px-4 py-1.5 rounded text-sm font-medium transition-colors"
                style={{
                  background: tab === 'table' ? 'var(--bg2)' : 'transparent',
                  color: tab === 'table' ? 'var(--mint)' : 'var(--muted)',
                  border: tab === 'table' ? '1px solid var(--border)' : '1px solid transparent',
                }}
              >
                📋 목록 보기
              </button>
            </div>

            {/* 힌트 바 */}
            <div className="px-4 py-2">
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                항목을 클릭하면 상세 정보와 교환 기록을 확인할 수 있습니다.
              </p>
            </div>

            {/* 간트 차트 또는 목록 테이블 */}
            <div
              className="mx-4 mb-4 rounded-lg overflow-hidden"
              style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
            >
              {tab === 'gantt' ? (
                <GanttChart parts={parts} vehicle={vehicle} />
              ) : (
                <PartTable parts={parts} vehicle={vehicle} />
              )}
            </div>
          </div>
        </>
      )}

      {/* 부품 상세 패널: 태블릿+는 사이드 패널, 모바일은 바텀 시트 */}
      <PartDetailPanel onRecordSaved={invalidateParts} />
      <PartDetailSheet onRecordSaved={invalidateParts} />
    </div>
  );
}
