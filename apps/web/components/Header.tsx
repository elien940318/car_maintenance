'use client';
import { useRouter } from 'next/navigation';
import type { Vehicle } from '../lib/types';

interface HeaderProps {
  vehicle: Vehicle;
}

export function Header({ vehicle }: HeaderProps) {
  const router = useRouter();
  const refDate = vehicle.reference_date
    ? new Date(vehicle.reference_date).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    : '-';

  const fuelLabel = vehicle.fuel_type?.label_ko ?? vehicle.fuel_type_code;
  const yearLabel = vehicle.model_year ? `${vehicle.model_year}년` : '';

  return (
    <header
      className="sticky top-0 z-30 px-4 py-3 border-b"
      style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
    >
      <div className="max-w-5xl mx-auto">
        {/* 차량 태그 */}
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-xs px-2 py-0.5 rounded font-mono"
              style={{ background: 'var(--bg2)', color: 'var(--mint)', border: '1px solid var(--border)' }}
            >
              {vehicle.name}
              {yearLabel && ` · ${yearLabel}`}
              {fuelLabel && ` · ${fuelLabel}`}
            </span>
            <h1 className="text-base font-bold" style={{ color: 'var(--text)' }}>
              내 차 교환 일정
            </h1>
          </div>
          <button
            onClick={() => router.push('/vehicle/edit')}
            className="text-xs px-3 py-1 rounded transition-opacity hover:opacity-70"
            style={{ color: 'var(--muted)', border: '1px solid var(--border)' }}
          >
            차량 수정
          </button>
        </div>
        {/* 메타 배지 */}
        <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--muted)' }}>
          <span>
            현재 km:{' '}
            <span className="font-mono" style={{ color: 'var(--text)' }}>
              {vehicle.current_km.toLocaleString()} km
            </span>
          </span>
          <span>·</span>
          <span>
            월 평균:{' '}
            <span className="font-mono" style={{ color: 'var(--text)' }}>
              {vehicle.monthly_km.toLocaleString()} km
            </span>
          </span>
          <span>·</span>
          <span>
            기준일:{' '}
            <span className="font-mono" style={{ color: 'var(--text)' }}>
              {refDate}
            </span>
          </span>
        </div>
      </div>
    </header>
  );
}
