import { Router } from "express";
import productoController from "../controllers/productoController"; 


const router = Router()

router.get('/', productoController.getProductos)

router.post('/', productoController.addNewProducto)

router.get('/:id', productoController.getProductoById)

router.get('/change/:id', productoController.changeStatus)

router.delete('/:id', productoController.deleteProducto)

router.put('/:id', productoController.updateProducto)


export default router