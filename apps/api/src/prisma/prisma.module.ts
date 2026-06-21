// @Global() = 이 모듈을 한 번만 imports[]에 넣으면 전체 앱에서 PrismaService를 주입받을 수 있다.
// Spring의 @Configuration + @Bean 전역 등록과 유사한 개념.
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // 다른 모듈에서 PrismaService를 imports 없이 사용 가능
})
export class PrismaModule {}
