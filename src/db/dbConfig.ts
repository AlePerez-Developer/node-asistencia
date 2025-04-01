import dotenv from "dotenv";
import config from "../config";

dotenv.config();

class dbConfig {
  public dbUser: string;
  public dbPassword: string;
  public dbServer: string;
  public dbDatabase: string;
  public dbPort: number;

  constructor() {
    this.dbUser = process.env.DB_USER || "";
    this.dbPassword = process.env.DB_PASSWORD || "";
    this.dbServer = process.env.DB_SERVER || "";
    this.dbDatabase = process.env.DB_DATABASE || "";
    this.dbPort = parseInt(process.env.DB_PORT || "1433", 10);
  }
}

export default dbConfig;
