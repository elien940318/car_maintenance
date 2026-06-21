import { Controller, Get, Query } from '@nestjs/common';
import { PresetService } from './preset.service';

@Controller('presets')
export class PresetController {
  constructor(private readonly presetService: PresetService) {}

  // GET /presets?fuelCode=hev&transCode=at
  @Get()
  findBySpec(
    @Query('fuelCode') fuelCode: string,
    @Query('transCode') transCode?: string,
  ) {
    return this.presetService.findByVehicleSpec(fuelCode, transCode);
  }
}
