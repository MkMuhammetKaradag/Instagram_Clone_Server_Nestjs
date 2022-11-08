import { IoAdapter } from '@nestjs/platform-socket.io';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Server } from 'socket.io';
import sharedsession from 'express-socket.io-session';

import { SESSION_SECRET } from 'src/config';
import { session } from 'src/common/middleware/session.middleware';
import { RedisService } from 'src/provider/redis/redis.service';
import { INestApplication } from '@nestjs/common';

/**
 * Enable session tokens for web sockets by using express-socket.io-session
 */
export class EventsAdapter extends IoAdapter {
  private app: INestApplication;

  constructor(app: INestApplication) {
    super(app);
    this.app = app;
  }

  createIOServer(port: number, options?: any): any {
    const server: Server = super.createIOServer(port, options);
    const redisService = this.app.get(RedisService);
    let adapterSession = session(redisService.instance);

    // this.app.use(adapterSession);
    server.use(
      sharedsession(adapterSession, {
        autoSave: true,
      }),
    );
    return server;
  }
}
