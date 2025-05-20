import RegistroRAB from "../models/RAB_models/Registro";

export class RegistroRABRepository {
  public static async generarRegistroRAB(
    idPersona: string,
    fechaHora: string,
    tipoFuncionario: string,
    dispositivo: number
  ): Promise<boolean> {
    const existsRAB = await RegistroRAB.findOne({
      where: {
        idPersona,
        FechaHora: fechaHora,
        TipoFuncionario: tipoFuncionario,
        IdDispositivo: dispositivo,
      },
    });

    if (!existsRAB) {
      try {
        const registroRAB = RegistroRAB.build({
          idPersona,
          FechaHora: fechaHora,
          TipoFuncionario: tipoFuncionario,
          IdDispositivo: dispositivo,
          enLinea: 1,
        });

        await registroRAB.validate();
        await registroRAB.save();
        return true;
      } catch (error) {
        console.error(
          "Error al crear el registro RAB:",
          error instanceof Error ? error.message : String(error)
        );
        return false;
      }
    }
    return false;
  }
}
