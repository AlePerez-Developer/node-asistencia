import { QueryTypes } from "sequelize";
import { acad_conn, rab_conn, rrhh_conn } from "../db";
import { PersonaResponse } from "../dto/persona-response.dto";
import { PhoneResponse } from "../dto/phone-response.dto";
import { TipoFuncionarioResponse } from "../dto/tipo-funcionario-response.dto";

class Persona {
  public idPersona: string;
  public nombreCompleto: string;
  public telefono: string;
  public tipoFuncionario: string;

  constructor(
    idPersona: string,
    nombreCompleto: string,
    telefonoPersona: string,
    tipoFuncionario: string
  ) {
    this.idPersona = idPersona;
    this.nombreCompleto = nombreCompleto;
    this.telefono = telefonoPersona;
    this.tipoFuncionario = tipoFuncionario;
  }

  static async crearPersona(idPersona: string): Promise<Persona> {
    const nombreCompleto = await this.getNombrePersona(idPersona);
    const telefonoPersona = await this.getTelefono(idPersona);
    const tipoFuncionario = await this.getTipoFuncionario(idPersona);

    return new Persona(
      idPersona,
      nombreCompleto,
      telefonoPersona,
      tipoFuncionario
    );
  }

  static async getNombrePersona(idPersona: string): Promise<string> {
    try {
      const qryRta = await rrhh_conn.query<PersonaResponse>(
        "select Ltrim(Rtrim(isnull(Paterno,''))) + ' ' + Ltrim(Rtrim(isnull(Materno,''))) + ' ' + Ltrim(Rtrim(isnull(Nombres, '')))  as nombreCompleto from personas where idpersona = :idpersona",
        {
          replacements: { idpersona: idPersona },
          type: QueryTypes.SELECT,
          plain: true,
          raw: true,
        }
      );
      if (!qryRta) {
        return "";
      }

      return qryRta?.nombreCompleto ?? "";
    } catch (error) {
      console.error(
        "Error al obtener el nombre de la persona:",
        (error as Error).message
      );
      return this.handleError((error as Error).message, "");
    }
  }

  static async getTelefono(idPersona: string): Promise<string> {
    try {
      const qryRta = await acad_conn.query<PhoneResponse>(
        "select LTrim(Rtrim(isnull(Celular,''))) as Celular from usuarios where IdPersona = :idpersona and TieneWhatsApp = 1",
        {
          replacements: { idpersona: idPersona },
          type: QueryTypes.SELECT,
          plain: true,
          raw: true,
        }
      );

      if (!qryRta) {
        return "";
      }
      const celular: string = qryRta?.Celular ?? "";

      return celular ? `+591${celular}` : "";
    } catch (error) {
      console.error("Error al obtener el telefono:", (error as Error).message);
      return this.handleError((error as Error).message, "");
    }
  }

  static async getTipoFuncionario(idPersona: string): Promise<string> {
    try {
      const qryRta = await rrhh_conn.query<TipoFuncionarioResponse>(
        "select CASE WHEN COUNT( distinct CodigoSectorTrabajo) = 1 THEN max(CodigoSectorTrabajo) WHEN COUNT( distinct CodigoSectorTrabajo) =  2 THEN 'DOA' ELSE 'DOC' END as TipoFuncionario from VFuncionarios where IdPersona = :idpersona group by IdPersona",
        {
          replacements: { idpersona: idPersona },
          type: QueryTypes.SELECT,
          plain: true,
          raw: true,
        }
      );

      if (!qryRta) {
        return "DOC";
      }

      return qryRta?.TipoFuncionario ?? "DOC";
    } catch (error) {
      console.error(
        "Error al obtener el tipo de funcionario:",
        (error as Error).message
      );
      return this.handleError((error as Error).message, "DOC");
    }
  }

  private static handleError(error: unknown, defaultValue: string): string {
    console.error("Error:", error);
    return defaultValue;
  }
}

export default Persona;
