import config from "../config";
class dbConfig {
  static dbConfigRRHH = class {
    public dbUser!: string;
    public dbPassword!: string;
    public dbServer!: string;
    public dbDatabase!: string;
    public dbPort!: number;
    constructor() {
      const {
        username: dbUser,
        password: dbPassword,
        host: dbServer,
        database: dbDatabase,
        port: dbPort,
      } = config.getRRHHDatabaseConfig();
      Object.assign(this, { dbUser, dbPassword, dbServer, dbDatabase, dbPort });
    }
  };

  static dbConfigRAB = class {
    public dbUser!: string;
    public dbPassword!: string;
    public dbServer!: string;
    public dbDatabase!: string;
    public dbPort!: number;
    constructor() {
      const {
        username: dbUser,
        password: dbPassword,
        host: dbServer,
        database: dbDatabase,
        port: dbPort,
      } = config.getRABDatabaseConfig();
      Object.assign(this, { dbUser, dbPassword, dbServer, dbDatabase, dbPort });
    }
  };
}

export default dbConfig;
