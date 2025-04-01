import { Router } from "express";
import usuarioController from "../controllers/usuarioController";
import { TokenValidation } from "../libs/verifyToken";


const router = Router()

router.get('/', usuarioController.getUsuarios)

router.post('/', usuarioController.addNewUsuario)

router.post('/auth', usuarioController.loginUsuario)

router.get('/:id', usuarioController.getUsuarioById)

router.get('/change/:id', usuarioController.changeStatus)

router.delete('/:id', usuarioController.deleteUsuario)

router.put('/:id', usuarioController.updateUsuario)

router.get('/test/:id', TokenValidation, usuarioController.getUsuarioById)

export default router