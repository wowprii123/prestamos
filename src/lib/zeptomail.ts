export interface DestinatarioCorreo {
  email: string;
  nombre?: string;
}

export interface AdjuntoCorreo {
  nombreArchivo: string;
  contenido: Buffer;
  mimeType: string;
}

export interface EnviarCorreoInput {
  destinatario: DestinatarioCorreo;
  asunto: string;
  htmlBody: string;
  adjunto: AdjuntoCorreo;
}

export interface RespuestaZeptoMail {
  [clave: string]: unknown;
}

/**
 * Envía un correo con adjunto vía la API HTTP de ZeptoMail.
 * Requiere ZEPTOMAIL_TOKEN y ZEPTOMAIL_FROM_EMAIL en el entorno.
 * Ref: https://www.zoho.com/zeptomail/help/api/email-sending.html
 */
export async function enviarCorreoZeptoMail(
  input: EnviarCorreoInput,
): Promise<RespuestaZeptoMail> {
  const token = process.env.ZEPTOMAIL_TOKEN;
  const fromEmail = process.env.ZEPTOMAIL_FROM_EMAIL;
  const fromName = process.env.ZEPTOMAIL_FROM_NAME ?? "Prestamos";

  if (!token) throw new Error("ZEPTOMAIL_TOKEN no está configurado");
  if (!fromEmail) throw new Error("ZEPTOMAIL_FROM_EMAIL no está configurado");

  const respuesta = await fetch("https://api.zeptomail.com/v1.1/email", {
    method: "POST",
    headers: {
      Authorization: `Zoho-enczapikey ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: { address: fromEmail, name: fromName },
      to: [
        {
          email_address: {
            address: input.destinatario.email,
            name: input.destinatario.nombre,
          },
        },
      ],
      subject: input.asunto,
      htmlbody: input.htmlBody,
      attachments: [
        {
          content: input.adjunto.contenido.toString("base64"),
          mime_type: input.adjunto.mimeType,
          name: input.adjunto.nombreArchivo,
        },
      ],
    }),
  });

  const cuerpo: RespuestaZeptoMail = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok) {
    throw new Error(`ZeptoMail respondió ${respuesta.status}: ${JSON.stringify(cuerpo)}`);
  }

  return cuerpo;
}
