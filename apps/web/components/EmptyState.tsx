'use client';
import { useRouter } from 'next/navigation';

export function EmptyState() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'var(--bg)' }}>
      <div className="text-center max-w-xs">
        <div className="text-6xl mb-6">🚗</div>
        <p className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>
          차량 정보를 먼저 등록해주세요.
        </p>
        <p className="text-sm mb-8" style={{ color: 'var(--muted)' }}>
          제원을 입력하면 교환 일정이 자동으로 계산됩니다.
        </p>
        <button
          onClick={() => router.push('/vehicle/new')}
          className="w-full py-3 px-6 rounded-lg font-semibold text-sm transition-opacity hover:opacity-80"
          style={{ background: 'var(--mint)', color: '#0b0f19' }}
        >
          + 차량 등록하기
        </button>
      </div>
    </div>
  );
}
