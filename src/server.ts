import express, { Application } from "express";
import usrRoutes from "./routes/usuario.routes";
import personaRoutes from "./routes/persona.routes";
import cors from "cors";
import db from "./db/dbConnection";
import config from "./config";

class Server {
  private app: Application;
  private port: string;
  private apiPath = {
    usuarios: "/api/usr",
  };

  constructor() {
    this.app = express();
    this.port = config.appPort.toString();

    this.dbConnection();
    this.middlewares();
    this.routes();
  }

  async dbConnection() {
    try {
      await db.authenticate();
      console.log("db online");
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
    this.app.use(this.apiPath.usuarios, usrRoutes);
  }

  listen() {
    this.app.listen(this.port, () => {
      console.log("Servidor corriendo en el puerto: " + this.port);
    });
  }
}

export default Server;
