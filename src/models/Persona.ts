import { QueryTypes } from "sequelize";
import { acad_conn, rab_conn, rrhh_conn } from "../db";

class Persona {
  public idPersona: string;
  public nombreCompleto: string;
  public telefono: string;
  public idSitio: string;
  public tipoFuncionario: string;

  constructor(
    idPersona: string,
    nombreCompleto: string,
    telefonoPersona: string,
    idSitio: string,
    tipoFuncionario: string
  ) {
    this.idPersona = idPersona;
    this.nombreCompleto = nombreCompleto;
    this.telefono = telefonoPersona;
    this.idSitio = idSitio;
    this.tipoFuncionario = tipoFuncionario;
  }

  static async crearPersona(
    idPersona: string,
    dispositivo: string
  ): Promise<Persona> {
    const nombreCompleto = await this.getNombrePersona(idPersona);
    const telefonoPersona = await this.getTelefono(idPersona);
    const idSitio = await this.getIdSitio(dispositivo);
    const tipoFuncionario = await this.getTipoFuncionario(idPersona, idSitio);

    return new Persona(
      idPersona,
      nombreCompleto,
      telefonoPersona,
      idSitio,
      tipoFuncionario
    );
  }

  static async getNombrePersona(idPersona: string): Promise<string> {
    try {
      const qryRta = await rrhh_conn.query(
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

      return JSON.parse(JSON.stringify(qryRta)).nombreCompleto;
    } catch (error) {
      console.error("Error al ejecutar el procedimiento almacenado:", error);
      return "";
    }
    return "";
  }

  static async getTelefono(idPersona: string): Promise<string> {
    try {
      const qryRta = await acad_conn.query(
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

      return "+591" + JSON.parse(JSON.stringify(qryRta)).Celular;
    } catch (error) {
      console.error("Error al ejecutar el procedimiento almacenado:", error);
      return "";
    }
    return "";
  }

  static async getIdSitio(dispositivo: string): Promise<string> {
    try {
      const qryRta = await rrhh_conn.query(
        "select idSitio from DispositivosControlAsistencia where IdDispositivo = :dispositivo",
        {
          replacements: { dispositivo: dispositivo },
          type: QueryTypes.SELECT,
          plain: true,
          raw: true,
        }
      );

      if (!qryRta) {
        return "0";
      }

      return JSON.parse(JSON.stringify(qryRta)).idSitio;
    } catch (error) {
      console.error("Error al ejecutar el procedimiento almacenado:", error);
      return "0";
    }
    return "";
  }

  static async getTipoFuncionario(
    idPersona: string,
    idSitio: string
  ): Promise<string> {
    try {
      const qryRta = await rab_conn.query(
        "select TipoFuncionario from FuncionariosPuntosControl where idpersona = :idpersona and PuntoAutorizado = :idsitio ",
        {
          replacements: { idpersona: idPersona, idsitio: idSitio },
          type: QueryTypes.SELECT,
          plain: true,
          raw: true,
        }
      );

      if (!qryRta) {
        return "DOC";
      }

      return JSON.parse(JSON.stringify(qryRta)).TipoFuncionario;
    } catch (error) {
      console.error("Error al ejecutar el procedimiento almacenado:", error);
      return "DOC";
    }
    return "";
  }
}

export default Persona;
