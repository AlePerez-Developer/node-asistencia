import { Schema } from "express-validator";

export const estadoBiometricoValidator: Schema = {
  id: {
    notEmpty: {
      errorMessage: "id del dispositivo: Es campo obligatorio",
    },
    isString: {
      errorMessage: "el id: Se espera una cadena",
    },
    trim: true,
    escape: true,
  },
  estado: {
    notEmpty: {
      errorMessage: "estado del dispositivo: Es campo obligatorio",
    },
    isInt: {
      options: { min: 0, max: 1 },
      errorMessage: "estado: Se espera un numero 0 o 1",
    },
  },
};
