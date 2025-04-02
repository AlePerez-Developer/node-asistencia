import { Request, Response } from "express";
import dbConnections from "../db/dbConnection";

import jwt from "jsonwebtoken";
import { QueryTypes } from "sequelize";
import { query } from "express-validator";

import axios from "axios";

interface PostData {
  aplicacion: string;
  telefono: string;
  mensaje: string;
  codigoMensaje: string;
}

class asistenciaController {
  static test = async (req: Request, res: Response) => {};

  static registerEvent = async (req: Request, res: Response) => {
    const { body } = req;
    console.log(body);
    new dbConnections();

    let qryRta = await dbConnections.conexionRRHH.query(
      "select idSitio from DispositivosControlAsistencia where IdDispositivo = :dispositivo",
      {
        replacements: { dispositivo: body.dispositivo },
        type: QueryTypes.SELECT,
        plain: true,
        raw: true,
      }
    );

    if (!qryRta) {
      res.status(404).json({
        msg: `No existe el sitio`,
      });
    }
    const idSitio = JSON.parse(JSON.stringify(qryRta)).idSitio;
    console.log(idSitio);

    qryRta = await dbConnections.conexionRAB.query(
      "select TipoFuncionario from FuncionariosPuntosControl where idpersona = :idpersona and PuntoAutorizado = :idsitio ",
      {
        replacements: { idpersona: body.idpersona, idsitio: idSitio },
        type: QueryTypes.SELECT,
        plain: true,
        raw: true,
      }
    );

    if (!qryRta) {
      res.status(404).json({
        msg: `No existe el tipo de funcionario`,
      });
    }

    const tipoFuncionario = JSON.parse(JSON.stringify(qryRta)).TipoFuncionario;
    console.log(tipoFuncionario);

    qryRta = await dbConnections.conexionRRHH.query(
      `exec GenerarPlantillaDeControlAsistencia @idPersona = :idpersona, @Fecha = :fecha`,
      {
        replacements: { idpersona: body.idpersona, fecha: body.fechahora },
        type: QueryTypes.SELECT,
      }
    );

    console.log(qryRta);
    //enviarPost();

    /*qryRta = await dbConnections.conexionRRHH.query(
      `declare @resultado nvarchar(100); 
       EXECUTE ProcesarAsistencia @idPersona = :idpersona, @fechaHora = :fechahora, @tipoFuncionario = :tipofuncionario, @idDispositivo = :iddispositivo, @resultado=@resultado output;
       select @resultado as rta`,
      {
        replacements: {
          idpersona: body.idpersona.trim(),
          fechahora: body.fechahora,
          tipofuncionario: tipoFuncionario,
          iddispositivo: body.dispositivo,
        },
        type: QueryTypes.SELECT,
      }
    );*/

    res.status(200).json({
      msg: `ok`,
    });
  };
}

async function enviarPost() {
  // URL del endpoint
  const endpointURL = "http://172.16.1.251/whatsappusfxapi/v0/mensaje";

  // Datos a enviar
  const datos: PostData = {
    aplicacion: "rrhh",
    telefono: "+59170320773",
    mensaje: "mensaje de prueba",
    codigoMensaje: "1111111111",
  };

  const headers = {
    "x-api-key":
      "DTIC_gNgCyUEGbGP8NkLs59BeqzARgU6dDk1kwJIgTa8ZowCxkWjAvgO3GXuezoC",
    "Content-Type": "application/json",
  };

  try {
    // Realizar la petición POST
    const response = await axios.post(endpointURL, datos, { headers });
    console.log("Respuesta del servidor:", response.data);
  } catch (error) {
    console.error("Error al enviar el POST:", error);
  }
}

export default asistenciaController;
