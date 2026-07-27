import { renderToBuffer } from "@react-pdf/renderer";
import type { DatosExtracto } from "@/lib/servicios/extractos";
import { ExtractoDocumento } from "./extracto-documento";

export async function generarExtractoPdf(datos: DatosExtracto): Promise<Buffer> {
  return renderToBuffer(<ExtractoDocumento datos={datos} />);
}
