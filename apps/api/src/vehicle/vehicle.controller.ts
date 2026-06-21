// Spring의 @RestController 역할
import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehicleService } from './vehicle.service';

@Controller('vehicle')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  // GET /vehicle — 단일 차량 조회 (없으면 404)
  @Get()
  findOne() {
    return this.vehicleService.findOne();
  }

  // POST /vehicle — 차량 등록 (1대 제한, AC-V5)
  @Post()
  create(@Body() dto: CreateVehicleDto) {
    return this.vehicleService.create(dto);
  }

  // PATCH /vehicle/:id — 차량 수정 (km 변경 시 monthly_km 재계산, AC-V2·V3)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateVehicleDto) {
    return this.vehicleService.update(id, dto);
  }
}
