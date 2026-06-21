import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { differenceInDays } from 'date-fns';
import { PrismaService } from '../prisma/prisma.service';
import { computePartSchedule } from '../schedule/schedule-calculator';
import { CreateMaintenancePartDto } from './dto/create-maintenance-part.dto';
import { RecordCompletionDto } from './dto/record-completion.dto';
import { UpdateMaintenancePartDto } from './dto/update-maintenance-part.dto';

@Injectable()
export class MaintenanceService {
  constructor(private readonly prisma: PrismaService) {}

  // interval_km과 interval_months 동시 입력 검증 (AC-M3)
  validateXOR(dto: { interval_km?: number; interval_months?: number; is_chain: boolean }): void {
    if (dto.interval_km && dto.interval_months) {
      throw new BadRequestException(
        'interval_km과 interval_months는 동시에 설정할 수 없습니다 (XOR).',
      );
    }
    if (!dto.is_chain && !dto.interval_km && !dto.interval_months) {
      throw new BadRequestException(
        'is_chain=false이면 interval_km 또는 interval_months 중 하나가 필요합니다.',
      );
    }
  }

  // record_km, record_date 둘 다 없으면 BadRequest
  validateRecord(dto: RecordCompletionDto): void {
    if (dto.record_km === undefined && !dto.record_date) {
      throw new BadRequestException(
        'record_km 또는 record_date 중 하나 이상 입력해야 합니다.',
      );
    }
  }

  /**
   * 누락 축 보간 (#7): 하나만 입력된 경우 나머지를 vehicle 보정값으로 계산.
   * - record_date 누락 → reference_date - (current_km - record_km)/monthly_km × 30
   * - record_km 누락 → current_km - (reference_date - record_date)/30 × monthly_km
   */
  interpolateRecord(
    dto: RecordCompletionDto,
    vehicle: { current_km: number; reference_date: Date; monthly_km: number },
  ): {
    record_km: number;
    record_date: Date;
    is_estimated_km: boolean;
    is_estimated_date: boolean;
  } {
    const hasKm = dto.record_km !== undefined;
    const hasDate = !!dto.record_date;

    if (hasKm && hasDate) {
      return {
        record_km: dto.record_km!,
        record_date: new Date(dto.record_date!),
        is_estimated_km: false,
        is_estimated_date: false,
      };
    }

    if (hasKm) {
      // record_date 보간: reference_date에서 경과 km만큼 역산
      const daysSince =
        ((vehicle.current_km - dto.record_km!) / vehicle.monthly_km) * 30;
      const record_date = new Date(vehicle.reference_date);
      record_date.setDate(record_date.getDate() - Math.round(daysSince));
      return {
        record_km: dto.record_km!,
        record_date,
        is_estimated_km: false,
        is_estimated_date: true,
      };
    }

    // record_km 보간: record_date에서 경과일만큼 km 역산
    const recordDate = new Date(dto.record_date!);
    const days = differenceInDays(vehicle.reference_date, recordDate);
    const record_km = Math.max(
      0,
      Math.round(vehicle.current_km - (days / 30) * vehicle.monthly_km),
    );
    return {
      record_km,
      record_date: recordDate,
      is_estimated_km: true,
      is_estimated_date: false,
    };
  }

  // 차량별 정비 항목 목록 + 각 항목의 예정일 계산 read model (AC-M4 트리거 포함)
  async findByVehicle(vehicleId: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });
    if (!vehicle) throw new NotFoundException(`차량(${vehicleId})을 찾을 수 없습니다.`);

    const parts = await this.prisma.maintenancePart.findMany({
      where: { vehicle_id: vehicleId },
      include: {
        records: {
          // 최신 교환 이력 1건만 포함 (lkm, ldt 산출용)
          orderBy: [{ record_date: 'desc' }, { created_at: 'desc' }],
          take: 1,
        },
      },
      orderBy: { sort_order: 'asc' },
    });

    const today = new Date();
    const vehicleSnap = {
      current_km: vehicle.current_km,
      reference_date: vehicle.reference_date,
      monthly_km: vehicle.monthly_km,
    };

    return parts.map((part) => {
      const lastRecord = part.records[0] ?? null;
      const schedule = computePartSchedule(
        {
          interval_km: part.interval_km,
          interval_months: part.interval_months,
          is_chain: part.is_chain,
        },
        lastRecord
          ? { record_km: lastRecord.record_km, record_date: lastRecord.record_date }
          : null,
        vehicleSnap,
        today,
      );
      return { ...part, schedule, lastRecord };
    });
  }

  // 정비 항목 수동 등록 (AC-M1)
  async createPart(vehicleId: string, dto: CreateMaintenancePartDto) {
    this.validateXOR(dto);
    return this.prisma.maintenancePart.create({
      data: { ...dto, vehicle_id: vehicleId },
    });
  }

  // 정비 항목 주기·팁 수정 (AC-M16: 원본 프리셋 불변, MaintenancePart만 업데이트)
  async updatePart(vehicleId: string, partId: string, dto: UpdateMaintenancePartDto) {
    await this.findPartOrFail(vehicleId, partId);
    if (dto.interval_km !== undefined || dto.interval_months !== undefined || dto.is_chain !== undefined) {
      this.validateXOR({
        interval_km: dto.interval_km,
        interval_months: dto.interval_months,
        is_chain: dto.is_chain ?? false,
      });
    }
    return this.prisma.maintenancePart.update({
      where: { id: partId },
      data: dto,
    });
  }

  // 교환완료 단건 기록 (AC-M12, M13): 보간 → 저장 → 해당 Part 재계산 반환
  async createRecord(vehicleId: string, partId: string, dto: RecordCompletionDto) {
    this.validateRecord(dto);

    const part = await this.findPartOrFail(vehicleId, partId);
    const vehicle = await this.prisma.vehicle.findUniqueOrThrow({
      where: { id: vehicleId },
    });

    const interpolated = this.interpolateRecord(dto, {
      current_km: vehicle.current_km,
      reference_date: vehicle.reference_date,
      monthly_km: vehicle.monthly_km,
    });

    await this.prisma.maintenanceRecord.create({
      data: {
        part_id: partId,
        record_km: interpolated.record_km,
        record_date: interpolated.record_date,
        is_estimated_km: interpolated.is_estimated_km,
        is_estimated_date: interpolated.is_estimated_date,
        memo: dto.memo,
      },
    });

    // 저장 직후 재계산 (AC-M4, M13)
    const today = new Date();
    const schedule = computePartSchedule(
      {
        interval_km: part.interval_km,
        interval_months: part.interval_months,
        is_chain: part.is_chain,
      },
      { record_km: interpolated.record_km, record_date: interpolated.record_date },
      {
        current_km: vehicle.current_km,
        reference_date: vehicle.reference_date,
        monthly_km: vehicle.monthly_km,
      },
      today,
    );

    return { ...part, schedule, lastRecord: interpolated };
  }

  private async findPartOrFail(vehicleId: string, partId: string) {
    const part = await this.prisma.maintenancePart.findFirst({
      where: { id: partId, vehicle_id: vehicleId },
    });
    if (!part) throw new NotFoundException(`정비 항목(${partId})을 찾을 수 없습니다.`);
    return part;
  }
}
