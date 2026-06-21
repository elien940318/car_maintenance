import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PresetService {
  constructor(private readonly prisma: PrismaService) {}

  // 제원 조합(연료×변속기)에 맞는 프리셋 조회 (AC-V6, V7, M15)
  // SQL: WHERE fuel_type_code = fuelCode AND (transmission_code IS NULL OR transmission_code = transCode)
  findByVehicleSpec(fuelCode: string, transCode?: string) {
    return this.prisma.maintenanceIntervalPreset.findMany({
      where: {
        fuel_type_code: fuelCode,
        OR: transCode
          ? [{ transmission_code: null }, { transmission_code: transCode }]
          : [{ transmission_code: null }],
      },
      include: { part: true },
      orderBy: { part: { sort_order: 'asc' } },
    });
  }
}
