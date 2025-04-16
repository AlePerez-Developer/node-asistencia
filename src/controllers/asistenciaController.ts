import { Request, Response } from "express";

import { QueryTypes } from "sequelize";
import mensajeria from "../libs/mensajeria";
import Persona from "../models/Persona";
import parseFechas from "../libs/parseFechas";
import Registro from "../models/RRHH_models/Registro";
import { rab_conn, rrhh_conn } from "../db";
import { exit } from "process";
import { string } from "zod";

interface PostData {
  aplicacion: string;
  telefono: string;
  mensaje: string;
  codigoMensaje: string;
}

type ProcesadoDTO = {
  Procesado: number;
  IdPersona: string;
  TipoRegistro: string;
  NombreCompleto: string;
  NombreEdificio: string;
  HoraSellado: string;
  SiglaMateria: string;
  Grupo: string;
  TipoGrupoMateria: string;
  Cm: string;
};

class asistenciaController {
  static test = async (req: Request, res: Response): Promise<void> => {};

  static getStatus = async (req: Request, res: Response) => {
    const { fechahora } = req.body;
    const { body } = req;
    const persona = await Persona.crearPersona("5493446", "88");
    console.log("final", persona);

    const fecha = parseFechas.parseFechaHora(fechahora);

    if (!fecha) {
      res.status(400).json({
        msg: "Error en el formato de fecha",
      });
      exit();
    }

    const registro = Registro.build(body);
    registro.idPersona = persona.idPersona;
    registro.FechaHora =
      fecha?.anio +
      "-" +
      fecha?.mes +
      "-" +
      fecha?.dia +
      " " +
      fecha?.hora +
      ":" +
      fecha?.minutos +
      ":" +
      fecha?.segundos;
    registro.TipoFuncionario = persona.tipoFuncionario;
    registro.IdDispositivo = 88;
    registro.EnLinea = 1;
    registro.CodigoProcesado = "";

    await registro
      .validate()
      .then(async () => {
        await registro.save();
        return res.status(200).json({
          msg: `La cama ${registro.id} se agrego correctamente`,
        });
      })
      .catch((error) => {
        return res.status(400).json({
          msg: error.message,
        });
      });

    const nuevoId = (registro as Registro).id;
    console.log("nuevoId", nuevoId);
    res.status(200).json({
      msg: "ok",
    });
  };

  static registerEventGEO = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const { idpersona, fechahora, idedificio } = req.body;
    let dispositivo = "";

    try {
      const qryRta = await rab_conn.query(
        "select IdDispositivo from Dispositivos where idEdificio = :edificio and Estado = 'V'",
        {
          replacements: { edificio: idedificio },
          type: QueryTypes.SELECT,
          plain: true,
          raw: true,
        }
      );

      if (!qryRta) {
        return void res.status(404).json({
          msg: "El edificio no tiene dispositivos habilitados",
        });
      }

      dispositivo = JSON.parse(JSON.stringify(qryRta)).IdDispositivo;
    } catch (error) {
      console.error("Error al obtener idedificio:", error);
      return void res.status(404).json({
        msg: error,
      });
    }

    const persona = await Persona.crearPersona(idpersona.trim(), dispositivo);
    const fecha = parseFechas.parseFechaHora(fechahora);

    try {
      const qryProcesarAsistencia = await rrhh_conn.query(
        `SET LANGUAGE spanish; 
       insert into registros values (:idPersona, :fechaHora, :tipoFuncionario, :idDispositivo, :enLinea); 
       `,
        {
          replacements: {
            idPersona: persona.idPersona,
            fechaHora: fechahora,
            tipoFuncionario: persona.tipoFuncionario,
            idDispositivo: dispositivo,
            enLinea: "1",
          },
          type: QueryTypes.RAW,
        }
      );
    } catch (error) {
      console.error("Error al registrar el registro:", error);
      return void res.status(404).json({
        msg: error,
      });
    }

    return void res.status(404).json({
      msg: "acceso correcto",
    });
  };

  static registerEventBIO = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const { idpersona, fechahora, dispositivo } = req.body;
    const { body } = req;

    const persona = await Persona.crearPersona(idpersona.trim(), dispositivo);
    const fecha = parseFechas.parseFechaHora(fechahora);

    const registro = Registro.build(body);
    registro.idPersona = persona.idPersona;
    registro.FechaHora =
      fecha?.anio +
      "-" +
      fecha?.mes +
      "-" +
      fecha?.dia +
      " " +
      fecha?.hora +
      ":" +
      fecha?.minutos +
      ":" +
      fecha?.segundos;
    registro.TipoFuncionario = persona.tipoFuncionario;
    registro.IdDispositivo = dispositivo;
    registro.EnLinea = 1;
    registro.CodigoProcesado = "";

    await registro
      .validate()
      .then(async () => {
        await registro.save();
      })
      .catch((error) => {
        return res.status(400).json({
          msg: error.message,
        });
      });

    try {
      const result = await rrhh_conn.query<ProcesadoDTO>(
        `SET LANGUAGE spanish; 
       EXECUTE procesarAsistenciaLyli @idpersona = :idpersona, @horaSellado = :fechahora, @iddispositivo = :dispositivo, @idregistro = :idregisto, @mostrarMensaje = :mostrarMensaje;`,
        {
          replacements: {
            idpersona: persona.idPersona,
            fechahora: fechahora,
            dispositivo: dispositivo,
            idregisto: registro.id,
            mostrarMensaje: 1,
          },
          type: QueryTypes.SELECT,
          plain: true,
          raw: true,
        }
      );

      if (!result) {
        console.log("error procesado de datos");
        return void res.status(400).json({ msg: "error procesado de datos" });
      }

      const msgText = `Estimado(a) ${result.NombreCompleto}\n 
                       Se registró su ${result.TipoRegistro}\n 
                       En: ${result.NombreEdificio}\n 
                       En fecha: ${result.HoraSellado}\n 
                       Materia: ${result.SiglaMateria} (${result.Grupo}) ${result.TipoGrupoMateria}\n 
                       cm: ${result.Cm}`;

      const mensaje = new mensajeria("+59176128920", msgText);

      if (result.Procesado) {
        //mensaje.enviarMensaje();
        console.log("mensaje enviado");
      }

      return void res.status(200).json({
        msg: "procesado correcto",
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json({
          msg: error.message,
        });
        console.error("Error ejecutando SP:", error.message);
        console.error("Stack trace:", error.stack);
      } else {
        console.error("Error inesperado:", error);
      }
    }
  };
}

export default asistenciaController;
