// 교환완료 기록 DTO (AC-M12, M13)
// record_km, record_date 둘 다 optional이나 하나 이상 필수 → 서비스 레이어에서 검증
import { IsDateString, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class RecordCompletionDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  record_km?: number;

  @IsOptional()
  @IsDateString()
  record_date?: string;

  @IsOptional()
  @IsString()
  memo?: string;
}
