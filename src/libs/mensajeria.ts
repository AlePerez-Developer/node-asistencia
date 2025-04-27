import axios from "axios";
import app_config from "../config/app.config";

interface PostData {
  aplicacion: string;
  telefono: string;
  mensaje: string;
  codigoMensaje: string;
}

class mensajeria {
  private telefono: string;
  private mensaje: string;

  constructor(telefono: string, mensaje: string) {
    this.telefono = telefono;
    this.mensaje = mensaje;
  }

  async enviarMensaje() {
    const headers = {
      "x-api-key": app_config.mensajeria_key,
      "Content-Type": "application/json",
    };

    const datos: PostData = {
      aplicacion: app_config.mensajeria_app,
      telefono: this.telefono,
      mensaje: this.mensaje,
      codigoMensaje: app_config.mensajeria_codigo,
    };
    try {
      console.log("mensajeria url:", app_config.mensajeria_url);
      const response = await axios.post(app_config.mensajeria_url, datos, {
        headers,
      });
      console.log("Respuesta del servidor:", response.data);
    } catch (error) {
      console.error("Error al enviar el POST:", error);
    }
  }
}

export default mensajeria;
