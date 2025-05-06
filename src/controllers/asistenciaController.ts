import e, { Request, Response } from "express";
import { QueryTypes } from "sequelize";
import mensajeria from "../libs/mensajeria";
import Persona from "../models/Persona";
import parseFechas from "../libs/parseFechas";
import Registro from "../models/RRHH_models/Registro";
import { acad_conn, rab_conn, rrhh_conn } from "../db";
import { validationResult } from "express-validator";
import { ProcesadoDTO } from "../dto/sp_procesado.dto";

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
    const validation = validationResult(req);
    if (!validation.isEmpty()) {
      console.log("error de validacion", validation.array());
      return void res.status(400).json({ error: validation.array() });
    }

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
    registro.IdDispositivo = parseInt(dispositivo);
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
          plain: false,
          raw: true,
        }
      );

      if (!result) {
        console.log("error procesado de datos", result);
        return void res.status(400).json({ msg: "error procesado de datos" });
      }

      return void res.status(200).json({
        msg: "acceso correcto",
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
      const result = await rrhh_conn.query<ProcesadoDTO[]>(
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
          raw: true,
        }
      );

      if (!result) {
        console.log("error procesado de datos", result);
        return void res.status(400).json({ msg: "error procesado de datos" });
      }

      console.log("tipo funcionario out", persona.tipoFuncionario);
      if (persona.tipoFuncionario !== "ADM") {
        console.log("tipo funcionario in", persona.tipoFuncionario);
        const resultSet = result[0] || [];
        resultSet.forEach((row: ProcesadoDTO) => {
          console.log("row", row);
          if (row.Procesado && persona.telefono) {
            const msgText = `Estimado(a) ${row.NombreCompleto} 
            Se registró su ${row.TipoRegistro}
            En: ${row.NombreEdificio}
            En fecha: ${row.HoraSellado}
            Materia: ${row.SiglaMateria} (${row.Grupo}) ${row.TipoGrupoMateria}
            cm: ${row.Cm}`;

            const mensaje = new mensajeria(persona.telefono, msgText);
            mensaje.enviarMensaje(row.Cm);
          }
        });
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

  static estadoBiometrico = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const validation = validationResult(req);
    if (!validation.isEmpty()) {
      console.log("error de validacion", validation.array());
      return void res.status(400).json({ error: validation.array() });
    }

    const { id, estado } = req.body;
  };
}

export default asistenciaController;
