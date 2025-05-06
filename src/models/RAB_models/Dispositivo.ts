import { table } from "console";
import {
  AllowNull,
  AutoIncrement,
  Column,
  DataType,
  Model,
  NotNull,
  PrimaryKey,
  Table,
} from "sequelize-typescript";

@Table({
  tableName: "Dispositivos",
  timestamps: false,
})
export class Dispositivo extends Model {
  @PrimaryKey
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare IdDispositivo: number;

  @Column(DataType.STRING)
  @AllowNull(true)
  declare IPAddress: string;

  @Column(DataType.STRING)
  @AllowNull(true)
  declare Descripcion: string;

  @Column(DataType.STRING)
  @AllowNull(true)
  declare NumeroSerie: string;

  @Column(DataType.STRING)
  @AllowNull(true)
  declare Estado: string;

  @Column(DataType.STRING)
  @AllowNull(true)
  declare idEdificio: string;

  @Column(DataType.STRING)
  @AllowNull(true)
  declare ciEncargado: string;

  @Column(DataType.STRING)
  @AllowNull(true)
  declare nombreEncargado: string;

  @Column(DataType.STRING)
  @AllowNull(true)
  declare telfonoEncargado: string;
}
