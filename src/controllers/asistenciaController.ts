import e, { Request, Response } from "express";
import { QueryTypes } from "sequelize";
import mensajeria from "../libs/mensajeria";
import Persona from "../models/Persona";
import parseFechas from "../libs/parseFechas";
import Registro from "../models/RRHH_models/Registro";
import { acad_conn, rab_conn, rrhh_conn } from "../db";
import { validationResult } from "express-validator";

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
  static getStatus = async (req: Request, res: Response) => {
    let rrhhStatus, rabStatus, acadStatus: boolean;

    try {
      await rrhh_conn.authenticate();
      rrhhStatus = true;
    } catch (error) {
      rrhhStatus = false;
    }

    try {
      await rab_conn.authenticate();
      rabStatus = true;
    } catch (error) {
      rabStatus = false;
    }

    try {
      await acad_conn.authenticate();
      acadStatus = true;
    } catch (error) {
      acadStatus = false;
    }

    return void res.status(200).json({
      status: "alive",
      dbrrhh: rrhhStatus,
      dbrab: rabStatus,
      dbacad: acadStatus,
    });
  };

  static registerEventGEO = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const { idpersona, fechahora, idedificio } = req.body;
    console.log(idpersona);
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

    return void res.status(200).json({
      msg: "acceso correcto",
    });
  };

  static registerEventBIO = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const validation = validationResult(req);
    if (!validation.isEmpty()) {
      console.log("error de validacion", validation.array());
      return void res.status(400).json({ error: validation.array() });
    }

    const { idpersona, fechahora, dispositivo } = req.body;

    const persona = await Persona.crearPersona(idpersona.trim(), dispositivo);
    const fechaTmp = parseFechas.parseFechaHora(fechahora);

    const _fechahora =
      fechaTmp?.anio +
      "-" +
      fechaTmp?.mes +
      "-" +
      fechaTmp?.dia +
      " " +
      fechaTmp?.hora +
      ":" +
      fechaTmp?.minutos +
      ":" +
      fechaTmp?.segundos;

    try {
      const exists = await Registro.findOne({
        where: {
          idPersona: persona.idPersona,
          FechaHora: _fechahora,
          TipoFuncionario: persona.tipoFuncionario,
          IdDispositivo: dispositivo,
        },
      });

      if (exists) {
        return void res.status(400).json({ msg: "ya existe un registro" });
      }
    } catch (error) {
      if (error instanceof Error) {
        return void res.status(404).json({
          msg: error.message,
        });
      } else {
        return void res.status(404).json({
          msg: error,
        });
      }
    }

    const registro = Registro.build();
    registro.idPersona = persona.idPersona;
    registro.FechaHora = _fechahora;
    registro.TipoFuncionario = persona.tipoFuncionario;
    registro.IdDispositivo = dispositivo;
    registro.EnLinea = 1;
    registro.CodigoProcesado = null;

    await registro
      .validate()
      .then(async () => {
        await registro.save();
      })
      .catch((error) => {
        console.log("error al crear el registro", error.message);
        return res.status(500).json({
          descripcion: "error al crear el registro",
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
        console.log("error procesado de datos", result);
        return void res.status(400).json({ msg: "error procesado de datos" });
      }

      const msgText = `Estimado(a) ${result.NombreCompleto}\n 
                       Se registró su ${result.TipoRegistro}\n 
                       En: ${result.NombreEdificio}\n 
                       En fecha: ${result.HoraSellado}\n 
                       Materia: ${result.SiglaMateria} (${result.Grupo}) ${result.TipoGrupoMateria}\n 
                       cm: ${result.Cm}`;

      const mensaje = new mensajeria("+59176128920", msgText);

      if (result.Procesado && persona.telefono) {
        //mensaje.enviarMensaje();
        console.log("mensaje enviado", persona.telefono);
      }

      console.log("procesado correcto", persona.idPersona);
      return void res.status(200).json({
        msg: "procesado correcto",
      });
    } catch (error) {
      if (error instanceof Error) {
        return void res.status(404).json({
          msg: error.message,
        });
      } else {
        return void res.status(404).json({
          msg: error,
        });
      }
    }
  };
}

export default asistenciaController;
