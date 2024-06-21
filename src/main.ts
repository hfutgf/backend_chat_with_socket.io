import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.enableCors({
    origin: ['http://localhost:5173'],
    credentials: true,
    exposedHeaders: 'set-cookie',
  });

  app.useGlobalPipes(new ValidationPipe());

  const PORT = process.env.PORT || 7777;

  await app.listen(PORT, () => console.log(`Server started on port: ${PORT}`));
}
bootstrap();
