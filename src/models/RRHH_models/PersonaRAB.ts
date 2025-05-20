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

@Table({
  tableName: "PersonasRAB",
  timestamps: false,
})
export default class PersonaRAB extends Model {
  @Column(DataType.NUMBER)
  declare IdPersonaRAB: number;

  @PrimaryKey
  @AllowNull(false)
  @Column(DataType.STRING)
  declare IdPersona: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  declare FechaHoraRegistro: string;
}
