"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export async function iniciarSesion(
  _estadoPrevio: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return "Correo o contraseña incorrectos";
    }
    throw error;
  }
}
