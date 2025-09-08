import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { ApplicationsService } from './applications/applications.service';

async function bootstrap() {
  const httpsOptions = {
    key: fs.readFileSync('./ssl/key.pem'),
    cert: fs.readFileSync('./ssl/cert.pem'),
  };

  const app = await NestFactory.create(AppModule, 
    // { httpsOptions}
  );

  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));

  const appService = app.get(ApplicationsService);
  const apps = await appService.findAll();

  app.enableCors({
    origin: apps.map(a => a.redirectUrl),
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');

  const config = new DocumentBuilder()
    .setTitle('SSO API')
    .setDescription('API de autenticación con roles y permisos')
    .setVersion('1.0')
    .addCookieAuth('access_token')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, { swaggerOptions: { withCredentials: true } });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Servidor corriendo en: https://localhost:${port}`);
  console.log(`📖 Swagger en: https://localhost:${port}/api`);
}
bootstrap();
