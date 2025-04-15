import { all } from "axios";
import {
  InferAttributes,
  InferCreationAttributes,
  Optional,
  Sequelize,
} from "sequelize";
import { Table, Model, Column, DataType } from "sequelize-typescript";

interface RegistroAttributes {
  id: number;
  idPersona: string;
  FechaHora: string;
  TipoFuncionario: string;
  IdDispositivo: number;
  EnLinea: number;
  CodigoProcesado: string;
}

type RegistroCreationAttributes = Optional<RegistroAttributes, "id">;

@Table({
  timestamps: false,
  tableName: "RegistrosLyli",
  modelName: "Registro",
})
export default class Registro extends Model<
  RegistroAttributes,
  RegistroCreationAttributes
> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notNull: {
        msg: "Debe ingresar un valor para el campo idPersona",
      },
    },
  })
  declare idPersona: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notNull: {
        msg: "Debe ingresar un valor para el campo FechaHora",
      },
    },
  })
  declare FechaHora: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notNull: {
        msg: "Debe ingresar un valor para el campo TipoFuncionario",
      },
    },
  })
  declare TipoFuncionario: string;

  @Column({
    type: DataType.NUMBER,
    allowNull: false,
    validate: {
      notNull: {
        msg: "Debe ingresar un valor para el campo idDispositivo",
      },
    },
  })
  declare IdDispositivo: number;

  @Column({
    type: DataType.NUMBER,
    allowNull: false,
    validate: {
      notNull: {
        msg: "Debe ingresar un valor para el campo EnLinea",
      },
    },
  })
  declare EnLinea: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notNull: {
        msg: "Debe ingresar un valor para el campo CodigoProcesado",
      },
    },
  })
  declare CodigoProcesado: string;
}
