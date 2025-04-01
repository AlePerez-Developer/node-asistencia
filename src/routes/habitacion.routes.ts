import { Router } from "express";
import habitacionController from "../controllers/habitacionController"; 


const router = Router()

router.get('/', habitacionController.getHabitaciones)

router.post('/', habitacionController.addNewHabitacion)

router.get('/:id', habitacionController.getHabitacionById)

router.get('/change/:id', habitacionController.changeStatus)

router.delete('/:id', habitacionController.deleteHabitacion)

router.put('/:id', habitacionController.updateHabitacion)


export default router