import { env } from "./env";

const databaseConfig = {
  RRHH_db: {
    dialect: "mssql",
    host: env.RRHH_DB_HOST,
    database: env.RRHH_DB_NAME,
    username: env.RRHH_DB_USER,
    password: env.RRHH_DB_PASSWORD,
    port: env.RRHH_DB_PORT,
  },

  RAB_db: {
    dialect: "mssql",
    host: env.RAB_DB_HOST,
    database: env.RAB_DB_NAME,
    username: env.RAB_DB_USER,
    password: env.RAB_DB_PASSWORD,
    port: env.RAB_DB_PORT,
  },

  ACAD_db: {
    dialect: "mssql",
    host: env.ACAD_DB_HOST,
    database: env.ACAD_DB_NAME,
    username: env.ACAD_DB_USER,
    password: env.ACAD_DB_PASSWORD,
    port: env.ACAD_DB_PORT,
  },
};

export default databaseConfig;
