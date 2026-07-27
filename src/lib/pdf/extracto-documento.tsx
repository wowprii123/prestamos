import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { DatosExtracto } from "@/lib/servicios/extractos";
import {
  formatearEstadoCuota,
  formatearEstadoPrestamo,
  formatearFecha,
  formatearMoneda,
  formatearPeriodo,
} from "@/lib/formato";

const estilos = StyleSheet.create({
  pagina: { padding: 32, fontSize: 10, fontFamily: "Helvetica", color: "#0f172a" },
  titulo: { fontSize: 16, fontWeight: 700, marginBottom: 2 },
  subtitulo: { fontSize: 10, color: "#64748b", marginBottom: 16 },
  seccion: { marginBottom: 16 },
  seccionTitulo: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 8,
    borderBottom: "1px solid #e2e8f0",
    paddingBottom: 4,
  },
  filaCampos: { flexDirection: "row", flexWrap: "wrap", marginBottom: 12 },
  campo: { width: "25%", marginBottom: 8 },
  campoEtiqueta: { fontSize: 8, color: "#64748b", textTransform: "uppercase" },
  campoValor: { fontSize: 10, fontWeight: 700, marginTop: 2 },
  tabla: { display: "flex", width: "auto" },
  filaTabla: { flexDirection: "row", borderBottom: "1px solid #e2e8f0", paddingVertical: 4 },
  encabezadoTabla: {
    flexDirection: "row",
    borderBottom: "1px solid #0f172a",
    paddingBottom: 4,
    marginBottom: 2,
  },
  celda: { flex: 1, fontSize: 9 },
  celdaEncabezado: { flex: 1, fontSize: 8, color: "#64748b", textTransform: "uppercase" },
  celdaDerecha: { textAlign: "right" },
  resumenFinal: {
    marginTop: 16,
    paddingTop: 8,
    borderTop: "1px solid #0f172a",
    flexDirection: "row",
    justifyContent: "flex-end",
  },
});

export function ExtractoDocumento({ datos }: { datos: DatosExtracto }) {
  const { tipo, periodoInicio, periodoFin, prestamo, cuotas, pagos, saldoPendiente } = datos;

  return (
    <Document>
      <Page size="A4" style={estilos.pagina}>
        <Text style={estilos.titulo}>
          Extracto {tipo === "mensual" ? "mensual" : "acumulado"}
        </Text>
        <Text style={estilos.subtitulo}>
          Período: {formatearFecha(periodoInicio)} – {formatearFecha(periodoFin)}
        </Text>

        <View style={estilos.seccion}>
          <Text style={estilos.seccionTitulo}>Cliente</Text>
          <View style={estilos.filaCampos}>
            <Campo etiqueta="Nombre" valor={prestamo.cliente.nombre} />
            <Campo etiqueta="Correo" valor={prestamo.cliente.email} />
            {prestamo.cliente.telefono && (
              <Campo etiqueta="Teléfono" valor={prestamo.cliente.telefono} />
            )}
          </View>
        </View>

        <View style={estilos.seccion}>
          <Text style={estilos.seccionTitulo}>Préstamo</Text>
          <View style={estilos.filaCampos}>
            <Campo etiqueta="Monto" valor={formatearMoneda(prestamo.monto.toString())} />
            <Campo etiqueta="Tasa mensual" valor={`${prestamo.tasaMensual.toString()}%`} />
            <Campo etiqueta="Período de pago" valor={formatearPeriodo(prestamo.periodo)} />
            <Campo etiqueta="N° de cuotas" valor={String(prestamo.numeroCuotas)} />
            <Campo
              etiqueta="Valor de cuota"
              valor={formatearMoneda(prestamo.valorCuota.toString())}
            />
            <Campo
              etiqueta="Desembolso"
              valor={formatearFecha(prestamo.fechaDesembolso)}
            />
            <Campo etiqueta="Estado" valor={formatearEstadoPrestamo(prestamo.estado)} />
          </View>
        </View>

        <View style={estilos.seccion}>
          <Text style={estilos.seccionTitulo}>
            Cuotas {tipo === "mensual" ? "del período" : ""}
          </Text>
          <View style={estilos.tabla}>
            <View style={estilos.encabezadoTabla}>
              <Text style={estilos.celdaEncabezado}>#</Text>
              <Text style={estilos.celdaEncabezado}>Vencimiento</Text>
              <Text style={[estilos.celdaEncabezado, estilos.celdaDerecha]}>Cuota</Text>
              <Text style={[estilos.celdaEncabezado, estilos.celdaDerecha]}>Pagado</Text>
              <Text style={estilos.celdaEncabezado}>Estado</Text>
            </View>
            {cuotas.length === 0 ? (
              <Text style={{ fontSize: 9, color: "#64748b", marginTop: 4 }}>
                Sin cuotas en este período.
              </Text>
            ) : (
              cuotas.map((cuota) => (
                <View style={estilos.filaTabla} key={cuota.id}>
                  <Text style={estilos.celda}>{cuota.numero}</Text>
                  <Text style={estilos.celda}>{formatearFecha(cuota.fechaVencimiento)}</Text>
                  <Text style={[estilos.celda, estilos.celdaDerecha]}>
                    {formatearMoneda(cuota.valorCuota.toString())}
                  </Text>
                  <Text style={[estilos.celda, estilos.celdaDerecha]}>
                    {formatearMoneda(cuota.montoPagado.toString())}
                  </Text>
                  <Text style={estilos.celda}>{formatearEstadoCuota(cuota.estado)}</Text>
                </View>
              ))
            )}
          </View>
        </View>

        <View style={estilos.seccion}>
          <Text style={estilos.seccionTitulo}>
            Pagos {tipo === "mensual" ? "del período" : ""}
          </Text>
          <View style={estilos.tabla}>
            <View style={estilos.encabezadoTabla}>
              <Text style={estilos.celdaEncabezado}>Fecha</Text>
              <Text style={[estilos.celdaEncabezado, estilos.celdaDerecha]}>Monto</Text>
              <Text style={estilos.celdaEncabezado}>Tipo</Text>
              <Text style={estilos.celdaEncabezado}>Aplicado a</Text>
            </View>
            {pagos.length === 0 ? (
              <Text style={{ fontSize: 9, color: "#64748b", marginTop: 4 }}>
                Sin pagos en este período.
              </Text>
            ) : (
              pagos.map((pago) => (
                <View style={estilos.filaTabla} key={pago.id}>
                  <Text style={estilos.celda}>{formatearFecha(pago.fecha)}</Text>
                  <Text style={[estilos.celda, estilos.celdaDerecha]}>
                    {formatearMoneda(pago.monto.toString())}
                  </Text>
                  <Text style={estilos.celda}>
                    {pago.tipo === "recomendado" ? "Recomendado" : "Libre"}
                  </Text>
                  <Text style={estilos.celda}>
                    {pago.aplicaciones
                      .map((aplicacion) => `Cuota #${aplicacion.cuota.numero}`)
                      .join(", ")}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>

        <View style={estilos.resumenFinal}>
          <Text style={{ fontSize: 11, fontWeight: 700 }}>
            Saldo pendiente actual: {formatearMoneda(saldoPendiente)}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

function Campo({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <View style={estilos.campo}>
      <Text style={estilos.campoEtiqueta}>{etiqueta}</Text>
      <Text style={estilos.campoValor}>{valor}</Text>
    </View>
  );
}
