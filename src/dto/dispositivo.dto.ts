import { QueryTypes } from "sequelize";
import { rrhh_conn } from "../db/db_RRHH_connection";
import { dispositivo } from "../interfaces/dispositivo.interface";

export class dispositivo_dto {
  iddispositivo: string;

  private constructor(dispositivo: string) {
    this.iddispositivo = dispositivo;
  }

  public static async create(edificio: string): Promise<dispositivo_dto> {
    const dispositivo = await dispositivo_dto.getDispositivo(edificio);
    return new dispositivo_dto(dispositivo);
  }

  private static async getDispositivo(edificio: string): Promise<string> {
    try {
      const qryRta = await rrhh_conn.query<dispositivo>(
        "select IdDispositivo from DispositivosEdificios where idEdificio = :edificio",
        {
          replacements: { edificio: edificio },
          type: QueryTypes.SELECT,
          plain: true,
          raw: true,
        }
      );

      if (!qryRta) {
        return "0"; // Si no se encuentra el dispositivo, retorna 0
      }

      return qryRta?.IdDispositivo;
    } catch (error) {
      const mensajeError =
        error instanceof Error ? error.message : String(error);
      console.error("Error al obtener el dispositivo:", mensajeError);
      return "0"; // Retorna 0 en caso de error
    }
  }
}
