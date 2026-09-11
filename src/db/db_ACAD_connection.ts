import { Sequelize } from "sequelize-typescript";
import databaseConfig from "../config/database.config";
import { Dialect } from "sequelize";
import path from "path";

export const acad_conn = new Sequelize();
