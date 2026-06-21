'use client';
// 차량 수정 페이지 — 현재 차량 정보를 불러와 폼에 pre-populate
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { VehicleForm } from '../../../components/vehicle/VehicleForm';
import { api } from '../../../lib/api';

export default function VehicleEditPage() {
  const router = useRouter();
  const { data: vehicle, isLoading } = useQuery({
    queryKey: ['vehicle'],
    queryFn: () => api.vehicle.get(),
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--bg)' }}>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>불러오는 중...</p>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--bg)' }}>
        <p className="text-sm" style={{ color: 'var(--rose)' }}>등록된 차량이 없습니다.</p>
      </div>
    );
  }

  return (
    <VehicleForm
      mode="edit"
      vehicleId={vehicle.id}
      defaultValues={{
        name: vehicle.name,
        model_name: vehicle.model_name ?? '',
        license_plate: vehicle.license_plate ?? '',
        manufacturer_code: vehicle.manufacturer_code ?? '',
        model_year: vehicle.model_year ?? '',
        vehicle_type_code: vehicle.vehicle_type_code,
        fuel_type_code: vehicle.fuel_type_code,
        transmission_code: vehicle.transmission_code,
        current_km: vehicle.current_km,
        annual_km: vehicle.annual_km,
        reference_date: vehicle.reference_date.slice(0, 10),
        notes: vehicle.notes ?? '',
      }}
      onSuccess={() => router.push('/')}
    />
  );
}
