import { Optional } from "sequelize";
import {
  AllowNull,
  AutoIncrement,
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";

interface RegistroAttributes {
  id: number;
  idPersona: string;
  FechaHora: string;
  TipoFuncionario: string;
  IdDispositivo: number;
  enLinea: number;
}

type RegistroCreationAttributes = Optional<RegistroAttributes, "id">;

@Table({
  tableName: "Registros",
  timestamps: false,
})
export default class RegistroRRHH extends Model {
  @PrimaryKey
  @AutoIncrement
  @AllowNull(false)
  @Column(DataType.NUMBER)
  declare id: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare idPersona: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare FechaHora: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare TipoFuncionario: string;

  @AllowNull(false)
  @Column(DataType.NUMBER)
  declare IdDispositivo: number;

  @AllowNull(false)
  @Column(DataType.NUMBER)
  declare enLinea: number;
}
