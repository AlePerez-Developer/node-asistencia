import dotenv from "dotenv";
dotenv.config();

const app_config = {
  env: process.env.NODE_ENV || "development",
  debug: process.env.APP_DEBUG === "true",
  appPort: parseInt(process.env.APP_PORT || "3000"),

  mensajeria_app: process.env.MENSAJERIA_APP || "",
  mensajeria_codigo: process.env.MENSAJERIA_CODIGO || "",
  mensajeria_url: process.env.MENSAJERIA_URL || "",
  mensajeria_key: process.env.MENSAJERIA_KEY || "",
};

export default app_config;
