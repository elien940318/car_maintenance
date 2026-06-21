'use client';
// 차량 신규 등록 페이지 (AC-V5: 기존 차량 있으면 edit으로 리다이렉트)
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { VehicleForm } from '../../../components/vehicle/VehicleForm';
import { api } from '../../../lib/api';

export default function VehicleNewPage() {
  const router = useRouter();
  const { data: vehicle, isLoading } = useQuery({
    queryKey: ['vehicle'],
    queryFn: () => api.vehicle.get(),
    retry: false,
  });

  // 이미 차량이 있으면 수정 화면으로 리다이렉트 (AC-V5)
  useEffect(() => {
    if (vehicle) router.replace('/vehicle/edit');
  }, [vehicle, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--bg)' }}>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>확인 중...</p>
      </div>
    );
  }

  return (
    <VehicleForm
      mode="new"
      onSuccess={() => router.push('/')}
    />
  );
}
