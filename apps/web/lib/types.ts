export type PartStatus = 'urgent' | 'soon' | 'ok' | 'chain' | 'unknown';
export type Baseline = 'recorded' | 'estimated';

export interface Vehicle {
  id: string;
  name: string;
  model_name: string | null;
  license_plate: string | null;
  manufacturer_code: string | null;
  model_year: number | null;
  vehicle_type_code: string;
  fuel_type_code: string;
  transmission_code: string;
  current_km: number;
  annual_km: number;
  monthly_km: number;
  reference_date: string;
  notes: string | null;
  vehicle_type?: { label_ko: string };
  fuel_type?: { label_ko: string };
  transmission?: { label_ko: string };
  manufacturer?: { label_ko: string } | null;
}

export interface ScheduleResult {
  nextKm: number | null;
  nextDate: string | null;
  daysRemaining: number | null;
  status: PartStatus;
  baseline: Baseline;
}

export interface LastRecord {
  id: string;
  part_id: string;
  record_km: number | null;
  record_date: string | null;
  memo: string | null;
  is_estimated_km: boolean;
  is_estimated_date: boolean;
}

export interface PartWithSchedule {
  id: string;
  vehicle_id: string;
  part_key: string | null;
  name: string;
  sub_name: string | null;
  category: string;
  interval_km: number | null;
  interval_months: number | null;
  is_chain: boolean;
  is_vehicle_specific: boolean;
  tip: string | null;
  svg_key: string | null;
  sort_order: number;
  schedule: ScheduleResult;
  lastRecord: LastRecord | null;
}

export interface PresetItem {
  id: string;
  part_key: string;
  fuel_type_code: string;
  transmission_code: string | null;
  interval_km: number | null;
  interval_months: number | null;
  is_chain: boolean;
  note: string | null;
  part: {
    part_key: string;
    name_ko: string;
    category: string;
    role_description: string | null;
    tip_template: string | null;
    svg_key: string | null;
    sort_order: number;
  };
}

export interface CreateVehiclePayload {
  name: string;
  model_name?: string;
  license_plate?: string;
  manufacturer_code?: string;
  model_year?: number;
  vehicle_type_code: string;
  fuel_type_code: string;
  transmission_code: string;
  current_km: number;
  annual_km: number;
  reference_date: string;
  notes?: string;
}

export interface CreatePartPayload {
  name: string;
  sub_name?: string;
  category: string;
  interval_km?: number;
  interval_months?: number;
  is_chain: boolean;
  is_vehicle_specific: boolean;
  tip?: string;
  svg_key?: string;
  sort_order: number;
  part_key?: string;
}

export interface CreateRecordPayload {
  record_km?: number;
  record_date?: string;
  memo?: string;
}
