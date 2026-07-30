import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Las fotos se comprimen a JPEG en el navegador antes de subirse
      // (ver comprimir-imagen.ts), así que llegan como un campo de texto
      // pequeño; este margen es solo por si el navegador comprime peor de
      // lo esperado en alguna imagen.
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
