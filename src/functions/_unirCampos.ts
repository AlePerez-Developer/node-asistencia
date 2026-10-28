export function unirCampos(
  idPersona: string,
  fecha: string,
  dispositivo: string,
): string {
  return [idPersona, fecha, dispositivo].join(":");
}
