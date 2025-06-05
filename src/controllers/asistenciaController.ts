import Persona from "../entities/persona.entity";
import mensajeria from "../libs/mensajeria";
import parseFechas from "../libs/parseFechas";
import notificaciones from "../libs/notificaciones";
import RegistroLyli from "../models/RRHH_models/Registro";
import { QueryTypes, Op } from "sequelize";
import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { acad_conn, rab_conn, rrhh_conn } from "../db";
import { sp_procesado } from "../interfaces/sp_procesado.interface";
import { encargado } from "../interfaces/encargado.interface";
import { responseGeo } from "../interfaces/responseGeo.interface";
import { eventoGeo } from "../interfaces/eventoGeo.interface";
import { EventoSalidas } from "../interfaces/eventoGeo-salidas.interface";
import { RegistroRABRepository } from "../repositories/registroRAB.repository";
import { RegistroRRHHRepository } from "../repositories/registroRRHH.repository";
import { dispositivo_dto } from "../dto/dispositivo.dto";
import { error } from "console";
import { estado_biometrico } from "../dto/estado-biometrico.dto";
import app_config from "../config/app.config";

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
    const { idpersona, fechahora, edificio } = req.body;

    const dispositivo = await dispositivo_dto.create(edificio);
    if (dispositivo.iddispositivo === "0") {
      console.error(
        new Date().toString(),
        "REGISTROGEO - error al obtener el dispositivo, edificio no encontrado",
        edificio
      );
      return void res.status(400).json({
        estado: "error",
        msg: "error al obtener el dispositivo",
        error: "dispositivo no encontrado",
      });
    }

    const salidas: eventoGeo[] = [];
    const entradas: EventoSalidas[] = [];

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
        IdDispositivo: dispositivo.iddispositivo,
      },
    });

    if (exists) {
      console.error(
        new Date().toString(),
        "REGISTROGEO - registro repetido",
        idpersona,
        _fechahora
      );
      return void res.status(400).json({
        estado: "error",
        msg: "ya existe un registro",
        error: "registro repetido",
      });
    }

    const registro = RegistroLyli.build();
    try {
      registro.idPersona = persona.idPersona;
      registro.FechaHora = _fechahora;
      registro.TipoFuncionario = persona.tipoFuncionario;
      registro.IdDispositivo = parseInt(dispositivo.iddispositivo);
      registro.EnLinea = 1;
      registro.CodigoProcesado = null;
      registro.TipoMarcado = "GEO";
      registro.FechaHoraProcesado = null;

      await registro.validate();
      await registro.save();
    } catch (error) {
      const mensajeError =
        error instanceof Error ? error.message : String(error);
      console.error(
        new Date().toString(),
        "REGISTROGEO - Error al crear el registro:",
        mensajeError
      );
      return void res.status(500).json({
        estado: "error",
        msg: "Error al crear el registro",
        error: mensajeError,
      });
    }

    try {
      const result = await rrhh_conn.query<sp_procesado>(
        `SET LANGUAGE spanish; 
       EXECUTE procesarAsistenciaLyli @idpersona = :idpersona, @horaSellado = :fechahora, @iddispositivo = :dispositivo, @idregistro = :idregisto, @mostrarMensaje = :mostrarMensaje;`,
        {
          replacements: {
            idpersona: persona.idPersona,
            fechahora: fechahora,
            dispositivo: dispositivo.iddispositivo,
            idregisto: registro.id,
            mostrarMensaje: 1,
          },
          type: QueryTypes.SELECT,
          plain: false,
          raw: true,
        }
      );

      if (!result) {
        console.error(
          new Date().toString(),
          "REGISTROGEO - error procesado de datos",
          idpersona,
          _fechahora,
          result
        );
        return void res.status(400).json({
          estado: "error",
          msg: "error procesado de datos",
          error: "error procesado de datos",
        });
      }

      result.forEach((row) => {
        if (row.Procesado) {
          if (row.TipoRegistro === "ENTRADA") {
            entradas.push({
              edificio: row.NombreEdificio,
              siglamateria: row.SiglaMateria,
              grupo: row.Grupo,
              tipogrupomateria: row.TipoGrupoMateria,
              horasalidaminima: row.FechaHoraMinimaSalida,
              horasalidamaxima: row.FechaHoraMaximaSalida,
            });
          } else {
            salidas.push({
              edificio: row.NombreEdificio,
              siglamateria: row.SiglaMateria,
              grupo: row.Grupo,
              tipogrupomateria: row.TipoGrupoMateria,
            });
          }
        }
      });
    } catch (error) {
      const mensajeError =
        error instanceof Error ? error.message : String(error);
      console.error(
        new Date().toString(),
        "REGISTROGEO - Error en la ejecucion del procedimiento:",
        idpersona,
        _fechahora,
        mensajeError
      );
      return void res.status(500).json({
        estado: "error",
        msg: "Error en la ejecucion del procedimiento",
        error: mensajeError,
      });
    }

    const Respuesta: responseGeo = {
      msg: "acceso correcto",
      nombre: persona.nombreCompleto,
      salidas: salidas,
      entradas: {
        horasalidaminima: entradas[0]?.horasalidaminima,
        horasalidamaxima: entradas[0]?.horasalidamaxima,
        materias: entradas,
      },
    };
    return void res.status(200).json({
      Respuesta,
    });
  };

  static registerEventBIO = async (
    req: Request,
    res: Response
  ): Promise<void> => {
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

    await RegistroRABRepository.generarRegistroRAB(
      persona.idPersonaRRHH,
      _fechahora,
      persona.tipoFuncionario,
      dispositivo
    );

    if (persona.tipoFuncionario !== "DOC") {
      await RegistroRRHHRepository.generarRegistroRRHH(
        persona.idPersonaRRHH,
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
      return void res.status(400).json({
        estado: "error",
        msg: "ya existe un registro",
        error: "registro repetido",
      });
    }

    const registro = RegistroLyli.build();
    try {
      registro.idPersona = persona.idPersona;
      registro.FechaHora = _fechahora;
      registro.TipoFuncionario = persona.tipoFuncionario;
      registro.IdDispositivo = dispositivo;
      registro.EnLinea = 1;
      registro.CodigoProcesado = null;
      registro.TipoMarcado = "BIO";
      registro.FechaHoraProcesado = null;

      await registro.validate();
      await registro.save();
    } catch (error) {
      const mensajeError =
        error instanceof Error ? error.message : String(error);
      console.error(
        new Date().toString(),
        "REGISTROBIO - Error al crear el registro:",
        idpersona,
        _fechahora,
        mensajeError
      );
      return void res.status(500).json({
        estado: "error",
        msg: "Error al crear el registro",
        error: mensajeError,
      });
    }

    try {
      const result = await rrhh_conn.query<sp_procesado>(
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
        console.error(
          new Date().toString(),
          "REGISTROBIO - error procesado de datos",
          idpersona,
          _fechahora,
          result
        );
        return void res.status(400).json({
          estado: "error",
          msg: "error procesado de datos",
          error: "error procesado de datos",
        });
      }

      result.forEach((row) => {
        if (row.Procesado && persona.telefono) {
          let msgText = `Estimado(a) ${row.NombreCompleto}\nSe registró su ${row.TipoRegistro}\nEn: ${row.NombreEdificio}\nEn fecha: ${row.HoraSellado}\nMateria: ${row.SiglaMateria} (${row.Grupo}) ${row.TipoGrupoMateria}`;

          if (row.SalidaSellado) {
            msgText += `\nPuede sellar su salida desde las ${row.SalidaSellado}`;
          }
          msgText += `\ncm: ${row.Cm}`;

          const mensaje = new mensajeria(persona.telefono, msgText);
          const notificacion = new notificaciones(
            persona.idPersona,
            msgText,
            row.SalidaSellado
          );

          mensaje.enviarMensaje(row.Cm);
          notificacion.enviarNotificacion();
        }
      });
    } catch (error) {
      const mensajeError =
        error instanceof Error ? error.message : String(error);
      console.error(
        new Date().toString(),
        "Error al ejecutar el procedimiento:",
        idpersona,
        _fechahora,
        mensajeError
      );

      return void res.status(500).json({
        estado: "error",
        msg: "Error al ejecutar el procedimiento",
        error: mensajeError,
      });
    }

    return void res.status(200).json({
      estado: "ok",
      msg: "procesado correcto registro BIO",
      error: "",
    });
  };

  static registerEventBIOSync = async (
    req: Request,
    res: Response
  ): Promise<void> => {
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

    await RegistroRABRepository.generarRegistroRAB(
      persona.idPersonaRRHH,
      _fechahora,
      persona.tipoFuncionario,
      dispositivo
    );

    if (persona.tipoFuncionario !== "DOC") {
      await RegistroRRHHRepository.generarRegistroRRHH(
        persona.idPersonaRRHH,
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
      return void res.status(400).json({
        estado: "error",
        msg: "ya existe un registro",
        error: "registro repetido",
      });
    }

    const registro = RegistroLyli.build();
    try {
      registro.idPersona = persona.idPersona;
      registro.FechaHora = _fechahora;
      registro.TipoFuncionario = persona.tipoFuncionario;
      registro.IdDispositivo = dispositivo;
      registro.EnLinea = 0;
      registro.CodigoProcesado = null;
      registro.TipoMarcado = "BIO";
      registro.FechaHoraProcesado = null;

      await registro.validate();
      await registro.save();
    } catch (error) {
      const mensajeError =
        error instanceof Error ? error.message : String(error);
      console.error(
        new Date().toString(),
        "Error al crear el registro:",
        idpersona,
        _fechahora,
        mensajeError
      );
      return void res.status(500).json({
        estado: "error",
        msg: "Error al crear el registro",
        error: mensajeError,
      });
    }

    try {
      const result = await rrhh_conn.query<sp_procesado>(
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
        console.log(
          new Date().toString(),
          "error procesado de datos",
          idpersona,
          _fechahora,
          result
        );
        return void res.status(400).json({
          estado: "error",
          msg: "error procesado de datos",
          error: "error procesado de datos",
        });
      }
    } catch (error) {
      const mensajeError =
        error instanceof Error ? error.message : String(error);
      console.error(
        new Date().toString(),
        "Error al ejecutar el procedimiento:",
        idpersona,
        _fechahora,
        mensajeError
      );

      return void res.status(500).json({
        estado: "error",
        msg: "Error al ejecutar el procedimiento",
        error: mensajeError,
      });
    }

    return void res.status(200).json({
      estado: "ok",
      msg: "procesado correcto",
      error: "",
    });
  };

  static estadoBiometrico = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const { dispositivo, estado } = req.body;

    try {
      const qryRta = await rab_conn.query<encargado>(
        "select LTrim(Rtrim(isnull(ciEncargado,''))) as Encargado, IPAddress, Descripcion from Dispositivos where IdDispositivo = :dispositivo",
        {
          replacements: { dispositivo: dispositivo },
          type: QueryTypes.SELECT,
          plain: true,
          raw: true,
        }
      );

      if (!qryRta) {
        console.log(
          new Date().toString(),
          "ESTADOBIO - error al obtener el ci del encargado",
          dispositivo,
          estado,
          qryRta
        );
        return void res.status(400).json({
          estado: "error",
          msg: "error al obtener el ci del encargado",
          error: qryRta,
        });
      }

      const persona = await Persona.crearPersona(qryRta?.Encargado);
      const _estado = estado_biometrico.create(estado);

      const msgText = `Estimado(a) ${persona.nombreCompleto}\nSe detecto que el biometrico ${dispositivo} - ${qryRta.Descripcion}\nCon direccion IP: ${qryRta.IPAddress} cambio de estado a: ${_estado.estado}\nPorfavor tomar encuenta este mensaje para informar a su unidad y/o realizar una verificacion del dispositivo.`;

      const mensaje = new mensajeria(persona.telefono, msgText);

      mensaje.enviarMensaje("000000000000");

      return void res.status(200).json({
        estado: "ok",
        msg: "procesado corrrecto",
        error: "",
      });
    } catch (error) {
      const mensajeError =
        error instanceof Error ? error.message : String(error);
      console.error(
        new Date().toString(),
        "Error al obtener el ci del encargado:",
        mensajeError
      );

      return void res.status(500).json({
        estado: "error",
        msg: "Error al obtener el ci del encargado",
        error: mensajeError,
      });
    }
  };

  static pruebitas = async (req: Request, res: Response): Promise<void> => {
    const { id, fecha } = req.body;

    const fechaTmp = parseFechas.parseFechaHora(fecha);

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

    console.log(app_config.notificacion_key);

    return void res.status(200).json({
      msg: "pruebitas",
    });
  };
}

export default asistenciaController;
