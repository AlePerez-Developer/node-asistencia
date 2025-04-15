import { Sequelize } from "sequelize-typescript";
import databaseConfig from "../config/database.config";
import { Dialect } from "sequelize";
import path from "path";

export const rab_conn = new Sequelize(
  databaseConfig.RAB_db.database,
  databaseConfig.RAB_db.username,
  databaseConfig.RAB_db.password,
  {
    host: databaseConfig.RAB_db.host,
    port: parseInt(databaseConfig.RAB_db.port),
    dialect: databaseConfig.RAB_db.dialect as Dialect,
    dialectOptions: {
      dateStrings: true,
      options: {
        encrypt: false,
        trustservercertificate: true,
      },
    },
    models: [path.resolve(__dirname, "../models/RAB_models")],
    logging: false,
  }
);
