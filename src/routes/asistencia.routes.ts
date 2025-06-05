import { Router } from "express";
import asistenciaController from "../controllers/asistenciaController";
import { checkSchema } from "express-validator";
import { registroBIOValidator } from "../validators/registroBio.validator";
import { registroGEOValidator } from "../validators/registroGeo.validator";
import { estadoBiometricoValidator } from "../validators/estadoBiometrico.validator";
import { validateRequest } from "../middlewares/validateRequest";

const router = Router();

router.post(
  "/registroBIO/",
  checkSchema(registroBIOValidator),
  validateRequest,
  asistenciaController.registerEventBIO
);

router.post(
  "/registroBIOSync/",
  checkSchema(registroBIOValidator),
  validateRequest,
  asistenciaController.registerEventBIOSync
);

router.post(
  "/registroGEO/",
  checkSchema(registroGEOValidator),
  validateRequest,
  asistenciaController.registerEventGEO
);

router.post(
  "/estadoBiometrico/",
  checkSchema(estadoBiometricoValidator),
  validateRequest,
  asistenciaController.estadoBiometrico
);

router.post("/pruebitas/", asistenciaController.pruebitas);

router.get("/getStatus", asistenciaController.getStatus);

export default router;
