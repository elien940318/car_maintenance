'use client';
import { useFormContext } from 'react-hook-form';
import type { VehicleFormValues } from './VehicleForm';
import { MANUFACTURERS } from '../../lib/codes';

interface Step1Props {
  onNext: () => void;
}

export function Step1Basic({ onNext }: Step1Props) {
  const { register, formState: { errors }, trigger } = useFormContext<VehicleFormValues>();

  const handleNext = async () => {
    const ok = await trigger(['name', 'vehicle_type_code']);
    if (ok) onNext();
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-5">
      <h2 className="text-base font-semibold" style={{ color: 'var(--text)' }}>
        기본 정보
      </h2>

      <div>
        <label className="block text-sm mb-1" style={{ color: 'var(--muted)' }}>
          차량 별칭 <span style={{ color: 'var(--rose)' }}>*</span>
        </label>
        <input
          {...register('name', { required: '차량 별칭을 입력하세요' })}
          placeholder="예: 내 투싼"
          className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-1"
          style={{
            background: 'var(--bg2)',
            color: 'var(--text)',
            border: `1px solid ${errors.name ? 'var(--rose)' : 'var(--border)'}`,
          }}
        />
        {errors.name && (
          <p className="text-xs mt-1" style={{ color: 'var(--rose)' }}>{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm mb-1" style={{ color: 'var(--muted)' }}>차량 모델명</label>
        <input
          {...register('model_name')}
          placeholder="예: 투싼 NX4 하이브리드"
          className="w-full px-3 py-2 rounded-lg text-sm outline-none"
          style={{ background: 'var(--bg2)', color: 'var(--text)', border: '1px solid var(--border)' }}
        />
      </div>

      <div>
        <label className="block text-sm mb-1" style={{ color: 'var(--muted)' }}>차량번호</label>
        <input
          {...register('license_plate')}
          placeholder="예: 123가 4567"
          className="w-full px-3 py-2 rounded-lg text-sm outline-none"
          style={{ background: 'var(--bg2)', color: 'var(--text)', border: '1px solid var(--border)' }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1" style={{ color: 'var(--muted)' }}>제조사</label>
          <select
            {...register('manufacturer_code')}
            className="w-full px-3 py-2 rounded-lg text-sm outline-none"
            style={{ background: 'var(--bg2)', color: 'var(--text)', border: '1px solid var(--border)' }}
          >
            <option value="">선택</option>
            {MANUFACTURERS.map((m) => (
              <option key={m.code} value={m.code}>{m.label_ko}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1" style={{ color: 'var(--muted)' }}>연식</label>
          <select
            {...register('model_year', { valueAsNumber: true })}
            className="w-full px-3 py-2 rounded-lg text-sm outline-none"
            style={{ background: 'var(--bg2)', color: 'var(--text)', border: '1px solid var(--border)' }}
          >
            <option value="">선택</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}년</option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={handleNext}
        className="w-full py-3 rounded-lg text-sm font-semibold transition-opacity hover:opacity-80"
        style={{ background: 'var(--mint)', color: '#0b0f19' }}
      >
        다음 — 제원 선택
      </button>
    </div>
  );
}
