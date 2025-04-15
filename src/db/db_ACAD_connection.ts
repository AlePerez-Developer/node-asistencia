import { Sequelize } from "sequelize-typescript";
import databaseConfig from "../config/database.config";
import { Dialect } from "sequelize";
import path from "path";

export const acad_conn = new Sequelize(
  databaseConfig.ACAD_db.database,
  databaseConfig.ACAD_db.username,
  databaseConfig.ACAD_db.password,
  {
    host: databaseConfig.ACAD_db.host,
    port: parseInt(databaseConfig.ACAD_db.port),
    dialect: databaseConfig.ACAD_db.dialect as Dialect,
    dialectOptions: {
      dateStrings: true,
      options: {
        encrypt: false,
        trustservercertificate: true,
      },
    },
    models: [path.resolve(__dirname, "../models/ACAD_models")],
    logging: false,
  }
);
