import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error(new Date().toString(), "error de validacion", errors.array());

    return void res.status(400).json({
      estado: "error",
      msg: "Error en la validación",
      error: errors.array(),
    });
  }
  next();
};
