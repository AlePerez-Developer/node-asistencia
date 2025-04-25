import { Schema } from "express-validator";

const regexFechaHora =
  /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/(\d{4}) (0[0-9]|1[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/;

export const registroGEOValidator: Schema = {
  idpersona: {
    notEmpty: {
      errorMessage: "idpersona: Es campo obligatorio",
    },
    isString: {
      errorMessage: "idpersona: Se espera una cadena",
    },
    trim: true,
    isLength: {
      options: { min: 5 },
      errorMessage: "idpersona: La cadena es muy corta",
    },
    escape: true,
  },
  fechahora: {
    notEmpty: {
      errorMessage: "fechahora: Es campo obligatorio",
    },
    matches: {
      options: [regexFechaHora],
      errorMessage: "La fecha y hora debe tener el formato dd/mm/yyyy hh:mm:ss",
    },
    trim: true,
    isLength: {
      options: { min: 19 },
      errorMessage: "fechapersona: Debe tener un tamaño fijo",
    },
  },
  edificio: {
    notEmpty: {
      errorMessage: "edificio: Es campo obligatorio",
    },
    isInt: {
      errorMessage: "edificio: Se espera un numero",
    },
    toInt: true,
    escape: true,
  },
};
