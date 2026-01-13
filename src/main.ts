import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from 'src/common/filters/exception.filters';
import { ResponseTransformInterceptor } from 'src/common/interceptors/response.interceptors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS (cho FE / mobile)
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  // Global validation (DTO)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip field không có trong DTO
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global Exception Filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global Response Interceptor
  app.useGlobalInterceptors(new ResponseTransformInterceptor());

  app.setGlobalPrefix('api');

  await app.listen(3000);
}
bootstrap();
