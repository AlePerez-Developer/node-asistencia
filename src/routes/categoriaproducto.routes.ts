import { Router } from "express";
import categoriaController from "../controllers/categoriaproductoController"; 


const router = Router()

router.get('/', categoriaController.getCategorias)

router.post('/', categoriaController.addNewCategoria)

router.get('/:id', categoriaController.getCategoriaById)

router.get('/change/:id', categoriaController.changeStatus)

router.delete('/:id', categoriaController.deleteCategoria)

router.put('/:id', categoriaController.updateCategoria)


export default router