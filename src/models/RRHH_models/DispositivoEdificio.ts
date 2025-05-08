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
  timestamps: false,
  tableName: "DispositivosEdificios",
})
export default class DispositivoEdificio extends Model {
  @PrimaryKey
  @AllowNull(false)
  @Column(DataType.NUMBER)
  declare IdDispositivo: number;

  @PrimaryKey
  @AllowNull(false)
  @Column(DataType.STRING)
  declare idEdificio: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  declare CodigoEdificioAgrupado: string;
}
