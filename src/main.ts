import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config'; // Importar el servicio

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Obtener el ConfigService
  const configService = app.get(ConfigService);
  const appName = configService.get<string>('APP_NAME') || 'HexaBank';

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  const config = new DocumentBuilder()
    .setTitle('HexaBank Core API')
    .setDescription('Documentación de los servicios financieros de HexaBank')
    .setVersion('1.0')
    .addTag('accounts')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);

  // Log Senior de confirmación
  console.log(`🚀 ${appName} está corriendo en: ${await app.getUrl()}`);
}
void bootstrap();
