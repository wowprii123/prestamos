import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { authConfig } from "./auth.config";

const esquemaCredenciales = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Correo", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const parsed = esquemaCredenciales.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const usuario = await prisma.usuario.findUnique({ where: { email } });
        if (!usuario || !usuario.activo) return null;

        const passwordValida = await bcrypt.compare(password, usuario.hashPassword);
        if (!passwordValida) return null;

        return {
          id: usuario.id,
          email: usuario.email,
          name: usuario.nombre,
        };
      },
    }),
  ],
});
