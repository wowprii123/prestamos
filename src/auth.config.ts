import type { NextAuthConfig } from "next-auth";

/**
 * Configuración segura para el runtime Edge del middleware: no importa
 * Prisma ni bcrypt (dependen de módulos de Node no soportados en Edge).
 * `auth.ts` extiende esta configuración añadiendo el provider de credenciales.
 *
 * Los callbacks jwt/session viven aquí (no en auth.ts) porque el middleware
 * construye su propia instancia de NextAuth a partir de este archivo. Si
 * `rol`/`id` solo se copiaran al token/sesión en auth.ts, el middleware
 * jamás los vería y el callback `authorized` rechazaría a todos los usuarios
 * sin importar sus credenciales.
 */
export const authConfig = {
  trustHost: true,
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const estaAutenticado = !!auth?.user;
      const rol = auth?.user?.rol;

      const esRutaAdmin = nextUrl.pathname.startsWith("/admin");
      const esRutaCliente = nextUrl.pathname.startsWith("/cliente");

      if (!estaAutenticado && (esRutaAdmin || esRutaCliente)) return false;
      if (esRutaAdmin && rol !== "admin") return false;
      if (esRutaCliente && rol !== "cliente") return false;

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.rol = user.rol;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.rol = token.rol;
      return session;
    },
  },
} satisfies NextAuthConfig;
