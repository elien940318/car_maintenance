'use client';
// React Hook Form + useFormContext = Spring의 @ModelAttribute + BindingContext 조합
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { api } from '../../lib/api';
import type { PresetItem, Vehicle } from '../../lib/types';
import { Step1Basic } from './Step1Basic';
import { Step2Spec } from './Step2Spec';
import { Step3Mileage } from './Step3Mileage';
import { Step4Preset } from './Step4Preset';
import { StepIndicator } from './StepIndicator';

export interface VehicleFormValues {
  name: string;
  model_name: string;
  license_plate: string;
  manufacturer_code: string;
  model_year: number | '';
  vehicle_type_code: string;
  fuel_type_code: string;
  transmission_code: string;
  current_km: number;
  annual_km: number;
  reference_date: string;
  notes: string;
}

const STEPS = ['기본 정보', '제원 선택', '주행 정보', '프리셋 확인'];

interface VehicleFormProps {
  mode: 'new' | 'edit';
  defaultValues?: Partial<VehicleFormValues>;
  vehicleId?: string;
  onSuccess: () => void;
}

export function VehicleForm({ mode, defaultValues, vehicleId, onSuccess }: VehicleFormProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const todayStr = new Date().toISOString().slice(0, 10);

  const methods = useForm<VehicleFormValues>({
    defaultValues: {
      name: '',
      model_name: '',
      license_plate: '',
      manufacturer_code: '',
      model_year: '',
      vehicle_type_code: '',
      fuel_type_code: '',
      transmission_code: '',
      current_km: 0,
      annual_km: 15000,
      reference_date: todayStr,
      notes: '',
      ...defaultValues,
    },
  });

  const handleSubmit = async (accepted: PresetItem[]) => {
    const values = methods.getValues();
    setIsSubmitting(true);
    setError(null);
    try {
      let vehicle: Vehicle;

      if (mode === 'new') {
        vehicle = await api.vehicle.create({
          name: values.name,
          model_name: values.model_name || undefined,
          license_plate: values.license_plate || undefined,
          manufacturer_code: values.manufacturer_code || undefined,
          model_year: values.model_year ? Number(values.model_year) : undefined,
          vehicle_type_code: values.vehicle_type_code,
          fuel_type_code: values.fuel_type_code,
          transmission_code: values.transmission_code,
          current_km: Number(values.current_km),
          annual_km: Number(values.annual_km),
          reference_date: values.reference_date,
          notes: values.notes || undefined,
        });
      } else {
        vehicle = await api.vehicle.update(vehicleId!, {
          name: values.name,
          model_name: values.model_name || undefined,
          license_plate: values.license_plate || undefined,
          manufacturer_code: values.manufacturer_code || undefined,
          model_year: values.model_year ? Number(values.model_year) : undefined,
          vehicle_type_code: values.vehicle_type_code,
          fuel_type_code: values.fuel_type_code,
          transmission_code: values.transmission_code,
          current_km: Number(values.current_km),
          annual_km: Number(values.annual_km),
          reference_date: values.reference_date,
          notes: values.notes || undefined,
        });
      }

      // 신규 등록 시 선택된 프리셋 → MaintenancePart 생성
      if (mode === 'new' && accepted.length > 0) {
        await Promise.all(
          accepted.map((p) =>
            api.parts.create(vehicle.id, {
              name: p.part.name_ko,
              category: p.part.category,
              interval_km: p.interval_km ?? undefined,
              interval_months: p.interval_months ?? undefined,
              is_chain: p.is_chain,
              is_vehicle_specific: false,
              tip: p.part.tip_template ?? undefined,
              svg_key: p.part.svg_key ?? undefined,
              sort_order: p.part.sort_order,
              part_key: p.part_key,
            }),
          ),
        );
      }

      onSuccess();
    } catch (e) {
      setError((e as Error).message ?? '등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen px-4 py-8"
      style={{ background: 'var(--bg)' }}
    >
      <div className="max-w-md mx-auto">
        <p className="text-xs mb-6" style={{ color: 'var(--muted)' }}>
          {mode === 'new' ? '차량 등록' : '차량 수정'}
        </p>

        <StepIndicator currentStep={step} steps={STEPS} />

        <div
          className="p-5 rounded-xl"
          style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
        >
          <FormProvider {...methods}>
            {step === 1 && <Step1Basic onNext={() => setStep(2)} />}
            {step === 2 && <Step2Spec onPrev={() => setStep(1)} onNext={() => setStep(3)} />}
            {step === 3 && <Step3Mileage onPrev={() => setStep(2)} onNext={() => setStep(4)} />}
            {step === 4 && (
              <Step4Preset
                onPrev={() => setStep(3)}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
              />
            )}
          </FormProvider>
        </div>

        {error && (
          <p className="mt-4 text-sm text-center" style={{ color: 'var(--rose)' }}>{error}</p>
        )}
      </div>
    </div>
  );
}
