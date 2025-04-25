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
  tableName: "Registro",
  timestamps: false,
})
export class Registro extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.NUMBER)
  declare id: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare idPersona: string;
}
