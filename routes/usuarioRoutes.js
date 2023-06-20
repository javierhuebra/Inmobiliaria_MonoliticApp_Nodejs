import express from "express";
import { comprobarToken, confirmar, formularioLogin, formularioOlvidePassword, formularioRegistro, nuevoPassword, registrar, resetPassword } from "../controllers/usuarioController.js";
const router = express.Router()

router.get('/login', formularioLogin)

router.get('/registro', formularioRegistro)
router.post('/registro', registrar)

router.get('/confirmar/:token', confirmar)

router.get('/restaurar-password', formularioOlvidePassword)
router.post('/restaurar-password', resetPassword)


//Almacena el nuevo password
router.get('/restaurar-password/:token', comprobarToken)
router.post('/restaurar-password/:token', nuevoPassword)


export default router