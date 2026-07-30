import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Debe ser al menos el límite de archivo-a-data-url.ts (8MB) para que
      // las fotos de cámara de celular no se rechacen antes de llegar ahí.
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;
