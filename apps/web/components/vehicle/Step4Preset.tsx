'use client';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { api } from '../../lib/api';
import { CATEGORY_COLORS, FUEL_TYPES, TRANSMISSION_TYPES, VEHICLE_TYPES } from '../../lib/codes';
import type { PresetItem } from '../../lib/types';
import type { VehicleFormValues } from './VehicleForm';

interface Step4Props {
  onPrev: () => void;
  onSubmit: (accepted: PresetItem[]) => Promise<void>;
  isSubmitting: boolean;
}

export function Step4Preset({ onPrev, onSubmit, isSubmitting }: Step4Props) {
  const { getValues } = useFormContext<VehicleFormValues>();
  const [presets, setPresets] = useState<PresetItem[]>([]);
  const [accepted, setAccepted] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const values = getValues();
  const fuelLabel = FUEL_TYPES.find((f) => f.code === values.fuel_type_code)?.label_ko ?? '';
  const transLabel = TRANSMISSION_TYPES.find((t) => t.code === values.transmission_code)?.label_ko ?? '';
  const typeLabel = VEHICLE_TYPES.find((v) => v.code === values.vehicle_type_code)?.label_ko ?? '';

  useEffect(() => {
    if (!values.fuel_type_code) return;
    setLoading(true);
    api.presets
      .list(values.fuel_type_code, values.transmission_code || undefined)
      .then((data) => {
        setPresets(data);
        setAccepted(new Set(data.map((p) => p.id)));
      })
      .catch(() => setPresets([]))
      .finally(() => setLoading(false));
  }, [values.fuel_type_code, values.transmission_code]);

  const toggle = (id: string) => {
    setAccepted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = () => {
    onSubmit(presets.filter((p) => accepted.has(p.id)));
  };

  return (
    <div className="space-y-5">
      <h2 className="text-base font-semibold" style={{ color: 'var(--text)' }}>프리셋 확인</h2>

      {/* 제원 요약 칩 */}
      <div className="flex flex-wrap gap-2">
        {[typeLabel, fuelLabel, transLabel].filter(Boolean).map((l) => (
          <span
            key={l}
            className="text-xs px-2 py-0.5 rounded"
            style={{ background: 'var(--bg3)', color: 'var(--mint)', border: '1px solid var(--border)' }}
          >
            {l}
          </span>
        ))}
      </div>

      {loading ? (
        <p className="text-sm" style={{ color: 'var(--muted)' }}>프리셋 불러오는 중...</p>
      ) : (
        <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          {presets.map((p) => {
            const isOn = accepted.has(p.id);
            const color = CATEGORY_COLORS[p.part.category] ?? '#6b7a99';
            const intervalText = p.is_chain
              ? '교환 불필요'
              : p.interval_km
              ? `${p.interval_km.toLocaleString()} km`
              : p.interval_months
              ? `${p.interval_months}개월`
              : '-';

            return (
              <button
                key={p.id}
                onClick={() => toggle(p.id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                style={{
                  background: isOn ? 'var(--bg2)' : 'var(--bg)',
                  borderBottom: '1px solid var(--border)',
                  opacity: isOn ? 1 : 0.4,
                }}
              >
                <span
                  className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
                  style={{
                    background: isOn ? color : 'var(--bg3)',
                    color: isOn ? '#0b0f19' : 'var(--muted)',
                  }}
                >
                  {isOn ? '✓' : '✕'}
                </span>
                <span className="flex-1 text-sm" style={{ color: isOn ? color : 'var(--muted)' }}>
                  {p.part.name_ko}
                </span>
                <span className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
                  {intervalText}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <p className="text-xs" style={{ color: 'var(--muted)' }}>
        ✓ 항목만 정비 부품으로 등록됩니다. 나중에 수동으로 추가·수정할 수 있습니다.
      </p>

      <div className="flex gap-3">
        <button
          onClick={onPrev}
          disabled={isSubmitting}
          className="flex-1 py-3 rounded-lg text-sm font-semibold transition-opacity hover:opacity-70 disabled:opacity-40"
          style={{ background: 'var(--bg2)', color: 'var(--muted)', border: '1px solid var(--border)' }}
        >
          ← 이전
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || loading}
          className="flex-1 py-3 rounded-lg text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-40"
          style={{ background: 'var(--mint)', color: '#0b0f19' }}
        >
          {isSubmitting ? '등록 중...' : '완료 등록'}
        </button>
      </div>
    </div>
  );
}
