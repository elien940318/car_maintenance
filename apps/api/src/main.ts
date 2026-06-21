// .env 파일을 process.env에 먼저 로드 (Spring의 application.yml 역할)
import 'dotenv/config';
import * as path from 'path';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  // pnpm store의 @prisma/client는 SQLite 상대경로를 store 위치 기준으로 해석해 파일을 못 찾음.
  // Prisma.connect() 호출 전에 process.cwd() 기준 절대경로로 변환.
  const dbUrl = process.env.DATABASE_URL ?? '';
  if (dbUrl.startsWith('file:.')) {
    const rel = dbUrl.slice('file:'.length);
    const abs = path.resolve(process.cwd(), rel).replace(/\\/g, '/');
    process.env.DATABASE_URL = `file:${abs}`;
  }
  const app = await NestFactory.create(AppModule);
  // Next.js(3000) → API(3001) 브라우저 cross-origin 요청 허용
  app.enableCors({ origin: 'http://localhost:3000' });
  // Spring의 @Valid + BindingResult 역할: DTO class-validator 데코레이터를 전역 활성화
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
