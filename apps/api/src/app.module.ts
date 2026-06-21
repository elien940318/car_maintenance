// @Module() = Spring의 @SpringBootApplication 역할:
// 애플리케이션 최상위 모듈. 모든 하위 모듈을 imports[]에 등록한다.
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    PrismaModule, // DB 접근 전역 모듈 (@Global 선언으로 하위 모듈에 자동 주입)
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
