/**
 * Redimensiona y recodifica una imagen a JPEG en el navegador antes de
 * subirla. Resuelve dos problemas de una vez:
 *  - Fotos HEIC (formato por defecto de la cámara del iPhone) no se
 *    muestran en <img> en la mayoría de navegadores/dispositivos; al pasar
 *    por canvas siempre queda en JPEG, que se ve en todas partes.
 *  - Las fotos de cámara pesan varios MB; esto las deja en unos cientos de
 *    KB antes de guardarlas como base64 en la base de datos.
 */
export async function comprimirImagenADataUrl(
  archivo: File,
  opciones: { dimensionMaxima?: number; calidad?: number } = {},
): Promise<string> {
  const { dimensionMaxima = 1024, calidad = 0.8 } = opciones;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(archivo);
  } catch {
    throw new Error(
      "No se pudo procesar esta foto. Prueba con otra imagen (JPG o PNG).",
    );
  }

  const escala = Math.min(1, dimensionMaxima / Math.max(bitmap.width, bitmap.height));
  const ancho = Math.max(1, Math.round(bitmap.width * escala));
  const alto = Math.max(1, Math.round(bitmap.height * escala));

  const canvas = document.createElement("canvas");
  canvas.width = ancho;
  canvas.height = alto;
  const contexto = canvas.getContext("2d");
  if (!contexto) throw new Error("Este navegador no puede procesar imágenes.");

  contexto.drawImage(bitmap, 0, 0, ancho, alto);
  bitmap.close();

  return canvas.toDataURL("image/jpeg", calidad);
}
