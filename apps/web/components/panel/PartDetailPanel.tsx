'use client';
// 태블릿+(≥640px) 우측 사이드 패널 (AC-VZ21)
import { usePanelStore } from '../../store/panelStore';
import { PartDetailContent } from './PartDetailContent';
import { RecordCompletionForm } from './RecordCompletionForm';

interface PartDetailPanelProps {
  onRecordSaved: () => void;
}

export function PartDetailPanel({ onRecordSaved }: PartDetailPanelProps) {
  const { isOpen, selectedPart, vehicle, closePanel } = usePanelStore();

  return (
    <>
      {/* 배경 오버레이 */}
      <div
        className="hidden sm:block fixed inset-0 z-20 transition-opacity duration-300"
        style={{
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(2px)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
        onClick={closePanel}
      />

      {/* 사이드 패널 (AC-VZ21: 0.28s cubic-bezier 슬라이드인) */}
      <div
        className="hidden sm:flex flex-col fixed top-0 right-0 h-full z-30 w-80"
        style={{
          background: 'var(--bg3)',
          borderLeft: '1px solid var(--border)',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* 헤더 */}
        <div
          className="flex items-center justify-between px-4 py-3 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>부품 상세</span>
          <button
            onClick={closePanel}
            className="w-7 h-7 flex items-center justify-center rounded transition-opacity hover:opacity-70"
            style={{ color: 'var(--muted)', background: 'var(--bg2)' }}
          >
            ✕
          </button>
        </div>

        {/* 스크롤 가능한 내용 */}
        {selectedPart && vehicle && (
          <>
            <PartDetailContent part={selectedPart} vehicle={vehicle} />
            <div className="flex-shrink-0 px-4 pb-4">
              <RecordCompletionForm
                part={selectedPart}
                vehicle={vehicle}
                onSaved={onRecordSaved}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}
