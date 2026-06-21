// PartialType: Spring의 @JsonProperty(required=false) 전체 적용과 동일
// CreateVehicleDto의 모든 필드를 optional로 변환
import { PartialType } from '@nestjs/mapped-types';
import { CreateVehicleDto } from './create-vehicle.dto';

export class UpdateVehicleDto extends PartialType(CreateVehicleDto) {}
