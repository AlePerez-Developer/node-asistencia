import express, { Application } from "express";
import asistenciaRoutes from "./routes/asistencia.routes";
import cors from "cors";
import dbConnections from "./db/dbConnection";
import config from "./config";

class Server {
  private app: Application;
  private port: string;

  private apiPath = {
    asistencia: "/api/asistencia",
  };

  constructor() {
    this.app = express();
    this.port = config.appPort.toString();

    new dbConnections();

    this.dbConnection();
    this.middlewares();
    this.routes();
  }

  async dbConnection() {
    try {
      await dbConnections.conexionRRHH.authenticate();
      console.log("db RRHH online");
    } catch (error) {
      let message;
      if (error instanceof Error) message = error.message;
      else message = String(error);
      console.log(message);
    }

    try {
      await dbConnections.conexionRAB.authenticate();
      console.log("db RAB online");
    } catch (error) {
      let message;
      if (error instanceof Error) message = error.message;
      else message = String(error);
      console.log(message);
    }

    try {
      await dbConnections.conexionACAD.authenticate();
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
