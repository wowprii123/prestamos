const TAMANO_MAXIMO_BYTES = 2 * 1024 * 1024; // 2MB

/** Convierte un archivo subido (File de FormData) a un data URL base64 para guardarlo directo en la base de datos. */
export async function archivoADataUrl(archivo: File): Promise<string> {
  if (archivo.size > TAMANO_MAXIMO_BYTES) {
    throw new Error("La foto no puede pesar más de 2MB");
  }

  const buffer = Buffer.from(await archivo.arrayBuffer());
  return `data:${archivo.type};base64,${buffer.toString("base64")}`;
}
