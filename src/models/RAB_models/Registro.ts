import {
  AllowNull,
  AutoIncrement,
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";

@Table({
  tableName: "Registros",
  timestamps: false,
})
export default class Registro extends Model {
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
