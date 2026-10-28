import { Sequelize } from "sequelize-typescript";
import databaseConfig from "../config/database.config";
import { Dialect } from "sequelize";
import Registro from "../models/RRHH_V3_models/Registro";

export const rrhh_v3_conn = new Sequelize(
  databaseConfig.RRHH_V3_db.database,
  databaseConfig.RRHH_V3_db.username,
  databaseConfig.RRHH_V3_db.password,
  {
    host: databaseConfig.RRHH_V3_db.host,
    port: parseInt(databaseConfig.RRHH_V3_db.port),
    dialect: databaseConfig.RRHH_V3_db.dialect as Dialect,
    dialectOptions: {
      dateStrings: true,
      options: {
        encrypt: false,
        trustservercertificate: true,
      },
    },
    models: [Registro],
    logging: false,
  },
);
