import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { API_VERSION, GLOBAL_PREFIX } from './config/contants';
import { FRONTEND_URL, PORT, SESSION_SECRET } from './config';
import { RedisService } from './provider/redis/redis.service';
import cookieParser from 'cookie-parser';
import { session } from './common/middleware/session.middleware';
import { EventsAdapter } from './utils/EventsAdapter';
import { NestExpressApplication } from '@nestjs/platform-express';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const redisService = app.get(RedisService);
  app.use(session(redisService.instance));
  app.use(cookieParser(SESSION_SECRET));
  app.enableCors({
    origin: FRONTEND_URL || ['http://localhost:3000', '*'],
    credentials: true,
  });
  const config = new DocumentBuilder()
    .setTitle('Instagram_Clone')
    .setDescription('Instagram_Clone rest api documentation.')
    .setVersion(API_VERSION)
    .build();
  const document = SwaggerModule.createDocument(app, config);
  app.useWebSocketAdapter(new EventsAdapter(app));

  SwaggerModule.setup(`${GLOBAL_PREFIX}/docs`, app, document);
  await app.listen(PORT);
}
bootstrap();
