import RegistroRRHH from "../models/RRHH_models/RegistrosRRHH";

export class RegistroRRHHRepository {
  public static async generarRegistroRRHH(
    idPersona: string,
    fechaHora: string,
    tipoFuncionario: string,
    dispositivo: number
  ): Promise<boolean> {
    const existsRRHH = await RegistroRRHH.findOne({
      where: {
        idPersona,
        FechaHora: fechaHora,
        TipoFuncionario: tipoFuncionario,
        IdDispositivo: dispositivo,
      },
    });

    if (!existsRRHH) {
      try {
        const registroRRHH = RegistroRRHH.build({
          idPersona,
          FechaHora: fechaHora,
          TipoFuncionario: tipoFuncionario,
          IdDispositivo: dispositivo,
          enLinea: 1,
        });

        await registroRRHH.validate();
        await registroRRHH.save({ returning: false });
        return true;
      } catch (error) {
        if (
          error instanceof TypeError &&
          error.message.includes("Cannot read properties of undefined")
        ) {
          return true;
        } else {
          console.error(
            "Error al crear el registro RRHH:",
            error instanceof Error ? error.message : String(error)
          );
          return false;
        }
      }
    }
    return false;
  }
}
