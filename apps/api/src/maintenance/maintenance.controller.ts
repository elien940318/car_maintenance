import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateMaintenancePartDto } from './dto/create-maintenance-part.dto';
import { RecordCompletionDto } from './dto/record-completion.dto';
import { UpdateMaintenancePartDto } from './dto/update-maintenance-part.dto';
import { MaintenanceService } from './maintenance.service';

@Controller('vehicles/:vehicleId/parts')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  // GET /vehicles/:vehicleId/parts — 차량별 정비 항목 목록 + 예정일 계산값
  @Get()
  findByVehicle(@Param('vehicleId') vehicleId: string) {
    return this.maintenanceService.findByVehicle(vehicleId);
  }

  // POST /vehicles/:vehicleId/parts — 정비 항목 수동 등록 (AC-M1)
  @Post()
  createPart(
    @Param('vehicleId') vehicleId: string,
    @Body() dto: CreateMaintenancePartDto,
  ) {
    return this.maintenanceService.createPart(vehicleId, dto);
  }

  // PATCH /vehicles/:vehicleId/parts/:partId — 주기·팁 수정 (AC-M16 프리셋 원본 불변)
  @Patch(':partId')
  updatePart(
    @Param('vehicleId') vehicleId: string,
    @Param('partId') partId: string,
    @Body() dto: UpdateMaintenancePartDto,
  ) {
    return this.maintenanceService.updatePart(vehicleId, partId, dto);
  }

  // POST /vehicles/:vehicleId/parts/:partId/records — 교환완료 단건 (AC-M12, M13)
  @Post(':partId/records')
  createRecord(
    @Param('vehicleId') vehicleId: string,
    @Param('partId') partId: string,
    @Body() dto: RecordCompletionDto,
  ) {
    return this.maintenanceService.createRecord(vehicleId, partId, dto);
  }
}
