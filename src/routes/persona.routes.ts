import { Router } from "express";
import personaController from "../controllers/personaController"; 


const router = Router()

router.get('/', personaController.getPersonas)

router.get('/:id', personaController.getPersonaById)

router.post('/', personaController.addNewPersona)

router.get('/change/:id', personaController.changeStatus)

router.delete('/:id', personaController.deletePersona)

router.put('/:id', personaController.updatePersona)


export default router