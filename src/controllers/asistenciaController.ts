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

    const dispositivo = await dispositivo_dto.create(edificio);
    if (dispositivo.iddispositivo === "0") {
      return void res
        .status(400)
        .json({ msg: "error al obtener el dispositivo" });
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
      return void res.status(400).json({ msg: "ya existe un registro" });
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
      console.error("Error al crear el registro:", mensajeError);
      res.status(500).json({
        descripcion: "Error al crear el registro",
        msg: mensajeError,
      });
    }

    try {
      const result = await rrhh_conn.query<sp_procesado>(
        `SET LANGUAGE spanish; 
       EXECUTE procesarAsistenciaLyli @idpersona = :idpersona, @horaSellado = :fechahora, @iddispositivo = :dispositivo, @idregistro = :idregisto, @mostrarMensaje = :mostrarMensaje;`,
        {
          replacements: {
            idpersona: idpersona,
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
        console.log("error procesado de datos", result);
        return void res.status(400).json({ msg: "error procesado de datos" });
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
      console.error("Error en la ejecucion del procedimiento:", mensajeError);
      res.status(500).json({
        descripcion: "Error en la ejecucion del procedimiento",
        msg: mensajeError,
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

    console.log(Respuesta);
    return void res.status(200).json({
      Respuesta,
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
      registro.TipoMarcado = "BIO";
      registro.FechaHoraProcesado = null;

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
        console.log("error procesado de datos", result);
        return void res.status(400).json({ msg: "error procesado de datos" });
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
          console.log(
            new Date().toString(),
            "mensaje/notificacion enviada",
            persona.idPersona,
            persona.telefono
          );
        }
      });
      console.log("procesado correcto registro BIO", persona.idPersona);
      return void res.status(200).json({
        msg: "procesado correcto registro BIO",
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
      registro.TipoMarcado = "BIO";
      registro.FechaHoraProcesado = null;

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
      const qryRta = await acad_conn.query<encargado>(
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

    await RegistroRRHHRepository.generarRegistroRRHH(
      "5493446-1H",
      _fechahora,
      "ADM",
      3
    );

    return void res.status(200).json({
      msg: "pruebitas",
    });
  };
}

export default asistenciaController;
