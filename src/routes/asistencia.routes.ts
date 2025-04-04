import { Router } from "express";
import { TokenValidation } from "../libs/verifyToken";
import asistenciaController from "../controllers/asistenciaController";

const router = Router();

router.post("/registroBIO/", asistenciaController.registerEventBIO);

router.post("/registroGEO/", asistenciaController.registerEventGEO);

router.get("/test/", asistenciaController.test);

export default router;
