// @Module() = Spring의 @SpringBootApplication 역할:
// 애플리케이션 최상위 모듈. 모든 하위 모듈을 imports[]에 등록한다.
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { PresetModule } from './preset/preset.module';
import { PrismaModule } from './prisma/prisma.module';
import { VehicleModule } from './vehicle/vehicle.module';

@Module({
  imports: [
    PrismaModule,       // DB 접근 전역 모듈 (@Global 선언으로 하위 모듈에 자동 주입)
    VehicleModule,      // 차량 CRUD (GET/POST/PATCH /vehicle)
    PresetModule,       // 프리셋 조회 (GET /presets)
    MaintenanceModule,  // 정비 항목·교환 기록 (GET/POST/PATCH /vehicles/:id/parts)
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
