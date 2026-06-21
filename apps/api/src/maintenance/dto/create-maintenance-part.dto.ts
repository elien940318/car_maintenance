import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  ValidateIf,
} from 'class-validator';

export class CreateMaintenancePartDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  sub_name?: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsOptional()
  @IsString()
  part_key?: string;

  // interval_km / interval_months XOR (AC-M3)
  // @ValidateIf: is_chain=false 이고 interval_months가 없을 때만 검증
  @ValidateIf((o: CreateMaintenancePartDto) => !o.is_chain && !o.interval_months)
  @IsInt()
  @IsPositive()
  interval_km?: number;

  @ValidateIf((o: CreateMaintenancePartDto) => !o.is_chain && !o.interval_km)
  @IsInt()
  @IsPositive()
  interval_months?: number;

  @IsBoolean()
  is_chain: boolean;

  @IsOptional()
  @IsBoolean()
  is_vehicle_specific?: boolean;

  @IsOptional()
  @IsString()
  tip?: string;

  @IsOptional()
  @IsString()
  svg_key?: string;

  @IsOptional()
  @IsInt()
  sort_order?: number;
}
