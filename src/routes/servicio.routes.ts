import { Router } from "express";
import servicioController from "../controllers/servicioController"; 


const router = Router()

router.get('/', servicioController.getServicios)

router.post('/', servicioController.addNewServicio)

router.get('/:id', servicioController.getServicioById)

router.get('/change/:id', servicioController.changeStatus)

router.delete('/:id', servicioController.deleteServicio)

router.put('/:id', servicioController.updateServicio)


export default router