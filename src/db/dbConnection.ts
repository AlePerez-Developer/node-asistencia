import { Sequelize } from "sequelize-typescript";
import dbConfig from "./dbConfig";

const dbConfigRRHH = new dbConfig.dbConfigRRHH();
const dbConfigRAB = new dbConfig.dbConfigRAB();
const dbConfigACAD = new dbConfig.dbConfigACAD();

class dbConnection {
  static conexionRRHH: Sequelize;
  static conexionRAB: Sequelize;
  static conexionACAD: Sequelize;

  constructor() {
    dbConnection.conexionRRHH = new Sequelize(
      dbConfigRRHH.dbDatabase,
      dbConfigRRHH.dbUser,
      dbConfigRRHH.dbPassword,
      {
        host: dbConfigRRHH.dbServer,
        port: dbConfigRRHH.dbPort,
        dialect: "mssql",
        dialectOptions: {
          options: {
            encrypt: false,
            trustservercertificate: true,
          },
        },
        models: [__dirname + "/models"],
        logging: false,
      }
    );

    dbConnection.conexionRAB = new Sequelize(
      dbConfigRAB.dbDatabase,
      dbConfigRAB.dbUser,
      dbConfigRAB.dbPassword,
      {
        host: dbConfigRAB.dbServer,
        port: dbConfigRAB.dbPort,
        dialect: "mssql",
        dialectOptions: {
          options: {
            encrypt: false,
            trustservercertificate: true,
          },
        },
        models: [__dirname + "/models"],
        logging: false,
      }
    );

    dbConnection.conexionACAD = new Sequelize(
      dbConfigACAD.dbDatabase,
      dbConfigACAD.dbUser,
      dbConfigACAD.dbPassword,
      {
        host: dbConfigACAD.dbServer,
        port: dbConfigACAD.dbPort,
        dialect: "mssql",
        dialectOptions: {
          options: {
            encrypt: false,
            trustservercertificate: true,
          },
        },
        models: [__dirname + "/models"],
        logging: false,
      }
    );
  }
}

export default dbConnection;
