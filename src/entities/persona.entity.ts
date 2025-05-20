import { QueryTypes } from "sequelize";
import { acad_conn, rab_conn, rrhh_conn } from "../db";

import PersonaRAB from "../models/RRHH_models/PersonaRAB";

import { nombreCompleto } from "../interfaces/nombreCompleto.interface";
import { tipoFuncionario } from "../interfaces/tipoFuncionario.interface";
import { telefono } from "../interfaces/telefono.interface";

class Persona {
  public idPersona: string;
  public idPersonaRRHH: string;
  public nombreCompleto: string;
  public telefono: string;
  public tipoFuncionario: string;

  private constructor(
    idPersona: string,
    idPersonaRRHH: string,
    nombreCompleto: string,
    telefonoPersona: string,
    tipoFuncionario: string
  ) {
    this.idPersona = idPersona;
    this.idPersonaRRHH = idPersonaRRHH;
    this.nombreCompleto = nombreCompleto;
    this.telefono = telefonoPersona;
    this.tipoFuncionario = tipoFuncionario;
  }

  static async crearPersona(idPersona: string): Promise<Persona> {
    const idPersonaRRHH = await this.getIdPersonaRRHH(idPersona);
    const nombreCompleto = await this.getNombrePersona(idPersonaRRHH);
    const telefonoPersona = await this.getTelefono(idPersonaRRHH);
    const tipoFuncionario = await this.getTipoFuncionario(idPersonaRRHH);

    return new Persona(
      idPersona,
      idPersonaRRHH,
      nombreCompleto,
      telefonoPersona,
      tipoFuncionario
    );
  }

  static async getIdPersonaRRHH(idPersona: string): Promise<string> {
    try {
      const personaRAB = await PersonaRAB.findOne({
        where: {
          idPersonaRAB: idPersona,
        },
      });

      return personaRAB?.IdPersona.trim() ?? idPersona;
    } catch (error) {
      console.error(
        "Error al obtener el idPersona de recursos humanos de la persona:",
        (error as Error).message
      );
      return this.handleError((error as Error).message, "");
    }
  }

  static async getNombrePersona(idPersona: string): Promise<string> {
    try {
      const qryRta = await rrhh_conn.query<nombreCompleto>(
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
      const qryRta = await acad_conn.query<telefono>(
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
      const qryRta = await rrhh_conn.query<tipoFuncionario>(
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
