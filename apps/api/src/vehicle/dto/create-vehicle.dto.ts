// Spring의 @RequestBody DTO + Bean Validation 역할
// class-validator 데코레이터가 ValidationPipe와 함께 자동 유효성 검사
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  model_name?: string;

  @IsOptional()
  @IsString()
  license_plate?: string;

  @IsOptional()
  @IsString()
  manufacturer_code?: string;

  @IsOptional()
  @IsInt()
  model_year?: number;

  @IsString()
  @IsNotEmpty()
  vehicle_type_code: string;

  @IsString()
  @IsNotEmpty()
  fuel_type_code: string;

  @IsString()
  @IsNotEmpty()
  transmission_code: string;

  @IsInt()
  @Min(0)
  current_km: number;

  // monthly_km은 서비스 레이어에서 annual_km / 12 로 자동 계산 — 직접 입력 불가
  @IsInt()
  @Min(1)
  annual_km: number;

  @IsDateString()
  reference_date: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
