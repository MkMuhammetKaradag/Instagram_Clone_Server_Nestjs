import session from 'express-session';
import connectRedis from 'connect-redis';
import { randomUUID } from 'crypto';
import { CookieOptions } from 'express';
import { NODE_ENV, SESSION_SECRET } from 'src/config';
import {
  SESSION_PREFIX,
  COOKIE_NAME,
  COOKIE_EXPIRATION,
} from 'src/config/contants';

const RedisStore = connectRedis(session);

const isProd = NODE_ENV === 'prod';

export const cookieOptions: CookieOptions = {
  sameSite: isProd ? 'none' : 'strict',
  secure: isProd,
  httpOnly: true,
  signed: true,
};

const sessionMiddleware = (redisClient: connectRedis.Client) => {
  return session({
    store: new RedisStore({
      client: redisClient,
      prefix: SESSION_PREFIX,
    }),
    name: COOKIE_NAME,
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    genid: () => randomUUID(),
    cookie: {
      ...cookieOptions,
      maxAge: COOKIE_EXPIRATION,
    },
  });
};

export { sessionMiddleware as session };
