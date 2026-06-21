'use client';
import { useFormContext, useWatch } from 'react-hook-form';
import type { VehicleFormValues } from './VehicleForm';

interface Step3Props {
  onPrev: () => void;
  onNext: () => void;
}

export function Step3Mileage({ onPrev, onNext }: Step3Props) {
  const { register, formState: { errors }, trigger, control } = useFormContext<VehicleFormValues>();

  const annualKm = useWatch({ control, name: 'annual_km' });
  const monthlyKm = annualKm && annualKm > 0 ? Math.round(Number(annualKm) / 12) : 0;

  const handleNext = async () => {
    const ok = await trigger(['current_km', 'annual_km', 'reference_date']);
    if (ok) onNext();
  };

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-5">
      <h2 className="text-base font-semibold" style={{ color: 'var(--text)' }}>주행 정보</h2>

      <div>
        <label className="block text-sm mb-1" style={{ color: 'var(--muted)' }}>
          현재 주행거리 (km) <span style={{ color: 'var(--rose)' }}>*</span>
        </label>
        <input
          type="number"
          {...register('current_km', {
            required: '현재 주행거리를 입력하세요',
            min: { value: 0, message: '0 이상 입력하세요' },
            valueAsNumber: true,
          })}
          placeholder="예: 89660"
          className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-1"
          style={{
            background: 'var(--bg2)',
            color: 'var(--text)',
            border: `1px solid ${errors.current_km ? 'var(--rose)' : 'var(--mint)'}`,
          }}
        />
        {errors.current_km && (
          <p className="text-xs mt-1" style={{ color: 'var(--rose)' }}>{errors.current_km.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm mb-1" style={{ color: 'var(--muted)' }}>
          연간 주행거리 (km/년) <span style={{ color: 'var(--rose)' }}>*</span>
        </label>
        <input
          type="number"
          {...register('annual_km', {
            required: '연간 주행거리를 입력하세요',
            min: { value: 1, message: '1 이상 입력하세요' },
            valueAsNumber: true,
          })}
          placeholder="예: 18000"
          className="w-full px-3 py-2 rounded-lg text-sm outline-none"
          style={{
            background: 'var(--bg2)',
            color: 'var(--text)',
            border: `1px solid ${errors.annual_km ? 'var(--rose)' : 'var(--border)'}`,
          }}
        />
        {errors.annual_km && (
          <p className="text-xs mt-1" style={{ color: 'var(--rose)' }}>{errors.annual_km.message}</p>
        )}
        {monthlyKm > 0 && (
          <p className="text-xs mt-1" style={{ color: 'var(--mint)' }}>
            → 월평균 {monthlyKm.toLocaleString()} km/월 (÷12)
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm mb-1" style={{ color: 'var(--muted)' }}>
          주행거리 기준일 <span style={{ color: 'var(--rose)' }}>*</span>
        </label>
        <input
          type="date"
          {...register('reference_date', { required: '기준일을 선택하세요' })}
          defaultValue={todayStr}
          max={todayStr}
          className="w-full px-3 py-2 rounded-lg text-sm outline-none"
          style={{
            background: 'var(--bg2)',
            color: 'var(--text)',
            border: `1px solid ${errors.reference_date ? 'var(--rose)' : 'var(--border)'}`,
            colorScheme: 'dark',
          }}
        />
        <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
          위의 현재 km을 측정한 날짜입니다. 계산 기준점이 됩니다.
        </p>
        {errors.reference_date && (
          <p className="text-xs mt-1" style={{ color: 'var(--rose)' }}>{errors.reference_date.message}</p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onPrev}
          className="flex-1 py-3 rounded-lg text-sm font-semibold transition-opacity hover:opacity-70"
          style={{ background: 'var(--bg2)', color: 'var(--muted)', border: '1px solid var(--border)' }}
        >
          ← 이전
        </button>
        <button
          onClick={handleNext}
          className="flex-1 py-3 rounded-lg text-sm font-semibold transition-opacity hover:opacity-80"
          style={{ background: 'var(--mint)', color: '#0b0f19' }}
        >
          다음 →
        </button>
      </div>
    </div>
  );
}
