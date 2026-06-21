// Spring의 @SpringBootApplication 하위 도메인 모듈
// PrismaModule이 @Global()이므로 별도 import 없이 PrismaService 주입 가능
import { Module } from '@nestjs/common';
import { VehicleController } from './vehicle.controller';
import { VehicleService } from './vehicle.service';

@Module({
  controllers: [VehicleController],
  providers: [VehicleService],
  exports: [VehicleService],
})
export class VehicleModule {}
