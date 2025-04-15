import express, { Application } from "express";
import asistenciaRoutes from "./routes/asistencia.routes";
import cors from "cors";

import app_config from "./config/app.config";
import { initDatabases, rrhh_conn, acad_conn, rab_conn } from "./db";

class Server {
  private app: Application;
  private port: string;

  private apiPath = {
    asistencia: "/api/asistencia",
  };

  constructor() {
    this.app = express();
    this.port = app_config.appPort.toString();

    /*
    try {
      this.initDb();
      console.log("Aplicación lista 🔥");
    } catch (error) {
      console.error("Error al iniciar las bases de datos:", error);
    }*/

    this.dbConnection();
    this.middlewares();
    this.routes();
  }

  async dbConnection() {
    try {
      await rrhh_conn.authenticate();
      console.log("db RRHH online");
    } catch (error) {
      let message;
      if (error instanceof Error) message = error.message;
      else message = String(error);
      console.log(message);
    }

    try {
      await rab_conn.authenticate();
      console.log("db RAB online");
    } catch (error) {
      let message;
      if (error instanceof Error) message = error.message;
      else message = String(error);
      console.log(message);
    }

    try {
      await acad_conn.authenticate();
      console.log("db ACAD online");
    } catch (error) {
      let message;
      if (error instanceof Error) message = error.message;
      else message = String(error);
      console.log(message);
    }
  }

  middlewares() {
    //CORS
    this.app.use(cors());

    //Json Parse
    this.app.use(express.json());

    //Carpeta Public
    this.app.use(express.static("src/public"));
  }

  routes() {
    this.app.use(this.apiPath.asistencia, asistenciaRoutes);
  }

  listen() {
    this.app.listen(this.port, () => {
      console.log("Servidor corriendo en el puerto: " + this.port);
    });
  }
}

export default Server;
