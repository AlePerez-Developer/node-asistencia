import { all } from "axios";
import {
  InferAttributes,
  InferCreationAttributes,
  Optional,
  Sequelize,
} from "sequelize";
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
  EnLinea: number;
  CodigoProcesado?: string;
}

type RegistroCreationAttributes = Optional<RegistroAttributes, "id">;

@Table({
  tableName: "RegistrosLyli",
  timestamps: false,
})
export default class Registro extends Model<
  RegistroAttributes,
  RegistroCreationAttributes
> {
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
  declare EnLinea: number;

  @AllowNull(true)
  @Column(DataType.STRING)
  declare CodigoProcesado: string | null;

  @AllowNull(true)
  @Column(DataType.STRING)
  declare TipoMarcado: string | null;

  @AllowNull(true)
  @Column(DataType.STRING)
  declare FechaHoraProcesado: string | null;
}
