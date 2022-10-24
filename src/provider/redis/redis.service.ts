import { Injectable, Logger } from '@nestjs/common';
import Redis, { Redis as RedisType } from 'ioredis';
import { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT } from 'src/config';

@Injectable()
export class RedisService {
  private readonly redis: RedisType;
  constructor(private readonly logger: Logger) {
    this.redis = new Redis({
      host: REDIS_HOST,
      password: REDIS_PASSWORD,
      port: Number(REDIS_PORT),
      name: 'test',
    });

    this.redis.on('error', (err: Error) => {
      this.logger.error(
        `Error occurred connecting redis [${err}]`,
        err.stack,
        RedisService.name,
      );
    });

    this.redis.once('connect', () => {
      this.logger.log('Connected to redis', RedisService.name);
    });
  }

  public get instance(): RedisType {
    return this.redis;
  }
}
