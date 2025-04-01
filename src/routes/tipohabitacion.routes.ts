import { Router } from "express";
import { body, Meta, param } from "express-validator";
import tipohabitacionController from "../controllers/tipohabitacionController";

const router = Router()

router.get('/', tipohabitacionController.getTipos)

router.post('/',
    body('Descripcion')
        .exists().withMessage('Se esperaba el parametro Descripcion')
        .isString().withMessage('El parametro debe ser una cadena valida')
        .escape(),
    tipohabitacionController.addNewTipo)

router.get('/:id',
    param('id')
        .exists().withMessage('Se esperaba el parametro id')
        .isNumeric().withMessage('El parametro debe ser un valor numerico'),
    tipohabitacionController.getTipoById
)

router.get('/change/:id',
    param('id')
        .exists().withMessage('Se esperaba el parametro id')
        .isNumeric().withMessage('El parametro debe ser un valor numerico'),
    tipohabitacionController.changeStatus
)

router.delete('/:id',
    param('id')
        .exists().withMessage('Se esperaba el parametro id')
        .isNumeric().withMessage('El parametro debe ser un valor numerico'),
    tipohabitacionController.deleteTipo
)

router.put('/:id',
    param('id')
        .exists().withMessage('Se esperaba el parametro id')
        .isNumeric().withMessage('El parametro debe ser un valor numerico'),
    body('Descripcion')
        .exists().withMessage('Se esperaba el parametro Descripcion')
        .isString().withMessage('El parametro debe ser una cadena valida')
        .escape(),
    tipohabitacionController.updateTipo
)

export default router