'use client';
import { useState } from 'react';
import { api } from '../../lib/api';
import type { PartWithSchedule, Vehicle } from '../../lib/types';
import { usePanelStore } from '../../store/panelStore';

interface RecordCompletionFormProps {
  part: PartWithSchedule;
  vehicle: Vehicle;
  onSaved: () => void;
}

export function RecordCompletionForm({ part, vehicle, onSaved }: RecordCompletionFormProps) {
  const { updatePart } = usePanelStore();
  const todayStr = new Date().toISOString().slice(0, 10);
  const [recordDate, setRecordDate] = useState(todayStr);
  const [recordKm, setRecordKm] = useState(String(vehicle.current_km));
  const [memo, setMemo] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const updated = await api.parts.createRecord(vehicle.id, part.id, {
        record_date: recordDate || undefined,
        record_km: recordKm ? Number(recordKm) : undefined,
        memo: memo || undefined,
      });
      updatePart(updated);
      onSaved();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError((e as Error).message ?? '저장 실패');
    } finally {
      setSaving(false);
    }
  };

  if (part.is_chain) return null;

  return (
    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 8 }}>
      <p className="text-xs font-semibold mb-3" style={{ color: 'var(--mint)' }}>
        ✅ 교환완료 기록
      </p>
      <div className="space-y-3">
        <div>
          <label className="block text-xs mb-1" style={{ color: 'var(--muted)' }}>교환 날짜</label>
          <input
            type="date"
            value={recordDate}
            max={todayStr}
            onChange={(e) => setRecordDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm outline-none"
            style={{
              background: 'var(--bg)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              colorScheme: 'dark',
            }}
          />
        </div>
        <div>
          <label className="block text-xs mb-1" style={{ color: 'var(--muted)' }}>교환 km</label>
          <input
            type="number"
            value={recordKm}
            onChange={(e) => setRecordKm(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm outline-none"
            style={{ background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)' }}
          />
        </div>
        <div>
          <label className="block text-xs mb-1" style={{ color: 'var(--muted)' }}>메모 (선택)</label>
          <input
            type="text"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="예: 현대 서비스센터"
            className="w-full px-3 py-2 rounded-lg text-sm outline-none"
            style={{ background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)' }}
          />
        </div>
        {error && <p className="text-xs" style={{ color: 'var(--rose)' }}>{error}</p>}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 rounded-lg text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-40"
          style={{ background: saved ? 'var(--green)' : 'var(--mint)', color: '#0b0f19' }}
        >
          {saving ? '저장 중...' : saved ? '저장됨 ✓' : '저장하기'}
        </button>
      </div>
    </div>
  );
}
