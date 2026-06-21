'use client';
// Next.js 페이지 컴포넌트 = Spring의 @Controller 역할 (요청 진입점)
import { useQuery } from '@tanstack/react-query';
import { Dashboard } from '../components/dashboard/Dashboard';
import { EmptyState } from '../components/EmptyState';
import { api } from '../lib/api';

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--bg)' }}>
      <div className="text-sm" style={{ color: 'var(--muted)' }}>불러오는 중...</div>
    </div>
  );
}

export default function HomePage() {
  const { data: vehicle, isLoading, error } = useQuery({
    queryKey: ['vehicle'],
    queryFn: () => api.vehicle.get(),
    retry: false,
  });

  const is404 = (error as { status?: number } | null)?.status === 404;

  if (isLoading) return <LoadingScreen />;
  if (is404 || !vehicle) return <EmptyState />;

  return <Dashboard vehicle={vehicle} />;
}
