import { Request, Response } from "express";
import dbConnections from "../db/dbConnection";

import jwt from "jsonwebtoken";
import { QueryTypes } from "sequelize";
import { query } from "express-validator";
import axios from "axios";
import mensajeria from "../libs/mensajeria";
import Persona from "../models/Persona";

interface PostData {
  aplicacion: string;
  telefono: string;
  mensaje: string;
  codigoMensaje: string;
}

class asistenciaController {
  static test = async (req: Request, res: Response) => {
    const persona = await Persona.crearPersona("5493446", "88");
    console.log("final", persona);
  };

  static registerEventGEO = async (req: Request, res: Response) => {
    console.log("entro");
    res.status(200).json({
      msg: `aqui estamos`,
    });
  };

  static registerEventBIO = async (req: Request, res: Response) => {
    const { body } = req;
    console.log(body);

    const persona = await Persona.crearPersona(
      body.idpersona.trim(),
      body.dispositivo
    );

    try {
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
    }

    try {
      const qryProcesarAsistencia = await dbConnections.conexionRRHH.query(
        `SET LANGUAGE spanish; 
       EXECUTE ProcesarAsistencia @idPersona = :idpersona, @fechaHora = :fechahora, @tipoFuncionario = :tipofuncionario, @idDispositivo = :iddispositivo; 
       `,
        {
          replacements: {
            idpersona: persona.idPersona,
            fechahora: body.fechahora,
            tipofuncionario: persona.tipoFuncionario,
            iddispositivo: body.dispositivo,
          },
          type: QueryTypes.RAW,
        }
      );
    } catch (error) {
      console.error("Error al ejecutar el procedimiento almacenado:", error);
      res.status(404).json({
        msg: error,
      });
    }

    const ale = new mensajeria(
      persona.telefono,
      "registro de " + body.idpersona + " en fechahora " + body.fechahora
    );
    ale.enviarMensaje();

    res.status(200).json({
      msg: `ok`,
    });
  };
}

export default asistenciaController;
