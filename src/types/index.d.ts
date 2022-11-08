declare module 'express-session' {
  export interface Session {
    context: {
      id: string;
      email: string;
      userProfilePicture: string;
      userNickName: string;
    };
  }
}
// declare module 'socket.io' {
// export interface Handshake {
//   session: {
//     context: {
//       id: string;
//       email: string;
//       userProfilePicture: string;
//       userNickName: string;
//     };
//   };
// }
// }
declare module 'socket.io' {
  interface Handshake {
    session: {
      context: {
        id: string;
        email: string;
        userProfilePicture: string;
        userNickName: string;
      };
    };
  }
}
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MONGO_URI: string;
      PORT: string;
      NODE_ENV: string;
      SESSION_SECRET: string;
      REDIS_HOST: string;
      REDIS_PASSWORD: string;
      REDIS_PORT: string;
      FRONTEND_URL: string;
    }
  }
}

interface CookieOptions {
  sameSite: boolean | 'none' | 'strict' | 'lax' | undefined;
  secure: boolean;
  httpOnly: boolean;
  signed: boolean;
}

export {};
