import { Router } from "express";
import { TokenValidation } from "../libs/verifyToken";
import asistenciaController from "../controllers/asistenciaController";

const router = Router();

router.post("/registrar/", asistenciaController.registerEvent);

router.get("/gettest/", asistenciaController.test);

export default router;
