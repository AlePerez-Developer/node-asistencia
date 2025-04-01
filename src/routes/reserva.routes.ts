import { Router } from "express";
import reservaController from "../controllers/reservaController"; 


const router = Router()

router.get('/', reservaController.getReservas)

router.post('/', reservaController.addNewReserva)

router.get('/byCama/:id', reservaController.getReservasByCama)

router.get('/:id', reservaController.getReservasById)

router.get('/change/:id', reservaController.changeStatus)

router.get('/check/:id', reservaController.check)

router.delete('/:id', reservaController.deleteReserva)

router.put('/:id', reservaController.updateReserva)


export default router