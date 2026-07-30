import type { NextAuthConfig } from "next-auth";

/**
 * Configuración segura para el runtime Edge del middleware: no importa
 * Prisma ni bcrypt (dependen de módulos de Node no soportados en Edge).
 * `auth.ts` extiende esta configuración añadiendo el provider de credenciales.
 *
 * Los callbacks jwt/session viven aquí (no en auth.ts) porque el middleware
 * construye su propia instancia de NextAuth a partir de este archivo. Si
 * `id` solo se copiara al token/sesión en auth.ts, el middleware jamás lo
 * vería y el callback `authorized` rechazaría a todos los usuarios sin
 * importar sus credenciales.
 */
export const authConfig = {
  trustHost: true,
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const estaAutenticado = !!auth?.user;
      const esRutaAdmin = nextUrl.pathname.startsWith("/admin");

      if (esRutaAdmin && !estaAutenticado) return false;

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      return session;
    },
  },
} satisfies NextAuthConfig;
