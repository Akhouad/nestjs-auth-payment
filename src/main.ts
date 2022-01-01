import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('v1');
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.use(cookieParser());
  await app.listen(3000);
}
bootstrap();
