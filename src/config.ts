const config = {
  env: process.env.NODE_ENV || "development",
  debug: process.env.APP_DEBUG === "true",
  appPort: parseInt(process.env.APP_PORT || "3000"),

  mensajeria_app: process.env.MENSAJERIA_APP || "",
  mensajeria_codigo: process.env.MENSAJERIA_CODIGO || "",
  mensajeria_url: process.env.MENSAJERIA_URL || "",
  mensajeria_key: process.env.MENSAJERIA_KEY || "",

  getRRHHDatabaseConfig: () => ({
    username: process.env.DB_USER_RRHH || "",
    password: process.env.DB_PASSWORD_RRHH || "",
    host: process.env.DB_HOST_RRHH || "",
    database: process.env.DB_NAME_RRHH || "",
    port: parseInt(process.env.DB_PORT_RRHH || "1433 "),
  }),

  getRABDatabaseConfig: () => ({
    username: process.env.DB_USER_RAB || "",
    password: process.env.DB_PASSWORD_RAB || "",
    host: process.env.DB_HOST_RAB || "",
    database: process.env.DB_NAME_RAB || "",
    port: parseInt(process.env.DB_PORT_RAB || "1433 "),
  }),

  getACADDatabaseConfig: () => ({
    username: process.env.DB_USER_ACAD || "",
    password: process.env.DB_PASSWORD_ACAD || "",
    host: process.env.DB_HOST_ACAD || "",
    database: process.env.DB_NAME_ACAD || "",
    port: parseInt(process.env.DB_PORT_ACAD || "1433 "),
  }),
};

export default config;
