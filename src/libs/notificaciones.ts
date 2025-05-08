import axios from "axios";
import app_config from "../config/app.config";
import { NotificacionDTO } from "../dto/notificaciones.dto";

class notificaciones {
  private idpersona: string;
  private mensaje: string;

  constructor(idpersona: string, mensaje: string) {
    this.idpersona = idpersona;
    this.mensaje = mensaje;
  }
  async enviarNotificacion() {
    const notificacion: NotificacionDTO = {
      title: app_config.notificacion_title,
      body: this.mensaje,
      userIds: [this.idpersona],
      type: "",
      startDate: "",
      endDate: "",
      LugarId: "",
      link: "",
      image: "",
    };
    try {
      const response = await axios.post(
        app_config.notificacion_url,
        notificacion
      );
      console.log("Respuesta del servidor:", response.data);
    } catch (error) {
      console.error("Error al enviar el POST:", error);
    }
  }
}

export default notificaciones;
