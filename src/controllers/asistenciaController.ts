import { Request, Response } from "express";

import { QueryTypes } from "sequelize";
import mensajeria from "../libs/mensajeria";
import Persona from "../models/Persona";
import Testing from "../models/RRHH_models/Registro";

import dayjs from "dayjs";
import parseFechas from "../libs/parseFechas";
import Registro from "../models/RRHH_models/Registro";

interface PostData {
  aplicacion: string;
  telefono: string;
  mensaje: string;
  codigoMensaje: string;
}

class asistenciaController {
  static test = async (req: Request, res: Response) => {
    const { fechahora } = req.body;
    const persona = await Persona.crearPersona("5493446", "88");
    console.log("final", persona);

    const fecha = parseFechas.parseFechaHora(fechahora);

    //const [fecha, hora] = fechahora.split(" "); // fecha = "14/04/2025", hora = "16:30:45"

    //Separar los componentes de la fecha
    //const [dia, mes, anio] = fecha.split("/");
    if (!fecha) {
      return res.status(400).json({
        msg: "Error en el formato de fecha",
      });
    }

    const registro = await Registro.create({
      idPersona: persona.idPersona,
      FechaHora:
        fecha.mes +
        "/" +
        fecha.dia +
        "/" +
        fecha.anio +
        " " +
        fecha.hora +
        ":" +
        fecha.minutos +
        ":" +
        fecha.segundos,
      TipoFuncionario: persona.tipoFuncionario,
      IdDispositivo: 88,
      EnLinea: 1,
      CodigoProcesado: "",
    }).catch((error) => {
      console.log(error);
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

  static getStatus = async (req: Request, res: Response) => {};

  static registerEventGEO = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const { idpersona, fechahora, idedificio } = req.body;
    //let iddispositivo: string = "0";

    console.log(req.body);

    /*try {
      const qryRta = await dbConnections.conexionRAB.query(
        "select IdDispositivo from Dispositivos where idEdificio = :edificio and Estado = 'V'",
        {
          replacements: { edificio: idedificio },
          type: QueryTypes.SELECT,
          plain: true,
          raw: true,
        }
      );

      if (!qryRta) {
        res.status(404).json({
          msg: "El edificio no tiene dispositivos habilitados",
        });
      }

      iddispositivo = JSON.parse(JSON.stringify(qryRta)).IdDispositivo;
    } catch (error) {
      console.error("Error al ejecutar el procedimiento almacenado:", error);
      res.status(404).json({
        msg: error,
      });
    }*/

    //const persona = await Persona.crearPersona(idpersona.trim(), iddispositivo);

    /*try {
      const qryGenerarPlanillas = await dbConnections.conexionRRHH.query(
        `SET LANGUAGE spanish;
        exec GenerarPlantillaDeControlAsistencia @idPersona = :idpersona, @Fecha = :fecha;`,
        {
          replacements: { idpersona: idpersona, fecha: fechahora },
          type: QueryTypes.RAW,
        }
      );
    } catch (error) {
      console.error("Error al ejecutar el procedimiento almacenado:", error);
      res.status(404).json({
        msg: error,
      });
    }

    try {
      const qryProcesarAsistencia = await dbConnections.conexionRRHH.query(
        `SET LANGUAGE spanish; 
       EXECUTE ProcesarAsistencia @idPersona = :idpersona, @fechaHora = :fechahora, @tipoFuncionario = :tipofuncionario, @idDispositivo = :iddispositivo; 
       `,
        {
          replacements: {
            idpersona: persona.idPersona,
            fechahora: fechahora,
            tipofuncionario: persona.tipoFuncionario,
            iddispositivo: iddispositivo,
          },
          type: QueryTypes.RAW,
        }
      );
    } catch (error) {
      console.error("Error al ejecutar el procedimiento almacenado:", error);
      res.status(404).json({
        msg: error,
      });
    }*/

    /*try {
      const qryProcesarAsistencia = await dbConnections.conexionRRHH.query(
        `SET LANGUAGE spanish; 
       insert into registros values (:idPersona, :fechaHora, :tipoFuncionario, :idDispositivo, :enLinea); 
       `,
        {
          replacements: {
            idPersona: persona.idPersona,
            fechaHora: fechahora,
            tipoFuncionario: persona.tipoFuncionario,
            idDispositivo: iddispositivo,
            enLinea: "1",
          },
          type: QueryTypes.RAW,
        }
      );
    } catch (error) {
      console.error("Error al ejecutar el procedimiento almacenado:", error);
      res.status(404).json({
        msg: error,
      });
    }*/

    /*const mensaje = new mensajeria(
      persona.telefono,
      "registro de " + idpersona + " en fechahora " + fechahora
    );*/
    //mensaje.enviarMensaje();

    res.status(200).json({
      msg: `acceso correcto`,
    });
  };

  static registerEventBIO = async (req: Request, res: Response) => {
    const { idpersona, fechahora, dispositivo } = req.body;

    const persona = await Persona.crearPersona(idpersona.trim(), dispositivo);

    /*try {
      const qryGenerarPlanillas = await dbConnections.conexionRRHH.query(
        `SET LANGUAGE spanish;
        exec GenerarPlantillaDeControlAsistencia @idPersona = :idpersona, @Fecha = :fecha;`,
        {
          replacements: { idpersona: body.idpersona, fecha: body.fechahora },
          type: QueryTypes.RAW,
        }
      );
    } catch (error) {
      console.error("Error al ejecutar el procedimiento almacenado:", error);
      res.status(404).json({
        msg: error,
      });
    }*/

    /*const newRegistro = await Registro.create({
      idPersona: persona.idPersona,
      FechaHora: fechahora,
      TipoFuncionario: persona.tipoFuncionario,
      IdDispositivo: dispositivo,
      EnLinea: 1,
      CodigoProcesado: null,
    });*/

    /* try {
      const qryProcesarAsistencia = await dbConnections.conexionRRHH.query(
        `SET LANGUAGE spanish; 
       EXECUTE procesarAsistenciaLyli @idpersona = :idpersona, @horaSellado = :fechahora, @iddispositivo = :dispositivo, @idregistro = :idregisto, @mostrarMensaje = :mostrarMensaje;
       `,
        {
          replacements: {
            idpersona: persona.idPersona,
            fechahora: fechahora,
            dispositivo: dispositivo,
            idregisto: newRegistro.id,
            mostrarMensaje: 1,
          },
          type: QueryTypes.SELECT,
          plain: true,
          raw: true,
        }
      );
    } catch (error) {
      console.error("Error al ejecutar el procedimiento almacenado:", error);
      res.status(404).json({
        msg: error,
      });
    }*/

    const mensaje = new mensajeria(
      "+59176128920",
      "registro de " + idpersona + " en fechahora " + fechahora
    );
    mensaje.enviarMensaje();
    console.log(idpersona, fechahora, dispositivo);
    res.status(200).json({
      msg: `ok`,
    });
  };
}

export default asistenciaController;
