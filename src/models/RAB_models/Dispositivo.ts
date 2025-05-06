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
export default class Dispositivo extends Model {
  @PrimaryKey
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare IdDispositivo: number;

  @AllowNull(true)
  @Column(DataType.STRING)
  declare IPAddress: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  declare Descripcion: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  declare NumeroSerie: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  declare Estado: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  declare idEdificio: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  declare ciEncargado: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  declare nombreEncargado: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  declare telfonoEncargado: string;
}
