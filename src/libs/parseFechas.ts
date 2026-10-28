type FechaHora = {
  dia: number;
  mes: number;
  anio: number;
  hora: number;
  minutos: number;
  segundos: number;
};

type FechaHoraStr = {
  dia: string;
  mes: string;
  anio: string;
  hora: string;
  minutos: string;
  segundos: string;
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
          (val) => isNaN(val) || val === undefined,
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

  static parseFechaHoraStr(fechaStr: string): FechaHoraStr | null {
    try {
      if (!fechaStr) return null;
      const partes = fechaStr.trim().split(" ");
      if (partes.length !== 2) return null; // Validación preventiva

      const [fechaParte, horaParte] = partes;
      const fechaArr = fechaParte.split("/");
      const horaArr = horaParte.split(":");

      // Validamos que tenga exactamente 3 partes cada uno (dia/mes/anio y hh:mm:ss)
      if (fechaArr.length !== 3 || horaArr.length !== 3) {
        return null;
      }

      const [dia, mes, anio] = fechaArr;
      const [hora, minutos, segundos] = horaArr;

      return {
        dia,
        mes,
        anio,
        hora,
        minutos,
        segundos,
      };
    } catch {
      return null;
    }
  }
}

export default parseFechas;
