import { Router } from "express";
import asistenciaController from "../controllers/asistenciaController";
import { checkSchema } from "express-validator";
import { registroBIOValidator } from "../validators/registroBio.validator";
import { registroGEOValidator } from "../validators/registroGeo.validator";

const router = Router();

router.post(
  "/registroBIO/",
  checkSchema(registroBIOValidator),
  asistenciaController.registerEventBIO
);

router.post(
  "/registroGEO/",
  checkSchema(registroGEOValidator),
  asistenciaController.registerEventGEO
);

router.get("/getStatus", asistenciaController.getStatus);

export default router;
