// .env 파일을 process.env에 먼저 로드 (Spring의 application.yml 역할)
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Spring의 @Valid + BindingResult 역할: DTO class-validator 데코레이터를 전역 활성화
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
