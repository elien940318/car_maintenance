// Spring의 @Repository / JPA EntityManager 역할:
// PrismaClient를 @Injectable()로 감싸서 NestJS DI 컨테이너에 등록한다.
// 다른 Service에서 constructor(private prisma: PrismaService)로 주입받아 사용.
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  // 모듈 초기화 시점에 DB 연결 (Spring의 @PostConstruct 역할)
  async onModuleInit() {
    await this.$connect();
  }
}
