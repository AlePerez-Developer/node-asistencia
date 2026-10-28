import * as crypto from "crypto";
import { env } from "../config/env";
import { unirCampos } from "./_unirCampos";

export function hashHmac(
  idPersona: string,
  dia: string,
  mes: string,
  anio: string,
  hora: string,
  minuto: string,
  segundo: string,
  dispositivo: string,
): string {
  const secretKey = env.biometricoKey;

  const fecha = [dia, mes, anio, hora, minuto, segundo].join("");

  const data = unirCampos(idPersona, fecha, dispositivo);

  return crypto.createHmac("sha256", secretKey).update(data).digest("hex");
}
