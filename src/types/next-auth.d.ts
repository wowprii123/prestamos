import type { DefaultSession } from "next-auth";

// `next-auth/index.d.ts` y `next-auth/jwt.d.ts` en esta versión solo
// re-exportan los tipos de `@auth/core`, así que la fusión de declaraciones
// debe apuntar al paquete original o no tiene efecto (los campos quedan
// tipados como `unknown` por el índice de `Record<string, unknown>`).
declare module "@auth/core/types" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
  }
}
