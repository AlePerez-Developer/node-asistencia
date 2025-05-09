import Persona from "../models/Persona";
import mensajeria from "../libs/mensajeria";
import parseFechas from "../libs/parseFechas";
import notificaciones from "../libs/notificaciones";
import RegistroRAB from "../models/RAB_models/Registro";
import RegistroLyli from "../models/RRHH_models/Registro";
import RegistroRRHH from "../models/RRHH_models/RegistrosRRHH";
import { QueryTypes } from "sequelize";
import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { acad_conn, rab_conn, rrhh_conn } from "../db";
import { ProcesadoDTO } from "../dto/sp_procesado.dto";
import { DispositivoResponse } from "../dto/dispositivo-response.dto";
import { EncargadoResponse } from "../dto/encargado-response.dto";

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

    const { idpersona, fechahora, edificio } = req.body;

    let dispositivo = "";

    try {
      const qryRta = await rrhh_conn.query<DispositivoResponse>(
        "select IdDispositivo from DispositivosEdificios where idEdificio = :edificio",
        {
          replacements: { edificio: edificio },
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

      dispositivo = qryRta?.IdDispositivo;
    } catch (error) {
      const mensajeError =
        error instanceof Error ? error.message : String(error);
      console.error("Error al obtener el dispositivo:", mensajeError);
      res.status(500).json({
        descripcion: "Error al obtener el dispositivo",
        msg: mensajeError,
      });
    }

    const persona = await Persona.crearPersona(idpersona.trim());
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

    const exists = await RegistroLyli.findOne({
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

    const registro = RegistroLyli.build();
    try {
      registro.idPersona = persona.idPersona;
      registro.FechaHora = _fechahora;
      registro.TipoFuncionario = persona.tipoFuncionario;
      registro.IdDispositivo = parseInt(dispositivo);
      registro.EnLinea = 1;
      registro.CodigoProcesado = null;

      await registro.validate();
      await registro.save();
    } catch (error) {
      const mensajeError =
        error instanceof Error ? error.message : String(error);
      console.error("Error al crear el registro:", mensajeError);
      res.status(500).json({
        descripcion: "Error al crear el registro",
        msg: mensajeError,
      });
    }

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
    } catch (error) {
      const mensajeError =
        error instanceof Error ? error.message : String(error);
      console.error("Error en la ejecucion del procedimiento:", mensajeError);
      res.status(500).json({
        descripcion: "Error en la ejecucion del procedimiento",
        msg: mensajeError,
      });
    }

    return void res.status(200).json({
      msg: "acceso correcto registro GEO",
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

    const persona = await Persona.crearPersona(idpersona.trim());
    const fechaTmp = parseFechas.parseFechaHora(fechahora);

    console.log("datos de la persona", persona);

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

    const rtarab = await asistenciaController.generarRegistroRAB(
      persona.idPersona,
      _fechahora,
      persona.tipoFuncionario,
      dispositivo
    );

    if (!rtarab) {
      return void res
        .status(400)
        .json({ msg: "error al crear el registro en rab" });
    }

    if (persona.tipoFuncionario !== "DOC") {
      const rtarrhh = await asistenciaController.generarRegistroRRHH(
        persona.idPersona,
        _fechahora,
        persona.tipoFuncionario,
        dispositivo
      );
      if (!rtarrhh) {
        return void res
          .status(400)
          .json({ msg: "error al crear el registro en rrhh" });
      }
    }

    const exists = await RegistroLyli.findOne({
      where: {
        idPersona: persona.idPersona,
        FechaHora: _fechahora,
        TipoFuncionario: persona.tipoFuncionario,
        IdDispositivo: dispositivo,
      },
    });

    if (exists) {
      console.log("ya existe un registro", exists);
      return void res.status(400).json({ msg: "ya existe un registro" });
    }

    const registro = RegistroLyli.build();
    try {
      registro.idPersona = persona.idPersona;
      registro.FechaHora = _fechahora;
      registro.TipoFuncionario = persona.tipoFuncionario;
      registro.IdDispositivo = dispositivo;
      registro.EnLinea = 1;
      registro.CodigoProcesado = null;

      await registro.validate();
      await registro.save();
    } catch (error) {
      const mensajeError =
        error instanceof Error ? error.message : String(error);
      console.error("Error al crear el registro:", mensajeError);
      res.status(500).json({
        descripcion: "Error al crear el registro",
        msg: mensajeError,
      });
    }

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

      console.log("rta respuesta", result);
      result.forEach((row) => {
        console.log("row", row);
        if (row.Procesado && persona.telefono) {
          let msgText = `Estimado(a) ${row.NombreCompleto}\nSe registró su ${row.TipoRegistro}\nEn: ${row.NombreEdificio}\nEn fecha: ${row.HoraSellado}\nMateria: ${row.SiglaMateria} (${row.Grupo}) ${row.TipoGrupoMateria}`;

          if (row.SalidaSellado) {
            msgText += `\nPuede sellar su salida desde las ${row.SalidaSellado}`;
          }
          msgText += `\ncm: ${row.Cm}`;

          const mensaje = new mensajeria(persona.telefono, msgText);
          const notificacion = new notificaciones(persona.idPersona, msgText);

          mensaje.enviarMensaje(row.Cm);
          notificacion.enviarNotificacion();
          console.log("mensaje/notificacion enviada", persona.telefono);
        }
      });
      console.log("procesado correcto registro BIO", persona.idPersona);
      return void res.status(200).json({
        msg: "procesado correcto",
      });
    } catch (error) {
      const mensajeError =
        error instanceof Error ? error.message : String(error);
      console.error("Error al ejecutar el procedimiento:", mensajeError);

      return void res.status(500).json({
        descripcion: "Error al crear el registro",
        msg: mensajeError,
      });
    }
  };

  static registerEventBIOSync = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const validation = validationResult(req);
    if (!validation.isEmpty()) {
      console.log("error de validacion", validation.array());
      return void res.status(400).json({ error: validation.array() });
    }

    const { idpersona, fechahora, dispositivo } = req.body;

    const persona = await Persona.crearPersona(idpersona.trim());
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

    await asistenciaController.generarRegistroRAB(
      persona.idPersona,
      _fechahora,
      persona.tipoFuncionario,
      dispositivo
    );

    if (persona.tipoFuncionario !== "DOC") {
      await asistenciaController.generarRegistroRRHH(
        persona.idPersona,
        _fechahora,
        persona.tipoFuncionario,
        dispositivo
      );
    }

    const exists = await RegistroLyli.findOne({
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

    const registro = RegistroLyli.build();
    try {
      registro.idPersona = persona.idPersona;
      registro.FechaHora = _fechahora;
      registro.TipoFuncionario = persona.tipoFuncionario;
      registro.IdDispositivo = dispositivo;
      registro.EnLinea = 0;
      registro.CodigoProcesado = null;

      await registro.validate();
      await registro.save();
    } catch (error) {
      const mensajeError =
        error instanceof Error ? error.message : String(error);
      console.error("Error al crear el registro:", mensajeError);
      res.status(500).json({
        descripcion: "Error al crear el registro",
        msg: mensajeError,
      });
    }

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
    } catch (error) {
      const mensajeError =
        error instanceof Error ? error.message : String(error);
      console.error("Error al ejecutar el procedimiento:", mensajeError);

      return void res.status(500).json({
        descripcion: "Error al ejecutar el procedimiento",
        msg: mensajeError,
      });
    }

    console.log("procesado correcto registro biosync", persona.idPersona);
    return void res.status(200).json({
      msg: "procesado correcto",
    });
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

    const { dispositivo, estado } = req.body;

    try {
      const qryRta = await acad_conn.query<EncargadoResponse>(
        "select LTrim(Rtrim(isnull(ciEncargado,''))) as Encargado, IPAddress, Descripcion from Dispositivos where IdDispositivo = :dispositivo",
        {
          replacements: { dispositivo: dispositivo },
          type: QueryTypes.SELECT,
          plain: true,
          raw: true,
        }
      );

      if (!qryRta) {
        console.log("error procesado de datos", qryRta);
        return void res.status(400).json({ msg: "error procesado de datos" });
      }

      const persona = await Persona.crearPersona(qryRta?.Encargado);

      const msgText = `Estimado(a) ${persona.nombreCompleto}\nSe detecto que el biometrico ${dispositivo} - ${qryRta.Descripcion}\nCon direccion IP: ${qryRta.IPAddress} cambio de estado a: ${estado}\nPorfavor tomar encuenta este mensaje para informar a su unidad y/o realizar una verificacion del dispositivo.`;

      const mensaje = new mensajeria(persona.telefono, msgText);

      mensaje.enviarMensaje("000000000000");

      console.log("mensaje enviado", persona.telefono);
    } catch (error) {
      const mensajeError =
        error instanceof Error ? error.message : String(error);
      console.error("Error al obtener el ci del encargado:", mensajeError);

      return void res.status(500).json({
        descripcion: "Error al obtener el ci del encargado",
        msg: mensajeError,
      });
    }
  };

  static pruebitas = async (req: Request, res: Response): Promise<void> => {
    const { id, fecha } = req.body;
    await asistenciaController.generarRegistroRRHH(id, fecha, "ADM", 3);
    return void res.status(200).json({
      msg: "pruebitas",
    });
  };

  static async generarRegistroRAB(
    idpersona: string,
    fechahora: string,
    tipoFuncionario: string,
    dispositivo: number
  ) {
    const existsRAB = await RegistroRAB.findOne({
      where: {
        idPersona: idpersona,
        FechaHora: fechahora,
        TipoFuncionario: tipoFuncionario,
        IdDispositivo: dispositivo,
      },
    });

    if (!existsRAB) {
      try {
        const registroRAB = RegistroRAB.build();
        registroRAB.idPersona = idpersona;
        registroRAB.FechaHora = fechahora;
        registroRAB.TipoFuncionario = tipoFuncionario;
        registroRAB.IdDispositivo = dispositivo;
        registroRAB.enLinea = 1;

        await registroRAB.validate();
        await registroRAB.save();
      } catch (error) {
        const mensajeError =
          error instanceof Error ? error.message : String(error);
        console.error("Error al crear el registro RAB:", mensajeError);
        return false;
      }
    }
  }

  static async generarRegistroRRHH(
    idpersona: string,
    fechahora: string,
    tipoFuncionario: string,
    dispositivo: number
  ) {
    const existsRRHH = await RegistroRRHH.findOne({
      where: {
        idPersona: idpersona,
        FechaHora: fechahora,
        TipoFuncionario: tipoFuncionario,
        IdDispositivo: dispositivo,
      },
    });

    if (!existsRRHH) {
      try {
        await RegistroRRHH.create(
          {
            idPersona: idpersona,
            FechaHora: fechahora,
            TipoFuncionario: tipoFuncionario,
            IdDispositivo: dispositivo,
            enLinea: 1,
          },
          { returning: false }
        );
        return true;
      } catch (error) {
        if (
          error instanceof TypeError &&
          error.message.includes("Cannot read properties of undefined")
        ) {
          return true;
        } else {
          console.error(
            "Error real al crear el registro RRHH:",
            (error as Error).message
          );
          return false;
        }
      }
    }
  }
}

export default asistenciaController;
