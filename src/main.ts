import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initFolder } from './utils/uploads/file';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('api');
  initFolder();
  await app.listen(8080);
}
bootstrap();
