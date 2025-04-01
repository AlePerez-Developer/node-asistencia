import { Sequelize } from "sequelize-typescript";
import dbConfig from "./dbConfig";

const config = new dbConfig();

const conexion = new Sequelize(
  config.dbDatabase,
  config.dbUser,
  config.dbPassword,
  {
    host: config.dbServer,
    port: config.dbPort,
    dialect: "mssql",
    models: [__dirname + "/models"],
    logging: false,
  }
);

export default conexion;
