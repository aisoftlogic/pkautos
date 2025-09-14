import { NestFactory } from '@nestjs/core';
import { AppModule } from './module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';

(async () => {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  const config = new DocumentBuilder().setTitle('PKAutos API').setVersion('0.1.0').build();
  const doc = SwaggerModule.createDocument(app, config);
  writeFileSync('openapi.json', JSON.stringify(doc, null, 2));
  await app.close();
})();
