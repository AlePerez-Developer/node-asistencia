import { Router } from "express";
import formacobroController from "../controllers/formacobroController"; 


const router = Router()

router.get('/', formacobroController.getFormas)


export default router