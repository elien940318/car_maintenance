'use client';
import { useFormContext } from 'react-hook-form';
import type { VehicleFormValues } from './VehicleForm';
import { FUEL_TYPES, TRANSMISSION_TYPES, VEHICLE_TYPES } from '../../lib/codes';

interface Step2Props {
  onPrev: () => void;
  onNext: () => void;
}

export function Step2Spec({ onPrev, onNext }: Step2Props) {
  const { register, formState: { errors }, trigger } = useFormContext<VehicleFormValues>();

  const handleNext = async () => {
    const ok = await trigger(['vehicle_type_code', 'fuel_type_code', 'transmission_code']);
    if (ok) onNext();
  };

  return (
    <div className="space-y-5">
      <h2 className="text-base font-semibold" style={{ color: 'var(--text)' }}>제원 선택</h2>

      <div>
        <label className="block text-sm mb-1" style={{ color: 'var(--muted)' }}>
          차종 <span style={{ color: 'var(--rose)' }}>*</span>
        </label>
        <select
          {...register('vehicle_type_code', { required: '차종을 선택하세요' })}
          className="w-full px-3 py-2 rounded-lg text-sm outline-none"
          style={{
            background: 'var(--bg2)',
            color: 'var(--text)',
            border: `1px solid ${errors.vehicle_type_code ? 'var(--rose)' : 'var(--border)'}`,
          }}
        >
          <option value="">선택하세요</option>
          {VEHICLE_TYPES.map((v) => (
            <option key={v.code} value={v.code}>{v.label_ko}</option>
          ))}
        </select>
        {errors.vehicle_type_code && (
          <p className="text-xs mt-1" style={{ color: 'var(--rose)' }}>{errors.vehicle_type_code.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm mb-1" style={{ color: 'var(--muted)' }}>
          연료 <span style={{ color: 'var(--rose)' }}>*</span>
        </label>
        <select
          {...register('fuel_type_code', { required: '연료 유형을 선택하세요' })}
          className="w-full px-3 py-2 rounded-lg text-sm outline-none"
          style={{
            background: 'var(--bg2)',
            color: 'var(--text)',
            border: `1px solid ${errors.fuel_type_code ? 'var(--rose)' : 'var(--border)'}`,
          }}
        >
          <option value="">선택하세요</option>
          {FUEL_TYPES.map((f) => (
            <option key={f.code} value={f.code}>{f.label_ko}</option>
          ))}
        </select>
        {errors.fuel_type_code && (
          <p className="text-xs mt-1" style={{ color: 'var(--rose)' }}>{errors.fuel_type_code.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm mb-1" style={{ color: 'var(--muted)' }}>
          변속기 <span style={{ color: 'var(--rose)' }}>*</span>
        </label>
        <select
          {...register('transmission_code', { required: '변속기를 선택하세요' })}
          className="w-full px-3 py-2 rounded-lg text-sm outline-none"
          style={{
            background: 'var(--bg2)',
            color: 'var(--text)',
            border: `1px solid ${errors.transmission_code ? 'var(--rose)' : 'var(--border)'}`,
          }}
        >
          <option value="">선택하세요</option>
          {TRANSMISSION_TYPES.map((t) => (
            <option key={t.code} value={t.code}>{t.label_ko}</option>
          ))}
        </select>
        {errors.transmission_code && (
          <p className="text-xs mt-1" style={{ color: 'var(--rose)' }}>{errors.transmission_code.message}</p>
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
