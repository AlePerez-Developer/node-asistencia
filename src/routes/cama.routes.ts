import { Router } from "express";
import camaController from "../controllers/camaController";

const router = Router()

router.get('/', camaController.getCamas)

router.get('/byHab/:id', camaController.getCamasbyHabitacion)

router.post('/', camaController.addNewCama)

router.get('/:id', camaController.getCamaById)

router.get('/change/:id', camaController.changeStatus)

router.delete('/:id', camaController.deleteCama)

router.put('/:id', camaController.updateCama)


export default router