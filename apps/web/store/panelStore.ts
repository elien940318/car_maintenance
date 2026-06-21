'use client';
// Zustand: Spring의 Singleton Bean과 유사하게 전역 상태를 관리한다.
import { create } from 'zustand';
import type { PartWithSchedule, Vehicle } from '../lib/types';

interface PanelState {
  selectedPart: PartWithSchedule | null;
  vehicle: Vehicle | null;
  isOpen: boolean;
  openPanel: (part: PartWithSchedule, vehicle: Vehicle) => void;
  closePanel: () => void;
  setVehicle: (vehicle: Vehicle) => void;
  updatePart: (part: PartWithSchedule) => void;
}

export const usePanelStore = create<PanelState>((set) => ({
  selectedPart: null,
  vehicle: null,
  isOpen: false,
  openPanel: (part, vehicle) => set({ selectedPart: part, vehicle, isOpen: true }),
  closePanel: () => set({ isOpen: false, selectedPart: null }),
  setVehicle: (vehicle) => set({ vehicle }),
  updatePart: (part) => set({ selectedPart: part }),
}));
