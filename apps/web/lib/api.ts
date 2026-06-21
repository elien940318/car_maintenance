import type {
  CreatePartPayload,
  CreateRecordPayload,
  CreateVehiclePayload,
  PartWithSchedule,
  PresetItem,
  Vehicle,
} from './types';

// 브라우저 접속 호스트 기준으로 API 주소 결정 (같은 PC: localhost, 모바일: 노트북 IP 자동 사용)
const BASE =
  typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}:3001`
    : (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001');

interface ApiError extends Error {
  status: number;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.message ?? `HTTP ${res.status}`) as ApiError;
    err.status = res.status;
    throw err;
  }
  return res.json() as Promise<T>;
}

export const api = {
  vehicle: {
    get: () => request<Vehicle>('/vehicle'),
    create: (data: CreateVehiclePayload) =>
      request<Vehicle>('/vehicle', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<CreateVehiclePayload>) =>
      request<Vehicle>(`/vehicle/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  },
  presets: {
    list: (fuelCode: string, transCode?: string) => {
      const params = new URLSearchParams({ fuelCode });
      if (transCode) params.set('transCode', transCode);
      return request<PresetItem[]>(`/presets?${params}`);
    },
  },
  parts: {
    list: (vehicleId: string) =>
      request<PartWithSchedule[]>(`/vehicles/${vehicleId}/parts`),
    create: (vehicleId: string, data: CreatePartPayload) =>
      request<PartWithSchedule>(`/vehicles/${vehicleId}/parts`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (vehicleId: string, partId: string, data: Partial<CreatePartPayload>) =>
      request<PartWithSchedule>(`/vehicles/${vehicleId}/parts/${partId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    createRecord: (vehicleId: string, partId: string, data: CreateRecordPayload) =>
      request<PartWithSchedule>(`/vehicles/${vehicleId}/parts/${partId}/records`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
};
