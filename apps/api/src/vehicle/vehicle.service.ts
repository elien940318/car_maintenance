// Spring의 @Service 역할 — 비즈니스 로직 담당
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehicleService {
  constructor(private readonly prisma: PrismaService) {}

  // annual_km / 12 반올림 (AC-V9, #8)
  calcMonthlyKm(annualKm: number): number {
    return Math.round(annualKm / 12);
  }

  async findOne() {
    const vehicle = await this.prisma.vehicle.findFirst({
      include: {
        vehicle_type: true,
        fuel_type: true,
        transmission: true,
        manufacturer: true,
      },
    });
    if (!vehicle) throw new NotFoundException('등록된 차량이 없습니다.');
    return vehicle;
  }

  async create(dto: CreateVehicleDto) {
    // 차량 1대 제한 (AC-V5)
    const existing = await this.prisma.vehicle.findFirst();
    if (existing) {
      throw new ConflictException(
        '차량은 1대만 등록할 수 있습니다. 수정 화면을 이용하세요.',
      );
    }

    const { reference_date, annual_km, ...rest } = dto;
    return this.prisma.vehicle.create({
      data: {
        ...rest,
        annual_km,
        monthly_km: this.calcMonthlyKm(annual_km),
        reference_date: new Date(reference_date),
      },
    });
  }

  async update(id: string, dto: UpdateVehicleDto) {
    await this.findOneById(id);

    const { reference_date, annual_km, ...rest } = dto;
    const data: Record<string, unknown> = { ...rest };

    if (reference_date !== undefined) {
      data['reference_date'] = new Date(reference_date);
    }
    // annual_km 변경 시 monthly_km 자동 재계산 (AC-V3)
    if (annual_km !== undefined) {
      data['annual_km'] = annual_km;
      data['monthly_km'] = this.calcMonthlyKm(annual_km);
    }

    return this.prisma.vehicle.update({ where: { id }, data });
  }

  private async findOneById(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) throw new NotFoundException(`차량(${id})을 찾을 수 없습니다.`);
    return vehicle;
  }
}
