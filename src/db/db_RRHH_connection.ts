import { Sequelize } from "sequelize-typescript";
import databaseConfig from "../config/database.config";
import { Dialect } from "sequelize";
import path from "path";

export const rrhh_conn = new Sequelize(
  databaseConfig.RRHH_db.database,
  databaseConfig.RRHH_db.username,
  databaseConfig.RRHH_db.password,
  {
    host: databaseConfig.RRHH_db.host,
    port: parseInt(databaseConfig.RRHH_db.port),
    dialect: databaseConfig.RRHH_db.dialect as Dialect,
    dialectOptions: {
      dateStrings: true,
      options: {
        encrypt: false,
        trustservercertificate: true,
      },
    },
    models: [path.resolve(__dirname, "../models/RRHH_models")],
    logging: false,
  }
);
