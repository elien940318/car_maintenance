'use client';
// 모바일(<640px) 바텀 시트 (AC-VZ20)
import { usePanelStore } from '../../store/panelStore';
import { PartDetailContent } from './PartDetailContent';
import { RecordCompletionForm } from './RecordCompletionForm';

interface PartDetailSheetProps {
  onRecordSaved: () => void;
}

export function PartDetailSheet({ onRecordSaved }: PartDetailSheetProps) {
  const { isOpen, selectedPart, vehicle, closePanel } = usePanelStore();

  return (
    <>
      {/* 배경 오버레이 */}
      <div
        className="sm:hidden fixed inset-0 z-20 transition-opacity duration-300"
        style={{
          background: 'rgba(0,0,0,0.6)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
        onClick={closePanel}
      />

      {/* 바텀 시트 (AC-VZ20: max-height 75vh, 하단 슬라이드업) */}
      <div
        className="sm:hidden fixed bottom-0 left-0 right-0 z-30 flex flex-col rounded-t-2xl"
        style={{
          background: 'var(--bg3)',
          maxHeight: '75vh',
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          borderTop: '1px solid var(--border)',
        }}
      >
        {/* 드래그 핸들 + 헤더 */}
        <div className="flex-shrink-0 pt-3 pb-2 px-4">
          <div className="mx-auto w-10 h-1 rounded-full mb-3"
            style={{ background: 'var(--border)' }} />
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>부품 상세</span>
            <button
              onClick={closePanel}
              className="w-7 h-7 flex items-center justify-center rounded"
              style={{ color: 'var(--muted)', background: 'var(--bg2)' }}
            >
              ✕
            </button>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)' }} />

        {/* 스크롤 가능한 내용 */}
        {selectedPart && vehicle && (
          <>
            <div className="flex-1 overflow-y-auto">
              <PartDetailContent part={selectedPart} vehicle={vehicle} />
            </div>
            <div className="flex-shrink-0 px-4 pb-6" style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
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
