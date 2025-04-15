type FechaHora = {
  dia: number;
  mes: number;
  anio: number;
  hora: number;
  minutos: number;
  segundos: number;
};

class parseFechas {
  static parseFechaHora(fechaStr: string): FechaHora | null {
    try {
      const [fecha, hora] = fechaStr.trim().split(" ");
      if (!fecha || !hora) return null;

      const [dia, mes, anio] = fecha.split("/").map(Number);
      const [horaStr, minutos, segundos] = hora.split(":").map(Number);

      if (
        [dia, mes, anio, horaStr, minutos, segundos].some(
          (val) => isNaN(val) || val === undefined
        )
      ) {
        return null;
      }

      return {
        dia,
        mes,
        anio,
        hora: horaStr,
        minutos,
        segundos,
      };
    } catch {
      return null;
    }
  }
}

export default parseFechas;
