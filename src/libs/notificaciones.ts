import axios from "axios";
import app_config from "../config/app.config";
import { notificacion } from "../interfaces/notificaciones.interface";

class notificaciones {
  private idpersona: string;
  private mensaje: string;
  private salida: string;

  constructor(idpersona: string, mensaje: string, salida: string) {
    this.idpersona = idpersona;
    this.mensaje = mensaje;
    this.salida = salida;
  }
  async enviarNotificacion() {
    const headers = {
      "x-api-key": app_config.notificacion_key,
      "Content-Type": "application/json",
    };
    const notificacion: notificacion = {
      title: app_config.notificacion_title,
      body: this.mensaje,
      userIds: [this.idpersona],
      salida: this.salida,
      type: "",
      startDate: "",
      endDate: "",
      LugarId: "",
      link: "",
      image: "",
      data: { biometrico: true },
    };
    try {
      const response = await axios.post(
        app_config.notificacion_url,
        notificacion
      );
      console.log("Respuesta del servidor:", response.data);
    } catch (error) {
      const mensajeError =
        error instanceof Error ? error.message : String(error);
      console.error("Error al enviar la notificacion:", mensajeError);
    }
  }
}

export default notificaciones;
