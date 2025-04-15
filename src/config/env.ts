import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  RRHH_DB_USER: z.string(),
  RRHH_DB_PASSWORD: z.string(),
  RRHH_DB_HOST: z.string(),
  RRHH_DB_NAME: z.string(),
  RRHH_DB_PORT: z.string(),

  RAB_DB_USER: z.string(),
  RAB_DB_PASSWORD: z.string(),
  RAB_DB_HOST: z.string(),
  RAB_DB_NAME: z.string(),
  RAB_DB_PORT: z.string(),

  ACAD_DB_USER: z.string(),
  ACAD_DB_PASSWORD: z.string(),
  ACAD_DB_HOST: z.string(),
  ACAD_DB_NAME: z.string(),
  ACAD_DB_PORT: z.string(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    "❌ Error en las variables de entorno:",
    parsedEnv.error.format()
  );
  process.exit(1);
}

export const env = parsedEnv.data;
