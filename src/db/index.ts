import { rrhh_conn } from "./db_RRHH_connection";
import { rab_conn } from "./db_RAB_connection";
import { acad_conn } from "./db_ACAD_connection";

export async function initDatabases() {
  await Promise.all([rrhh_conn.sync(), rab_conn.sync(), acad_conn.sync()]);
  console.log("Todas las bases de datos han sido sincronizadas.");
}

export { rrhh_conn, rab_conn, acad_conn };
